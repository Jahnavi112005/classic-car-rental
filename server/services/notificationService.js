export function sendEmailNotification(to, subject, body) {
  // Stubbed notification service; replace with SMTP provider later.
  console.log(`[Notification] To: ${to} Subject: ${subject}\n${body}`);
}

export default { sendEmailNotification };
