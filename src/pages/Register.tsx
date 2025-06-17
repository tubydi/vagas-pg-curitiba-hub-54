
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (formData.city !== "ponta-grossa" && formData.city !== "curitiba") {
      toast({
        title: "Erro de validação",
        description: "Apenas empresas de Ponta Grossa e Curitiba podem se cadastrar.",
        variant: "destructive"
      });
      return;
    }

    // Simular registro bem-sucedido
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Bem-vindo ao Vagas PG. Redirecionando para seu dashboard...",
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold company-gradient bg-clip-text text-transparent">
                Vagas PG
              </h1>
            </div>
            <CardTitle className="text-2xl text-gray-900">Cadastro de Empresa</CardTitle>
            <CardDescription>
              Publique suas vagas e encontre os melhores talentos da região
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      required
                      placeholder="Ex: Tech Solutions Ltda"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange("cnpj", e.target.value)}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      placeholder="(42) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    placeholder="Rua, número, bairro, CEP"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ponta-grossa">Ponta Grossa</SelectItem>
                        <SelectItem value="curitiba">Curitiba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sector">Área de Atuação *</Label>
                    <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                      <SelectTrigger>
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
                    value={formData.legalRepresentative}
                    onChange={(e) => handleInputChange("legalRepresentative", e.target.value)}
                    required
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição da Empresa</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Conte um pouco sobre sua empresa, missão, valores..."
                    className="h-24"
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
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      placeholder="Confirme sua senha"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button type="submit" className="w-full h-12 company-gradient text-white text-lg">
                  Cadastrar Empresa
                </Button>
                
                <div className="text-center">
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm">
                    Já tem uma conta? Faça login
                  </Link>
                </div>
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

export default Register;
