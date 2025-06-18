import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Briefcase, Building2, Phone, Mail, ExternalLink, CheckCircle, Loader2, Send, Badge } from 'lucide-react';

type ApplicationStatus = Database['public']['Enums']['application_status'];

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
  const [applicationMethod, setApplicationMethod] = useState('site');
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

      // Criar bucket se não existir
      const { error: bucketError } = await supabase.storage
        .createBucket('resumes', { public: false });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Erro ao criar bucket:', bucketError);
      }

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
        : [];
      
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
        skills: skillsArray.length > 0 ? skillsArray : null,
        cover_letter: formData.cover_letter.trim() || null,
        resume_url: resumeUrl,
        status: 'Novo' as ApplicationStatus
      };

      console.log('Dados da candidatura preparados:', applicationData);

      // Inserir candidatura no banco
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao inserir candidatura:', error);
        
        // Tratar erros específicos
        if (error.message.includes('duplicate')) {
          throw new Error('Você já se candidatou para esta vaga');
        } else if (error.message.includes('foreign key')) {
          throw new Error('Vaga não encontrada ou inválida');
        } else {
          throw new Error(`Erro no banco de dados: ${error.message}`);
        }
      }

      console.log('Candidatura inserida com sucesso:', data);

      toast({
        title: "✅ Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. A empresa entrará em contato em breve.",
        duration: 5000,
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
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Vaga não encontrada. Atualize a página e tente novamente.";
        } else if (error.message.includes('banco de dados')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: "Erro ao enviar candidatura",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const message = `Olá! Venho através do site *Vagas PG* (https://vagaspg.vercel.app) e tenho interesse na vaga de *${job.title}* da empresa *${job.companies.name}*.

Meus dados:
• Nome: ${formData.name}
• Email: ${formData.email}
• Telefone: ${formData.phone}
• Cidade: ${formData.address}

${formData.cover_letter ? `Apresentação: ${formData.cover_letter}` : ''}

Aguardo retorno. Obrigado(a)!`;
    
    return encodeURIComponent(message);
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
    <Card className="border-0 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
        <CardTitle className="text-2xl">Candidatar-se para {job.title}</CardTitle>
        <CardDescription className="text-green-100 text-lg">
          {job.companies?.name || job.company || 'Empresa'} - {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-8">
        {/* Opções de Candidatura */}
        <div className="mb-8">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-green-600" />
            Como deseja se candidatar?
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidatura pelo Site */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer" 
                  onClick={() => setApplicationMethod('site')}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  {applicationMethod === 'site' && <CheckCircle className="w-5 h-5 text-green-600 ml-2" />}
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">Candidatar pelo Site</h5>
                <p className="text-sm text-gray-600">
                  Envie seus dados através da plataforma Vagas PG
                </p>
              </CardContent>
            </Card>

            {/* Candidatura Externa */}
            {job.has_external_application && (
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => setApplicationMethod('external')}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      {job.application_method === 'WhatsApp' && <Phone className="w-6 h-6 text-blue-600" />}
                      {job.application_method === 'Email' && <Mail className="w-6 h-6 text-blue-600" />}
                      {!['WhatsApp', 'Email'].includes(job.application_method || '') && <ExternalLink className="w-6 h-6 text-blue-600" />}
                    </div>
                    {applicationMethod === 'external' && <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />}
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Contato Direto via {job.application_method}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Entre em contato diretamente com a empresa
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Formulário ou Contato Direto */}
        {applicationMethod === 'site' && (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="rounded-xl"
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
                  className="rounded-xl"
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
                  placeholder="(42) 99999-9999"
                  className="rounded-xl"
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
                  className="rounded-xl"
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
                  className="rounded-xl"
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
                  className="rounded-xl"
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
                className="rounded-xl"
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
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Currículo (PDF, DOC ou DOCX - máx. 10MB)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="rounded-xl"
              />
              {resume && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Arquivo selecionado: {resume.name}
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
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-12 font-semibold text-lg flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Candidatura
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-2xl h-12 font-semibold text-lg flex-1 md:flex-none md:w-32"
              >
                Fechar
              </Button>
            </div>
          </form>
        )}

        {applicationMethod === 'external' && job.has_external_application && (
          <div className="space-y-6">
            <Card className="bg-blue-50 border border-blue-200 rounded-xl">
              <CardContent className="p-6">
                <h5 className="font-semibold text-blue-900 mb-4">
                  📞 Contato Direto com a Empresa
                </h5>
                <p className="text-blue-700 mb-4">
                  Entre em contato diretamente com a empresa através do método preferido deles:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-3">
                      {job.application_method}
                    </Badge>
                    <span className="font-medium">{job.contact_info}</span>
                  </div>
                  
                  {job.application_method === 'WhatsApp' && job.contact_info && (
                    <Button
                      onClick={() => {
                        const phoneNumber = job.contact_info?.replace(/\D/g, '');
                        const message = generateWhatsAppMessage();
                        window.open(`https://wa.me/55${phoneNumber}?text=${message}`, '_blank');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Enviar WhatsApp
                    </Button>
                  )}
                  
                  {job.application_method === 'Email' && job.contact_info && (
                    <Button
                      onClick={() => {
                        const subject = `Candidatura: ${job.title} - Vagas PG`;
                        const body = `Olá! Venho através do site Vagas PG (https://vagaspg.vercel.app) e tenho interesse na vaga de ${job.title}.`;
                        window.open(`mailto:${job.contact_info}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-2xl h-12 font-semibold text-lg px-8"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;
