
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface JobFormProps {
  onSubmit: (job: any) => void;
  onCancel: () => void;
}

const JobForm = ({ onSubmit, onCancel }: JobFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    salary: "",
    location: "",
    type: "",
    workMode: "",
    experience: ""
  });

  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Informações Básicas</h4>
        
        <div>
          <Label htmlFor="title">Título da Vaga *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
            placeholder="Ex: Desenvolvedor Full Stack"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição da Vaga *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
            placeholder="Descreva as principais responsabilidades e atividades..."
            className="h-32"
          />
        </div>

        <div>
          <Label htmlFor="requirements">Requisitos *</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => handleInputChange("requirements", e.target.value)}
            required
            placeholder="Liste os requisitos técnicos e experiências necessárias..."
            className="h-24"
          />
        </div>
      </div>

      {/* Condições */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Condições da Vaga</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary">Faixa Salarial *</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", e.target.value)}
              required
              placeholder="Ex: R$ 5.000 - R$ 8.000"
            />
          </div>

          <div>
            <Label htmlFor="location">Local *</Label>
            <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="type">Tipo de Contrato *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
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
            <Label htmlFor="workMode">Modalidade *</Label>
            <Select value={formData.workMode} onValueChange={(value) => handleInputChange("workMode", value)}>
              <SelectTrigger>
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
            <Label htmlFor="experience">Experiência *</Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
              <SelectTrigger>
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
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Benefícios</h4>
        
        <div className="flex gap-2">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            placeholder="Ex: Vale refeição, Plano de saúde..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
          />
          <Button type="button" onClick={addBenefit} variant="outline">
            Adicionar
          </Button>
        </div>

        {benefitsList.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {benefitsList.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {benefit}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
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
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="company-gradient text-white flex-1">
          Publicar Vaga
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
