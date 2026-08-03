import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newsletter_id } = await req.json()

    const ZOHO_USER = Deno.env.get('ZOHO_SMTP_USER')!
    const ZOHO_PASS = Deno.env.get('ZOHO_SMTP_PASS')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Fetch newsletter
    const { data: newsletter, error: nlError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletter_id)
      .single()

    if (nlError || !newsletter) {
      return new Response(
        JSON.stringify({ error: 'Newsletter not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')

    if (subError || !subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No subscribers found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Setup Zoho transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zohocloud.ca',
      port: 465,
      secure: true,
      auth: {
        user: ZOHO_USER,
        pass: ZOHO_PASS,
      },
    })

    // Send to each subscriber
    let sent = 0
    let failed = 0

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: `Lammyde Beauty & Spa Lounge <${ZOHO_USER}>`,
          to: subscriber.email,
          subject: newsletter.subject,
          html: newsletter.html_content,
        })
        sent++
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err)
        failed++
      }
    }

    // Update newsletter status
    await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        recipients_count: sent,
        sent_at: new Date().toISOString(),
      })
      .eq('id', newsletter_id)

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})