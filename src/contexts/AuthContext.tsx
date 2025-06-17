
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, companyData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
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
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin status
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();
              
              setIsAdmin(profile?.role === 'admin');
            } catch (error) {
              console.error('Error checking admin status:', error);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        toast({
          title: "Erro no login",
          description: error.message === 'Invalid login credentials' 
            ? "Email ou senha incorretos" 
            : error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, companyData?: any) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Criar usuário SEM confirmação de email - usando service role key internamente
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Não definir emailRedirectTo para evitar envio de email
          data: {
            company_name: companyData?.companyName || '',
            cnpj: companyData?.cnpj || ''
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Este email já está cadastrado. Tente fazer login ou use outro email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Criar dados da empresa
        if (companyData) {
          console.log('Creating company data for user:', data.user.id);
          
          try {
            const { error: companyError } = await supabase
              .from('companies')
              .insert({
                user_id: data.user.id,
                name: companyData.companyName,
                cnpj: companyData.cnpj,
                email: companyData.email,
                phone: companyData.phone,
                address: companyData.address,
                city: companyData.city,
                sector: companyData.sector,
                legal_representative: companyData.legalRepresentative,
                description: companyData.description || '',
                status: 'Ativa'
              });

            if (companyError) {
              console.error('Company creation error:', companyError);
            } else {
              console.log('Company data created successfully');
            }
          } catch (companyCreationError) {
            console.error('Error creating company:', companyCreationError);
          }
        }

        toast({
          title: "✅ Conta criada com sucesso!",
          description: "Você já pode fazer login com suas credenciais.",
          duration: 5000,
        });

        // Tentar fazer login automaticamente após alguns segundos
        setTimeout(async () => {
          console.log('Attempting auto-login after signup...');
          const { error: loginError } = await signIn(email, password);
          if (!loginError) {
            console.log('Auto-login successful after signup');
          } else {
            console.log('Auto-login failed, user needs to login manually');
            toast({
              title: "Faça login",
              description: "Use suas credenciais para acessar sua conta.",
            });
          }
        }, 2000);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Force clear all local state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
