"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { KeyRound, LoaderCircle, Save, Trash2, UserRound } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { Card } from "@/components/panel/ui";
import {
  changePasswordSchema,
  deleteAccountSchema,
  profileSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validations/auth";

type Alert = { type: "error" | "success"; message: string } | null;

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
  return { ok: res.ok, data };
}

function SubmitButton({ loading, children, danger }: { loading: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60 ${
        danger ? "bg-red-600 hover:bg-red-700" : "bg-teal-700 hover:bg-teal-800"
      }`}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default function AccountSettings({ initial }: { initial: { name: string; email: string; phone: string } }) {
  return (
    <div className="max-w-2xl space-y-6">
      <ProfileCard initial={initial} />
      <PasswordCard />
      <DeleteCard />
    </div>
  );
}

function ProfileCard({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const { update } = useSession();
  const [values, setValues] = useState({ name: initial.name, phone: initial.phone });
  const [errors, setErrors] = useState<FieldErrors<typeof values>>({});
  const [alert, setAlert] = useState<Alert>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setAlert(null);
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error) as FieldErrors<typeof values>);
    setLoading(true);
    const { ok, data } = await send("/api/account/profile", "PATCH", values).catch(() => ({ ok: false, data: {} as { message?: string; errors?: Record<string, string> } }));
    setLoading(false);
    if (!ok) {
      if (data.errors) setErrors(data.errors);
      return setAlert({ type: "error", message: data.message ?? "Kaydedilemedi." });
    }
    await update({ name: parsed.data.name });
    setAlert({ type: "success", message: "Bilgileriniz güncellendi." });
    router.refresh();
  }

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <UserRound className="size-5 text-teal-700" aria-hidden="true" /> Kişisel Bilgiler
      </h2>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {alert && <FormAlert type={alert.type} message={alert.message} />}
        <FormField
          id="name"
          label="Ad Soyad"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          error={errors.name}
          disabled={loading}
        />
        <FormField
          id="phone"
          label="Telefon"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          error={errors.phone}
          disabled={loading}
        />
        <FormField id="email" label="E-posta" value={initial.email} disabled hint="E-posta adresi değiştirilemez." readOnly />
        <div className="flex justify-end">
          <SubmitButton loading={loading}>
            <Save className="size-4" aria-hidden="true" /> Kaydet
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [alert, setAlert] = useState<Alert>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setAlert(null);
    setErrors({});
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    if (values.newPassword !== values.confirm) return setErrors({ confirm: "Şifreler eşleşmiyor." });
    setLoading(true);
    const { ok, data } = await send("/api/account/password", "POST", parsed.data).catch(() => ({ ok: false, data: {} as { message?: string; errors?: Record<string, string> } }));
    setLoading(false);
    if (!ok) {
      if (data.errors) setErrors(data.errors);
      return setAlert({ type: "error", message: data.message ?? "Şifre değiştirilemedi." });
    }
    setValues({ currentPassword: "", newPassword: "", confirm: "" });
    setAlert({ type: "success", message: "Şifreniz güncellendi." });
  }

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <KeyRound className="size-5 text-teal-700" aria-hidden="true" /> Şifre Değiştir
      </h2>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {alert && <FormAlert type={alert.type} message={alert.message} />}
        <FormField
          id="currentPassword"
          label="Mevcut şifre"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => setValues((v) => ({ ...v, currentPassword: e.target.value }))}
          error={errors.currentPassword}
          disabled={loading}
        />
        <FormField
          id="newPassword"
          label="Yeni şifre"
          type="password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))}
          error={errors.newPassword}
          hint="En az 8 karakter; en az bir harf ve bir rakam içermelidir."
          disabled={loading}
        />
        <FormField
          id="confirm"
          label="Yeni şifre (tekrar)"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
          error={errors.confirm}
          disabled={loading}
        />
        <div className="flex justify-end">
          <SubmitButton loading={loading}>Şifreyi Güncelle</SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function DeleteCard() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ password: "", confirmText: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [alert, setAlert] = useState<Alert>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setAlert(null);
    setErrors({});
    const parsed = deleteAccountSchema.safeParse(values);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    setLoading(true);
    const { ok, data } = await send("/api/account/delete", "POST", parsed.data).catch(() => ({ ok: false, data: {} as { message?: string; errors?: Record<string, string> } }));
    if (!ok) {
      setLoading(false);
      if (data.errors) setErrors(data.errors);
      return setAlert({ type: "error", message: data.message ?? "Hesap silinemedi." });
    }
    await signOut({ redirectTo: "/?hesap=silindi" });
  }

  return (
    <Card className="border-red-100 p-6 ring-red-100">
      <h2 className="flex items-center gap-2 font-semibold text-red-700">
        <Trash2 className="size-5" aria-hidden="true" /> Hesabı Sil
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Hesabınız ve giriş bilgileriniz kalıcı olarak silinir; gelecekteki randevularınız iptal edilir. Geçmiş seans
        kayıtlarınız sağlık mevzuatındaki saklama yükümlülüğü nedeniyle yasal süre boyunca saklanır ve süre sonunda silinir.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          Hesabımı silmek istiyorum
        </button>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {alert && <FormAlert type={alert.type} message={alert.message} />}
          <FormField
            id="delete-password"
            label="Şifreniz"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            error={errors.password}
            disabled={loading}
          />
          <FormField
            id="delete-confirm"
            label='Onaylamak için büyük harflerle "SİL" yazın'
            value={values.confirmText}
            onChange={(e) => setValues((v) => ({ ...v, confirmText: e.target.value }))}
            error={errors.confirmText}
            disabled={loading}
            autoComplete="off"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Vazgeç
            </button>
            <SubmitButton loading={loading} danger>
              Hesabı Kalıcı Olarak Sil
            </SubmitButton>
          </div>
        </form>
      )}
    </Card>
  );
}
