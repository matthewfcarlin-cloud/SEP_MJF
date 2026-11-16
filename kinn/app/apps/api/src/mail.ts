/** Sending the sign-in code. Resend in production; nothing is sent in a local run (the code is handed back instead). */
export interface Mailer {
  send(message: { readonly to: string; readonly subject: string; readonly text: string }): Promise<void>
}

const RESEND_URL = 'https://api.resend.com/emails'
const SEND_TIMEOUT_MS = 8000

export function resendMailer(apiKey: string, from: string): Mailer {
  return {
    async send({ to, subject, text }) {
      const response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from, to, subject, text }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      })
      if (!response.ok) throw new Error(`RECO server: the sign-in email was not accepted (${response.status})`)
    },
  }
}

export const SIGN_IN_MINUTES = 10

export const signInEmail = (code: string): { subject: string; text: string } => ({
  subject: `${code} is your RECO sign-in code`,
  text: `Your RECO sign-in code is ${code}.\n\nIt works for ${SIGN_IN_MINUTES} minutes and only once. If you didn't ask for it, you can ignore this email; nobody can sign in without the code.\n\nRECO is in development and is not a medical device.`,
})
