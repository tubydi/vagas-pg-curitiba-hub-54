
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, X, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PixPaymentModalProps {
  jobTitle: string;
  companyEmail: string;
  onClose: () => void;
  onPaymentComplete: (jobId: string) => void;
  createJobFn: () => Promise<any>;
}

const PixPaymentModal = ({ jobTitle, companyEmail, onClose, onPaymentComplete, createJobFn }: PixPaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [jobCreated, setJobCreated] = useState(false);
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const { toast } = useToast();

  const PIX_CNPJ = "45.534.543/0001-10"; // Sua chave PIX
  const PAYMENT_VALUE = "11,90";

  // Gerar dados do PIX para QR Code (formato simplificado)
  const generatePixQRCode = () => {
    const pixData = `00020126580014br.gov.bcb.pix0136${PIX_CNPJ.replace(/[^\d]/g, '')}0208Vagas PG520400005303986540511.905802BR5909Vagas PG6009SAO_PAULO62070503***6304`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData)}`;
  };

  const handleCreateJob = async () => {
    setLoading(true);
    try {
      const result = await createJobFn();
      
      if (result.success) {
        setJobCreated(true);
        toast({
          title: "✅ Vaga Publicada!",
          description: "Sua vaga foi publicada! Realize o pagamento PIX para manter ativa.",
        });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao publicar vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'cnpj') setCopiedCnpj(true);
      
      toast({
        title: "📋 Copiado!",
        description: `${type.toUpperCase()} copiado para área de transferência.`,
      });
      
      setTimeout(() => {
        if (type === 'cnpj') setCopiedCnpj(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao copiar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = () => {
    toast({
      title: "✅ Pagamento Confirmado!",
      description: "Obrigado! Sua vaga permanecerá ativa por 30 dias.",
    });
    onPaymentComplete('');
  };

  const isExempt = companyEmail === 'vagas@vagas.com';

  if (isExempt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md border-0 rounded-3xl shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              Empresa Isenta
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Publicação Gratuita</h3>
            <p className="text-gray-600 mb-6">
              Sua empresa está isenta de pagamento. A vaga será publicada gratuitamente.
            </p>
            <Button
              onClick={() => {
                handleCreateJob();
                onPaymentComplete('');
              }}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Publicar Vaga Gratuitamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg border-0 rounded-3xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              💰 Pagamento PIX - R$ {PAYMENT_VALUE}
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
              Publicação de vaga na plataforma Vagas PG
            </p>
          </div>

          {!jobCreated ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center text-yellow-800 mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Importante!</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Sua vaga será publicada imediatamente, mas será removida em 24h se o pagamento não for realizado.
                </p>
              </div>

              <Button
                onClick={handleCreateJob}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-semibold"
              >
                {loading ? "Publicando..." : "Publicar Vaga e Gerar PIX"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 mb-1">Vaga Publicada!</h4>
                <p className="text-sm text-green-700">
                  Agora realize o pagamento PIX para manter a vaga ativa
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center text-red-800 mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Prazo de Pagamento</span>
                </div>
                <p className="text-sm text-red-700">
                  <strong>24 horas</strong> para realizar o pagamento, ou a vaga será removida e a conta bloqueada.
                </p>
              </div>

              {/* QR Code PIX */}
              <div className="text-center space-y-4">
                <h4 className="font-semibold text-gray-900">Escaneie o QR Code PIX:</h4>
                <div className="flex justify-center">
                  <img 
                    src={generatePixQRCode()} 
                    alt="QR Code PIX" 
                    className="border-2 border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Chave PIX */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Ou use a chave PIX (CNPJ):</h4>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                  <code className="flex-1 text-lg font-mono">{PIX_CNPJ}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(PIX_CNPJ, 'cnpj')}
                    className={copiedCnpj ? 'bg-green-50 border-green-200' : ''}
                  >
                    {copiedCnpj ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Valor */}
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Valor a pagar:</p>
                <p className="text-2xl font-bold text-blue-900">R$ {PAYMENT_VALUE}</p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Pagar Depois
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                >
                  ✅ Já Paguei
                </Button>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="text-xs text-gray-500">
                  🔒 Pagamento seguro via PIX
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PixPaymentModal;
