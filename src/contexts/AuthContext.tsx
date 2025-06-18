import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, companyData: any) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (session?.user) {
          await fetchIsAdmin(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchIsAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao entrar",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Login realizado",
        description: "Bem-vindo!",
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, companyData: any) => {
    console.log('=== INICIANDO CADASTRO DIRETO ===');
    console.log('Email:', email);
    console.log('Company Data:', companyData);
    
    try {
      // Primeiro criar o usuário
      console.log('1. Criando usuário...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Erro na criação do usuário:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return { data: null, error: authError };
      }

      if (!authData.user) {
        const error = new Error('Usuário não foi criado');
        console.error('Usuário não foi criado');
        toast({
          title: "Erro no cadastro",
          description: "Falha ao criar usuário",
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log('2. Usuário criado, criando empresa para:', authData.user.id);

      // Aguardar para garantir que o trigger do profile foi executado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o profile foi criado
      console.log('3. Verificando profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.log('Profile não encontrado, criando manualmente...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: email,
            role: 'company'
          }]);

        if (createProfileError) {
          console.error('Erro ao criar profile:', createProfileError);
        }
      } else {
        console.log('Profile encontrado:', profileData);
      }

      // Criar empresa automaticamente
      console.log('4. Criando empresa...');
      const { data: companyInsertData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          user_id: authData.user.id,
          name: companyData.companyName,
          cnpj: companyData.cnpj,
          email: companyData.email || email,
          phone: companyData.phone,
          address: companyData.address,
          city: companyData.city,
          sector: companyData.sector,
          legal_representative: companyData.legalRepresentative,
          description: companyData.description || '',
          status: 'Ativa' as const // Empresa ativa automaticamente
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Erro na criação da empresa:', companyError);
        
        // Se for erro de CNPJ duplicado, mostrar mensagem específica
        if (companyError.code === '23505' && companyError.message.includes('companies_cnpj_key')) {
          toast({
            title: "CNPJ já cadastrado",
            description: "Este CNPJ já está cadastrado no sistema. Tente fazer login ou use outro CNPJ.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar empresa",
            description: "Erro ao salvar dados da empresa. Tente novamente.",
            variant: "destructive",
          });
        }
        
        return { data: null, error: companyError };
      }

      console.log('5. Empresa criada com sucesso:', companyInsertData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua empresa está ativa e pronta para publicar vagas!",
      });

      return { data: authData, error: null };
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      setIsAdmin(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session') && !error.message.includes('Session')) {
        console.error('Signout error:', error);
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAdmin, 
        signIn, 
        signUp, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
