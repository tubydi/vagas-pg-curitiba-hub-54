
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando busca automática de vagas...')
    
    // Simulação de busca de vagas (aqui você pode integrar com APIs reais)
    const mockJobs = [
      {
        title: "Desenvolvedor Full Stack",
        description: "Vaga para desenvolvedor full stack com experiência em React e Node.js",
        requirements: "React, Node.js, TypeScript, experiência com bancos de dados",
        salary: "R$ 5.000 - R$ 8.000",
        location: "Ponta Grossa",
        contract_type: "CLT",
        work_mode: "Híbrido",
        experience_level: "Pleno",
        benefits: ["Vale alimentação", "Plano de saúde", "Home office"],
        external_url: "https://linkedin.com/jobs/exemplo1"
      },
      {
        title: "Analista de Sistemas",
        description: "Oportunidade para analista de sistemas em empresa de tecnologia",
        requirements: "Análise de sistemas, SQL, conhecimento em metodologias ágeis",
        salary: "R$ 4.000 - R$ 6.000",
        location: "Curitiba",
        contract_type: "CLT",
        work_mode: "Presencial",
        experience_level: "Júnior",
        benefits: ["Vale transporte", "Plano de saúde"],
        external_url: "https://linkedin.com/jobs/exemplo2"
      }
    ]

    // Criar empresa "sistema" se não existir
    let { data: systemCompany, error: companyError } = await supabaseClient
      .from('companies')
      .select('id')
      .eq('cnpj', '00.000.000/0001-00')
      .single()

    if (companyError || !systemCompany) {
      const { data: newCompany, error: createError } = await supabaseClient
        .from('companies')
        .insert({
          name: 'VAGAS PG - Sistema Automático',
          cnpj: '00.000.000/0001-00',
          email: 'sistema@vagaspg.com',
          phone: '(42) 0000-0000',
          address: 'Sistema Automático',
          city: 'Ponta Grossa',
          sector: 'Tecnologia',
          legal_representative: 'Sistema',
          description: 'Vagas coletadas automaticamente pelo sistema',
          status: 'Ativa',
          user_id: '00000000-0000-0000-0000-000000000000' // UUID fictício para sistema
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Erro ao criar empresa sistema:', createError)
        systemCompany = { id: '00000000-0000-0000-0000-000000000000' }
      } else {
        systemCompany = newCompany
      }
    }

    // Inserir vagas mock
    for (const job of mockJobs) {
      const { error: jobError } = await supabaseClient
        .from('jobs')
        .insert({
          company_id: systemCompany.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          salary: job.salary,
          location: job.location,
          contract_type: job.contract_type as any,
          work_mode: job.work_mode as any,
          experience_level: job.experience_level as any,
          benefits: job.benefits,
          status: 'Ativa'
        })

      if (jobError) {
        console.error('Erro ao inserir vaga:', jobError)
      } else {
        console.log('Vaga inserida:', job.title)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vagas sincronizadas com sucesso',
        jobsProcessed: mockJobs.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na sincronização:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
