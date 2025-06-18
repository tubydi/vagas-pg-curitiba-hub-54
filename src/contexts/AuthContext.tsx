
import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from '@/hooks/useAuthState';

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
  const { user, loading, isAdmin } = useAuthState();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
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
    }
  };

  const signUp = async (email: string, password: string, companyData: any) => {
    console.log('Starting signup process for:', email);
    
    try {
      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return { data: null, error: authError };
      }

      if (!authData.user) {
        const error = new Error('Usuário não foi criado');
        console.error('User not created');
        toast({
          title: "Erro no cadastro",
          description: "Falha ao criar usuário",
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log('User created, creating company...');

      // Wait for profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create company
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
          status: 'Ativa' as const
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        
        if (companyError.code === '23505' && companyError.message.includes('companies_cnpj_key')) {
          toast({
            title: "CNPJ já cadastrado",
            description: "Este CNPJ já está cadastrado no sistema.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar empresa",
            description: "Erro ao salvar dados da empresa.",
            variant: "destructive",
          });
        }
        
        return { data: null, error: companyError };
      }

      console.log('Company created successfully:', companyInsertData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua empresa está ativa e pronta para publicar vagas!",
      });

      return { data: authData, error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session')) {
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
