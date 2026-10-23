import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, List, SubTitle, Table, Term } from "@/components/legal/prose";
import { siteConfig } from "@/lib/site";

const PATH = "/cerez-politikasi";
const DOMAIN = new URL(siteConfig.url).host.replace(/^www\./, "");

export const metadata = legalMetadata({
  title: "Çerez Politikası",
  description:
    "Fizyoterapist Berkay Tan web sitesinde kullanılan çerez türleri, kullanım amaçları ve çerez tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi edinin.",
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "cerez-nedir",
    title: "Çerez Nedir?",
    content: (
      <>
        <p>
          Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilebilen küçük
          veri dosyalarıdır.
        </p>
        <p>
          Çerezler; internet sitesinin düzgün çalışması, güvenliğin sağlanması, kullanıcı tercihlerinin hatırlanması ve
          site kullanımının analiz edilmesi gibi amaçlarla kullanılabilir.
        </p>
      </>
    ),
  },
  {
    id: "kullanilan-cerezler",
    title: "Hangi Çerezleri Kullanıyoruz?",
    content: (
      <>
        <SubTitle>Zorunlu Çerezler (kullanılıyor)</SubTitle>
        <p>
          Web sitesinin ve randevu sisteminin temel işlevlerinin çalışması, güvenli oturumların sağlanması ve
          sayfaların düzgün görüntülenmesi için gereklidir. Bu çerezler olmadan hesabınıza giriş yapamaz ve randevu
          sistemini kullanamazsınız. Zorunlu çerezler, KVKK kapsamında açık rıza gerektirmeyen hukuki sebeplere
          dayanılarak kullanılır.
        </p>
        <Table
          head={["Çerez", "Amaç", "Süre"]}
          rows={[
            [<code key="c" className="text-xs">authjs.session-token</code>, "Giriş yaptığınız oturumun güvenli şekilde sürdürülmesi", "En fazla 7 gün"],
            [<code key="c" className="text-xs">authjs.csrf-token</code>, "Giriş formunun sahte isteklere (CSRF) karşı korunması", "Tarayıcı oturumu süresince"],
            [<code key="c" className="text-xs">authjs.callback-url</code>, "Giriş sonrasında doğru sayfaya yönlendirme", "Tarayıcı oturumu süresince"],
          ]}
        />
        <p className="text-sm text-slate-500">
          Güvenli bağlantı (HTTPS) üzerinden bu çerezlerin adları <code className="text-xs">__Secure-</code> veya{" "}
          <code className="text-xs">__Host-</code> önekiyle görünebilir.
        </p>

        <SubTitle>İşlevsel Çerezler (kullanılmıyor)</SubTitle>
        <p>Dil, görünüm veya kullanıcı tercihleri gibi bilgilerin hatırlanmasına yardımcı olabilir.</p>

        <SubTitle>Analitik Çerezler (kullanılmıyor)</SubTitle>
        <p>
          Ziyaretçilerin siteyi nasıl kullandığını, hangi sayfaların ziyaret edildiğini ve teknik performansı anlamak
          amacıyla kullanılabilir.
        </p>

        <SubTitle>Pazarlama Çerezleri (kullanılmıyor)</SubTitle>
        <p>
          Reklam, yeniden pazarlama veya benzeri hizmetler kapsamında kullanıcı davranışlarının analiz edilmesi
          amacıyla kullanılabilir.
        </p>

        <p>
          Sitemizde şu anda işlevsel, analitik veya pazarlama çerezi kullanılmamaktadır. Bu tür çerezlerin ileride
          kullanılması halinde, söz konusu çerezler yalnızca <Term>açık rızanız alınarak</Term> etkinleştirilecek ve bu
          politika güncellenecektir.
        </p>
      </>
    ),
  },
  {
    id: "altyapi",
    title: "Web Sitesi Altyapısı ve Randevu Sistemi",
    content: (
      <>
        <p>
          {DOMAIN}, tarafımıza özel olarak geliştirilmiş bir yazılım altyapısı üzerinden çalışmaktadır. Online randevu
          sistemi de bu altyapının bir parçasıdır.
        </p>
        <p>
          Yukarıda belirtilen zorunlu çerezler, hasta panelinde ve randevu sürecinde oturumunuzun güvenli şekilde
          yönetilmesi için kullanılır. Bu çerezler yalnızca sitemiz tarafından okunabilir; tarayıcıdaki komut dosyaları
          tarafından erişilemeyecek şekilde (HttpOnly) ve güvenli bağlantı üzerinden iletilecek şekilde (Secure)
          ayarlanmıştır.
        </p>
        <p>
          Kullanılan çerezlerin türleri, siteye eklenen özelliklere bağlı olarak zaman içerisinde değişebilir. Bu
          durumda bu politika güncellenir.
        </p>
      </>
    ),
  },
  {
    id: "ucuncu-taraf",
    title: "Üçüncü Taraf Hizmetler",
    content: (
      <>
        <p>
          Anasayfamızın iletişim bölümünde konumumuzu göstermek amacıyla <Term>Google Haritalar</Term> gömülü olarak
          yer almaktadır. Harita yüklendiğinde Google, kendi çerezlerini ve benzeri teknolojilerini kullanabilir. Ayrıca
          sitemizde WhatsApp gibi üçüncü taraf hizmetlere bağlantılar bulunmaktadır.
        </p>
        <p>
          Bu hizmetleri kullandığınızda veya bu hizmetlere yönlendirildiğinizde ilgili platformlar kendi çerezlerini ve
          takip teknolojilerini kullanabilir. Üçüncü tarafların çerez uygulamaları kendi gizlilik ve çerez
          politikalarına tabidir.
        </p>
      </>
    ),
  },
  {
    id: "tercihler",
    title: "Çerez Tercihlerinizi Yönetme",
    content: (
      <>
        <p>Tarayıcı ayarlarınız üzerinden çerezleri kabul edebilir, reddedebilir veya mevcut çerezleri silebilirsiniz:</p>
        <List
          items={[
            <><Term>Google Chrome:</Term> Ayarlar → Gizlilik ve güvenlik → Üçüncü taraf çerezleri</>,
            <><Term>Mozilla Firefox:</Term> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve site verileri</>,
            <><Term>Safari:</Term> Ayarlar → Gizlilik → Web sitesi verilerini yönet</>,
            <><Term>Microsoft Edge:</Term> Ayarlar → Çerezler ve site izinleri</>,
          ]}
        />
        <p>
          Zorunlu çerezlerin devre dışı bırakılması, hesabınıza giriş yapamamanıza ve randevu sisteminin düzgün
          çalışmamasına neden olabilir.
        </p>
      </>
    ),
  },
  {
    id: "kisisel-veriler",
    title: "Kişisel Veriler",
    content: (
      <p>
        Çerezler aracılığıyla kişisel veri işlenmesi halinde ilgili işlemler yürürlükteki kişisel verilerin korunmasına
        ilişkin mevzuata uygun olarak gerçekleştirilir. Kişisel verilerin işlenmesi hakkında ayrıntılı bilgi için{" "}
        <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink> ve{" "}
        <InlineLink href="/gizlilik-politikasi">Gizlilik Politikası</InlineLink> sayfalarımızı inceleyebilirsiniz.
      </p>
    ),
  },
  {
    id: "guncelleme",
    title: "Politikanın Güncellenmesi",
    content: (
      <>
        <p>
          Bu Çerez Politikası; kullanılan teknolojilerin, site özelliklerinin veya mevzuatın değişmesi halinde
          güncellenebilir.
        </p>
        <p>Güncel metin her zaman {DOMAIN} üzerinden yayımlanır.</p>
      </>
    ),
  },
  {
    id: "iletisim",
    title: "İletişim",
    content: (
      <>
        <p>Çerez kullanımı veya gizlilik uygulamalarımız hakkında bizimle iletişime geçebilirsiniz:</p>
        <ContactCard title="İletişim" />
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      lastUpdated="19 Ekim 2026"
      intro={
        <p>
          Bu Çerez Politikası, {siteConfig.name} – {siteConfig.unit} tarafından işletilen {DOMAIN} internet sitesinde
          kullanılan çerezler ve benzeri teknolojiler hakkında ziyaretçileri bilgilendirmek amacıyla hazırlanmıştır.
        </p>
      }
      sections={sections}
      currentPath={PATH}
    />
  );
}
