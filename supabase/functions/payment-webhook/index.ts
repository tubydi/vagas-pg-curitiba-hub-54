
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Payment webhook received:', body)

    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

      // Buscar detalhes do pagamento no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const paymentData = await mpResponse.json()
      console.log('Payment data from MP:', paymentData)

      if (paymentData.status === 'approved') {
        // Encontrar o payment no nosso banco
        const { data: payment } = await supabaseClient
          .from('payments')
          .select('*, jobs(*)')
          .eq('payment_id', paymentId.toString())
          .single()

        if (payment) {
          // Atualizar status do pagamento
          await supabaseClient
            .from('payments')
            .update({
              status: 'approved',
              paid_at: new Date().toISOString(),
              mercadopago_data: paymentData
            })
            .eq('id', payment.id)

          // Ativar a vaga
          await supabaseClient
            .from('jobs')
            .update({
              payment_status: 'approved',
              status: 'Ativa'
            })
            .eq('id', payment.job_id)

          console.log(`Job ${payment.job_id} activated after payment approval`)
        }
      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
        // Atualizar status para rejeitado/cancelado
        const { data: payment } = await supabaseClient
          .from('payments')
          .select('*')
          .eq('payment_id', paymentId.toString())
          .single()

        if (payment) {
          await supabaseClient
            .from('payments')
            .update({
              status: paymentData.status === 'rejected' ? 'rejected' : 'cancelled',
              mercadopago_data: paymentData
            })
            .eq('id', payment.id)

          await supabaseClient
            .from('jobs')
            .update({
              payment_status: paymentData.status === 'rejected' ? 'rejected' : 'cancelled'
            })
            .eq('id', payment.job_id)
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
