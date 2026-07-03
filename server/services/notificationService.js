import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export async function sendEmailNotification(to, subject, body) {
  const smtpConfigured = env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.fromEmail;

  if (!smtpConfigured) {
    if (env.nodeEnv === 'development') {
      console.log('SMTP not configured. Development email preview:');
      console.log({ to, subject, body });
      return;
    }

    throw new Error('SMTP configuration is incomplete. Unable to send email.');
  }

  await transporter.sendMail({
    from: env.fromEmail,
    to,
    subject,
    text: body,
  });
}

export default { sendEmailNotification };
