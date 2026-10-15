import { Baby, Bone, Brain, HeartPulse } from "lucide-react";

const areas = [
  { label: "Ortopedik Rehabilitasyon", icon: Bone },
  { label: "Nörolojik Rehabilitasyon", icon: Brain },
  { label: "Pediatrik Rehabilitasyon", icon: Baby },
  { label: "Geriatrik Rehabilitasyon", icon: HeartPulse },
];

export default function About() {
  return (
    <section id="biz-kimiz" aria-labelledby="biz-kimiz-baslik" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">Biz Kimiz?</p>
          <h2
            id="biz-kimiz-baslik"
            className="mt-3 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl"
          >
            Hakkımızda
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-700">
            Fizyoterapist Berkay Tan, İstanbul Eyüpsultan Alibeyköy’de kendi Özel Sağlık Meslek Hizmet
            Biriminde fizyoterapi hizmeti sunmaktadır.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {areas.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <article className="relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <span
            aria-hidden="true"
            className="absolute top-0 left-8 h-1 w-20 -translate-y-1/2 rounded-full bg-teal-600 sm:left-10"
          />
          <h3 className="text-2xl font-bold text-slate-900">Çalışma Yaklaşımım</h3>
          <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
            <p>
              Mesleki deneyimim; ortopedik, nörolojik, pediatrik ve geriatrik rehabilitasyon
              alanlarındaki çalışmalarımı kapsamaktadır.
            </p>
            <p>
              Her danışanın ihtiyaçları, günlük yaşamı ve fonksiyonel hedefleri doğrultusunda bireysel
              bir fizyoterapi ve egzersiz programı planlamaktayım.
            </p>
            <p>Mesleki gelişimimi farklı eğitimlerle desteklemeye devam ediyorum.</p>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-6 text-sm font-semibold text-teal-800">
            — Fzt. Berkay Tan
          </p>
        </article>
      </div>
    </section>
  );
}
