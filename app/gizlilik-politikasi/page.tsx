import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, Note } from "@/components/legal/prose";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

const PATH = "/gizlilik-politikasi";

export const metadata = legalMetadata({
  title: "Gizlilik Politikası",
  description: "fztberkaytan.com web sitesi ve online randevu sisteminin gizlilik uygulamaları, veri güvenliği ve kişisel bilgilerin kullanımı.",
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "kapsam",
    title: "Kapsam ve işletmeci",
    content: (
      <p>
        Bu politika, Fizyoterapist Berkay TAN tarafından işletilen fztberkaytan.com internet sitesinin ve online randevu
        sisteminin gizlilik uygulamalarını açıklar. Faaliyet yeri Özel Sağlık Meslek Hizmet Birimi – Fizyoterapist Berkay
        TAN’dır. Veri kategorileri, hukuki sebepler, alıcılar ve haklarınız hakkında ayrıntılı bilgi{" "}
        <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>’nde yer alır.
      </p>
    ),
  },
  {
    id: "toplanan-bilgiler",
    title: "Toplanan bilgiler ve kullanım",
    content: (
      <>
        <p>
          Üyelik ve randevu işlemlerinde ad-soyad, telefon, e-posta, hesap/kimlik doğrulama bilgileri, seçilen hizmet, randevu
          tarih-saati, durum ve iletişim kayıtları işlenir. Sitenin çalışması ve güvenliği için gerekli teknik kayıtlar ve
          çerez verileri de işlenir.
        </p>
        <p>
          Bilgiler; randevu talebinin alınması, değerlendirilmesi, onay/ret/iptal ve değişiklik bildirimlerinin gönderilmesi,
          hatırlatmalar, takvim planlaması, kullanıcı taleplerinin yanıtlanması, güvenlik ve hukuki yükümlülüklerin yerine
          getirilmesi için kullanılır. Randevu e-postaları işlem bilgilendirmesidir; reklam veya pazarlama izni yerine geçmez.
        </p>
        <Note>
          Randevu formunda ad, soyad, e-posta adresi, telefon numarası ve şikâyet açıklaması alınır. Şikâyet açıklamasındaki
          sağlık bilgileri özel nitelikli kişisel veri olarak, sağlık hizmetinin planlanması ve yürütülmesi için gerekli
          kapsamla sınırlı işlenir. Başvuru nedeninizi kısa yazınız; gereksiz ayrıntı ve üçüncü kişilere ait sağlık bilgisi
          paylaşmayınız.
        </Note>
        <p>
          Seçilen hizmetin sağlık durumunu açıklaması hâlinde bu bilgi ayrıca özel nitelikli veri bakımından değerlendirilir.
          Klinik hizmet sırasında gerekli sağlık bilgileri, o sürece ilişkin ayrı aydınlatma kapsamında alınır.
        </p>
      </>
    ),
  },
  {
    id: "altyapi-paylasim",
    title: "Altyapı ve paylaşım",
    content: (
      <>
        <p>
          Online sistemde hosting hizmeti, hesap ve randevu kayıtları için MongoDB Atlas, işlem e-postaları için Resend ve
          randevu planlaması için Google Takvim kullanılmaktadır. Şikâyet açıklaması yönetim panelinde görüntülenir veya
          fizyoterapiste e-posta ile iletilir; randevu kaydıyla birlikte Google Takvim’e de aktarılır. Sağlayıcılar, veri
          kapsamları ve yurt dışı aktarım açıklaması <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>’nde
          belirtilir. Gerekli yetkilendirme ve güvenlik koşulları gözetilir.
        </p>
        <p>
          Kişisel bilgiler satılmaz. Hizmetin yürütülmesi için gereken sağlayıcılar ve kanuni şartlarla yetkili merciler
          dışında, amaçla ilgisiz ticari paylaşım yapılmaz. Sağlayıcı kullanılması, veri sorumlusunun kanuni yükümlülüklerini
          ortadan kaldırmaz.
        </p>
      </>
    ),
  },
  {
    id: "cerezler",
    title: "Çerezler ve harici hizmetler",
    content: (
      <>
        <p>
          Oturum ve güvenlik çerezlerinin amaç ve süreleri <InlineLink href="/cerez-politikasi">Çerez Politikası</InlineLink>
          ’nda açıklanır. Üçüncü taraf harita veya benzeri içeriklerin bulunması hâlinde bunlara ilişkin veri işleme de aynı
          politikada açıklanır. Rıza gerektiren çerezler önceden rıza alınmadan etkinleştirilmez; rıza tercihleri
          değiştirilebilir.
        </p>
        <p>
          Dış bağlantıya tıklayarak başka bir platforma geçtiğinizde o platformun kendi koşulları geçerlidir. Sitemize
          yerleştirdiğimiz entegrasyonlar nedeniyle doğan aydınlatma, veri güvenliği ve aktarım yükümlülüklerimiz saklıdır.
        </p>
      </>
    ),
  },
  {
    id: "guvenlik",
    title: "Güvenlik ve hesap kullanımı",
    content: (
      <>
        <p>
          Kişisel verilerin hukuka aykırı işlenmesini, yetkisiz erişimi ve kaybını önlemek için uygun güvenlik düzeyini
          sağlamaya yönelik gerekli teknik ve idari tedbirler alınır. Erişimler görev ve hizmet gereksinimleriyle
          sınırlandırılır. Parolanızı üçüncü kişilerle paylaşmayınız; hesabınızda şüpheli işlem fark ederseniz bizimle
          iletişime geçiniz.
        </p>
        <p>
          İnternet sistemlerinde mutlak risksizlik garantisi verilemez. Bu açıklama, veri güvenliği yükümlülüklerimizi veya
          mevzuattan doğan sorumluluğumuzu ortadan kaldırmaz.
        </p>
      </>
    ),
  },
  {
    id: "saklama-haklar",
    title: "Saklama, haklar ve güncellemeler",
    content: (
      <>
        <p>
          Veriler amaçla ve kanuni sürelerle sınırlı tutulur; işleme şartları sona erdiğinde mevzuata uygun imha işlemleri
          uygulanır. Haklarınız ve başvuru yöntemi <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>’nde
          açıklanmıştır.
        </p>
        <p>
          Politika, hizmet ve mevzuat değişikliklerine göre güncellenebilir. Yeni işleme amaçları için gereken aydınlatma
          işlem başlamadan yapılır; açık rıza gerekiyorsa ayrıca alınır. Politikanın güncellenmesi veya sitenin kullanılmaya
          devam edilmesi kendiliğinden açık rıza oluşturmaz.
        </p>
      </>
    ),
  },
  {
    id: "iletisim",
    title: "İletişim",
    content: <ContactCard title="İletişim" />,
  },
];

export default function PrivacyPolicyPage() {
  return <LegalPage title="Gizlilik Politikası" lastUpdated={LEGAL_LAST_UPDATED} sections={sections} currentPath={PATH} />;
}
