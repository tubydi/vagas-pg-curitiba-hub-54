
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
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "❌ Erro ao entrar",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (data.user) {
        console.log('Sign in successful for user:', data.user.email);
        toast({
          title: "✅ Login realizado",
          description: "Bem-vindo!",
        });
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, companyData: any) => {
    console.log('=== STARTING SIGNUP PROCESS ===');
    console.log('Email:', email);
    console.log('Company data:', companyData);
    
    try {
      // Create user
      console.log('Creating user account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error during signup:', authError);
        toast({
          title: "❌ Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return { data: null, error: authError };
      }

      if (!authData.user) {
        const error = new Error('Usuário não foi criado');
        console.error('User not created during signup');
        toast({
          title: "❌ Erro no cadastro",
          description: "Falha ao criar usuário",
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log('User created successfully:', authData.user.id);

      // Wait for profile creation trigger
      console.log('Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create company with unique CNPJ
      console.log('Creating company...');
      const uniqueCnpj = `${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}/${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 90 + 10)}`;
      
      const { data: companyInsertData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          user_id: authData.user.id,
          name: companyData.companyName,
          cnpj: companyData.cnpj || uniqueCnpj,
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
        
        let errorMessage = "Erro ao salvar dados da empresa.";
        if (companyError.code === '23505') {
          if (companyError.message.includes('cnpj')) {
            errorMessage = "Este CNPJ já está cadastrado no sistema.";
          } else if (companyError.message.includes('email')) {
            errorMessage = "Este email já está cadastrado no sistema.";
          }
        }
        
        toast({
          title: "❌ Erro ao criar empresa",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { data: null, error: companyError };
      }

      if (!companyInsertData) {
        const error = new Error('Empresa criada mas dados não retornados');
        console.error('Company created but no data returned');
        toast({
          title: "❌ Erro ao criar empresa",
          description: "Dados da empresa não foram retornados",
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log('Company created successfully:', companyInsertData);

      toast({
        title: "✅ Cadastro realizado com sucesso!",
        description: "Sua empresa está ativa e pronta para publicar vagas!",
      });

      return { data: authData, error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "❌ Erro no cadastro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session')) {
        console.error('Signout error:', error);
        toast({
          title: "❌ Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: "✅ Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Unexpected signout error:', error);
      toast({
        title: "✅ Logout realizado",
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
