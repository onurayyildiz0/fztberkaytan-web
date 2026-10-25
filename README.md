# Fizyoterapist Berkay Tan — Web Sitesi ve Randevu Sistemi

Tanıtım sitesi, hasta paneli (online randevu) ve fizyoterapist için admin paneli.

**Teknoloji:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · MongoDB (Mongoose) · Auth.js 5 · Resend · Google Takvim API

## Kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldurun (açıklamalar dosyanın içinde)
npm run admin:password -- "GucluSifre123" "Berkay Tan"
npm run dev                  # http://localhost:3000
```

`.env.local` asla commit edilmez. Gerekli değişkenler:

| Değişken | Açıklama |
| --- | --- |
| `MONGODB_URI`, `MONGODB_DB` | Veritabanı bağlantısı |
| `AUTH_SECRET` | Oturum şifreleme anahtarı (`npx auth secret`) |
| `AUTH_URL` | Yayındaki site adresi (yalnızca production) |
| `ADMIN_EMAIL` | Bu adresle giriş yapan kullanıcı admin olur |
| `RESEND_API_KEY`, `EMAIL_FROM` | E-posta gönderimi (doğrulama, randevu bildirimleri, hatırlatma) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` | Google Takvim senkronu (isteğe bağlı) |
| `CRON_SECRET` | Günlük otomatik görevin (`/api/cron/daily`) yetki anahtarı |

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Production derleme / çalıştırma |
| `npm run lint` | ESLint |
| `npm run admin:password -- "Sifre"` | `ADMIN_EMAIL` için admin hesabını oluşturur veya şifresini sıfırlar |
| `npm run email:test -- adres@ornek.com` | Resend ayarını deneme e-postasıyla sınar |
| `npm run google:key -- "anahtar.json"` | Google servis hesabı anahtarını `.env.local`'a yazar (anahtar ekrana basılmaz) |

## Randevu kuralları

- Açık saatler: **Pazartesi–Cumartesi 09:00–22:00**, Pazar kapalı (`lib/appointments.ts` → `OPEN_HOURS`, `CLOSED_WEEKDAYS`).
- Alınmış randevular, hasta onayı bekleyen erteleme önerileri ve Google Takvim'deki "Meşgul" etkinlikler o saati kapatır; hastaya "Dolu" görünür.
- Seans süreleri ve hizmetler: `lib/services.ts`. Fiyatlar sitede gösterilmez.
- Hasta randevuyu en geç 24 saat öncesine kadar iptal edebilir; en fazla 3 aktif randevusu olabilir; 60 gün ilerisine kadar randevu alınabilir.
- Onaylanan randevu Google Takvim'e eklenir, iptal edilince silinir.

## Klasör yapısı

```
app/            Sayfalar ve API route'ları (admin/, hasta-paneli/, api/, yasal sayfalar)
components/     Arayüz bileşenleri (admin/, patient/, auth/, legal/, panel/)
lib/            İş mantığı: data/ (veritabanı sorguları), validations/ (zod şemaları),
                auth/, google-calendar.ts, emails.ts, rate-limit.ts, site.ts, services.ts
models/         Mongoose modelleri (User, Patient, Appointment, token'lar)
scripts/        Yönetim komutları
```

## Yayın (Vercel)

1. Repo Vercel'e bağlanır; production ortam değişkenleri girilir (`AUTH_SECRET` yeni üretilir, `AUTH_URL=https://www.fztberkaytan.com`).
2. `vercel.json` günlük görevi her gün 10:00'da (TR) çalıştırır: hatırlatma e-postaları, süresi geçen talepler ve öneriler.
3. Alan adı DNS kayıtları Vercel'e yönlendirilir.
4. Yayın öncesi açık yasal maddeler `lib/legal.ts` → `LEGAL_PENDING_ITEMS` içinde listelenir ve admin panelinde uyarı olarak görünür.
