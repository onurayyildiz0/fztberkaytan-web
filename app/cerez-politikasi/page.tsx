import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, Table } from "@/components/legal/prose";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

const PATH = "/cerez-politikasi";

export const metadata = legalMetadata({
  title: "Çerez Politikası",
  description:
    "Fizyoterapist Berkay Tan web sitesinde kullanılan çerez türleri, kullanım amaçları ve çerez tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi edinin.",
  path: PATH,
});

const code = (text: string) => <code className="text-xs break-all">{text}</code>;

const sections: LegalSection[] = [
  {
    id: "kapsam",
    title: "Kapsam",
    content: (
      <p>
        Bu politika, veri sorumlusu Fizyoterapist Berkay TAN tarafından işletilen fztberkaytan.com üzerindeki çerezler ve
        benzeri teknolojilerle ilgili bilgi verir. Çerezler, tarayıcı aracılığıyla cihazınızda saklanan küçük veri
        dosyalarıdır. Bu politika, <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink> ile birlikte
        değerlendirilmelidir.
      </p>
    ),
  },
  {
    id: "oturum-guvenlik",
    title: "Oturum ve güvenlik çerezleri",
    content: (
      <>
        <p>
          Hesaba girişin ve randevu sisteminin çalışması için gereken oturum çerezleri, talep ettiğiniz hizmetin sunulması
          bakımından KVKK m.5/2-c; kötüye kullanım ve sahte istekleri önlemeye yönelik güvenlik işlemleri ise temel hak ve
          özgürlüklerinize zarar vermemek kaydıyla m.5/2-f kapsamında kullanılır. Zorunluluk değerlendirmesi yalnızca ilgili
          işlev için gereken çerezlerle sınırlıdır.
        </p>
        <Table
          head={["Çerez", "Sağlayıcı / taraf", "Amaç", "Süre"]}
          rows={[
            [
              code("__Secure-authjs.session-token"),
              "fztberkaytan.com / birinci taraf",
              "Giriş oturumunun sürdürülmesi",
              "Son kullanımdan itibaren 7 gün; oturum açıkken siteyi kullandıkça bu süre yeniden başlar. Çıkış yapıldığında silinir.",
            ],
            [
              code("__Host-authjs.csrf-token"),
              "fztberkaytan.com / birinci taraf",
              "Sahte isteklerin önlenmesine yardımcı olmak",
              "Tarayıcı oturumu (tarayıcı kapatılınca silinir)",
            ],
            [
              code("__Secure-authjs.callback-url"),
              "fztberkaytan.com / birinci taraf",
              "Kimlik doğrulama sonrasında ilgili sayfaya yönlendirmek",
              "Tarayıcı oturumu (tarayıcı kapatılınca silinir)",
            ],
          ]}
        />
        <p className="text-sm text-slate-500">
          Çerezler yalnızca güvenli (HTTPS) bağlantı üzerinden gönderilir ve sayfadaki komut dosyalarınca okunamaz
          (HttpOnly). Oturum çerezi tarayıcı sınırını aşacak kadar büyürse aynı amaçla {code(".0")}, {code(".1")} ekli
          parçalara bölünebilir.
        </p>
      </>
    ),
  },
  {
    id: "diger-cerezler",
    title: "Diğer çerezler ve üçüncü taraf içerikler",
    content: (
      <>
        <p>
          Sitemizde yukarıdaki zorunlu çerezler dışında işlevsel, analitik veya pazarlama çerezi kullanılmamaktadır. Google
          Haritalar ve WhatsApp bağlantıları ilgili platformlara yönlendirir; bu içerikler sayfa açılışında gömülü olarak
          yüklenmez.
        </p>
        <p>
          Üçüncü taraf platformlara yönlendirildiğinizde ilgili platformların politikaları geçerlidir. Kendi sitemizde
          başlattığımız veri işleme ve aktarımlardan doğan yükümlülüklerimiz devam eder.
        </p>
      </>
    ),
  },
  {
    id: "tercihler",
    title: "Tercihler ve silme",
    content: (
      <>
        <p>
          Tarayıcınızın gizlilik, çerez veya site verileri ayarlarından çerezleri görüntüleyebilir, engelleyebilir ve
          silebilirsiniz. Menü adları tarayıcıya ve sürüme göre değişebilir. Oturum çerezlerinin engellenmesi giriş ve randevu
          işlevlerini etkileyebilir.
        </p>
        <p>
          Açık rızaya tabi çerezlerin kullanıldığı bir özellik etkinleştirilirse, ilgili çerezler rızadan önce çalıştırılmaz;
          kabul ve ret seçenekleri ile tercihlerin sonradan değiştirilebildiği bir mekanizma sunulur. Tarayıcı ayarları
          üzerinden sonradan silme imkânı, gerekli önceden rıza sürecinin yerine geçmez.
        </p>
      </>
    ),
  },
  {
    id: "haklar-iletisim",
    title: "Haklar ve iletişim",
    content: (
      <>
        <p>
          Çerezler aracılığıyla işlenen kişisel verilere ilişkin KVKK m.11 hakları ve başvuru usulü{" "}
          <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>’nde açıklanmıştır.
        </p>
        <ContactCard title="İletişim" />
        <p>
          Çerez uygulaması değiştiğinde politika güncellenir ve gerekli aydınlatma/rıza işlemleri yeni uygulama başlamadan
          tamamlanır.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return <LegalPage title="Çerez Politikası" lastUpdated={LEGAL_LAST_UPDATED} sections={sections} currentPath={PATH} />;
}
