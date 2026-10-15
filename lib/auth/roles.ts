export const ROLES = ["admin", "patient"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Her rolün giriş sonrası varsayılan paneli */
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  patient: "/hasta-paneli",
};

/** Korumalı alanlar ve bu alanlara erişebilen rol */
export const PROTECTED_AREAS: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/hasta-paneli", role: "patient" },
];

export const AUTH_PAGES = ["/giris-yap", "/kayit-ol"] as const;

export function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * callbackUrl yalnızca site içi bir yol ise ve kullanıcının rolüne açık bir alana
 * işaret ediyorsa kullanılır (open-redirect ve rol dışı yönlendirmeyi engeller).
 */
export function resolveRedirect(role: Role, callbackUrl?: string | null): string {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.startsWith("/\\")
  ) {
    const area = PROTECTED_AREAS.find((a) => matchesPrefix(callbackUrl.split(/[?#]/)[0], a.prefix));
    if (area?.role === role) return callbackUrl;
  }
  return ROLE_HOME[role];
}
