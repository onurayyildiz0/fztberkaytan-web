// Google servis hesabının JSON anahtarındaki e-posta ve özel anahtarı .env.local'a yazar.
// Kullanım:  npm run google:key -- "C:\Users\...\Downloads\proje-123abc.json"
//
// Özel anahtar ekrana yazdırılmaz; elle kopyalarken \n karakterlerinin bozulması da önlenir.
// İşlem bitince indirilen JSON dosyasını silin (anahtarın tek kopyası .env.local'da kalsın).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [keyPath] = process.argv.slice(2);
const ENV_FILE = ".env.local";

if (!keyPath || !existsSync(keyPath)) {
  console.error('Kullanım: npm run google:key -- "indirilen-anahtar.json"');
  process.exit(1);
}

let key;
try {
  key = JSON.parse(readFileSync(keyPath, "utf8"));
} catch {
  console.error("Dosya okunamadı veya geçerli bir JSON değil.");
  process.exit(1);
}
if (key.type !== "service_account" || !key.client_email || !key.private_key) {
  console.error("Bu dosya bir servis hesabı anahtarı değil (type: service_account bekleniyor).");
  process.exit(1);
}

const values = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: key.client_email,
  GOOGLE_PRIVATE_KEY: JSON.stringify(key.private_key),
};

let env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
for (const [name, value] of Object.entries(values)) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  env = pattern.test(env) ? env.replace(pattern, () => line) : `${env.replace(/\n?$/, "\n")}${line}\n`;
}
writeFileSync(ENV_FILE, env);

console.log(`${ENV_FILE} güncellendi.`);
console.log(`Servis hesabı: ${key.client_email}`);
console.log("Takvimleri bu adresle paylaşmayı unutmayın; ardından JSON dosyasını silin.");
