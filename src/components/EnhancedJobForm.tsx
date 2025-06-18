import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import PixPaymentModal from "./PixPaymentModal";

type ContractType = Database["public"]["Enums"]["contract_type"];
type WorkMode = Database["public"]["Enums"]["work_mode"];
type ExperienceLevel = Database["public"]["Enums"]["experience_level"];

interface EnhancedJobFormProps {
  job?: any;
  onSave: () => void;
  onCancel: () => void;
  companyId: string;
}

const EnhancedJobForm = ({ job, onSave, onCancel, companyId }: EnhancedJobFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [companyEmail, setCompanyEmail] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    contract_type: "" as ContractType,
    work_mode: "" as WorkMode,
    experience_level: "" as ExperienceLevel,
    has_external_application: false,
    application_method: "",
    contact_info: ""
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        salary: job.salary || "",
        location: job.location || "",
        contract_type: job.contract_type || "" as ContractType,
        work_mode: job.work_mode || "" as WorkMode,
        experience_level: job.experience_level || "" as ExperienceLevel,
        has_external_application: job.has_external_application || false,
        application_method: job.application_method || "",
        contact_info: job.contact_info || ""
      });
      setBenefitsList(job.benefits || []);
    }
    
    // Buscar email da empresa
    fetchCompanyEmail();
  }, [job, companyId]);

  const fetchCompanyEmail = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('email')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Erro ao buscar email da empresa:', error);
      } else if (data) {
        setCompanyEmail(data.email);
      }
    } catch (error) {
      console.error('Erro ao buscar email da empresa:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== INICIANDO CRIAÇÃO DE VAGA ===');
    console.log('Company ID:', companyId);
    console.log('Form Data:', formData);

    // Validar campos obrigatórios
    if (!formData.title || !formData.description || !formData.requirements || 
        !formData.salary || !formData.location || !formData.contract_type || 
        !formData.work_mode || !formData.experience_level) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado. Tente fazer logout e login novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const jobData = {
        ...formData,
        benefits: benefitsList,
        company_id: companyId,
        status: 'Ativa' as const // Sempre ativa inicialmente
      };

      console.log('Dados da vaga a serem inseridos:', jobData);

      if (job?.id) {
        // Atualizar vaga existente
        console.log('Atualizando vaga existente:', job.id);
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);

        if (error) {
          console.error('Erro ao atualizar vaga:', error);
          throw error;
        }

        toast({
          title: "✅ Vaga atualizada!",
          description: "A vaga foi atualizada com sucesso!",
        });
        
        onSave();
      } else {
        // Nova vaga
        console.log('Criando nova vaga...');
        const { data: insertedData, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar vaga:', error);
          throw error;
        }

        console.log('Vaga criada com sucesso:', insertedData);
        setCreatedJobId(insertedData.id);

        // Verificar se é empresa isenta
        if (companyEmail === 'vagas@vagas.com') {
          toast({
            title: "✅ Vaga Publicada Gratuitamente!",
            description: "Sua empresa está isenta de pagamento. A vaga já está ativa!",
          });
          onSave();
        } else {
          // Mostrar modal de pagamento
          toast({
            title: "✅ Vaga Publicada!",
            description: "Sua vaga foi publicada! Realize o pagamento PIX para manter ativa.",
          });
          setShowPaymentModal(true);
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar vaga. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefitsList.includes(newBenefit.trim())) {
      setBenefitsList([...benefitsList, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBenefitsList(benefitsList.filter(b => b !== benefit));
  };

  const createJobForPayment = async () => {
    // Job já foi criado, apenas retornar sucesso
    return { success: true, jobId: createdJobId };
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    onSave();
  };

  return (
    <>
      <Card className="border-0 rounded-3xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
          <CardTitle className="text-2xl font-bold text-center">
            {job ? "Editar Vaga" : "Nova Vaga"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Informações Básicas</h4>
              
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Título da Vaga *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  placeholder="Ex: Desenvolvedor Full Stack"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">Descrição da Vaga *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  placeholder="Descreva as principais responsabilidades e atividades..."
                  className="mt-2 h-32 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="requirements" className="text-base font-semibold">Requisitos *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  required
                  placeholder="Liste os requisitos técnicos e experiências necessárias..."
                  className="mt-2 h-24 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Condições da Vaga</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salary" className="text-base font-semibold">Faixa Salarial *</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                    required
                    placeholder="Ex: R$ 5.000 - R$ 8.000"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-base font-semibold">Local *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                      <SelectItem value="Curitiba">Curitiba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="contract_type" className="text-base font-semibold">Tipo de Contrato *</Label>
                  <Select value={formData.contract_type} onValueChange={(value) => handleInputChange("contract_type", value)}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work_mode" className="text-base font-semibold">Modalidade *</Label>
                  <Select value={formData.work_mode} onValueChange={(value) => handleInputChange("work_mode", value)}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Remoto">Remoto</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience_level" className="text-base font-semibold">Experiência *</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange("experience_level", value)}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estagiário">Estagiário</SelectItem>
                      <SelectItem value="Júnior">Júnior</SelectItem>
                      <SelectItem value="Pleno">Pleno</SelectItem>
                      <SelectItem value="Sênior">Sênior</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Candidatura Externa</h4>
              
              <div className="flex items-center space-x-3">
                <Switch
                  id="has_external_application"
                  checked={formData.has_external_application}
                  onCheckedChange={(checked) => handleInputChange("has_external_application", checked)}
                />
                <Label htmlFor="has_external_application" className="text-base font-semibold">
                  Permitir candidatura direta com a empresa
                </Label>
              </div>

              {formData.has_external_application && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="application_method" className="text-base font-semibold">Método de Candidatura</Label>
                    <Select value={formData.application_method} onValueChange={(value) => handleInputChange("application_method", value)}>
                      <SelectTrigger className="mt-2 h-12 rounded-xl">
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Telefone">Telefone</SelectItem>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contact_info" className="text-base font-semibold">Informação de Contato</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => handleInputChange("contact_info", e.target.value)}
                      placeholder="Ex: (42) 9999-9999 ou email@empresa.com"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Benefícios</h4>
              
              <div className="flex gap-3">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Ex: Vale refeição, Plano de saúde..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="h-12 rounded-xl"
                />
                <Button type="button" onClick={addBenefit} variant="outline" className="rounded-xl px-6">
                  Adicionar
                </Button>
              </div>

              {benefitsList.length > 0 && (
                <Card className="rounded-2xl border-green-100">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {benefitsList.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-full px-3 py-1">
                          {benefit}
                          <X 
                            className="w-4 h-4 cursor-pointer hover:text-red-500" 
                            onClick={() => removeBenefit(benefit)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex-1 h-12 rounded-2xl font-semibold text-lg"
              >
                {loading ? "Salvando..." : (job ? "Atualizar Vaga" : "Publicar Vaga")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1 h-12 rounded-2xl font-semibold"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Pagamento PIX */}
      {showPaymentModal && (
        <PixPaymentModal
          jobTitle={formData.title}
          companyEmail={companyEmail}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
          createJobFn={createJobForPayment}
        />
      )}
    </>
  );
};

export default EnhancedJobForm;
