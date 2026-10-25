export const siteConfig = {
  name: "Fizyoterapist Berkay Tan",
  unit: "Özel Sağlık Meslek Hizmet Birimi",
  title: "Fizyoterapist Berkay Tan | Eyüpsultan Fizyoterapi & Klinik Pilates",
  description:
    "Eyüpsultan Alibeyköy'de kişiye özel fizyoterapi, rehabilitasyon ve klinik pilates. Ortopedik, nörolojik, pediatrik ve geriatrik rehabilitasyon alanlarında bireysel tedavi ve egzersiz programları.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fztberkaytan.com",
  locale: "tr_TR",
  email: "fztberkay@gmail.com",
  phoneDisplay: "0536 972 28 22",
  phoneE164: "+905369722822",
  address: {
    street: "Alibeyköy Mahallesi Güzelyayla Caddesi No:3/5b",
    district: "Eyüpsultan",
    city: "İstanbul",
    country: "Türkiye",
    countryCode: "TR",
    full: "Alibeyköy Mahallesi Güzelyayla Caddesi No:3/5b Eyüpsultan/İstanbul, Türkiye",
  },
  appointmentHref: "/giris-yap",
} as const;

export const links = {
  tel: `tel:${siteConfig.phoneE164}`,
  mail: `mailto:${siteConfig.email}`,
  whatsapp: `https://wa.me/${siteConfig.phoneE164.replace("+", "")}?text=${encodeURIComponent(
    "Merhaba, randevu almak istiyorum.",
  )}`,
  mapsSearch: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.full)}`,
  mapsDirections: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    siteConfig.address.full,
  )}`,
};

export const navItems = [
  { label: "Anasayfa", href: "/#anasayfa" },
  { label: "Hizmetler", href: "/#hizmetler" },
  { label: "Biz Kimiz", href: "/#biz-kimiz" },
  { label: "Deneyim & Eğitimler", href: "/#deneyim" },
  { label: "İletişim", href: "/#iletisim" },
] as const;

export const legalLinks = [
  { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
] as const;
