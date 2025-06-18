import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import PixPaymentModal from "./PixPaymentModal";
import AIJobExtractor from "./AIJobExtractor";

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
  const [showAIExtractor, setShowAIExtractor] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "Ponta Grossa",
    contract_type: "CLT" as ContractType,
    work_mode: "Presencial" as WorkMode,
    experience_level: "Júnior" as ExperienceLevel,
    has_external_application: false,
    application_method: "",
    contact_info: ""
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  useEffect(() => {
    if (job) {
      console.log('Loading job data for editing:', job);
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        salary: job.salary || "",
        location: job.location || "Ponta Grossa",
        contract_type: job.contract_type || "CLT",
        work_mode: job.work_mode || "Presencial",
        experience_level: job.experience_level || "Júnior",
        has_external_application: job.has_external_application || false,
        application_method: job.application_method || "",
        contact_info: job.contact_info || ""
      });
      setBenefitsList(job.benefits || []);
    }
    
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
        console.error('Error fetching company email:', error);
      } else if (data) {
        setCompanyEmail(data.email);
        console.log('Company email loaded:', data.email);
      }
    } catch (error) {
      console.error('Error fetching company email:', error);
    }
  };

  const handleAIExtraction = (extractedData: any) => {
    console.log('AI extracted data:', extractedData);
    
    setFormData({
      title: extractedData.title || "",
      description: extractedData.description || "",
      requirements: extractedData.requirements || "",
      salary: extractedData.salary || "",
      location: extractedData.location || "Ponta Grossa",
      contract_type: extractedData.contract_type || "CLT",
      work_mode: extractedData.work_mode || "Presencial",
      experience_level: extractedData.experience_level || "Júnior",
      has_external_application: extractedData.has_external_application || false,
      application_method: extractedData.application_method || "",
      contact_info: extractedData.contact_info || ""
    });

    if (extractedData.benefits && Array.isArray(extractedData.benefits)) {
      setBenefitsList(extractedData.benefits);
    }

    setShowAIExtractor(false);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push("Título da vaga é obrigatório");
    if (!formData.description.trim()) errors.push("Descrição da vaga é obrigatória");
    if (!formData.requirements.trim()) errors.push("Requisitos são obrigatórios");
    if (!formData.salary.trim()) errors.push("Faixa salarial é obrigatória");
    if (!formData.location.trim()) errors.push("Local é obrigatório");
    if (!formData.contract_type) errors.push("Tipo de contrato é obrigatório");
    if (!formData.work_mode) errors.push("Modalidade é obrigatória");
    if (!formData.experience_level) errors.push("Nível de experiência é obrigatório");
    
    if (formData.has_external_application && !formData.contact_info.trim()) {
      errors.push("Informação de contato é obrigatória quando candidatura externa está habilitada");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== STARTING JOB SUBMISSION ===');
    console.log('Company ID:', companyId);
    console.log('Company Email:', companyEmail);
    console.log('Form Data:', formData);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      toast({
        title: "❌ Erro de Validação",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (!companyId) {
      console.error('No company ID provided');
      toast({
        title: "❌ Erro",
        description: "ID da empresa não encontrado.",
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
        status: 'Ativa' as const // Always use 'Ativa' status
      };

      console.log('=== JOB DATA TO BE SAVED ===');
      console.log(jobData);

      if (job?.id) {
        // Update existing job
        console.log('=== UPDATING EXISTING JOB ===', job.id);
        const { data: updatedJob, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating job:', error);
          throw new Error(`Erro ao atualizar vaga: ${error.message}`);
        }

        console.log('Job updated successfully:', updatedJob);
        toast({
          title: "✅ Vaga atualizada!",
          description: "A vaga foi atualizada com sucesso!",
        });
        
        onSave();
      } else {
        // Create new job
        console.log('=== CREATING NEW JOB ===');
        const { data: insertedData, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()
          .single();

        if (error) {
          console.error('Error creating job:', error);
          throw new Error(`Erro ao criar vaga: ${error.message}`);
        }

        if (!insertedData) {
          throw new Error('Vaga criada mas dados não retornados');
        }

        console.log('Job created successfully:', insertedData);
        setCreatedJobId(insertedData.id);

        // Check if company is exempt from payment
        const isExemptCompany = companyEmail === 'vagas@vagas.com' || companyEmail === 'admin@vagaspg.com';
        
        if (isExemptCompany) {
          console.log('Company is exempt from payment');
          toast({
            title: "✅ Vaga Publicada Gratuitamente!",
            description: "Sua empresa está isenta de pagamento. A vaga já está ativa!",
          });
          onSave();
        } else {
          console.log('Company requires payment, showing payment modal');
          toast({
            title: "✅ Vaga Publicada!",
            description: "Sua vaga foi publicada! Realize o pagamento PIX para manter ativa.",
          });
          setShowPaymentModal(true);
        }
      }
    } catch (error: any) {
      console.error('=== ERROR SAVING JOB ===');
      console.error('Error details:', error);
      
      let errorMessage = "Erro desconhecido ao salvar vaga";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "❌ Erro ao salvar vaga",
        description: errorMessage,
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
    return { success: true, jobId: createdJobId };
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    onSave();
  };

  if (showAIExtractor) {
    return (
      <AIJobExtractor
        onExtracted={handleAIExtraction}
        onClose={() => setShowAIExtractor(false)}
      />
    );
  }

  return (
    <>
      <Card className="border-0 rounded-3xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {job ? "Editar Vaga" : "Nova Vaga"}
            </CardTitle>
            {!job && (
              <Button
                onClick={() => setShowAIExtractor(true)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                🤖 IA
              </Button>
            )}
          </div>
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
                    <Label htmlFor="contact_info" className="text-base font-semibold">Informação de Contato *</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => handleInputChange("contact_info", e.target.value)}
                      placeholder="Ex: (42) 9999-9999 ou email@empresa.com"
                      className="mt-2 h-12 rounded-xl"
                      required={formData.has_external_application}
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
