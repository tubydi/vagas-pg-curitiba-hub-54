import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Sparkles, Phone, Mail, MapPin } from "lucide-react"; // Removed Loader2, CreditCard, Shield, CheckCircle
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import AIJobExtractor from "./AIJobExtractor";
// Removed PixPaymentModal import

type JobStatus = Database['public']['Enums']['job_status'];
type ContractType = Database['public']['Enums']['contract_type'];
type WorkMode = Database['public']['Enums']['work_mode'];
type ExperienceLevel = Database['public']['Enums']['experience_level'];

interface Job {
  id?: string;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  contract_type: ContractType;
  work_mode: WorkMode;
  experience_level: ExperienceLevel;
  benefits: string[];
  status?: JobStatus;
  company_id: string;
  application_method?: string;
  contact_info?: string;
  has_external_application?: boolean;
}

interface EnhancedJobFormProps {
  job?: Job | null;
  onSave: () => void;
  onCancel: () => void;
  companyId: string;
}

const EnhancedJobForm = ({ job, onSave, onCancel, companyId }: EnhancedJobFormProps) => {
  const [formData, setFormData] = useState<Job>({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    contract_type: "CLT" as ContractType,
    work_mode: "Presencial" as WorkMode,
    experience_level: "Júnior" as ExperienceLevel,
    benefits: [],
    company_id: companyId,
    application_method: "",
    contact_info: "",
    has_external_application: false,
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIExtractor, setShowAIExtractor] = useState(false);
  // Removed showPaymentModal state
  // Removed companyEmail state
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        application_method: job.application_method || "",
        contact_info: job.contact_info || "",
        has_external_application: job.has_external_application || false,
      });
    }
  }, [job, companyId]);

  // Removed useEffect for fetching company email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.title || !formData.description || !formData.requirements || 
        !formData.salary || !formData.location) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const jobDataToSave = {
        ...formData,
        company_id: companyId,
        status: 'Ativa' as JobStatus, // Always active, no payment involved
        updated_at: new Date().toISOString(),
      };

      if (job?.id) {
        // Atualizar vaga existente
        const { error } = await supabase
          .from('jobs')
          .update(jobDataToSave)
          .eq('id', job.id);

        if (error) throw error;

        toast({
          title: "✅ Sucesso!",
          description: "Vaga atualizada com sucesso!",
        });
      } else {
        // Criar nova vaga - directly insert without payment
        const { error } = await supabase
          .from('jobs')
          .insert([jobDataToSave]);

        if (error) throw error;

        toast({
          title: "✅ Vaga Publicada!",
          description: "Sua vaga foi publicada com sucesso e está ativa!",
        });
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleAIExtraction = (extractedData: Partial<Job>) => {
    setFormData(prev => ({
      ...prev,
      ...extractedData,
      company_id: companyId,
    }));
    setShowAIExtractor(false);
    
    toast({
      title: "🤖 IA aplicada!",
      description: "Dados extraídos e preenchidos automaticamente.",
    });
  };

  return (
    <>
      <Card className="border-0 rounded-3xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-6 md:h-8 w-6 md:w-8 mr-3" />
              {job ? "Editar Vaga" : "Nova Vaga"}
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowAIExtractor(!showAIExtractor)}
              className="text-white hover:bg-white/20 rounded-xl"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Preenchimento Automático</span>
              <span className="md:hidden">IA</span>
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 md:p-8 space-y-6">
          {/* AI Extractor */}
          {showAIExtractor && (
            <div className="mb-6">
              <AIJobExtractor 
                onExtracted={handleAIExtraction} 
                onClose={() => setShowAIExtractor(false)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salário *</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo - SP"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Vaga *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva as responsabilidades e atividades..."
                required
                className="rounded-xl h-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos *</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Liste os requisitos necessários..."
                required
                className="rounded-xl h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Tipo de Contrato *</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value: ContractType) => setFormData(prev => ({ ...prev, contract_type: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modalidade *</Label>
                <Select
                  value={formData.work_mode}
                  onValueChange={(value: WorkMode) => setFormData(prev => ({ ...prev, work_mode: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experiência *</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value: ExperienceLevel) => setFormData(prev => ({ ...prev, experience_level: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
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

            {/* Candidatura Externa */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.has_external_application}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_external_application: checked }))}
                />
                <Label>Permitir candidatura direta com a empresa</Label>
              </div>

              {formData.has_external_application && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Método de Candidatura</Label>
                    <Select
                      value={formData.application_method}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, application_method: value }))}
                    >
                      <SelectTrigger className="rounded-xl">
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

                  <div className="space-y-2">
                    <Label>Informação de Contato</Label>
                    <Input
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="Ex: (42) 9999-9999 ou email@empresa.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Benefícios */}
            <div className="space-y-4">
              <Label>Benefícios</Label>
              
              <div className="flex gap-3">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Ex: Vale refeição, Plano de saúde..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="rounded-xl"
                />
                <Button type="button" onClick={addBenefit} variant="outline" className="rounded-xl">
                  Adicionar
                </Button>
              </div>

              {formData.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 rounded-full">
                      {benefit}
                      <X 
                        className="w-4 h-4 cursor-pointer hover:text-red-500" 
                        onClick={() => removeBenefit(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex-1 h-12 rounded-2xl font-semibold text-lg"
              >
                {isSubmitting ? "Salvando..." : (job ? "Atualizar Vaga" : "Publicar Vaga")}
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

      {/* Removed Payment Modal */}
    </>
  );
};

export default EnhancedJobForm;