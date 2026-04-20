// Email notification utilities
// This is a basic implementation - in production, use a service like SendGrid, Resend, or Nodemailer

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.log('[Email] Email notifications disabled. Set EMAIL_ENABLED=true to enable.')
    return false
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'SOLACE <notifications@yourdomain.com>'

  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY is not set. Cannot send email.')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    const data = await response.json()
    if (response.ok) {
      console.log('[Email] Email sent successfully:', data.id)
      return true
    } else {
      console.error('[Email] Failed to send email:', data)
      return false
    }
  } catch (error) {
    console.error('[Email] Error sending email:', error)
    return false
  }
}

export function generateApplicationStatusEmail(
  recipientName: string,
  status: 'approved' | 'denied',
  reason?: string
): EmailOptions {
  const isApproved = status === 'approved'
  const brandColor = isApproved ? '#3b82f6' : '#ef4444'
  
  return {
    to: '', 
    subject: `[SOLACE] Application ${isApproved ? 'Approved' : 'Denied'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
          .wrapper { background-color: #0a0a0a; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; }
          .header { background-color: #161616; padding: 40px; text-align: center; border-bottom: 1px solid #1a1a1a; }
          .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: #ffffff; }
          .content { padding: 40px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; background: ${brandColor}20; color: ${brandColor}; border: 1px solid ${brandColor}30; margin-bottom: 24px; }
          .greeting { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #ffffff; }
          .message { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
          .reason-box { background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
          .reason-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #475569; margin-bottom: 12px; }
          .reason-text { font-size: 14px; color: #cbd5e1; line-height: 1.5; }
          .footer { padding: 32px; text-align: center; font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">SOLACE</div>
            </div>
            <div class="content">
              <div class="status-badge">${status}</div>
              <div class="greeting">Hello, ${recipientName}</div>
              <p class="message">
                Your allowlist application for SOLACE has been processed. 
                ${isApproved 
                  ? 'We are excited to welcome you to our community! You are now authorized to connect to the secure frequency.' 
                  : 'After careful review, we regret to inform you that your application has been denied at this time.'}
              </p>
              
              ${reason ? `
                <div class="reason-box">
                  <div class="reason-label">Transmission Feedback</div>
                  <div class="reason-text">${reason}</div>
                </div>
              ` : ''}
              
              ${isApproved ? `
                <p class="message">Please ensure you have read all the community protocols before your arrival.</p>
              ` : `
                <p class="message">You may re-apply once you have addressed the feedback provided above.</p>
              `}
            </div>
            <div class="footer">
              &copy; 2026 SOLACE • SECURE TRANSMISSION
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
[SOLACE]
APPLICATION ${status.toUpperCase()}

Hello ${recipientName},

Your allowlist application for SOLACE has been processed.

${isApproved ? 'Congratulations! You can now join the server.' : 'Your application has been denied.'}

${reason ? `FEEDBACK: ${reason}\n\n` : ''}

Best regards,
SOLACE Administration
    `.trim(),
  }
}
