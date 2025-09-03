import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string
  url: string
  provider: any
}) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      throw new Error('Resend API key not configured')
    }
    
    const { data, error } = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'Your App <noreply@yourapp.com>',
      to: email,
      subject: 'Sign in to Your App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Sign in to Your App</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Your App</h1>
              </div>
              
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">Welcome back!</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Hello ${email},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                  Click the button below to sign in to your account. 
                  This magic link expires in <strong>10 minutes</strong>.
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${url}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Sign In
                  </a>
                </div>
                
                <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
                    <strong>Link not working?</strong> Copy and paste this URL into your browser:
                  </p>
                  <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin: 0;">
                    ${url}
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
              
              <div style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                  © ${new Date().getFullYear()} Your App - Powered by Next.js SaaS Template
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending magic link email:', error)
      throw new Error('Failed to send magic link email')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendVerificationRequest:', error)
    throw error
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string | string[]
  subject: string
  html?: string
  react?: React.ReactElement
}) {
  try {
    const resendClient = getResendClient()
    if (!resendClient) {
      throw new Error('Resend API key not configured')
    }
    
    const { data, error } = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'Your App <noreply@yourapp.com>',
      to,
      subject,
      html,
      react,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}