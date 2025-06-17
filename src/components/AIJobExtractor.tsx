
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Loader2, X, FileText, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/geminiService";

interface AIJobExtractorProps {
  onExtracted: (data: any) => void;
  onClose: () => void;
}

const AIJobExtractor = ({ onExtracted, onClose }: AIJobExtractorProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [jobText, setJobText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
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

  const extractJobDataFromText = async () => {
    if (!jobText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole o texto da vaga primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const prompt = `
Analise este texto de vaga de emprego e extraia as seguintes informações em formato JSON:

TEXTO DA VAGA:
${jobText}

Extraia as informações e formate como JSON:
{
  "title": "título da vaga principal (se houver múltiplas vagas, use a primeira ou mais relevante)",
  "description": "descrição detalhada da vaga, responsabilidades e informações sobre a empresa",
  "requirements": "requisitos e qualificações necessárias",
  "salary": "faixa salarial (se mencionada, senão 'A combinar')",
  "location": "localização (sempre Ponta Grossa se não especificado)",
  "contract_type": "CLT (padrão se não especificado)",
  "work_mode": "Presencial (padrão se não especificado)",
  "experience_level": "Júnior (padrão se não especificado)",
  "benefits": ["lista", "de", "benefícios", "mencionados"],
  "application_method": "Como se candidatar (WhatsApp, Email, Presencial, etc)",
  "contact_info": "Informação de contato para candidatura (telefone, email, endereço, etc)",
  "has_external_application": true/false (se há forma de candidatura externa)
}

IMPORTANTE - EXTRAÇÃO DE CONTATO:
- Procure por números de WhatsApp, telefones, emails para envio de currículo
- Identifique se é para entregar currículo presencialmente (endereço específico)
- Procure instruções como "enviar currículo para", "candidatar-se via", "contato:"
- Se encontrar contato específico, marque has_external_application como true
- Se não encontrar contato específico, marque has_external_application como false

REGRAS:
- Para contract_type use apenas: "CLT", "PJ", "Freelancer", "Estágio"
- Para work_mode use apenas: "Presencial", "Remoto", "Híbrido"  
- Para experience_level use apenas: "Estagiário", "Júnior", "Pleno", "Sênior", "Especialista"
- Se a localização não for especificada, use "Ponta Grossa"
- Extraia APENAS as informações presentes no texto
- Responda APENAS com o JSON, sem texto adicional
`;

      const result = await GeminiService.generateContent(prompt);
      
      // Parse the JSON response
      const cleanedResult = result.replace(/```json|```/g, '').trim();
      const extractedData = JSON.parse(cleanedResult);
      
      // Validate and set defaults for required fields
      extractedData.location = extractedData.location || 'Ponta Grossa';
      extractedData.contract_type = extractedData.contract_type || 'CLT';
      extractedData.work_mode = extractedData.work_mode || 'Presencial';
      extractedData.experience_level = extractedData.experience_level || 'Júnior';
      extractedData.salary = extractedData.salary || 'A combinar';
      extractedData.application_method = extractedData.application_method || '';
      extractedData.contact_info = extractedData.contact_info || '';
      extractedData.has_external_application = extractedData.has_external_application || false;

      onExtracted(extractedData);
      
      toast({
        title: "✅ Dados extraídos com sucesso!",
        description: "A IA preencheu automaticamente os campos da vaga a partir do texto.",
      });
      
      onClose();
    } catch (parseError) {
      console.error('Erro ao processar resposta da IA:', parseError);
      toast({
        title: "Erro",
        description: "Erro ao processar os dados extraídos. Tente novamente ou revise o formato do texto.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
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
  "description": "descrição detalhada da vaga",
  "requirements": "requisitos e qualificações necessárias",
  "salary": "faixa salarial (se mencionada)",
  "location": "localização (se for Ponta Grossa ou Curitiba)",
  "contract_type": "tipo de contrato (CLT, PJ, Estágio, etc)",
  "work_mode": "modalidade (Presencial, Remoto, Híbrido)",
  "experience_level": "nível de experiência (Júnior, Pleno, Sênior, etc)",
  "benefits": ["lista", "de", "benefícios"],
  "application_method": "Como se candidatar (WhatsApp, Email, Presencial, etc)",
  "contact_info": "Informação de contato para candidatura (telefone, email, endereço, etc)",
  "has_external_application": true/false (se há forma de candidatura externa)
}

IMPORTANTE - EXTRAÇÃO DE CONTATO DA IMAGEM:
- Procure por números de WhatsApp, telefones, emails para envio de currículo
- Identifique se é para entregar currículo presencialmente (endereço específico)
- Procure instruções como "enviar currículo para", "candidatar-se via", "contato:"
- Se encontrar contato específico, marque has_external_application como true
- Se não encontrar contato específico, marque has_external_application como false

REGRAS:
- Para contract_type use apenas: "CLT", "PJ", "Freelancer", "Estágio"
- Para work_mode use apenas: "Presencial", "Remoto", "Híbrido"  
- Para experience_level use apenas: "Estagiário", "Júnior", "Pleno", "Sênior", "Especialista"
- Se alguma informação não estiver disponível na imagem, deixe o campo vazio ou com um valor padrão apropriado.
- Extraia APENAS as informações visíveis na imagem.
- Responda APENAS com o JSON, sem texto adicional.
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
          extractedData.application_method = extractedData.application_method || '';
          extractedData.contact_info = extractedData.contact_info || '';
          extractedData.has_external_application = extractedData.has_external_application || false;

          onExtracted(extractedData);
          
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
    <Card className="border-0 rounded-3xl shadow-2xl max-w-3xl mx-auto">
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
              🚀 Cole o texto da vaga ou faça upload de uma imagem e a IA preencherá automaticamente todos os campos, incluindo informações de contato para candidatura!
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Texto da Vaga
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Imagem da Vaga
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="job-text" className="text-base font-semibold">
                  Cole o Texto da Vaga Aqui
                </Label>
                <div className="mt-2">
                  <Textarea
                    id="job-text"
                    placeholder="Cole aqui o texto completo da vaga de emprego..."
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    className="min-h-[200px] rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={extractJobDataFromText}
                disabled={!jobText.trim() || isExtracting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold text-lg"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    🤖 IA Analisando Texto...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    🚀 Extrair Dados do Texto
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
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

              <Button
                onClick={extractJobDataFromImage}
                disabled={!selectedImage || isExtracting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold text-lg"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    🤖 IA Analisando Imagem...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    🚀 Extrair Dados da Imagem
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para melhores resultados:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Texto:</strong> Cole o texto completo da vaga com todas as informações</li>
              <li>• <strong>Imagem:</strong> Use imagens nítidas e com texto legível</li>
              <li>• <strong>Contatos:</strong> A IA identifica automaticamente WhatsApp, emails e telefones para candidatura</li>
              <li>• <strong>Formato:</strong> A IA reconhece emojis e formatação especial</li>
              <li>• <strong>Múltiplas vagas:</strong> Se o texto tiver várias vagas, a IA escolherá a principal</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIJobExtractor;
