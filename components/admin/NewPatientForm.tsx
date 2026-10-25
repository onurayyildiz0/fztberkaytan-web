"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import PatientFormFields from "@/components/admin/PatientFormFields";
import { toFieldErrors, type FieldErrors } from "@/lib/validations/auth";
import { EMPTY_PATIENT_FORM, patientSchema, type PatientFormValues } from "@/lib/validations/patients";

export default function NewPatientForm() {
  const router = useRouter();
  const [values, setValues] = useState<PatientFormValues>(EMPTY_PATIENT_FORM);
  const [errors, setErrors] = useState<FieldErrors<PatientFormValues>>({});
  const [formError, setFormError] = useState<{ message: string; existingId?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof PatientFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const parsed = patientSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error) as FieldErrors<PatientFormValues>);
      setFormError({ message: "Lütfen işaretli alanları kontrol edin." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        id?: string;
        existingId?: string;
        errors?: FieldErrors<PatientFormValues>;
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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

      <PatientFormFields
        values={values}
        errors={errors}
        onChange={update}
        disabled={loading}
        idPrefix="new"
        emailHint="Hasta ileride bu adresle siteye kayıt olursa kartı otomatik bağlanır."
      />

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Link href="/admin/hastalar" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
          Hastayı Kaydet
        </button>
      </div>
    </form>
  );
}
