
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
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
    console.log('Iniciando AuthProvider...')
    
    // Configurar listener de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Verificar se é admin após o login
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Erro ao verificar role:', error);
                setIsAdmin(false);
              } else {
                setIsAdmin(profile?.role === 'admin');
                console.log('User role:', profile?.role);
              }
            } catch (error) {
              console.error('Erro ao verificar role:', error);
              setIsAdmin(false);
            }
          }, 1000);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Tentando fazer login com:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro no login';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.log('Login bem-sucedido:', data.user?.email);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a)!`,
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('Tentando cadastrar usuário:', email);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error);
      let errorMessage = 'Erro no cadastro';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message.includes('Password should be')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.log('Cadastro realizado:', data.user?.email);
      toast({
        title: "Cadastro realizado!",
        description: "Conta criada com sucesso.",
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
