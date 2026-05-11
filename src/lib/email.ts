import nodemailer from 'nodemailer'
import { serverEnv } from './env/server'

export async function sendEmail({
  to,
  subject,
  body
}: {
  to: string
  subject: string
  body: string
}) {
  const transporter = nodemailer.createTransport({
    host: serverEnv.aliSmtpHost,
    port: serverEnv.aliSmtpPort,
    auth: {
      user: serverEnv.aliSmtpUser,
      pass: serverEnv.aliSmtpPass
    }
  })

  const options = {
    from: `${serverEnv.aliSmtpNickname}<${serverEnv.aliSmtpUser}>`,
    to,
    subject,
    html: body
  }

  try {
    const testResult = await transporter.verify()
    console.log('SMTP server is ready to take messages:', testResult)
  } catch (error) {
    console.error('Error connecting to SMTP server:', error)
    return
  }

  try {
    const sendResult = await transporter.sendMail(options)
    console.log('Message sent: ' + sendResult.response)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
