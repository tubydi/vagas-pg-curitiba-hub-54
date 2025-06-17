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

  const checkAdminStatus = async (userEmail: string | undefined) => {
    console.log('🔍🔍🔍 VERIFICANDO ADMIN PARA:', userEmail);
    
    if (!userEmail) {
      console.log('❌ Sem email, não é admin');
      setIsAdmin(false);
      return;
    }

    // VERIFICAÇÃO DIRETA: se o email é admin@vagaspg.com, É ADMIN!
    if (userEmail === 'admin@vagaspg.com') {
      console.log('🔥🔥🔥 EMAIL É ADMIN@VAGASPG.COM - DEFININDO COMO ADMIN!');
      setIsAdmin(true);
      return;
    }

    console.log('❌ Email não é admin@vagaspg.com, não é admin');
    setIsAdmin(false);
  };

  useEffect(() => {
    console.log('🚀 Iniciando AuthProvider...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        console.log('👤 Session user:', session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('✅ Usuário logado:', session.user.email);
          await checkAdminStatus(session.user.email);
        } else {
          console.log('❌ Usuário deslogado');
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Sessão inicial:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.email);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
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
        console.log('✅ Login bem-sucedido para:', email);
        
        // Verificar status de admin imediatamente após o login
        await checkAdminStatus(email);
        
        // Verificar se é admin e mostrar mensagem especial
        if (email === 'admin@vagaspg.com') {
          toast({
            title: "🔑 Login de Administrador",
            description: "Bem-vindo ao painel administrativo!",
          });
        } else {
          toast({
            title: "Login realizado",
            description: "Bem-vindo de volta!",
          });
        }
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Erro catch no login:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, companyData?: any) => {
    try {
      console.log('📝 Tentando cadastro para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyData?.companyName || '',
            cnpj: companyData?.cnpj || ''
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
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
        console.log('✅ Usuário criado:', data.user.id);
        
        if (companyData) {
          console.log('🏢 Criando dados da empresa...');
          
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
              console.error('❌ Erro ao criar empresa:', companyError);
            } else {
              console.log('✅ Dados da empresa criados');
            }
          } catch (companyCreationError) {
            console.error('❌ Erro na criação da empresa:', companyCreationError);
          }
        }

        toast({
          title: "✅ Conta criada com sucesso!",
          description: "Você já pode fazer login com suas credenciais.",
          duration: 5000,
        });

        setTimeout(async () => {
          console.log('🔄 Tentando auto-login...');
          const { error: loginError } = await signIn(email, password);
          if (!loginError) {
            console.log('✅ Auto-login realizado');
          } else {
            console.log('❌ Auto-login falhou');
            toast({
              title: "Faça login",
              description: "Use suas credenciais para acessar sua conta.",
            });
          }
        }, 2000);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Erro catch no cadastro:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }

      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
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
