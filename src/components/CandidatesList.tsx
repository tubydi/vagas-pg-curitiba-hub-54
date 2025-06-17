
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Mail, Phone, Eye } from "lucide-react";

const CandidatesList = () => {
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
      resumeUrl: "#"
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "(41) 98888-5678",
      job: "Desenvolvedor Full Stack",
      appliedAt: "2024-01-15",
      status: "Visualizado",
      resumeUrl: "#"
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro.costa@email.com",
      phone: "(42) 97777-9012",
      job: "Analista de Marketing",
      appliedAt: "2024-01-14",
      status: "Contato",
      resumeUrl: "#"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Candidatos</h2>
        <p className="text-gray-600">{candidates.length} candidatos encontrados</p>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {candidate.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {candidate.phone}
                      </div>
                      <div>
                        <span className="font-medium">Vaga:</span> {candidate.job}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Candidatou-se em {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Perfil
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Currículo
                  </Button>
                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                    Entrar em Contato
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
