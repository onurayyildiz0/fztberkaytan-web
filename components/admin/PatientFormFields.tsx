"use client";

import FormField from "@/components/auth/FormField";
import { todayKey } from "@/lib/dates";
import type { FieldErrors } from "@/lib/validations/auth";
import { GENDERS, GENDER_LABELS, type PatientFormValues } from "@/lib/validations/patients";

type Props = {
  values: PatientFormValues;
  errors: FieldErrors<PatientFormValues>;
  onChange: (key: keyof PatientFormValues, value: string) => void;
  disabled?: boolean;
  /** Aynı sayfada birden fazla form olursa id çakışmasın */
  idPrefix?: string;
  emailHint?: string;
};

const textareaClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none disabled:bg-slate-50";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-xs font-bold tracking-wider text-teal-700 uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Hasta kartı alanları (yeni hasta ve düzenleme formlarında ortak) */
export default function PatientFormFields({ values, errors, onChange, disabled, idPrefix = "p", emailHint }: Props) {
  const id = (k: string) => `${idPrefix}-${k}`;
  const field = (key: keyof PatientFormValues, label: string, extra: Partial<React.ComponentProps<typeof FormField>> = {}) => (
    <FormField
      id={id(key)}
      label={label}
      value={values[key]}
      onChange={(e) => onChange(key, e.target.value)}
      error={errors[key]}
      disabled={disabled}
      autoComplete="off"
      {...extra}
    />
  );
  const area = (key: keyof PatientFormValues, label: string, rows: number, max: number, placeholder?: string) => (
    <div>
      <label htmlFor={id(key)} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id(key)}
        rows={rows}
        maxLength={max}
        value={values[key]}
        onChange={(e) => onChange(key, e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={textareaClass}
      />
      {errors[key] && <p className="mt-1.5 text-sm text-red-600">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-7">
      <Section title="Kimlik">
        {field("name", "Ad Soyad *")}
        <div className="grid gap-4 sm:grid-cols-3">
          {field("tcNo", "T.C. Kimlik No", { inputMode: "numeric", maxLength: 11, placeholder: "11 haneli" })}
          {field("birthDate", "Doğum Tarihi", { type: "date", max: todayKey(), min: "1900-01-01" })}
          <div>
            <label htmlFor={id("gender")} className="block text-sm font-medium text-slate-700">
              Cinsiyet
            </label>
            <select
              id={id("gender")}
              value={values.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              disabled={disabled}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm"
            >
              <option value="">Seçiniz</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </select>
            {errors.gender && <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>}
          </div>
        </div>
      </Section>

      <Section title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone", "Telefon", { type: "tel", placeholder: "05xx xxx xx xx" })}
          {field("email", "E-posta", { type: "email", placeholder: "ornek@eposta.com", hint: emailHint })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("emergencyContactName", "Acil durumda aranacak kişi", { placeholder: "Ad Soyad (yakınlık)" })}
          {field("emergencyContactPhone", "Acil durum telefonu", { type: "tel", placeholder: "05xx xxx xx xx" })}
        </div>
      </Section>

      <Section title="Klinik Bilgiler">
        {field("referringPhysician", "Yönlendiren hekim", { placeholder: "Dr. Ad Soyad – Branş / Kurum" })}
        {area("complaint", "Şikâyet", 3, 2000, "Hastanın başvuru nedeni")}
        {area("findings", "Bulgular", 4, 4000, "Değerlendirme bulguları")}
        {area("notes", "Notlar", 3, 2000)}
      </Section>
    </div>
  );
}
