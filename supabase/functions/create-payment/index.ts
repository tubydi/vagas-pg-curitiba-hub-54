
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
    const { jobData, companyId } = body

    console.log('Creating payment for job:', JSON.stringify(jobData, null, 2))
    console.log('Company ID received:', companyId)

    // Validar se companyId foi fornecido e não é string vazia
    if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
      console.error('Company ID is missing, empty, or invalid:', companyId)
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

    // Verificar se a empresa existe e buscar dados
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('email, name')
      .eq('id', companyId)
      .single()

    if (companyError) {
      console.error('Error fetching company:', companyError)
      return new Response(
        JSON.stringify({ 
          error: 'Company not found',
          success: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    console.log('Company data found:', company)

    // Verificar se a empresa é isenta
    if (company?.email === 'vagas@vagas.com') {
      console.log('Exempt company detected, creating job directly')
      
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
        console.error('Error creating exempt job:', jobError)
        throw jobError
      }

      console.log('Exempt job created successfully:', job.id)

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
      console.error('Mercado Pago access token not configured')
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

    console.log('Creating Mercado Pago preference for company:', company.name)

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

    console.log('Mercado Pago preference:', JSON.stringify(preference, null, 2))

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
      console.error('Mercado Pago API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: `Payment system error: ${mpResponse.status}`,
          success: false 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const mpData = await mpResponse.json()
    console.log('Mercado Pago response success:', mpData.id)

    // Salvar job com status pendente
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .insert([{
        ...jobData,
        company_id: companyId,
        payment_status: 'pending',
        status: 'Pendente'
      }])
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      throw jobError
    }

    console.log('Job created with pending status:', job.id)

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
      console.error('Error creating payment record:', paymentError)
      throw paymentError
    }

    console.log('Payment record created:', payment.id)

    // Atualizar job com payment_id
    const { error: updateError } = await supabaseClient
      .from('jobs')
      .update({ payment_id: payment.id })
      .eq('id', job.id)

    if (updateError) {
      console.error('Error updating job with payment_id:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        jobId: job.id,
        paymentId: payment.id,
        checkoutUrl: mpData.init_point,
        preferenceId: mpData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-payment function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
