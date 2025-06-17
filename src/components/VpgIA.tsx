
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, FileText, MessageSquare, Sparkles, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeminiService } from "@/services/geminiService";

const VpgIA = () => {
  const [curriculumText, setCurriculumText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGeneratingJob, setIsGeneratingJob] = useState(false);
  const [interviewJobTitle, setInterviewJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeCurriculum = async () => {
    if (!curriculumText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o texto do seu currículo.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await GeminiService.analyzeCurriculum(curriculumText);
      setAnalysis(result);
      toast({
        title: "Análise concluída!",
        description: "Seu currículo foi analisado pelo VPG IA.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao analisar currículo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateJobDescription = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o cargo e empresa.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingJob(true);
    try {
      const result = await GeminiService.generateJobDescription(jobTitle, company, requirements);
      setJobDescription(result);
      toast({
        title: "Descrição gerada!",
        description: "VPG IA criou uma descrição profissional para sua vaga.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar descrição.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingJob(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!interviewJobTitle.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o cargo.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const result = await GeminiService.generateInterviewQuestions(interviewJobTitle, experience);
      setInterviewQuestions(result);
      toast({
        title: "Perguntas geradas!",
        description: "VPG IA criou perguntas personalizadas para a entrevista.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar perguntas.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-3xl overflow-hidden">
        <CardHeader className="text-center py-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">VPG IA</CardTitle>
              <CardDescription className="text-green-100 text-lg">
                Inteligência Artificial para Vagas PG
              </CardDescription>
            </div>
          </div>
          <p className="text-green-100 max-w-2xl mx-auto">
            Seu assistente inteligente para análise de currículos, criação de vagas e preparação para entrevistas
          </p>
        </CardHeader>
      </Card>

      {/* Main Features */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl shadow-sm p-1">
          <TabsTrigger value="curriculum" className="rounded-xl font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Analisar Currículo
          </TabsTrigger>
          <TabsTrigger value="job" className="rounded-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Criar Vaga
          </TabsTrigger>
          <TabsTrigger value="interview" className="rounded-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Entrevista
          </TabsTrigger>
        </TabsList>

        {/* Análise de Currículo */}
        <TabsContent value="curriculum" className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Análise Inteligente de Currículo
              </CardTitle>
              <CardDescription>
                Cole o texto do seu currículo e receba feedback personalizado do VPG IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="curriculum">Texto do Currículo</Label>
                <Textarea
                  id="curriculum"
                  placeholder="Cole aqui o texto completo do seu currículo..."
                  value={curriculumText}
                  onChange={(e) => setCurriculumText(e.target.value)}
                  className="min-h-32 rounded-xl"
                />
              </div>
              <Button
                onClick={handleAnalyzeCurriculum}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analisar com VPG IA
                  </>
                )}
              </Button>
              
              {analysis && (
                <Card className="bg-green-50 border-green-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Análise Completa</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {analysis}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gerador de Descrição de Vaga */}
        <TabsContent value="job" className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Gerador de Descrição de Vaga
              </CardTitle>
              <CardDescription>
                Crie descrições profissionais e atrativas para suas vagas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Cargo</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Nome da empresa"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requirements">Requisitos (opcional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Liste os principais requisitos para a vaga..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleGenerateJobDescription}
                disabled={isGeneratingJob}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12"
              >
                {isGeneratingJob ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Descrição
                  </>
                )}
              </Button>
              
              {jobDescription && (
                <Card className="bg-yellow-50 border-yellow-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Descrição Gerada</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {jobDescription}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gerador de Perguntas de Entrevista */}
        <TabsContent value="interview" className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Perguntas de Entrevista
              </CardTitle>
              <CardDescription>
                Gere perguntas personalizadas para suas entrevistas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewJobTitle">Cargo</Label>
                  <Input
                    id="interviewJobTitle"
                    placeholder="Ex: Analista de Marketing"
                    value={interviewJobTitle}
                    onChange={(e) => setInterviewJobTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Nível de Experiência</Label>
                  <Input
                    id="experience"
                    placeholder="Ex: Júnior, Pleno, Sênior"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateInterviewQuestions}
                disabled={isGeneratingQuestions}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12"
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Gerar Perguntas
                  </>
                )}
              </Button>
              
              {interviewQuestions && (
                <Card className="bg-blue-50 border-blue-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Perguntas Geradas</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {interviewQuestions}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VpgIA;
