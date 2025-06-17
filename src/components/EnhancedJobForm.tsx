
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, X, Sparkles, Phone, Mail, MapPin } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import AIJobExtractor from "./AIJobExtractor";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
  }, [job]);

  const validateField = (text: string): string[] => {
    const errors: string[] = [];
    
    // Verificar emojis problemáticos
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(text)) {
      errors.push("Emojis podem causar problemas. Considere removê-los.");
    }
    
    // Verificar caracteres especiais problemáticos
    const problematicChars = /['""`´''""]/g;
    if (problematicChars.test(text)) {
      errors.push("Aspas especiais podem causar problemas. Use aspas simples (') ou duplas (\") padrão.");
    }
    
    return errors;
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    // Validar todos os campos de texto
    const fieldsToValidate = [
      { field: formData.title, name: "Título" },
      { field: formData.description, name: "Descrição" },
      { field: formData.requirements, name: "Requisitos" },
      { field: formData.salary, name: "Salário" },
      { field: formData.location, name: "Localização" }
    ];
    
    fieldsToValidate.forEach(({ field, name }) => {
      const fieldErrors = validateField(field);
      if (fieldErrors.length > 0) {
        errors.push(`${name}: ${fieldErrors.join(", ")}`);
      }
    });
    
    // Validar benefícios
    formData.benefits.forEach((benefit, index) => {
      const benefitErrors = validateField(benefit);
      if (benefitErrors.length > 0) {
        errors.push(`Benefício ${index + 1}: ${benefitErrors.join(", ")}`);
      }
    });
    
    // Validar campos de candidatura se external application estiver ativa
    if (formData.has_external_application) {
      if (formData.application_method) {
        const methodErrors = validateField(formData.application_method);
        if (methodErrors.length > 0) {
          errors.push(`Método de candidatura: ${methodErrors.join(", ")}`);
        }
      }
      
      if (formData.contact_info) {
        const contactErrors = validateField(formData.contact_info);
        if (contactErrors.length > 0) {
          errors.push(`Informações de contato: ${contactErrors.join(", ")}`);
        }
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ Problemas encontrados",
        description: "Verifique os erros listados abaixo e corrija antes de publicar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        company_id: companyId,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (job?.id) {
        // Atualizar vaga existente
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);
      } else {
        // Criar nova vaga
        result = await supabase
          .from('jobs')
          .insert([{
            ...jobData,
            created_at: new Date().toISOString(),
          }]);
      }

      if (result.error) {
        console.error('Erro ao salvar vaga:', result.error);
        
        // Mensagem de erro mais específica
        let errorMessage = "Erro ao salvar vaga.";
        if (result.error.message.includes('invalid input value for enum')) {
          errorMessage = "Valor inválido selecionado. Verifique os campos obrigatórios.";
        } else if (result.error.message.includes('duplicate')) {
          errorMessage = "Já existe uma vaga com essas informações.";
        }
        
        toast({
          title: "❌ Erro",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Sucesso!",
        description: job?.id ? "Vaga atualizada com sucesso!" : "Vaga publicada com sucesso!",
      });

      onSave();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao salvar vaga.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      const benefitErrors = validateField(newBenefit.trim());
      if (benefitErrors.length > 0) {
        toast({
          title: "⚠️ Problema no benefício",
          description: benefitErrors.join(", "),
          variant: "destructive",
        });
        return;
      }
      
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
      description: "Dados extraídos e preenchidos automaticamente, incluindo informações de candidatura.",
    });
  };

  return (
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
        {/* Mostrar erros de validação */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Problemas encontrados:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_type">Tipo de Contrato *</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value: ContractType) => 
                  setFormData(prev => ({ ...prev, contract_type: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione" />
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
              <Label htmlFor="work_mode">Modalidade *</Label>
              <Select
                value={formData.work_mode}
                onValueChange={(value: WorkMode) => 
                  setFormData(prev => ({ ...prev, work_mode: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experiência *</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value: ExperienceLevel) => 
                  setFormData(prev => ({ ...prev, experience_level: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione" />
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Vaga *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva as responsabilidades e o que a empresa oferece..."
              className="min-h-[120px] rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos *</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Liste os requisitos técnicos e experiências necessárias..."
              className="min-h-[120px] rounded-xl"
              required
            />
          </div>

          {/* Seção de Candidatura Externa */}
          <div className="space-y-4 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold text-blue-900">📞 Candidatura Direta com a Empresa</Label>
                <p className="text-sm text-blue-700 mt-1">
                  Habilite para permitir que candidatos se candidatem diretamente via WhatsApp, email, etc.
                </p>
              </div>
              <Switch
                checked={formData.has_external_application || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, has_external_application: checked }))
                }
              />
            </div>

            {formData.has_external_application && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_method">Método de Candidatura</Label>
                    <Select
                      value={formData.application_method || ""}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, application_method: value }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Como se candidatar?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WhatsApp">📱 WhatsApp</SelectItem>
                        <SelectItem value="Email">📧 Email</SelectItem>
                        <SelectItem value="Telefone">📞 Telefone</SelectItem>
                        <SelectItem value="Presencial">🏢 Entrega Presencial</SelectItem>
                        <SelectItem value="Site">🌐 Site da Empresa</SelectItem>
                        <SelectItem value="Outro">🔗 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Informações de Contato</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="WhatsApp, email, endereço, etc..."
                      className="rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Quando ativado, os candidatos terão duas opções: se candidatar pelo site ou entrar em contato diretamente com sua empresa.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Benefícios</Label>
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Ex: Vale refeição, Plano de saúde..."
                className="flex-1 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button
                type="button"
                onClick={addBenefit}
                variant="outline"
                className="rounded-xl"
              >
                Adicionar
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-sm"
                >
                  {benefit}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBenefit(index)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl h-12 font-semibold text-lg flex-1"
            >
              {isSubmitting ? "Salvando..." : (job ? "💾 Atualizar Vaga" : "🚀 Publicar Vaga")}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-2xl h-12 font-semibold text-lg flex-1 md:flex-none md:w-32"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedJobForm;
