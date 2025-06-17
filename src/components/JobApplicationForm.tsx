
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JobApplicationFormProps {
  job: any;
  onClose: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    experience_years: '',
    current_position: '',
    education: '',
    skills: '',
    cover_letter: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, envie apenas arquivos PDF ou Word (.doc, .docx)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho do arquivo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }

      setResume(file);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      console.log('Iniciando upload do currículo:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { data, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload realizado com sucesso:', data);

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload do currículo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Por favor, informe seu telefone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando envio da candidatura para vaga:', job.id);
      
      // Upload do currículo se fornecido
      let resumeUrl = null;
      if (resume) {
        console.log('Fazendo upload do currículo...');
        resumeUrl = await uploadResume(resume);
        if (!resumeUrl) {
          throw new Error('Falha no upload do currículo');
        }
        console.log('Upload do currículo concluído:', resumeUrl);
      }

      // Preparar dados para inserção
      const skillsArray = formData.skills.trim() 
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : null;
      
      const experienceYears = formData.experience_years 
        ? parseInt(formData.experience_years) 
        : null;

      const applicationData = {
        job_id: job.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        linkedin: formData.linkedin.trim() || null,
        experience_years: experienceYears,
        current_position: formData.current_position.trim() || null,
        education: formData.education.trim() || null,
        skills: skillsArray,
        cover_letter: formData.cover_letter.trim() || null,
        resume_url: resumeUrl,
        status: 'Novo'
      };

      console.log('Dados da candidatura:', applicationData);

      // Inserir candidatura no banco
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir candidatura:', error);
        throw error;
      }

      console.log('Candidatura inserida com sucesso:', data);

      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
      });

      // Fechar o formulário
      onClose();
    } catch (error) {
      console.error('Erro completo ao enviar candidatura:', error);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('upload')) {
          errorMessage = "Erro no upload do currículo. Tente novamente ou envie um arquivo diferente.";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "Você já se candidatou para esta vaga.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao enviar candidatura",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se a vaga existe
  if (!job || !job.id) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Vaga não encontrada.</p>
          <Button onClick={onClose} className="w-full mt-4">Fechar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Candidatar-se para {job.title}</CardTitle>
        <CardDescription>
          {job.companies?.name || job.company || 'Empresa'} - {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_years">Anos de Experiência</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={handleInputChange}
                placeholder="Ex: 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_position">Cargo Atual</Label>
              <Input
                id="current_position"
                name="current_position"
                value={formData.current_position}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Formação</Label>
            <Input
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Ex: Graduação em Engenharia de Software"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="Ex: JavaScript, React, Node.js (separar por vírgula)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Currículo (PDF, DOC ou DOCX - máx. 10MB)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
            {resume && (
              <p className="text-sm text-green-600">
                Arquivo selecionado: {resume.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Carta de Apresentação</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleInputChange}
              placeholder="Escreva uma breve apresentação sobre você e por que se interessa por esta vaga..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1"
            >
              {loading ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;
