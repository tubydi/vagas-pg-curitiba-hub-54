
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";

interface PaymentWarningProps {
  jobsCount: number;
  onOpenPayment: () => void;
}

const PaymentWarning = ({ jobsCount, onOpenPayment }: PaymentWarningProps) => {
  if (jobsCount === 0) return null;

  return (
    <Card className="border-2 border-red-200 bg-red-50 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ Pagamento Pendente
            </h3>
            <p className="text-red-700 mb-4">
              Você possui <strong>{jobsCount} vaga{jobsCount > 1 ? 's' : ''}</strong> com pagamento pendente.
              {jobsCount === 1 ? ' Esta vaga será' : ' Estas vagas serão'} removida{jobsCount > 1 ? 's' : ''} em <strong>24 horas</strong> se o pagamento não for realizado.
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-red-600 mb-4">
              <Clock className="w-4 h-4" />
              <span>Sua conta também pode ser bloqueada após o vencimento</span>
            </div>
            
            <Button 
              onClick={onOpenPayment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Realizar Pagamento PIX
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentWarning;
