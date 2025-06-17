
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  createCompanyProfile: (companyData: any) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          const isUserAdmin = session.user.email === 'admin@vagaspg.com';
          setIsAdmin(isUserAdmin);
          
          // Ensure profile exists with timeout to avoid blocking
          setTimeout(async () => {
            await ensureProfileExists(session.user);
          }, 100);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const isUserAdmin = session.user.email === 'admin@vagaspg.com';
        setIsAdmin(isUserAdmin);
        
        // Ensure profile exists with timeout to avoid blocking
        setTimeout(async () => {
          await ensureProfileExists(session.user);
        }, 100);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      console.log('Checking if profile exists for user:', user.email);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        console.log('Creating profile for user:', user.email);
        
        const role = user.email === 'admin@vagaspg.com' ? 'admin' : 'company';
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: role
          });

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error creating profile:', error);
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('Profile already exists');
      }
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = 'Erro no login. Tente novamente.';
        
        if (error.message === 'Invalid login credentials') {
          errorMessage = "Email ou senha incorretos. Verifique se você confirmou seu email e se está usando o email corporativo cadastrado.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.";
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
        return { error };
      }

      console.log('Sign in successful');
      toast({
        title: "✅ Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${email}!`,
        duration: 3000,
      });

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('Attempting to sign up:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('weak password')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Aguarde um momento e tente novamente.';
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
        return { error };
      }

      if (data.user && !data.session) {
        console.log('User created, needs email confirmation:', data.user.email);
        return { error: null };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao desconectar.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const createCompanyProfile = async (companyData: any) => {
    try {
      console.log('Creating company profile:', companyData);
      
      if (!user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { error } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyData.name,
          cnpj: companyData.cnpj,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          city: companyData.city,
          sector: companyData.sector,
          legal_representative: companyData.legal_representative,
          description: companyData.description || null,
          status: 'Aprovada' // Automático para facilitar o teste
        });

      if (error) {
        console.error('Error creating company:', error);
        
        let errorMessage = error.message;
        if (error.code === '23505' && error.message.includes('cnpj')) {
          errorMessage = 'Este CNPJ já está cadastrado no sistema.';
        }
        
        toast({
          title: "Erro ao cadastrar empresa",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
        return { error };
      }

      console.log('Company profile created successfully');
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Sua empresa foi cadastrada e aprovada automaticamente.",
        duration: 5000,
      });

      return { error: null };
    } catch (error) {
      console.error('Unexpected error creating company:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao cadastrar a empresa. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    createCompanyProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
