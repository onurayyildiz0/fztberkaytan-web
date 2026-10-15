export type ClinicService = {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  /** public/ altındaki görsel (546x366) */
  image: string;
  imageAlt: string;
  /** TL cinsinden seans ücreti. null ise "Bilgi için iletişime geçin" gösterilir. */
  price: number | null;
};

// Fiyatları buradan güncelleyin
export const SERVICES = [
  {
    slug: "on-degerlendirme",
    name: "Ön Değerlendirme",
    description:
      "Şikâyetlerinizin, günlük yaşamınızın ve fonksiyonel hedeflerinizin ayrıntılı değerlendirilmesiyle size özel tedavi planının temeli oluşturulur.",
    durationMinutes: 60,
    image: "/hizmetler/on-degerlendirme.avif",
    imageAlt: "Fizyoterapist Berkay Tan ön değerlendirme sırasında MR görüntüsünü inceliyor",
    price: null,
  },
  {
    slug: "fizyoterapi",
    name: "Fizyoterapi Hizmetleri",
    description:
      "Ortopedik, nörolojik, pediatrik ve geriatrik rehabilitasyon alanlarında bireysel fizyoterapi ve egzersiz programları.",
    durationMinutes: 60,
    image: "/hizmetler/fizyoterapi.avif",
    imageAlt: "Kliniğimizdeki fizyoterapi tedavi masası ve infrared lamba",
    price: null,
  },
  {
    slug: "fizyoterapi-danismanligi",
    name: "Fizyoterapi Danışmanlığı",
    description:
      "Ağrı, duruş ve hareket alışkanlıklarınıza yönelik bilgilendirme, ev egzersizi planlaması ve süreç takibi.",
    durationMinutes: 60,
    image: "/hizmetler/fizyoterapi-danismanligi.avif",
    imageAlt: "Fizyoterapist Berkay Tan klinikteki çalışma masasında danışmanlık hizmeti veriyor",
    price: null,
  },
  {
    slug: "klinik-pilates",
    name: "Klinik Pilates Hizmetleri",
    description:
      "Kas kuvveti, esneklik ve vücut farkındalığını geliştirmeye yönelik, ihtiyaçlarınıza göre planlanan klinik pilates seansları.",
    durationMinutes: 60,
    image: "/hizmetler/klinik-pilates.avif",
    imageAlt: "Klinik pilates stüdyomuzdaki reformer ve cadillac cihazları",
    price: null,
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

export function formatPrice(price: number | null): string {
  if (price === null) return "Bilgi için iletişime geçin";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    price,
  );
}
