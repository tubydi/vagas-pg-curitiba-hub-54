
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
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchIsAdmin(session.user.id);
      }
    };

    checkSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchIsAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, companyData: any) => {
    try {
      console.log('Iniciando cadastro para:', email);
      
      // Primeiro criar o usuário
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
        toast({
          title: "Erro no cadastro",
          description: "Falha ao criar usuário",
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log('Usuário criado, criando empresa para:', authData.user.id);

      // Aguardar um pouco para garantir que o usuário foi processado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Criar empresa com dados do formulário
      const { data: companyInsertData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          user_id: authData.user.id,
          name: companyData.companyName,
          cnpj: companyData.cnpj,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          city: companyData.city,
          sector: companyData.sector,
          legal_representative: companyData.legalRepresentative,
          description: companyData.description || '',
          status: 'Ativa' // Empresa ativa automaticamente
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

      console.log('Empresa criada com sucesso:', companyInsertData);

      toast({
        title: "Cadastro realizado!",
        description: "Sua empresa foi cadastrada e ativada automaticamente. Você já pode publicar vagas!",
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
      // Primeiro limpar o estado local imediatamente
      setUser(null);
      setIsAdmin(false);
      
      // Tentar fazer logout no Supabase, mas não falhar se a sessão já foi perdida
      const { error } = await supabase.auth.signOut();
      
      // Se o erro for relacionado à sessão não encontrada, ignorar
      if (error && !error.message.includes('session') && !error.message.includes('Session')) {
        console.error('Signout error:', error);
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Se não há erro ou é erro de sessão, considerar logout bem-sucedido
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
      // Mesmo com erro, mostrar mensagem de sucesso se o estado foi limpo
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
