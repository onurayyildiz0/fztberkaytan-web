import "server-only";

/**
 * Admin yetkisi veritabanındaki bir alandan değil, ADMIN_EMAIL ortam değişkeninden gelir.
 * Adresi değiştirmek için .env.local içindeki ADMIN_EMAIL'i güncelleyip
 * `npm run admin:password -- "<şifre>"` komutuyla yeni adres için şifre belirlemek yeterlidir.
 */
export function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email ? email : null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail();
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail;
}
