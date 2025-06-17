
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate("/dashboard");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await signUp(email, password);
    setLoading(false);
  };

  const handleAdminLogin = () => {
    setEmail("admin@vagaspg.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              VAGAS PG
            </h1>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-3xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre ou cadastre sua empresa
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>

                {/* Botão de Login Admin */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAdminLogin}
                    className="w-full rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    🔑 Login como Administrador
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Clique para preencher credenciais de admin automaticamente
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email da Empresa</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="contato@suaempresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Crie uma senha segura (mín. 6 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl"
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                    disabled={loading}
                  >
                    {loading ? "Cadastrando..." : "Cadastrar Empresa"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Problemas com acesso? Entre em contato:
            <br />
            <span className="text-green-600 font-medium">contato@vagaspg.com</span>
          </p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">📧 Credenciais de Admin:</p>
            <p className="text-blue-700">Email: admin@vagaspg.com</p>
            <p className="text-blue-700">Senha: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
