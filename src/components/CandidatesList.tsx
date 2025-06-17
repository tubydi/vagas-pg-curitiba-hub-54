
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Mail, Phone, Eye, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CandidatesList = () => {
  const { toast } = useToast();

  // Mock data para demonstração
  const candidates = [
    {
      id: 1,
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "(42) 99999-1234",
      job: "Desenvolvedor Full Stack",
      appliedAt: "2024-01-16",
      status: "Novo",
      resumeUrl: "#",
      experience: "3 anos",
      skills: ["React", "Node.js", "TypeScript"]
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "(41) 98888-5678",
      job: "Desenvolvedor Full Stack",
      appliedAt: "2024-01-15",
      status: "Visualizado",
      resumeUrl: "#",
      experience: "5 anos",
      skills: ["Vue.js", "Python", "PostgreSQL"]
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro.costa@email.com",
      phone: "(42) 97777-9012",
      job: "Analista de Marketing",
      appliedAt: "2024-01-14",
      status: "Contato",
      resumeUrl: "#",
      experience: "2 anos",
      skills: ["Google Ads", "Facebook Ads", "Analytics"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-100 text-blue-800";
      case "Visualizado":
        return "bg-yellow-100 text-yellow-800";
      case "Contato":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const handleViewProfile = (candidate: any) => {
    toast({
      title: "Visualizando perfil",
      description: `Abrindo perfil de ${candidate.name}`,
    });
  };

  const handleDownloadResume = (candidate: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando currículo de ${candidate.name}`,
    });
  };

  const handleContact = (candidate: any) => {
    toast({
      title: "Contato iniciado",
      description: `Abrindo conversa com ${candidate.name}`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Candidatos</h2>
          <p className="text-gray-600 mt-2">{candidates.length} candidatos encontrados</p>
        </div>
      </div>

      <div className="space-y-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-3xl border-0 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6 flex-1">
                  <Avatar className="h-16 w-16 ring-4 ring-green-100">
                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                      <Badge className={`${getStatusColor(candidate.status)} rounded-full px-3 py-1 font-semibold`}>
                        {candidate.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-5 h-5 mr-3 text-green-500" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-5 h-5 mr-3 text-green-500" />
                        <span>{candidate.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Vaga:</span> {candidate.job}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Experiência:</span> {candidate.experience}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="rounded-full">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Candidatou-se em {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 ml-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProfile(candidate)}
                    className="rounded-xl"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadResume(candidate)}
                    className="rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Currículo
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleContact(candidate)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CandidatesList;
