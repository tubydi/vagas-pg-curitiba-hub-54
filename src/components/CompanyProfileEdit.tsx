
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Save, Edit3 } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  sector: string;
  legal_representative: string;
  description: string;
  status: string;
}

const CompanyProfileEdit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    sector: "",
    legal_representative: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching company data:', error);
        return;
      }

      setCompanyData(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        sector: data.sector || "",
        legal_representative: data.legal_representative || "",
        description: data.description || "",
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!companyData) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          sector: formData.sector,
          legal_representative: formData.legal_representative,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyData.id);

      if (error) {
        console.error('Error updating company:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar informações da empresa.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Sucesso!",
        description: "Informações da empresa atualizadas com sucesso.",
      });

      setIsEditing(false);
      fetchCompanyData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !companyData) {
    return (
      <Card className="border-0 rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações da empresa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 rounded-3xl shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8" />
            <CardTitle className="text-2xl font-bold">
              Informações da Empresa
            </CardTitle>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  if (companyData) {
                    setFormData({
                      name: companyData.name || "",
                      email: companyData.email || "",
                      phone: companyData.phone || "",
                      address: companyData.address || "",
                      city: companyData.city || "",
                      sector: companyData.sector || "",
                      legal_representative: companyData.legal_representative || "",
                      description: companyData.description || "",
                    });
                  }
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">Nome da Empresa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="cnpj" className="text-base font-semibold">CNPJ</Label>
              <Input
                id="cnpj"
                value={companyData?.cnpj || ""}
                disabled
                className="mt-2 h-12 rounded-xl bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">CNPJ não pode ser alterado</p>
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-semibold">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="legal_representative" className="text-base font-semibold">Representante Legal</Label>
              <Input
                id="legal_representative"
                value={formData.legal_representative}
                onChange={(e) => handleInputChange("legal_representative", e.target.value)}
                disabled={!isEditing}
                className="mt-2 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-base font-semibold">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-base font-semibold">Cidade</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => handleInputChange("city", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-2 h-12 rounded-xl">
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                  <SelectItem value="Curitiba">Curitiba</SelectItem>
                  <SelectItem value="Castro">Castro</SelectItem>
                  <SelectItem value="Carambeí">Carambeí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sector" className="text-base font-semibold">Setor</Label>
              <Select 
                value={formData.sector} 
                onValueChange={(value) => handleInputChange("sector", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-2 h-12 rounded-xl">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Varejo">Varejo</SelectItem>
                  <SelectItem value="Indústria">Indústria</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Agricultura">Agricultura</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-semibold">Descrição da Empresa</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={!isEditing}
                placeholder="Descreva sua empresa, valores e atividades..."
                className="mt-2 h-24 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Status da Empresa</Label>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  companyData?.status === 'Ativa' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {companyData?.status || 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileEdit;
