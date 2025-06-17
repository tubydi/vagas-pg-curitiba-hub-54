
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    setLoading(true);
    try {
      // Criar usuário admin diretamente
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@vagaspg.com',
        password: 'admin123',
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (error) {
        console.error('Admin creation error:', error);
        toast({
          title: "Erro ao criar administrador",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Inserir diretamente na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: 'admin@vagaspg.com',
            role: 'admin'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setAdminCreated(true);
        toast({
          title: "✅ Administrador criado!",
          description: "Use admin@vagaspg.com / admin123 para fazer login",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (adminCreated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Administrador Criado!</CardTitle>
          <CardDescription>
            Use as credenciais abaixo para fazer login como administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> admin@vagaspg.com</p>
            <p><strong>Senha:</strong> admin123</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <CardTitle>Configurar Administrador</CardTitle>
        <CardDescription>
          Criar conta de administrador do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createAdminUser}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Criando..." : "Criar Administrador"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
