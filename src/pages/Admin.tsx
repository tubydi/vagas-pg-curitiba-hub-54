
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Shield, 
  LogOut,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminJobsTable from "@/components/AdminJobsTable";
import AdminCompaniesTable from "@/components/AdminCompaniesTable";
import AdminApplicationsTable from "@/components/AdminApplicationsTable";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ADMIN VAGAS PG
                </h1>
                <p className="text-sm text-gray-600">Painel Administrativo - Otimizado para Milhões de Usuários</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                👑 Administrador Geral
              </span>
              <Link to="/">
                <Button variant="outline" size="sm" className="rounded-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Empresas</CardTitle>
              <div className="bg-blue-100 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">🔥 LIVE</div>
              <p className="text-xs text-gray-500 mt-1">Dados em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Vagas</CardTitle>
              <div className="bg-green-100 p-2 rounded-xl">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">🔥 LIVE</div>
              <p className="text-xs text-gray-500 mt-1">Dados em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Candidaturas</CardTitle>
              <div className="bg-purple-100 p-2 rounded-xl">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">🔥 LIVE</div>
              <p className="text-xs text-gray-500 mt-1">Dados em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-xl">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">📊 AI</div>
              <p className="text-xs text-gray-500 mt-1">Análise inteligente</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl shadow-sm p-1">
            <TabsTrigger value="jobs" className="rounded-xl font-semibold">🔥 Vagas</TabsTrigger>
            <TabsTrigger value="companies" className="rounded-xl font-semibold">🏢 Empresas</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl font-semibold">👥 Candidaturas</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <AdminJobsTable />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <AdminCompaniesTable />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <AdminApplicationsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
