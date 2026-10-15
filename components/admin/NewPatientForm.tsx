"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { toFieldErrors, type FieldErrors } from "@/lib/validations/auth";
import { patientSchema } from "@/lib/validations/patients";

type Values = { name: string; phone: string; email: string; notes: string };
const initial: Values = { name: "", phone: "", email: "", notes: "" };

export default function NewPatientForm() {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<{ message: string; existingId?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = patientSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error) as FieldErrors<Values>);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        id?: string;
        existingId?: string;
        errors?: FieldErrors<Values>;
      };
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setFormError({ message: data.message ?? "Hasta kaydedilemedi.", existingId: data.existingId });
        return;
      }
      router.push(`/admin/hastalar/${data.id}`);
      router.refresh();
    } catch {
      setFormError({ message: "Sunucuya ulaşılamadı." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <div className="space-y-2">
          <FormAlert type="error" message={formError.message} />
          {formError.existingId && (
            <Link href={`/admin/hastalar/${formError.existingId}`} className="text-sm font-semibold text-teal-700 hover:underline">
              Mevcut hasta kartını aç →
            </Link>
          )}
        </div>
      )}

      <FormField
        id="name"
        label="Ad Soyad *"
        autoComplete="off"
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        disabled={loading}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="phone"
          label="Telefon"
          type="tel"
          autoComplete="off"
          placeholder="05xx xxx xx xx"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          disabled={loading}
        />
        <FormField
          id="email"
          label="E-posta"
          type="email"
          autoComplete="off"
          placeholder="ornek@eposta.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          hint="Hasta ileride bu adresle siteye kayıt olursa kartı otomatik bağlanır."
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notlar
        </label>
        <textarea
          id="notes"
          rows={4}
          maxLength={2000}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          disabled={loading}
          placeholder="Hastaya ilişkin kısa notlar (isteğe bağlı)"
          className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 shadow-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
        />
        {errors.notes && <p className="mt-1.5 text-sm text-red-600">{errors.notes}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Link
          href="/admin/hastalar"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="size-4" aria-hidden="true" />
          )}
          Hastayı Kaydet
        </button>
      </div>
    </form>
  );
}
