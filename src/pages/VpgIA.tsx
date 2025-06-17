
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import VpgIA from "@/components/VpgIA";

const VpgIAPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                VAGAS PG
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <VpgIA />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 py-12 text-white mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              VAGAS PG
            </h4>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 VAGAS PG. Conectando talentos em Ponta Grossa e Curitiba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VpgIAPage;
