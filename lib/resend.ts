import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "Fizyoterapist Berkay Tan <onboarding@resend.dev>";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * E-posta gönderir. Hata fırlatmaz: e-posta gönderilemese de randevu işlemi
 * başarılı sayılmalıdır, bu yüzden hatalar yalnızca loglanır.
 */
export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY tanımlı değil, e-posta gönderilmedi: "${subject}" → ${String(to)}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html, text, replyTo });
    if (error) {
      console.error("[email] Resend hatası:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Gönderim hatası:", error);
    return false;
  }
}
