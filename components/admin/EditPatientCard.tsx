"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import FormAlert from "@/components/auth/FormAlert";
import PatientFormFields from "@/components/admin/PatientFormFields";
import { toFieldErrors, type FieldErrors } from "@/lib/validations/auth";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patients";

/** Hasta kartı düzenleme / silme (admin) */
export default function EditPatientCard({
  patientId,
  initial,
  hasAccount,
}: {
  patientId: string;
  initial: PatientFormValues;
  hasAccount: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PatientFormValues>(initial);
  const [errors, setErrors] = useState<FieldErrors<PatientFormValues>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function update(key: keyof PatientFormValues, value: string) {
    setValues((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setAlert(null);
    const parsed = patientSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error) as FieldErrors<PatientFormValues>);
      return setAlert("Lütfen işaretli alanları kontrol edin.");
    }
    setSaving(true);
    const res = await fetch(`/api/admin/patients/${patientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { message?: string; errors?: FieldErrors<PatientFormValues> } | undefined;
    setSaving(false);
    if (!res?.ok) {
      if (data?.errors) setErrors(data.errors);
      return setAlert(data?.message ?? "Kaydedilemedi.");
    }
    setOpen(false);
    router.refresh();
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true);
    setSaving(true);
    const res = await fetch(`/api/admin/patients/${patientId}`, { method: "DELETE" }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { message?: string } | undefined;
    setSaving(false);
    setConfirmDelete(false);
    if (!res?.ok) return setAlert(data?.message ?? "Silinemedi.");
    router.push("/admin/hastalar");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setValues(initial);
          setErrors({});
          setAlert(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
      >
        <Pencil className="size-4" aria-hidden="true" /> Düzenle
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="hasta-duzenle">
      <form onSubmit={save} noValidate className="max-h-[92vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="hasta-duzenle" className="text-lg font-bold text-slate-900">
          Hasta Kartını Düzenle
        </h2>
        {alert && <FormAlert type="error" message={alert} />}
        <PatientFormFields
          values={values}
          errors={errors}
          onChange={update}
          disabled={saving}
          idPrefix="edit"
          emailHint={hasAccount ? "Hastanın giriş e-postası değişmez; yalnızca kart bilgisi güncellenir." : undefined}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {!hasAccount ? (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              onBlur={() => setConfirmDelete(false)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                confirmDelete ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 className="size-4" aria-hidden="true" /> {confirmDelete ? "Silmeyi onayla" : "Kartı sil"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              Kaydet
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
