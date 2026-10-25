// Resend ayarını sınar: EMAIL_FROM adresinden verilen adrese bir deneme e-postası gönderir.
// Kullanım:  npm run email:test -- alici@ornek.com
//
// Alan adı doğrulanmadan (EMAIL_FROM ...@resend.dev iken) yalnızca Resend hesabının
// sahibi olan e-posta adresine gönderim yapılabilir.
import { Resend } from "resend";

const [to] = process.argv.slice(2);
const from = process.env.EMAIL_FROM || "Fizyoterapist Berkay Tan <onboarding@resend.dev>";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY tanımlı değil (.env.local).");
  process.exit(1);
}
if (!to || !to.includes("@")) {
  console.error("Kullanım: npm run email:test -- alici@ornek.com");
  process.exit(1);
}

const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
  from,
  to,
  subject: "Deneme e-postası – Fizyoterapist Berkay Tan",
  text: "Bu e-posta geldiyse Resend ayarları doğru çalışıyor.",
  html: "<p>Bu e-posta geldiyse <strong>Resend ayarları doğru çalışıyor</strong>.</p>",
});

if (error) {
  console.error(`Gönderilemedi (${error.name}): ${error.message}`);
  process.exit(1);
}
console.log(`Gönderildi: ${from} → ${to} (id: ${data.id})`);
