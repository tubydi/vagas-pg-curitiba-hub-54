
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular login bem-sucedido
    toast({
      title: "Login realizado com sucesso!",
      description: "Redirecionando para seu dashboard...",
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold company-gradient bg-clip-text text-transparent">
                Vagas PG
              </h1>
            </div>
            <CardTitle className="text-2xl text-gray-900">Login da Empresa</CardTitle>
            <CardDescription>
              Acesse seu painel para gerenciar suas vagas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  placeholder="Sua senha"
                />
              </div>

              <Button type="submit" className="w-full h-12 company-gradient text-white text-lg">
                Entrar
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Cadastre sua empresa
                  </Link>
                </p>
                <p className="text-sm">
                  <a href="#" className="text-gray-500 hover:text-gray-700">
                    Esqueceu sua senha?
                  </a>
                </p>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
