import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, List, Note, Term } from "@/components/legal/prose";
import { siteConfig } from "@/lib/site";

const PATH = "/gizlilik-politikasi";
const DOMAIN = new URL(siteConfig.url).host.replace(/^www\./, "");

export const metadata = legalMetadata({
  title: "Gizlilik Politikası",
  description: `${DOMAIN} web sitesi gizlilik politikası, veri güvenliği ve kişisel bilgilerin kullanımı hakkında bilgilendirme.`,
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "toplanabilecek-bilgiler",
    title: "Toplanabilecek Bilgiler",
    content: (
      <>
        <p>Web sitemizi kullandığınızda aşağıdaki bilgiler işlenebilir:</p>
        <List
          items={[
            <><Term>Kimlik ve iletişim bilgileri:</Term> Ad, soyad, telefon numarası ve e-posta adresi.</>,
            <><Term>Hesap bilgileri:</Term> Online randevu için oluşturduğunuz kullanıcı hesabına ait e-posta adresi ve parola. Parolanız geri döndürülemez şekilde şifrelenerek (hash’lenerek) saklanır; tarafımızca görüntülenemez.</>,
            <><Term>Randevu bilgileri:</Term> Seçilen hizmet, randevu tarihi ve saati, randevu durumu ile randevu sırasında tarafınızca iletilen kısa notlar.</>,
            <><Term>Adres bilgileri:</Term> Yalnızca evde fizyoterapi hizmeti talep edilmesi halinde hizmetin gerçekleştirileceği adres bilgileri.</>,
            <><Term>Teknik bilgiler:</Term> IP adresi, kullanılan cihaz ve tarayıcı türü, siteye erişim zamanı, ziyaret edilen sayfalar ve çerezler aracılığıyla elde edilebilen teknik kullanım bilgileri.</>,
          ]}
        />
        <Note>
          Randevu notu veya iletişim alanları üzerinden sağlık durumunuza ilişkin bilgi paylaşmanız halinde bu bilgiler
          özel nitelikli kişisel veri niteliğinde olabilir. Bu nedenle gerekli olmayan sağlık bilgilerini web formu
          üzerinden paylaşmamanızı öneririz.
        </Note>
      </>
    ),
  },
  {
    id: "toplanma-sekli",
    title: "Bilgiler Nasıl Toplanır?",
    content: (
      <p>
        Bilgileriniz; web sitesindeki üyelik, randevu ve iletişim formları, hasta paneli üzerinden sizin tarafınızdan
        gerçekleştirilen randevu işlemleri, telefon veya e-posta yoluyla iletişim kurulması ve web sitesinin teknik
        çalışmasını sağlayan çerezler ve benzeri teknolojiler aracılığıyla toplanabilir.
      </p>
    ),
  },
  {
    id: "kullanim-amaclari",
    title: "Bilgiler Hangi Amaçlarla Kullanılır?",
    content: (
      <>
        <p>
          Toplanan bilgiler; randevu taleplerinin oluşturulması ve yönetilmesi, randevu durumuna ilişkin e-posta
          bildirimlerinin ve randevu hatırlatmalarının gönderilmesi, randevuların fizyoterapistin takviminde planlanması, sizinle iletişim kurulması, talep edilen fizyoterapi hizmetinin planlanması,
          evde hizmet talep edilmesi halinde adresin belirlenmesi, kullanıcı hesabının güvenliğinin sağlanması, web
          sitesinin güvenli ve düzgün şekilde çalışmasının sağlanması, kullanıcı deneyiminin geliştirilmesi ve yasal
          yükümlülüklerin yerine getirilmesi amacıyla kullanılabilir.
        </p>
        <p>Kişisel bilgileriniz, açık bir hukuki dayanak bulunmadıkça amaç dışı kullanılmaz.</p>
      </>
    ),
  },
  {
    id: "altyapi",
    title: "Web Sitesi Altyapısı ve Hizmet Sağlayıcıları",
    content: (
      <>
        <p>
          Web sitemiz ve online randevu sistemimiz, tarafımıza özel olarak geliştirilmiş bir yazılım ile
          çalışmaktadır. Sitenin işletilmesi için aşağıdaki hizmet sağlayıcılardan yararlanılmaktadır:
        </p>
        <List
          items={[
            <><Term>Barındırma (hosting):</Term> Web sitesinin yayınlanması ve güvenli şekilde erişilebilir olması için kullanılan sunucu hizmeti.</>,
            <><Term>Veritabanı (MongoDB Atlas):</Term> Kullanıcı hesabı ve randevu kayıtlarının saklandığı bulut veritabanı hizmeti.</>,
            <><Term>E-posta gönderimi (Resend):</Term> Randevu talebi, onay, ret, tarih değişikliği, iptal ve hatırlatma bildirimlerinin e-posta ile iletilmesi.</>,
            <><Term>Takvim (Google Takvim):</Term> Onaylanan randevuların fizyoterapistin iş takvimine aktarılması. Takvime yalnızca ad soyad, hizmet, randevu saati ve telefon numarası aktarılır; randevu notlarınız aktarılmaz.</>,
          ]}
        />
        <p>
          Bu hizmet sağlayıcılar bilgilerinize yalnızca hizmetin sunulması için gerekli olduğu ölçüde erişebilir.
          Kişisel verilerin yurt dışına aktarılmasının söz konusu olduğu durumlarda işlemler, uygulanabilir mevzuat ve
          KVKK’nın yurt dışına veri aktarımına ilişkin 9. maddesi hükümleri çerçevesinde yürütülür.
        </p>
      </>
    ),
  },
  {
    id: "cerezler",
    title: "Çerezler",
    content: (
      <>
        <p>
          Web sitemiz, sitenin ve randevu sisteminin düzgün ve güvenli şekilde çalışması için yalnızca zorunlu
          çerezler kullanmaktadır. Bu çerezler; hesabınıza giriş yapmanızı, oturumunuzun güvenli şekilde
          sürdürülmesini ve formların sahte isteklere karşı korunmasını sağlar. Sitemizde şu anda analitik, reklam veya
          pazarlama amaçlı çerez kullanılmamaktadır.
        </p>
        <p>
          İleride zorunlu olmayan çerezlerin kullanılması halinde, bu çerezler yalnızca açık rızanız alınarak
          kullanılacak ve tercihlerinizi yönetebileceğiniz bir çerez bildirimi sunulacaktır.
        </p>
        <p>
          Çerezler hakkında daha ayrıntılı bilgi için{" "}
          <InlineLink href="/cerez-politikasi">Çerez Politikası</InlineLink> sayfamızı inceleyebilirsiniz.
        </p>
      </>
    ),
  },
  {
    id: "paylasim",
    title: "Bilgilerin Paylaşılması",
    content: (
      <>
        <p>Kişisel bilgileriniz satılmaz veya ilgisiz üçüncü kişilere ticari amaçlarla aktarılmaz.</p>
        <p>
          Ancak web sitesinin ve randevu sisteminin çalışması için gerekli olması halinde yukarıda belirtilen bilişim
          ve altyapı hizmeti sağlayıcılarıyla veya yasal bir zorunluluk bulunması halinde yetkili kamu kurum ve
          kuruluşlarıyla mevzuatın izin verdiği ölçüde paylaşım yapılabilir.
        </p>
      </>
    ),
  },
  {
    id: "guvenlik",
    title: "Veri Güvenliği",
    content: (
      <>
        <p>
          Kişisel bilgilerin yetkisiz erişim, kayıp, kötüye kullanım veya hukuka aykırı şekilde açıklanmasına karşı
          korunması amacıyla makul teknik ve idari tedbirlerin uygulanmasına özen gösterilir. Bu kapsamda;
        </p>
        <List
          items={[
            "site ile tarayıcınız arasındaki veri iletimi SSL/TLS ile şifrelenir,",
            "parolalar geri döndürülemez şekilde şifrelenerek saklanır,",
            "randevu bilgilerinize yalnızca sizin ve yetkili fizyoterapistin erişebilmesi sağlanır,",
            "yönetim paneline yalnızca yetkili kişi erişebilir.",
          ]}
        />
        <p>
          Bununla birlikte internet üzerinden gerçekleştirilen hiçbir veri aktarım yönteminin tamamen risksiz olmadığı
          dikkate alınmalıdır. Parolanızı kimseyle paylaşmamanızı öneririz.
        </p>
      </>
    ),
  },
  {
    id: "saklama",
    title: "Verilerin Saklanması",
    content: (
      <>
        <p>
          Kişisel bilgiler, toplanma amaçlarının gerektirdiği süre boyunca ve uygulanabilir mevzuatta öngörülen
          saklama süreleri kapsamında muhafaza edilir.
        </p>
        <p>
          İşleme amacı ve hukuki saklama yükümlülüğü sona erdiğinde veriler mevzuata uygun şekilde silinir, yok edilir
          veya anonim hale getirilir.
        </p>
      </>
    ),
  },
  {
    id: "haklariniz",
    title: "Haklarınız",
    content: (
      <p>
        Kişisel verilerinizle ilgili haklarınız ve bu hakların nasıl kullanılacağı konusunda ayrıntılı bilgi için{" "}
        <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink> sayfamızı inceleyebilirsiniz.
      </p>
    ),
  },
  {
    id: "ucuncu-taraf-baglantilar",
    title: "Üçüncü Taraf Bağlantılar",
    content: (
      <>
        <p>
          Web sitesinde Google Haritalar, WhatsApp veya başka üçüncü taraf internet sitelerine ve hizmetlerine
          yönlendiren bağlantılar ile gömülü içerikler bulunabilir.
        </p>
        <p>
          Bu bağlantılar üzerinden ziyaret edilen üçüncü taraf sitelerin gizlilik uygulamaları kendi politikalarına
          tabidir. {siteConfig.name}, üçüncü taraf sitelerin veri işleme uygulamalarından sorumlu değildir.
        </p>
      </>
    ),
  },
  {
    id: "degisiklikler",
    title: "Politika Değişiklikleri",
    content: (
      <>
        <p>
          Bu Gizlilik Politikası; mevzuat, web sitesinin özellikleri veya kullanılan hizmetlerin değişmesi halinde
          güncellenebilir.
        </p>
        <p>Güncel politika her zaman {DOMAIN} üzerinden yayımlanır.</p>
      </>
    ),
  },
  {
    id: "iletisim",
    title: "İletişim",
    content: (
      <>
        <p>Gizlilik uygulamalarımız veya kişisel verileriniz hakkında bizimle iletişime geçebilirsiniz:</p>
        <ContactCard title="İletişim" />
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      lastUpdated="19 Ekim 2026"
      intro={
        <>
          <p>
            Bu Gizlilik Politikası, {siteConfig.name} – {siteConfig.unit} tarafından işletilen {DOMAIN} internet
            sitesini ziyaret ettiğinizde bilgilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi
            vermek amacıyla hazırlanmıştır.
          </p>
          <p>
            Bu politika, web sitesinin kullanımıyla ilgili genel gizlilik uygulamalarını açıklamaktadır. Kişisel
            verilerin 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamındaki işlenmesine ilişkin
            ayrıntılı bilgi için ayrıca <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink> sayfamızı
            inceleyebilirsiniz.
          </p>
        </>
      }
      sections={sections}
      currentPath={PATH}
    />
  );
}
