// Supabase Edge Function: Send Application Confirmation Email
// Uses Resend API to send confirmation emails to job applicants

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'careers@mastersolis.com'
const RESEND_API_URL = 'https://api.resend.com/emails'

interface ApplicationData {
  name: string
  email: string
  position: string
  phone?: string
  resume_url?: string
  cover_letter?: string
  experience?: string
  skills?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify Resend API key is set
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set. Please configure it using: supabase secrets set RESEND_API_KEY=your_key')
    }

    // Parse request body
    const { applicationData }: { applicationData: ApplicationData } = await req.json()

    // Validate required fields
    if (!applicationData?.email || !applicationData?.name || !applicationData?.position) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, name, and position are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #2b2b2b;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #9d8f89 0%, #6d3d5f 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .content {
              background: #f5f3f1;
              padding: 30px;
              border-radius: 0 0 12px 12px;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #9d8f89;
            }
            .info-row {
              margin: 10px 0;
            }
            .label {
              font-weight: 600;
              color: #6d3d5f;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #d7d5d4;
              color: #5a5a5a;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, #9d8f89 0%, #6d3d5f 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Received</h1>
            <p>Thank you for your interest in joining Mastersolis Infotech</p>
          </div>
          <div class="content">
            <p>Dear ${applicationData.name},</p>
            
            <p>We have successfully received your application for the position of <strong>${applicationData.position}</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #6d3d5f;">Application Details</h3>
              <div class="info-row">
                <span class="label">Position:</span> ${applicationData.position}
              </div>
              <div class="info-row">
                <span class="label">Name:</span> ${applicationData.name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${applicationData.email}
              </div>
              ${applicationData.phone ? `
              <div class="info-row">
                <span class="label">Phone:</span> ${applicationData.phone}
              </div>
              ` : ''}
              ${applicationData.experience ? `
              <div class="info-row">
                <span class="label">Experience:</span> ${applicationData.experience}
              </div>
              ` : ''}
              ${applicationData.skills ? `
              <div class="info-row">
                <span class="label">Skills:</span> ${applicationData.skills}
              </div>
              ` : ''}
            </div>
            
            <p>Our hiring team will review your application and get back to you within 5-7 business days.</p>
            
            <p>If you have any questions or need to update your application, please don't hesitate to reach out to us at ${FROM_EMAIL}.</p>
            
            <p>Best regards,<br>
            <strong>The Mastersolis Infotech Team</strong></p>
            
            <div class="footer">
              <p>Mastersolis Infotech<br>
              Transforming Ideas Into Digital Reality</p>
              <p style="font-size: 12px; color: #9d8f89;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Prepare email data for Resend API
    const emailData = {
      from: `Mastersolis Infotech <${FROM_EMAIL}>`,
      to: [applicationData.email],
      subject: `Application Confirmation - ${applicationData.position}`,
      html: emailHtml,
      reply_to: FROM_EMAIL,
    }

    // Send email via Resend API
    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API Error:', resendData)
      throw new Error(`Failed to send email: ${resendData.message || 'Unknown error'}`)
    }

    // Log successful email send (optional - you can store this in Supabase)
    console.log(`Email sent successfully to ${applicationData.email} for position ${applicationData.position}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        emailId: resendData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send confirmation email',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

