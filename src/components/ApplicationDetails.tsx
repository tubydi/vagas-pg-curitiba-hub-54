
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Calendar, FileText, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApplicationDetailsProps {
  application: any;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onStatusUpdate,
  onClose
}) => {
  const [status, setStatus] = useState(application.status || 'Novo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      onStatusUpdate(application.id, status);
      
      toast({
        title: "Status atualizado com sucesso!",
        description: `Candidatura marcada como: ${status}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-500';
      case 'Visualizado':
        return 'bg-yellow-500';
      case 'Contato':
        return 'bg-orange-500';
      case 'Aprovado':
        return 'bg-green-500';
      case 'Rejeitado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!application) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{application.name || 'Candidato'}</CardTitle>
              <CardDescription>
                Candidatura para: {application.jobs?.title || 'Vaga'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(application.status)} text-white`}>
                {application.status}
              </Badge>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span>{application.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span>{application.phone}</span>
              </div>
              {application.linkedin && (
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2 text-gray-500" />
                  <a 
                    href={application.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  Candidatura enviada em: {new Date(application.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Carta de apresentação */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Carta de Apresentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </CardContent>
            </Card>
          )}

          {/* Currículo */}
          {application.resume_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Currículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a 
                    href={application.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Currículo
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Atualizar status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atualizar Status da Candidatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Novo Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Visualizado">Visualizado</SelectItem>
                    <SelectItem value="Contato">Em Contato</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas internas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione notas sobre esta candidatura..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleStatusUpdate} 
                disabled={loading || status === application.status}
                className="w-full"
              >
                {loading ? 'Atualizando...' : 'Atualizar Status'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
