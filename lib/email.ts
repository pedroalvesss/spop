import "server-only";
import { Resend } from "resend";

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Sem chave do Resend (dev local), o e-mail só aparece no console.
export async function sendEmail(message: EmailMessage) {
  if (!resend) {
    console.info(`[email] ${message.to} · ${message.subject}\n${message.text}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "SPOP! <onboarding@resend.dev>",
    ...message,
  });
  if (error) console.error("[email] falhou", error);
}
