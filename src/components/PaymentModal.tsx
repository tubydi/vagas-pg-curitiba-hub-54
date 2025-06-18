
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  jobTitle: string;
  companyEmail: string;
  onClose: () => void;
  onPaymentComplete: (jobId: string) => void;
  createPaymentFn: () => Promise<any>;
}

const PaymentModal = ({ jobTitle, companyEmail, onClose, onPaymentComplete, createPaymentFn }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const isExempt = companyEmail === 'vagas@vagas.com';

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await createPaymentFn();
      
      if (result.isExempt) {
        toast({
          title: "✅ Vaga Publicada!",
          description: "Sua empresa está isenta de pagamento. A vaga foi publicada automaticamente.",
        });
        onPaymentComplete(result.jobId);
        return;
      }

      if (result.checkoutUrl) {
        setPaymentUrl(result.checkoutUrl);
        // Abrir em nova aba
        window.open(result.checkoutUrl, '_blank');
        
        toast({
          title: "🔗 Redirecionando para pagamento",
          description: "Você será redirecionado para o Mercado Pago para finalizar o pagamento.",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "❌ Erro no pagamento",
        description: "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "✅ Pagamento Aprovado!",
      description: "Sua vaga foi publicada com sucesso!",
    });
    onPaymentComplete('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 rounded-3xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Publicar Vaga
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {jobTitle}
            </h3>
            <p className="text-gray-600">
              Para publicar esta vaga na plataforma Vagas PG
            </p>
          </div>

          {isExempt ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 mb-1">Empresa Isenta</h4>
              <p className="text-sm text-green-700">
                Sua empresa está isenta de pagamento. A vaga será publicada gratuitamente.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-blue-900">Taxa de Publicação:</span>
                  <span className="text-2xl font-bold text-blue-600">R$ 11,90</span>
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Pagamento seguro via Mercado Pago
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">O que está incluído:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Publicação da vaga por 30 dias
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Visibilidade para candidatos da região
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sistema de candidaturas organizado
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Suporte técnico incluído
                  </li>
                </ul>
              </div>
            </>
          )}

          {paymentUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-sm text-yellow-800 mb-3">
                Finalize o pagamento na aba aberta do Mercado Pago
              </p>
              <Button
                onClick={handlePaymentSuccess}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                ✅ Já finalizei o pagamento
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isExempt ? 'Publicar Gratuitamente' : 'Pagar R$ 11,90'}
            </Button>
          </div>

          <div className="text-center">
            <Badge variant="outline" className="text-xs text-gray-500">
              🔒 Pagamento 100% seguro via Mercado Pago
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
