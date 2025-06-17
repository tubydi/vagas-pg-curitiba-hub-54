
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Search, Edit, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CompanyStatus = Database['public']['Enums']['company_status'];

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
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('ADMIN: Buscando TODAS as empresas do banco...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar empresas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas.",
          variant: "destructive",
        });
        return;
      }

      console.log('Total de empresas no banco:', data?.length || 0);
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId: string, newStatus: CompanyStatus) => {
    try {
      console.log('ADMIN: Alterando status da empresa:', companyId, 'para:', newStatus);
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', companyId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da empresa.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status atualizado",
        description: `Status da empresa alterado para ${newStatus}.`,
      });

      fetchCompanies();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const deleteCompany = async (companyId: string) => {
    if (!confirm('⚠️ ATENÇÃO: Tem certeza que deseja excluir esta empresa? Isso também excluirá todas as vagas e candidaturas da empresa. Esta ação não pode ser desfeita!')) return;

    try {
      console.log('ADMIN: Excluindo empresa:', companyId);
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) {
        console.error('Erro ao excluir empresa:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir empresa.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso.",
      });

      fetchCompanies();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchTerm === "" || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando TODAS as empresas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">🔥 ADMIN - GERENCIAR EMPRESAS</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ativa">Ativa</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Bloqueada">Bloqueada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        📊 {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''} no banco de dados
      </div>

      <div className="grid gap-6">
        {filteredCompanies.length === 0 ? (
          <Card className="border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500">
                Ajuste os filtros de busca para encontrar empresas.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="border-0 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-3xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                      <Building2 className="h-6 w-6 mr-2 text-blue-500" />
                      {company.name}
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                        🔥 ADMIN
                      </Badge>
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">📧 {company.email}</p>
                      <p className="text-sm text-gray-600">📱 {company.phone}</p>
                      <p className="text-sm text-gray-600">🏢 CNPJ: {company.cnpj}</p>
                      <p className="text-sm text-gray-600">📍 {company.city}</p>
                      <p className="text-sm text-gray-600">🏭 {company.sector}</p>
                      <p className="text-sm text-gray-600">👤 User ID: {company.user_id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={company.status === 'Ativa' ? 'default' : 
                               company.status === 'Pendente' ? 'secondary' : 'destructive'}
                    >
                      {company.status}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Representante Legal:</strong> {company.legal_representative}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Endereço:</strong> {company.address}
                  </p>
                  {company.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Descrição:</strong> {company.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {company.status === 'Pendente' && (
                    <Button
                      size="sm"
                      onClick={() => updateCompanyStatus(company.id, 'Ativa')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  
                  {company.status === 'Ativa' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCompanyStatus(company.id, 'Bloqueada')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Bloquear
                    </Button>
                  )}
                  
                  {company.status === 'Bloqueada' && (
                    <Button
                      size="sm"
                      onClick={() => updateCompanyStatus(company.id, 'Ativa')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Reativar
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCompany(company.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
