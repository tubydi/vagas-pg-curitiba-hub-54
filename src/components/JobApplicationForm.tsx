
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface JobApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

const JobApplicationForm = ({ isOpen, onClose, jobId, jobTitle, companyName }: JobApplicationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    experience_years: "",
    current_position: "",
    education: "",
    cover_letter: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setResumeFile(file);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      const fileExt = 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Erro no upload do currículo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha nome, email e telefone.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Upload do currículo se fornecido
      let resumeUrl = null;
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile);
        if (!resumeUrl) {
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload do currículo. Tente novamente.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Preparar dados da candidatura com tipos corretos
      const applicationData = {
        job_id: jobId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        current_position: formData.current_position || null,
        education: formData.education || null,
        skills: skills.length > 0 ? skills : null,
        cover_letter: formData.cover_letter || null,
        resume_url: resumeUrl,
        status: 'Novo' as ApplicationStatus
      };

      console.log('Dados da candidatura:', applicationData);

      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select();

      if (error) {
        console.error('Erro ao enviar candidatura:', error);
        toast({
          title: "Erro ao enviar candidatura",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Candidatura enviada com sucesso:', data);

      toast({
        title: "Candidatura enviada com sucesso!",
        description: `Sua candidatura para "${jobTitle}" na empresa ${companyName} foi enviada. A empresa entrará em contato em breve.`,
      });

      // Resetar formulário e fechar modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        experience_years: "",
        current_position: "",
        education: "",
        cover_letter: ""
      });
      setSkills([]);
      setResumeFile(null);
      onClose();

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar a candidatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Candidatar-se para {jobTitle}
          </DialogTitle>
          <p className="text-gray-600">Empresa: {companyName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(42) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/seuperfil"
                />
              </div>
            </div>
          </div>

          {/* Experiência Profissional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Experiência Profissional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">Anos de Experiência</Label>
                <Select value={formData.experience_years} onValueChange={(value) => handleInputChange('experience_years', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem experiência</SelectItem>
                    <SelectItem value="1">1 ano</SelectItem>
                    <SelectItem value="2">2 anos</SelectItem>
                    <SelectItem value="3">3 anos</SelectItem>
                    <SelectItem value="4">4 anos</SelectItem>
                    <SelectItem value="5">5 anos</SelectItem>
                    <SelectItem value="6">6+ anos</SelectItem>
                    <SelectItem value="10">10+ anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="current_position">Cargo Atual</Label>
                <Input
                  id="current_position"
                  value={formData.current_position}
                  onChange={(e) => handleInputChange('current_position', e.target.value)}
                  placeholder="Seu cargo atual"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="education">Formação Acadêmica</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Ex: Graduação em Engenharia de Software - UEPG"
              />
            </div>
          </div>

          {/* Habilidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Habilidades</h3>
            
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Digite uma habilidade"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill}
                  <X 
                    className="w-3 h-3 ml-2 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Carta de Apresentação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Carta de Apresentação</h3>
            <Textarea
              value={formData.cover_letter}
              onChange={(e) => handleInputChange('cover_letter', e.target.value)}
              placeholder="Conte um pouco sobre você e por que se interessa por esta vaga..."
              rows={4}
            />
          </div>

          {/* Upload de Currículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Currículo (PDF)</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <Label htmlFor="resume" className="cursor-pointer">
                <span className="text-green-600 hover:text-green-700">
                  Clique para enviar seu currículo (PDF)
                </span>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              <p className="text-sm text-gray-500 mt-1">Máximo 5MB</p>
              {resumeFile && (
                <p className="text-sm text-green-600 mt-2">
                  Arquivo selecionado: {resumeFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Candidatura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationForm;
