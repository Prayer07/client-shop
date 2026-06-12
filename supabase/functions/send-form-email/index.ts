import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

    const ZOHO_USER = Deno.env.get('ZOHO_SMTP_USER')!
    const ZOHO_PASS = Deno.env.get('ZOHO_SMTP_PASS')!

    let subject = ''
    let content = ''

    if (type === 'contact') {
      subject = `New Enquiry from ${data.name}`
      content = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F3EE;padding:32px;border-radius:12px;">
          <div style="background:#4A3A32;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#F7F3EE;font-size:20px;margin:0;">New Contact Enquiry</h1>
            <p style="color:#C6A75E;font-size:12px;margin:8px 0 0 0;letter-spacing:2px;text-transform:uppercase;">Lammyde Beauty & Spa Lounge</p>
          </div>
          <div style="background:#fff;border:1px solid #E6C7BE;border-radius:8px;padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:130px;">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;"><a href="mailto:${data.email}" style="color:#C6A75E;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Subject</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.subject}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Message</td>
                <td style="padding:10px 0;font-size:14px;color:#4A3A32;line-height:1.6;">${data.message}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="mailto:${data.email}" style="display:inline-block;background:#4A3A32;color:#F7F3EE;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:100px;">Reply to ${data.name}</a>
          </div>
          <p style="text-align:center;font-size:11px;color:#8E7F76;margin-top:20px;">Lammyde Beauty & Spa Lounge · lammydebeautylounge.com</p>
        </div>
      `
    }

    if (type === 'consultation') {
      subject = `New Pre-Consultation from ${data.full_name}`
      content = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F3EE;padding:32px;border-radius:12px;">
          <div style="background:#4A3A32;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#F7F3EE;font-size:20px;margin:0;">New Pre-Consultation Form</h1>
            <p style="color:#C6A75E;font-size:12px;margin:8px 0 0 0;letter-spacing:2px;text-transform:uppercase;">Lammyde Beauty & Spa Lounge</p>
          </div>
          <div style="background:#fff;border:1px solid #E6C7BE;border-radius:8px;padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:140px;">Full Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.full_name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;"><a href="mailto:${data.email}" style="color:#C6A75E;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Date of Birth</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.date_of_birth ?? 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Service</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.service_interest ?? 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Preferred Date</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.preferred_date ?? 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Heard About Us</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;font-weight:600;">${data.how_did_you_hear ?? 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Reason for Visit</td>
                <td style="padding:10px 0;border-bottom:1px solid #E6C7BE;font-size:14px;color:#4A3A32;line-height:1.6;">${data.visit_reason ?? 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:12px;color:#8E7F76;font-weight:700;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Special Requests</td>
                <td style="padding:10px 0;font-size:14px;color:#4A3A32;line-height:1.6;">${data.special_requests ?? 'None'}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="mailto:${data.email}" style="display:inline-block;background:#4A3A32;color:#F7F3EE;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:100px;">Reply to ${data.full_name}</a>
          </div>
          <p style="text-align:center;font-size:11px;color:#8E7F76;margin-top:20px;">Lammyde Beauty & Spa Lounge · lammydebeautylounge.com</p>
        </div>
      `
    }

    const client = new SmtpClient()

    await client.connectTLS({
      hostname: 'smtp.zoho.com',
      port: 465,
      username: ZOHO_USER,
      password: ZOHO_PASS,
    })

    await client.send({
      from: `Lammyde Beauty & Spa Lounge <${ZOHO_USER}>`,
      to: ZOHO_USER,
      subject,
      content: 'Please view this email in an HTML-compatible client.',
      html: content,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})