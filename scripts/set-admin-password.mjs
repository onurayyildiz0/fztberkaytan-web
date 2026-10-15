// ADMIN_EMAIL adresi için admin hesabını oluşturur veya şifresini sıfırlar.
// Kullanım:  npm run admin:password -- "GucluSifre123" ["Ad Soyad"]
//
// Neden kayıt formu değil? Kayıt formu herkese açık ve e-posta doğrulaması yok.
// Admin adresinin formdan kaydına izin verilseydi, adresi önceden kaydeden biri
// admin olabilirdi. Bu script mevcut şifreyi de ezdiği için, ADMIN_EMAIL değiştirildiğinde
// çalıştırılması o adresle önceden açılmış bir hesabın ele geçirilmesini de engeller.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [password, name = "Berkay Tan"] = process.argv.slice(2);
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!email) {
  console.error("ADMIN_EMAIL tanımlı değil (.env.local).");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('Kullanım: npm run admin:password -- "EnAz8KarakterliSifre" ["Ad Soyad"]');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI tanımlı değil (.env.local).");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "fizyoterapi" });

const result = await mongoose.connection.collection("users").updateOne(
  { email },
  {
    $set: { password: await bcrypt.hash(password, 12), role: "admin", emailVerified: new Date() },
    $setOnInsert: { email, name, createdAt: new Date() },
  },
  { upsert: true },
);

console.log(
  result.upsertedCount ? `Admin hesabı oluşturuldu: ${email}` : `Admin şifresi güncellendi: ${email}`,
);
await mongoose.disconnect();
