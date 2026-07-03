import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function logSmtpEnvStatus() {
  const status = {
    SMTP_HOST: !!env.smtpHost,
    SMTP_PORT: !!env.smtpPort,
    SMTP_SECURE: process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== '',
    SMTP_USER: !!env.smtpUser,
    SMTP_PASS: !!env.smtpPass,
    FROM_EMAIL: !!env.fromEmail,
  };

  console.log('SMTP environment variable status:');
  console.log(`  SMTP_HOST: ${status.SMTP_HOST ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`  SMTP_PORT: ${status.SMTP_PORT ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`  SMTP_SECURE: ${status.SMTP_SECURE ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`  SMTP_USER: ${status.SMTP_USER ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`  SMTP_PASS: ${status.SMTP_PASS ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`  FROM_EMAIL: ${status.FROM_EMAIL ? 'Loaded ✓' : 'Missing ✗'}`);

  return status;
}

function createTransporter() {
  const missing = [];
  if (!env.smtpHost) missing.push('SMTP_HOST');
  if (!env.smtpPort) missing.push('SMTP_PORT');
  if (process.env.SMTP_SECURE === undefined || process.env.SMTP_SECURE === '') missing.push('SMTP_SECURE');
  if (!env.smtpUser) missing.push('SMTP_USER');
  if (!env.smtpPass) missing.push('SMTP_PASS');
  if (!env.fromEmail) missing.push('FROM_EMAIL');

  if (missing.length > 0) {
    throw new Error(`SMTP configuration incomplete: missing ${missing.join(', ')}`);
  }

  console.log('Creating SMTP transporter using host:', env.smtpHost);
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

logSmtpEnvStatus();

export async function verifySmtpConnection() {
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error('SMTP transporter creation failed:', error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }

  try {
    await transporter.verify();
    console.log('✓ SMTP connection successful');
    return { success: true };
  } catch (error) {
    console.error('SMTP verification failed:', error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

export async function sendEmailNotification(to, subject, body) {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: env.fromEmail,
      to,
      subject,
      text: body,
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      smtpHost: env.smtpHost,
    });
    console.log('Email body includes reset link:', body.includes('/reset-password/') ? 'yes' : 'no');

    return info;
  } catch (error) {
    console.error('Failed to send email:', error?.message || error);
    throw new Error(`Failed to send email: ${error?.message || error}`);
  }
}

export default { sendEmailNotification, verifySmtpConnection };
