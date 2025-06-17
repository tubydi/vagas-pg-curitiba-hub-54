import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingCnpj, setValidatingCnpj] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dados da empresa para cadastro
  const [companyData, setCompanyData] = useState({
    companyName: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    sector: "",
    legalRepresentative: "",
    password: "",
    confirmPassword: "",
    description: ""
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const resendConfirmationEmail = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para reenviar a confirmação.",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentDomain = window.location.origin;
      const redirectUrl = `${currentDomain}/auth`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Erro ao reenviar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada.",
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  const validateCnpj = async (cnpj: string) => {
    try {
      setValidatingCnpj(true);
      
      // Chamar edge function para validar CNPJ
      const { data, error } = await supabase.functions.invoke('validate-cnpj', {
        body: { cnpj: cnpj.replace(/\D/g, '') }
      });

      if (error) {
        console.log('CNPJ validation error (continuing anyway):', error);
        return { valid: true, message: 'Validação offline - prosseguindo' };
      }

      return data || { valid: true, message: 'CNPJ validado' };
    } catch (error) {
      console.log('CNPJ validation error (continuing anyway):', error);
      return { valid: true, message: 'Validação offline - prosseguindo' };
    } finally {
      setValidatingCnpj(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResendButton(false);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error && error.message.includes('Email not confirmed')) {
        setShowResendButton(true);
      } else if (!error) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (companyData.password !== companyData.confirmPassword) {
        toast({
          title: "Erro de validação",
          description: "As senhas não coincidem.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (companyData.password.length < 6) {
        toast({
          title: "Erro de validação", 
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!companyData.companyName || !companyData.cnpj || !companyData.email || !companyData.phone) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validar CNPJ (continua mesmo se falhar)
      console.log('Validating CNPJ:', companyData.cnpj);
      const cnpjValidation = await validateCnpj(companyData.cnpj);
      
      if (!cnpjValidation.valid) {
        console.log('CNPJ validation failed, but continuing:', cnpjValidation.message);
      }

      console.log('Creating user account with email:', companyData.email);

      // Criar usuário no Supabase Auth com o EMAIL CORPORATIVO
      const { error: authError } = await signUp(companyData.email, companyData.password, companyData);
      
      if (authError) {
        console.error('Auth error:', authError);
        setLoading(false);
        return;
      }

      // Mostrar mensagem de confirmação de email
      toast({
        title: "📧 Confirme seu email!",
        description: `Enviamos um email de confirmação para ${companyData.email}. Clique no link para ativar sua conta e depois faça login.`,
        duration: 10000, // 10 segundos para ler
      });

      // Limpar formulário
      setCompanyData({
        companyName: "",
        cnpj: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        sector: "",
        legalRepresentative: "",
        password: "",
        confirmPassword: "",
        description: ""
      });

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleCompanyInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              Entre com seu email corporativo ou cadastre sua empresa
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showResendButton && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Seu email ainda não foi confirmado. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1 text-yellow-600 underline"
                    onClick={resendConfirmationEmail}
                  >
                    Clique aqui para reenviar o email de confirmação
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@suaempresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                    <p className="text-xs text-gray-500">
                      Use o mesmo email que você cadastrou sua empresa
                    </p>
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
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Dados da Empresa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Dados da Empresa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Nome da Empresa *</Label>
                        <Input
                          id="companyName"
                          value={companyData.companyName}
                          onChange={(e) => handleCompanyInputChange("companyName", e.target.value)}
                          required
                          placeholder="Ex: Tech Solutions Ltda"
                          className="rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cnpj">CNPJ *</Label>
                        <Input
                          id="cnpj"
                          value={formatCnpj(companyData.cnpj)}
                          onChange={(e) => handleCompanyInputChange("cnpj", e.target.value)}
                          required
                          placeholder="00.000.000/0000-00"
                          className="rounded-xl"
                          maxLength={18}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-email">E-mail Corporativo * (para login)</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={companyData.email}
                          onChange={(e) => handleCompanyInputChange("email", e.target.value)}
                          required
                          placeholder="contato@suaempresa.com"
                          className="rounded-xl"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Este será seu email de login
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={formatPhone(companyData.phone)}
                          onChange={(e) => handleCompanyInputChange("phone", e.target.value)}
                          required
                          placeholder="(42) 99999-9999"
                          className="rounded-xl"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço Completo *</Label>
                      <Input
                        id="address"
                        value={companyData.address}
                        onChange={(e) => handleCompanyInputChange("address", e.target.value)}
                        required
                        placeholder="Rua, número, bairro, CEP"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Select value={companyData.city} onValueChange={(value) => handleCompanyInputChange("city", value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                            <SelectItem value="Curitiba">Curitiba</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="sector">Área de Atuação *</Label>
                        <Select value={companyData.sector} onValueChange={(value) => handleCompanyInputChange("sector", value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                            <SelectItem value="educacao">Educação</SelectItem>
                            <SelectItem value="saude">Saúde</SelectItem>
                            <SelectItem value="industria">Indústria</SelectItem>
                            <SelectItem value="servicos">Serviços</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="legalRepresentative">Responsável Legal *</Label>
                      <Input
                        id="legalRepresentative"
                        value={companyData.legalRepresentative}
                        onChange={(e) => handleCompanyInputChange("legalRepresentative", e.target.value)}
                        required
                        placeholder="Nome completo do responsável"
                        className="rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição da Empresa</Label>
                      <Textarea
                        id="description"
                        value={companyData.description}
                        onChange={(e) => handleCompanyInputChange("description", e.target.value)}
                        placeholder="Conte um pouco sobre sua empresa, missão, valores..."
                        className="h-24 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Dados de Acesso */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Dados de Acesso
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-password">Senha *</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={companyData.password}
                          onChange={(e) => handleCompanyInputChange("password", e.target.value)}
                          required
                          placeholder="Mínimo 6 caracteres"
                          className="rounded-xl"
                          minLength={6}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={companyData.confirmPassword}
                          onChange={(e) => handleCompanyInputChange("confirmPassword", e.target.value)}
                          required
                          placeholder="Confirme sua senha"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12 text-lg"
                    disabled={loading || validatingCnpj}
                  >
                    {loading ? "Cadastrando..." : validatingCnpj ? "Validando CNPJ..." : "Cadastrar Empresa"}
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
      </div>
    </div>
  );
};

export default Auth;
