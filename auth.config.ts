import type { NextAuthConfig } from "next-auth";
import {
  AUTH_PAGES,
  PROTECTED_AREAS,
  ROLE_HOME,
  isRole,
  matchesPrefix,
} from "@/lib/auth/roles";

/** lib/auth/admin.ts ile aynı kural; o dosya "server-only" olduğu için middleware'de burada tekrarlanır */
function isAdminAddress(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail;
}

/**
 * Edge uyumlu temel yapılandırma (middleware tarafından kullanılır).
 * Veritabanı / bcrypt gibi Node.js bağımlılıkları burada OLMAMALIDIR;
 * Credentials provider `auth.ts` içinde eklenir.
 */
export const authConfig = {
  pages: {
    signIn: "/giris-yap",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 gün
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // `user` yalnızca giriş anında doludur
      if (user) {
        if (user.id) token.id = user.id;
        if (isRole(user.role)) token.role = user.role;
      }
      // Hesap ayarlarında ad değişince istemci update({ name }) çağırır; yalnızca ad güncellenir (rol asla)
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name.trim().slice(0, 100);
      }
      // ADMIN_EMAIL değiştiyse rolü e-postasıyla artık uyuşmayan eski oturum geçersizdir (çıkış yapılmış sayılır).
      // Aksi hâlde eski admin oturumu /admin ↔ / arasında yönlendirilip giriş sayfasına da ulaşamaz.
      if (isRole(token.role) && (token.role === "admin") !== isAdminAddress(token.email)) return null;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (isRole(token.role)) session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      const role = isRole(auth?.user?.role) ? auth.user.role : null;

      // Giriş yapmış kullanıcı giriş/kayıt sayfalarına gelirse kendi paneline
      if (AUTH_PAGES.some((p) => matchesPrefix(pathname, p))) {
        return role ? Response.redirect(new URL(ROLE_HOME[role], request.nextUrl)) : true;
      }

      const area = PROTECTED_AREAS.find((a) => matchesPrefix(pathname, a.prefix));
      if (!area) return true;

      if (!role) {
        const loginUrl = new URL("/giris-yap", request.nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname + search);
        return Response.redirect(loginUrl);
      }

      if (role !== area.role) {
        // Yetkisiz rol: kendi paneline yönlendir
        return Response.redirect(new URL(ROLE_HOME[role], request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
