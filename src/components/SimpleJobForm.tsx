
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface SimpleJobFormProps {
  job?: Job | null;
  onSave: () => void;
  onCancel: () => void;
  companyId: string;
}

const SimpleJobForm: React.FC<SimpleJobFormProps> = ({ job, onSave, onCancel, companyId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    salary: job?.salary || '',
    location: job?.location || 'Ponta Grossa',
    contract_type: job?.contract_type || 'CLT',
    work_mode: job?.work_mode || 'Presencial',
    experience_level: job?.experience_level || 'Júnior',
    benefits: job?.benefits?.join(', ') || '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Salvando vaga...');
      console.log('Company ID:', companyId);
      console.log('Form Data:', formData);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        salary: formData.salary,
        location: formData.location,
        contract_type: formData.contract_type as any,
        work_mode: formData.work_mode as any,
        experience_level: formData.experience_level as any,
        benefits: formData.benefits ? formData.benefits.split(',').map(b => b.trim()) : [],
        company_id: companyId,
        status: 'Ativa' as const
      };

      console.log('Dados da vaga:', jobData);

      let result;
      if (job) {
        console.log('Atualizando vaga existente...');
        result = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id)
          .select();
      } else {
        console.log('Criando nova vaga...');
        result = await supabase
          .from('jobs')
          .insert([jobData])
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Erro ao salvar vaga:', error);
        toast({
          title: "Erro ao salvar vaga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Vaga salva:', data);
      toast({
        title: "Sucesso!",
        description: job ? "Vaga atualizada!" : "Vaga criada!",
      });

      onSave();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao salvar vaga",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job ? 'Editar Vaga' : 'Nova Vaga'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Vaga</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">Salário</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Ex: R$ 3.000 - R$ 5.000"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                  <SelectItem value="Curitiba">Curitiba</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contract_type">Tipo de Contrato</Label>
              <Select value={formData.contract_type} onValueChange={(value) => handleInputChange('contract_type', value)}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="work_mode">Modalidade</Label>
              <Select value={formData.work_mode} onValueChange={(value) => handleInputChange('work_mode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Remoto">Remoto</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience_level">Nível</Label>
              <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                <SelectTrigger>
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

          <div>
            <Label htmlFor="benefits">Benefícios (separados por vírgula)</Label>
            <Input
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="Ex: Vale Refeição, Plano de Saúde, Home Office"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : job ? 'Atualizar Vaga' : 'Criar Vaga'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleJobForm;
