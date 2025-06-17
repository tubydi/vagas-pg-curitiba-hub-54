
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save } from "lucide-react";

interface Company {
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
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching company:', error);
        return;
      }

      setCompany(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          sector: company.sector,
          legal_representative: company.legal_representative,
          description: company.description,
        })
        .eq('id', company.id);

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
        title: "Sucesso",
        description: "Informações da empresa atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando informações...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <Card className="border-0 rounded-3xl shadow-lg">
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Empresa não encontrada</h3>
          <p className="text-gray-500">
            Não foi possível carregar as informações da empresa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 rounded-3xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
        <CardTitle className="text-xl md:text-2xl font-bold flex items-center">
          <Building2 className="h-6 md:h-8 w-6 md:w-8 mr-3" />
          Informações da Empresa
        </CardTitle>
        <CardDescription className="text-green-100">
          Atualize os dados da sua empresa
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={company.name}
              onChange={(e) => setCompany({...company, name: e.target.value})}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={company.cnpj}
              disabled
              className="rounded-xl bg-gray-100"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={company.email}
              onChange={(e) => setCompany({...company, email: e.target.value})}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={company.phone}
              onChange={(e) => setCompany({...company, phone: e.target.value})}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={company.city}
              onChange={(e) => setCompany({...company, city: e.target.value})}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="sector">Setor</Label>
            <Input
              id="sector"
              value={company.sector}
              onChange={(e) => setCompany({...company, sector: e.target.value})}
              className="rounded-xl"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={company.address}
            onChange={(e) => setCompany({...company, address: e.target.value})}
            className="rounded-xl"
          />
        </div>
        
        <div>
          <Label htmlFor="legal_representative">Representante Legal</Label>
          <Input
            id="legal_representative"
            value={company.legal_representative}
            onChange={(e) => setCompany({...company, legal_representative: e.target.value})}
            className="rounded-xl"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição da Empresa</Label>
          <Textarea
            id="description"
            value={company.description}
            onChange={(e) => setCompany({...company, description: e.target.value})}
            className="rounded-xl"
            rows={4}
            placeholder="Descreva sua empresa..."
          />
        </div>
        
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl h-12"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileEdit;
