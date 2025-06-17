
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface JobFormProps {
  initialData?: any;
  onSubmit: (job: any) => void;
  onCancel: () => void;
}

const JobForm = ({ initialData, onSubmit, onCancel }: JobFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    type: "",
    workMode: "",
    experience: ""
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        requirements: initialData.requirements || "",
        salary: initialData.salary || "",
        location: initialData.location || "",
        type: initialData.type || "",
        workMode: initialData.workMode || "",
        experience: initialData.experience || ""
      });
      setBenefitsList(initialData.benefits || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      benefits: benefitsList
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefitsList.includes(newBenefit.trim())) {
      setBenefitsList([...benefitsList, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBenefitsList(benefitsList.filter(b => b !== benefit));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Informações Básicas</h4>
        
        <div>
          <Label htmlFor="title" className="text-base font-semibold">Título da Vaga *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
            placeholder="Ex: Desenvolvedor Full Stack"
            className="mt-2 h-12 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-semibold">Descrição da Vaga *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
            placeholder="Descreva as principais responsabilidades e atividades..."
            className="mt-2 h-32 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="requirements" className="text-base font-semibold">Requisitos *</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => handleInputChange("requirements", e.target.value)}
            required
            placeholder="Liste os requisitos técnicos e experiências necessárias..."
            className="mt-2 h-24 rounded-xl"
          />
        </div>
      </div>

      {/* Condições */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Condições da Vaga</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="salary" className="text-base font-semibold">Faixa Salarial *</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", e.target.value)}
              required
              placeholder="Ex: R$ 5.000 - R$ 8.000"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-base font-semibold">Local *</Label>
            <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
              <SelectTrigger className="mt-2 h-12 rounded-xl">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="type" className="text-base font-semibold">Tipo de Contrato *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger className="mt-2 h-12 rounded-xl">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Estágio">Estágio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workMode" className="text-base font-semibold">Modalidade *</Label>
            <Select value={formData.workMode} onValueChange={(value) => handleInputChange("workMode", value)}>
              <SelectTrigger className="mt-2 h-12 rounded-xl">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Remoto">Remoto</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience" className="text-base font-semibold">Experiência *</Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
              <SelectTrigger className="mt-2 h-12 rounded-xl">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Estagiário">Estagiário</SelectItem>
                <SelectItem value="Júnior">Júnior</SelectItem>
                <SelectItem value="Pleno">Pleno</SelectItem>
                <SelectItem value="Sênior">Sênior</SelectItem>
                <SelectItem value="Especialista">Especialista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Benefícios</h4>
        
        <div className="flex gap-3">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            placeholder="Ex: Vale refeição, Plano de saúde..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
            className="h-12 rounded-xl"
          />
          <Button type="button" onClick={addBenefit} variant="outline" className="rounded-xl px-6">
            Adicionar
          </Button>
        </div>

        {benefitsList.length > 0 && (
          <Card className="rounded-2xl border-green-100">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {benefitsList.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-full px-3 py-1">
                    {benefit}
                    <X 
                      className="w-4 h-4 cursor-pointer hover:text-red-500" 
                      onClick={() => removeBenefit(benefit)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex-1 h-12 rounded-2xl font-semibold text-lg"
        >
          {initialData ? "Atualizar Vaga" : "Publicar Vaga"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 h-12 rounded-2xl font-semibold"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
