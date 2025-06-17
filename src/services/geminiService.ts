
const GEMINI_API_KEY = "AIzaSyChgS0OhDB-5jh0jUIR8nOZwd8VrlPquyc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "Não foi possível gerar uma resposta.";
    } catch (error) {
      console.error('Erro na API Gemini:', error);
      throw new Error('Erro ao conectar com o VPG IA. Tente novamente.');
    }
  }

  static async analyzeCurriculum(curriculumText: string): Promise<string> {
    const prompt = `
Analise este currículo e forneça feedback detalhado em português brasileiro:

CURRÍCULO:
${curriculumText}

Por favor, analise e forneça:
1. Pontos fortes do currículo
2. Áreas que precisam de melhoria
3. Sugestões específicas para melhorar
4. Nota geral (0-10)
5. Dicas para se destacar no mercado de trabalho de Ponta Grossa e Curitiba

Seja específico e construtivo no feedback.
`;
    
    return this.generateContent(prompt);
  }

  static async generateJobDescription(jobTitle: string, company: string, requirements: string): Promise<string> {
    const prompt = `
Crie uma descrição de vaga atrativa e profissional para:

CARGO: ${jobTitle}
EMPRESA: ${company}
REQUISITOS BÁSICOS: ${requirements}

A vaga é para Ponta Grossa ou Curitiba. Crie uma descrição que:
1. Seja atrativa para candidatos
2. Descreva as responsabilidades
3. Liste benefícios típicos da região
4. Use linguagem profissional mas acessível
5. Tenha entre 150-300 palavras

Foque no que torna esta oportunidade especial.
`;
    
    return this.generateContent(prompt);
  }

  static async generateInterviewQuestions(jobTitle: string, experience: string): Promise<string> {
    const prompt = `
Gere 5 perguntas de entrevista relevantes para:

CARGO: ${jobTitle}
NÍVEL DE EXPERIÊNCIA: ${experience}

As perguntas devem:
1. Avaliar competências técnicas
2. Avaliar soft skills
3. Ser específicas para o cargo
4. Ser adequadas para o mercado de trabalho de Ponta Grossa/Curitiba
5. Incluir uma pergunta sobre adaptação ao trabalho local

Formate como uma lista numerada.
`;
    
    return this.generateContent(prompt);
  }

  static async searchLatestJobs(): Promise<string> {
    const prompt = `
Busque e liste as vagas de emprego mais recentes (últimas 24 horas) para Ponta Grossa e Curitiba do LinkedIn e Google Jobs.

Formate a resposta como uma lista com:
- Título da vaga
- Empresa
- Localização (Ponta Grossa ou Curitiba)
- Tipo de contrato
- Link (se disponível)
- Data de publicação

Foque em vagas relevantes para o mercado local dessas cidades.
Limite a 10 vagas mais relevantes e recentes.
`;
    
    return this.generateContent(prompt);
  }
}
