
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

    const { jobData, companyId } = await req.json()
    console.log('Creating payment for job:', jobData)
    console.log('Company ID received:', companyId)

    // Validar se companyId foi fornecido
    if (!companyId || companyId.trim() === '') {
      console.error('Company ID is missing or empty')
      throw new Error('Company ID is required')
    }

    // Verificar se a empresa é isenta
    const { data: company } = await supabaseClient
      .from('companies')
      .select('email')
      .eq('id', companyId)
      .single()

    console.log('Company data found:', company)

    if (company?.email === 'vagas@vagas.com') {
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

      if (jobError) throw jobError

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
      throw new Error('Mercado Pago access token not configured')
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: [{
        title: `Publicação de Vaga: ${jobData.title}`,
        description: `Publicação da vaga "${jobData.title}" no Vagas PG`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 11.90
      }],
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-success`,
        failure: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-failure`,
        pending: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-pending`
      },
      auto_return: 'approved',
      external_reference: companyId
    }

    console.log('Creating Mercado Pago preference:', preference)

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
      console.error('Mercado Pago error:', errorText)
      throw new Error(`Mercado Pago API error: ${mpResponse.status}`)
    }

    const mpData = await mpResponse.json()
    console.log('Mercado Pago response:', mpData)

    // Salvar job temporário e payment
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

    console.log('Job created:', job)

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
      console.error('Error creating payment:', paymentError)
      throw paymentError
    }

    console.log('Payment created:', payment)

    // Atualizar job com payment_id
    await supabaseClient
      .from('jobs')
      .update({ payment_id: payment.id })
      .eq('id', job.id)

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
    console.error('Error creating payment:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
