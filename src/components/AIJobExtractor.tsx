
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/geminiService";

interface AIJobExtractorProps {
  onExtractedData: (data: any) => void;
  onClose: () => void;
}

const AIJobExtractor = ({ onExtractedData, onClose }: AIJobExtractorProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractJobDataFromImage = async () => {
    if (!selectedImage) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        const prompt = `
Analise esta imagem de vaga de emprego e extraia as seguintes informações em formato JSON:

{
  "title": "título da vaga",
  "company": "nome da empresa",
  "description": "descrição detalhada da vaga",
  "requirements": "requisitos e qualificações necessárias",
  "salary": "faixa salarial (se mencionada)",
  "location": "localização (se for Ponta Grossa ou Curitiba)",
  "contract_type": "tipo de contrato (CLT, PJ, Estágio, etc)",
  "work_mode": "modalidade (Presencial, Remoto, Híbrido)",
  "experience_level": "nível de experiência (Júnior, Pleno, Sênior, etc)",
  "benefits": ["lista", "de", "benefícios"]
}

Se alguma informação não estiver disponível na imagem, deixe o campo vazio ou com um valor padrão apropriado.
Extraia APENAS as informações visíveis na imagem.
Responda APENAS com o JSON, sem texto adicional.
`;

        try {
          const result = await GeminiService.generateContent(prompt);
          
          // Parse the JSON response
          const cleanedResult = result.replace(/```json|```/g, '').trim();
          const extractedData = JSON.parse(cleanedResult);
          
          // Validate location (default to Ponta Grossa if not specified)
          if (!extractedData.location || 
              (!extractedData.location.toLowerCase().includes('ponta grossa') && 
               !extractedData.location.toLowerCase().includes('curitiba'))) {
            extractedData.location = 'Ponta Grossa';
          }

          // Set defaults for required fields
          extractedData.contract_type = extractedData.contract_type || 'CLT';
          extractedData.work_mode = extractedData.work_mode || 'Presencial';
          extractedData.experience_level = extractedData.experience_level || 'Júnior';
          extractedData.salary = extractedData.salary || 'A combinar';

          onExtractedData(extractedData);
          
          toast({
            title: "✅ Dados extraídos com sucesso!",
            description: "A IA preencheu automaticamente os campos da vaga.",
          });
          
          onClose();
        } catch (parseError) {
          console.error('Erro ao processar resposta da IA:', parseError);
          toast({
            title: "Erro",
            description: "Erro ao processar os dados extraídos. Tente novamente.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Erro na extração:', error);
      toast({
        title: "Erro",
        description: "Erro ao extrair dados da imagem. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="border-0 rounded-3xl shadow-2xl max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-3xl">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Sparkles className="h-6 w-6 mr-2" />
            🤖 Preenchimento Automático por IA
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              📸 Faça upload de uma imagem da vaga e a IA preencherá automaticamente todos os campos!
            </p>
          </div>

          <div>
            <Label htmlFor="image-upload" className="text-base font-semibold">
              Selecionar Imagem da Vaga
            </Label>
            <div className="mt-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="rounded-xl"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={extractJobDataFromImage}
              disabled={!selectedImage || isExtracting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold text-lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  🤖 IA Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  🚀 Extrair Dados com IA
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 rounded-2xl h-12"
            >
              Cancelar
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para melhores resultados:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use imagens nítidas e com boa qualidade</li>
              <li>• Certifique-se que o texto está legível</li>
              <li>• Inclua todas as informações da vaga na imagem</li>
              <li>• Formatos suportados: JPG, PNG, WebP</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIJobExtractor;
