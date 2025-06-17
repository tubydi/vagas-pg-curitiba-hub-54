
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const JobSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncJobs = async () => {
    setSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-jobs');
      
      if (error) {
        console.error('Erro na sincronização:', error);
        toast({
          title: "Erro na sincronização",
          description: "Não foi possível sincronizar as vagas. Tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('Sincronização bem-sucedida:', data);
        toast({
          title: "Sincronização concluída!",
          description: `${data?.jobsProcessed || 0} vagas foram processadas com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante a sincronização.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Sincronização Automática de Vagas
        </CardTitle>
        <CardDescription>
          Busca automaticamente novas vagas de emprego do LinkedIn e outras fontes para Ponta Grossa e Curitiba
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Sistema de IA integrado</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Filtros para Ponta Grossa e Curitiba</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span>Últimas 24 horas</span>
        </div>
        
        <Button 
          onClick={syncJobs}
          disabled={syncing}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Vagas Agora
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobSync;
