
import { Building2, ArrowLeft, Shield, Lock, Users, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  VAGAS PG
                </h1>
                <p className="text-sm text-gray-600">Termos de Uso e Privacidade</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Política de Privacidade e Termos de Uso
          </h2>
          <p className="text-lg text-gray-600">
            Transparência e segurança no tratamento dos seus dados
          </p>
        </div>

        <div className="space-y-8">
          {/* Introdução */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Shield className="h-6 w-6 text-green-600" />
                1. Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Bem-vindo(a) ao Vagas PG, uma plataforma criada com o propósito de conectar candidatos e empresas de forma prática, ágil e segura. Nossa prioridade é garantir que todas as informações fornecidas pelos usuários sejam tratadas com o máximo respeito, confidencialidade e responsabilidade. Este documento tem como objetivo esclarecer, de forma transparente, como os dados pessoais coletados em nossa plataforma são utilizados, protegidos e compartilhados.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Ao utilizar o Vagas PG e submeter qualquer tipo de informação, você está concordando com os termos abaixo. Por isso, recomendamos a leitura atenta e completa deste documento.
              </p>
            </CardContent>
          </Card>

          {/* Coleta de Dados */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-green-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-blue-600" />
                2. Coleta de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Ao utilizar o site Vagas PG, podemos coletar os seguintes dados pessoais fornecidos por você, de forma voluntária, ao se candidatar a uma vaga de emprego:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Nome completo</li>
                <li>Número de telefone</li>
                <li>Endereço de e-mail</li>
                <li>Endereço residencial</li>
                <li>Data de nascimento</li>
                <li>Formação acadêmica</li>
                <li>Experiências profissionais</li>
                <li>Currículo em formato digital (PDF, DOCX etc.)</li>
                <li>LinkedIn, portfólio ou outras informações opcionais</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Esses dados são exclusivamente utilizados para fins de recrutamento, visando conectar candidatos a oportunidades de trabalho.
              </p>
            </CardContent>
          </Card>

          {/* Armazenamento e Proteção */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-yellow-50 to-green-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Lock className="h-6 w-6 text-yellow-600" />
                3. Armazenamento e Proteção de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Os dados fornecidos pelos usuários são armazenados de forma segura em servidores com tecnologia de ponta e padrões rigorosos de segurança digital.
              </p>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-4">
                <h4 className="font-bold text-green-800 mb-2">🔐 Criptografia de ponta a ponta</h4>
                <p className="text-green-700 text-sm leading-relaxed">
                  Todas as informações pessoais enviadas através do Vagas PG são criptografadas de ponta a ponta, utilizando protocolos modernos e confiáveis.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Os dados são embaralhados digitalmente durante o envio e o armazenamento</li>
                <li>Nem mesmo o próprio Vagas PG ou seus administradores têm acesso ao conteúdo sensível enviado pelos candidatos</li>
                <li>Somente a empresa responsável pela vaga para a qual você se candidatou poderá acessar os seus dados, e apenas com a sua autorização prévia ao enviar sua candidatura</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartilhamento de Dados */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-red-50 to-yellow-50">
              <CardTitle className="text-2xl">4. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                O Vagas PG não compartilha, vende, aluga ou distribui seus dados a terceiros não autorizados. As informações fornecidas são compartilhadas somente com a empresa contratante responsável pela vaga à qual o candidato escolheu se aplicar. Esse processo é automatizado e respeita rigorosamente as normas de proteção de dados vigentes.
              </p>
            </CardContent>
          </Card>

          {/* Acesso e Responsabilidade das Empresas */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardTitle className="text-2xl">5. Acesso e Responsabilidade das Empresas</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                As empresas parceiras que utilizam o Vagas PG para divulgar vagas e receber currículos se comprometem a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Utilizar os dados exclusivamente para fins de recrutamento e seleção</li>
                <li>Não repassar, divulgar ou armazenar indevidamente os dados recebidos</li>
                <li>Garantir o sigilo e a confidencialidade das informações obtidas</li>
                <li>Cumprir com as normas da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Caso uma empresa parceira viole qualquer norma ou regra de conduta descrita neste termo, ela poderá ser banida da plataforma e responder legalmente.
              </p>
            </CardContent>
          </Card>

          {/* Direitos dos Usuários */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardTitle className="text-2xl">6. Direitos dos Usuários</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Você, como titular dos dados, tem total liberdade e controle sobre suas informações. A qualquer momento, você pode:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Solicitar acesso aos dados que temos armazenados</li>
                <li>Corrigir ou atualizar informações incorretas</li>
                <li>Revogar o consentimento para uso dos dados</li>
                <li>Solicitar a exclusão permanente de seus dados do sistema</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para isso, entre em contato conosco por meio do e-mail oficial: pontagrossavagas@gmail.com.
              </p>
            </CardContent>
          </Card>

          {/* Consentimento */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-yellow-50 to-red-50">
              <CardTitle className="text-2xl">7. Consentimento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Ao se candidatar a uma vaga no Vagas PG e fornecer suas informações pessoais, você declara estar ciente e de acordo com os termos apresentados nesta política de privacidade.
              </p>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardHeader className="bg-gradient-to-br from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Mail className="h-6 w-6 text-green-600" />
                9. Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Se você tiver qualquer dúvida, sugestão ou solicitação referente ao uso dos seus dados pessoais, fale com a nossa equipe:
              </p>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                <p className="text-green-800 font-semibold">📧 E-mail: pontagrossavagas@gmail.com</p>
                <p className="text-green-800 font-semibold">🌐 Site: https://vagaspg.vercel.app</p>
              </div>
            </CardContent>
          </Card>

          {/* Conclusão */}
          <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Conclusão</h3>
              <p className="leading-relaxed">
                Acreditamos que confiar em uma plataforma é essencial, especialmente quando se trata da sua vida profissional. Por isso, o Vagas PG reforça seu compromisso com a privacidade, integridade e segurança de seus dados. Aqui, o respeito pelo usuário vem sempre em primeiro lugar.
              </p>
              <p className="mt-4 font-semibold text-yellow-300">
                Muito obrigado por confiar no Vagas PG.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
