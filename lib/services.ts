export type ServiceOption = {
  slug: string;
  name: string;
  /** Belirtilmezse ana hizmetin süresi kullanılır */
  durationMinutes?: number;
};

export type ClinicService = {
  slug: string;
  name: string;
  description: string;
  /** Seans süresi (dakika) — randevu takvimde bu kadar yer kaplar */
  durationMinutes: number;
  /** Hastanın seçmesi gereken alt seçenekler (ör. Fizyoterapi → Manuel Terapi) */
  options?: readonly ServiceOption[];
  /** public/ altındaki görsel (546x366) */
  image: string;
  imageAlt: string;
};

// Fiyatlar sitede gösterilmez; hastalar iletişim üzerinden bilgi alır.
export const SERVICES = [
  {
    slug: "on-degerlendirme",
    name: "Ön Değerlendirme",
    description:
      "Şikâyetlerinizin, günlük yaşamınızın ve fonksiyonel hedeflerinizin ayrıntılı değerlendirilmesiyle size özel tedavi planının temeli oluşturulur.",
    durationMinutes: 60,
    image: "/hizmetler/on-degerlendirme.avif",
    imageAlt: "Fizyoterapist Berkay Tan ön değerlendirme sırasında MR görüntüsünü inceliyor",
  },
  {
    slug: "fizyoterapi",
    name: "Fizyoterapi Hizmetleri",
    description:
      "Ortopedik, nörolojik, pediatrik ve geriatrik rehabilitasyon alanlarında bireysel fizyoterapi ve egzersiz programları.",
    durationMinutes: 60,
    options: [
      { slug: "elektroterapi", name: "Elektroterapi" },
      { slug: "manuel-terapi", name: "Manuel Terapi" },
      { slug: "masaj", name: "Masaj" },
    ],
    image: "/hizmetler/fizyoterapi.avif",
    imageAlt: "Kliniğimizdeki fizyoterapi tedavi masası ve infrared lamba",
  },
  {
    slug: "fizyoterapi-danismanligi",
    name: "Fizyoterapi Danışmanlığı",
    description:
      "Ağrı, duruş ve hareket alışkanlıklarınıza yönelik bilgilendirme, ev egzersizi planlaması ve süreç takibi.",
    durationMinutes: 15,
    image: "/hizmetler/fizyoterapi-danismanligi.avif",
    imageAlt: "Fizyoterapist Berkay Tan klinikteki çalışma masasında danışmanlık hizmeti veriyor",
  },
  {
    slug: "klinik-pilates",
    name: "Egzersiz Uygulamaları",
    description:
      "Kas kuvveti, esneklik ve vücut farkındalığını geliştirmeye yönelik, ihtiyaçlarınıza göre planlanan klinik pilates seansları.",
    durationMinutes: 50,
    image: "/hizmetler/klinik-pilates.avif",
    imageAlt: "Klinik pilates stüdyomuzdaki reformer ve cadillac cihazları",
  },
] as const satisfies readonly ClinicService[];

export const SERVICE_NAMES = SERVICES.map((s) => s.name) as unknown as readonly [
  (typeof SERVICES)[number]["name"],
  ...(typeof SERVICES)[number]["name"][],
];

export type ServiceName = (typeof SERVICES)[number]["name"];

export function isServiceName(value: unknown): value is ServiceName {
  return typeof value === "string" && SERVICES.some((s) => s.name === value);
}

export function getService(name: string): ClinicService | undefined {
  return SERVICES.find((s) => s.name === name);
}

/** Alt seçenek bu hizmete ait mi? Alt seçeneği olan hizmette seçim zorunludur. */
export function isValidServiceOption(serviceName: string, option: string | null | undefined): boolean {
  const service = getService(serviceName);
  if (!service) return false;
  if (!service.options?.length) return !option;
  return !!option && service.options.some((o) => o.name === option);
}

export function serviceDurationMinutes(serviceName: string, option?: string | null): number {
  const service = getService(serviceName);
  const opt = service?.options?.find((o) => o.name === option);
  return opt?.durationMinutes ?? service?.durationMinutes ?? 60;
}

/** "Fizyoterapi Hizmetleri – Manuel Terapi" */
export function serviceLabel(serviceName: string, option?: string | null): string {
  return option ? `${serviceName} – ${option}` : serviceName;
}
