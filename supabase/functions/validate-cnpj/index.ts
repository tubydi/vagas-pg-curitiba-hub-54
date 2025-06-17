
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Validação de CNPJ iniciada');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj } = await req.json();
    console.log('CNPJ recebido:', cnpj);

    if (!cnpj || cnpj.length !== 14) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'CNPJ deve ter 14 dígitos' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validar formato do CNPJ
    if (!isValidCnpj(cnpj)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'CNPJ com formato inválido' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Consultando API da Receita Federal...');

    // Consultar API da Receita Federal
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      console.error('Erro na API da Receita:', response.status);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Erro ao consultar base de dados da Receita Federal' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const data = await response.json();
    console.log('Resposta da Receita:', data);

    if (data.status === 'ERROR') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'CNPJ não encontrado na Receita Federal' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se a empresa está ativa
    if (data.situacao !== 'ATIVA') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: `Empresa com situação: ${data.situacao}. Apenas empresas ativas podem se cadastrar.` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('CNPJ válido e empresa ativa');

    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'CNPJ válido e empresa ativa',
        companyData: {
          name: data.nome,
          address: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}`,
          activity: data.atividade_principal?.[0]?.text || 'Não informado'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na validação do CNPJ:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: 'Erro interno do servidor ao validar CNPJ' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function isValidCnpj(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  let digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  if (parseInt(numbers[12]) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  return parseInt(numbers[13]) === digit;
}
