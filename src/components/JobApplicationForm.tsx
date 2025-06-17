
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
      setResume(e.target.files[0]);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload do currículo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando envio da candidatura...');
      
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
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
      const experienceYears = formData.experience_years ? parseInt(formData.experience_years) : null;

      const applicationData = {
        job_id: job.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin || null,
        experience_years: experienceYears,
        current_position: formData.current_position || null,
        education: formData.education || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        cover_letter: formData.cover_letter || null,
        resume_url: resumeUrl,
        status: 'Novo'
      };

      console.log('Dados da candidatura:', applicationData);

      // Inserir candidatura no banco
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select();

      if (error) {
        console.error('Erro ao inserir candidatura:', error);
        throw error;
      }

      console.log('Candidatura inserida com sucesso:', data);

      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
      });

      onClose();
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao enviar candidatura",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Candidatar-se para {job.title}</CardTitle>
        <CardDescription>
          {job.companies?.name || job.company} - {job.location}
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
                value={formData.experience_years}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_position">Cargo Atual</Label>
              <Input
                id="current_position"
                name="current_position"
                value={formData.current_position}
                onChange={handleInputChange}
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
            <Label htmlFor="resume">Currículo (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;
