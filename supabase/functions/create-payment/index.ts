
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Iniciando create-payment function')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const body = await req.json()
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2))

    const { jobData, companyId } = body

    if (!jobData || !companyId) {
      console.error('❌ Dados obrigatórios faltando - jobData ou companyId')
      return new Response(
        JSON.stringify({ 
          error: 'jobData and companyId are required',
          success: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('🔍 Validando company ID:', companyId)

    // Validar se companyId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!companyId || typeof companyId !== 'string' || companyId.trim() === '' || !uuidRegex.test(companyId)) {
      console.error('❌ Company ID inválido:', companyId)
      return new Response(
        JSON.stringify({ 
          error: 'Company ID is required and must be a valid UUID',
          success: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('🏢 Buscando dados da empresa ID:', companyId)

    // Verificar se a empresa existe e buscar dados
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('email, name')
      .eq('id', companyId)
      .single()

    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError)
      return new Response(
        JSON.stringify({ 
          error: 'Company not found',
          success: false,
          details: companyError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    console.log('✅ Empresa encontrada:', JSON.stringify(company, null, 2))

    // Verificar se a empresa é isenta
    if (company?.email === 'vagas@vagas.com') {
      console.log('🆓 Empresa isenta detectada, criando vaga diretamente')
      
      // Empresa isenta - criar job diretamente
      const { data: job, error: jobError } = await supabaseClient
        .from('jobs')
        .insert([{
          ...jobData,
          company_id: companyId,
          payment_status: 'approved',
          status: 'Ativa'
        }])
        .select()
        .single()

      if (jobError) {
        console.error('❌ Erro ao criar vaga isenta:', jobError)
        throw jobError
      }

      console.log('✅ Vaga isenta criada com sucesso:', job.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          jobId: job.id,
          isExempt: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Para empresas que precisam pagar
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('❌ Token do Mercado Pago não configurado')
      return new Response(
        JSON.stringify({ 
          error: 'Payment system not configured',
          success: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('💳 Criando preferência no Mercado Pago para:', company.name)

    // Criar preferência no Mercado Pago
    const preference = {
      items: [{
        title: `Publicação de Vaga: ${jobData.title}`,
        description: `Publicação da vaga "${jobData.title}" no Vagas PG para ${company.name}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 11.90
      }],
      payer: {
        name: company.name,
        email: company.email
      },
      back_urls: {
        success: `https://fottrghxikgjfjfhxzxf.supabase.co/functions/v1/payment-webhook?status=success`,
        failure: `https://fottrghxikgjfjfhxzxf.supabase.co/functions/v1/payment-webhook?status=failure`,
        pending: `https://fottrghxikgjfjfhxzxf.supabase.co/functions/v1/payment-webhook?status=pending`
      },
      auto_return: 'approved',
      external_reference: companyId,
      notification_url: `https://fottrghxikgjfjfhxzxf.supabase.co/functions/v1/payment-webhook`,
      statement_descriptor: 'VAGAS PG'
    }

    console.log('📋 Preferência Mercado Pago:', JSON.stringify(preference, null, 2))

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    })

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text()
      console.error('❌ Erro na API do Mercado Pago:', errorText)
      return new Response(
        JSON.stringify({ 
          error: `Payment system error: ${mpResponse.status}`,
          success: false,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const mpData = await mpResponse.json()
    console.log('✅ Resposta do Mercado Pago:', JSON.stringify(mpData, null, 2))

    // Salvar job com status pendente
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .insert([{
        ...jobData,
        company_id: companyId,
        payment_status: 'pending',
        status: 'Pausada'
      }])
      .select()
      .single()

    if (jobError) {
      console.error('❌ Erro ao criar vaga:', jobError)
      throw jobError
    }

    console.log('✅ Vaga criada com status pendente:', job.id)

    // Salvar informações do pagamento
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert([{
        company_id: companyId,
        job_id: job.id,
        amount: 11.90,
        status: 'pending',
        preference_id: mpData.id,
        mercadopago_data: mpData
      }])
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Erro ao criar registro de pagamento:', paymentError)
      throw paymentError
    }

    console.log('✅ Registro de pagamento criado:', payment.id)

    // Atualizar job com payment_id
    const { error: updateError } = await supabaseClient
      .from('jobs')
      .update({ payment_id: payment.id })
      .eq('id', job.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar vaga com payment_id:', updateError)
    } else {
      console.log('✅ Vaga atualizada com payment_id')
    }

    const result = {
      success: true,
      jobId: job.id,
      paymentId: payment.id,
      checkoutUrl: mpData.init_point,
      preferenceId: mpData.id
    }

    console.log('🎉 Resultado final:', JSON.stringify(result, null, 2))

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Erro na função create-payment:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
