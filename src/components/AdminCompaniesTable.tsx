
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Search, Edit, Trash2, CheckCircle, XCircle, Eye, Mail, Phone, MapPin } from "lucide-react";
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

const AdminCompaniesTable = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
      setSelectedCompany(null);
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
      setSelectedCompany(null);
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
      company.cnpj.includes(searchTerm) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Bloqueada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

      <Card className="border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-blue-500" />
            Empresas Resumidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.city}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(company.status)} rounded-full px-3 py-1 font-semibold`}>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(company.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCompany(company)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building2 className="h-6 w-6 text-blue-500" />
                              {company.name}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedCompany && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center">
                                      <Building2 className="w-5 h-5 mr-3 text-blue-500" />
                                      <div>
                                        <p className="font-medium">{selectedCompany.name}</p>
                                        <p className="text-sm text-gray-600">CNPJ: {selectedCompany.cnpj}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Mail className="w-5 h-5 mr-3 text-green-500" />
                                      <p>{selectedCompany.email}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Phone className="w-5 h-5 mr-3 text-purple-500" />
                                      <p>{selectedCompany.phone}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <MapPin className="w-5 h-5 mr-3 text-red-500" />
                                      <div>
                                        <p>{selectedCompany.city}</p>
                                        <p className="text-sm text-gray-600">{selectedCompany.address}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Detalhes Administrativos</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="font-medium">Status:</p>
                                      <Badge className={`${getStatusColor(selectedCompany.status)}`}>
                                        {selectedCompany.status}
                                      </Badge>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">Setor:</p>
                                      <p className="text-gray-600">{selectedCompany.sector}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">Representante Legal:</p>
                                      <p className="text-gray-600">{selectedCompany.legal_representative}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">User ID:</p>
                                      <p className="text-xs text-gray-500 font-mono">{selectedCompany.user_id}</p>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">Criada em:</p>
                                      <p className="text-gray-600">{new Date(selectedCompany.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedCompany.description && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Descrição da Empresa</h4>
                                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedCompany.description}</p>
                                </div>
                              )}

                              <div className="flex gap-4 pt-4 border-t">
                                {selectedCompany.status === 'Pendente' && (
                                  <Button
                                    onClick={() => updateCompanyStatus(selectedCompany.id, 'Ativa')}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar Empresa
                                  </Button>
                                )}
                                
                                {selectedCompany.status === 'Ativa' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => updateCompanyStatus(selectedCompany.id, 'Bloqueada')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Bloquear Empresa
                                  </Button>
                                )}
                                
                                {selectedCompany.status === 'Bloqueada' && (
                                  <Button
                                    onClick={() => updateCompanyStatus(selectedCompany.id, 'Ativa')}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Reativar Empresa
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline"
                                  onClick={() => deleteCompany(selectedCompany.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir Empresa
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompaniesTable;
