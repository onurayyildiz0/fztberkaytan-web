import { Award, Briefcase, GraduationCap } from "lucide-react";

const experiences = [
  {
    period: "2025 – Günümüz",
    place: "Özel Sağlık Meslek Hizmet Birimi",
    detail: "Eyüpsultan’da kişiye özel fizyoterapi hizmeti.",
  },
  {
    period: "2021 – 2024",
    place: "Gaziosmanpaşa Fizik Tedavi EAH",
    detail: "Ortopedik, nörolojik, pediatrik ve geriatrik rehabilitasyon.",
  },
  {
    period: "2020",
    place: "Özel Duygu Hastanesi",
    detail: "Staj deneyimi.",
  },
  {
    period: "2016",
    place: "İstanbul Fizik Tedavi Rehabilitasyon EAH",
    detail: "Klinik staj.",
  },
];

const certificates = [
  "Clinical Pilates Exercise Method – Reformer 1",
  "The Bad Ragaz Ring Method",
  "HVLA Teknikleri – Eklem Manipülasyon Eğitimi",
  "Mesleki gelişim eğitimleri",
];

export default function Experience() {
  return (
    <section id="deneyim" aria-labelledby="deneyim-baslik" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
            Deneyim & Eğitimler
          </p>
          <h2
            id="deneyim-baslik"
            className="mt-3 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl"
          >
            Mesleki Deneyim ve Eğitimler
          </h2>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <Briefcase className="size-6 text-teal-700" aria-hidden="true" />
              Mesleki Deneyim
            </h3>
            <ol className="relative mt-8 space-y-8 border-l-2 border-teal-100 pl-8">
              {experiences.map((exp) => (
                <li key={exp.period + exp.place} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[41px] size-4 rounded-full border-4 border-white bg-teal-600 ring-2 ring-teal-100"
                  />
                  <p className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                    <time>{exp.period}</time>
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{exp.place}</h4>
                  <p className="mt-1 text-slate-600">{exp.detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 text-white shadow-xl">
              <h3 className="flex items-center gap-3 text-xl font-bold">
                <GraduationCap className="size-6" aria-hidden="true" />
                Eğitimler & Sertifikalar
              </h3>
              <ul className="mt-8 space-y-4">
                {certificates.map((cert) => (
                  <li key={cert} className="flex items-start gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                    <Award className="mt-0.5 size-5 shrink-0 text-teal-200" aria-hidden="true" />
                    <span className="font-medium">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
