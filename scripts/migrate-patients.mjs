// Eski yapıdan yeni yapıya geçiş: her hasta hesabı için bir hasta kartı (patients) oluşturur ve
// randevuları hesap id'si yerine kart id'sine bağlar. Birden fazla çalıştırılması güvenlidir.
// Kullanım:  npm run migrate:patients
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI tanımlı değil (.env.local).");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "fizyoterapi" });
const db = mongoose.connection.db;
const users = db.collection("users");
const patients = db.collection("patients");
const appointments = db.collection("appointments");

let created = 0;
let moved = 0;

for await (const user of users.find({ role: "patient" })) {
  let card = await patients.findOne({ userId: user._id });
  if (!card) {
    const now = new Date();
    const doc = {
      userId: user._id,
      name: user.name,
      email: user.email,
      ...(user.phone ? { phone: user.phone } : {}),
      source: "online",
      createdAt: user.createdAt ?? now,
      updatedAt: now,
    };
    const { insertedId } = await patients.insertOne(doc);
    card = { _id: insertedId };
    created++;
  }
  const { modifiedCount } = await appointments.updateMany({ patientId: user._id }, { $set: { patientId: card._id } });
  moved += modifiedCount;
}

// Kartı olmayan (bağlantısı kopuk) randevu kalmış mı?
const cardIds = await patients.distinct("_id");
const orphans = await appointments.countDocuments({ patientId: { $nin: cardIds } });

console.log(`Oluşturulan hasta kartı: ${created}`);
console.log(`Karta taşınan randevu: ${moved}`);
console.log(orphans ? `UYARI: Kartı bulunmayan ${orphans} randevu var.` : "Tüm randevular bir hasta kartına bağlı.");
await mongoose.disconnect();
