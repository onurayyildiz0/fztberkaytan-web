import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, List, Note } from "@/components/legal/prose";
import { siteConfig } from "@/lib/site";

const PATH = "/kullanim-kosullari";
const DOMAIN = new URL(siteConfig.url).host.replace(/^www\./, "");

export const metadata = legalMetadata({
  title: "Kullanım Koşulları",
  description: `${DOMAIN} web sitesi kullanım şartları, randevu sistemi koşulları ve yasal sorumluluklar.`,
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "site-hakkinda",
    title: "Site Hakkında",
    content: (
      <>
        <p>
          {DOMAIN}; {siteConfig.name} tarafından sunulan fizyoterapi, fizyoterapi danışmanlığı, ön değerlendirme,
          klinik pilates ve ilgili hizmetler hakkında bilgi vermek ve uygun hizmetler için randevu oluşturulmasını
          sağlamak amacıyla kullanılmaktadır.
        </p>
        <p>Web sitesinde yer alan içerikler genel bilgilendirme niteliğindedir.</p>
      </>
    ),
  },
  {
    id: "saglik-bilgilendirmeleri",
    title: "Sağlık Bilgilendirmeleri",
    content: (
      <>
        <p>
          Web sitesindeki yazılar, açıklamalar, görseller ve diğer içerikler kişiye özel tıbbi tanı veya tedavi önerisi
          niteliğinde değildir.
        </p>
        <p>
          Fizyoterapi süreci; kişinin sağlık durumu, öyküsü, değerlendirme bulguları ve gerektiğinde ilgili sağlık
          profesyonellerinin görüşleri dikkate alınarak kişiye özel planlanır.
        </p>
        <Note>
          Acil veya ciddi bir sağlık sorunu söz konusu olduğunda internet sitesi ya da randevu formu yerine uygun acil
          sağlık hizmetlerine (<strong>112 Acil Çağrı Merkezi</strong>) başvurulmalıdır.
        </Note>
      </>
    ),
  },
  {
    id: "randevu-sistemi",
    title: "Randevu Sistemi",
    content: (
      <List
        items={[
          "Online randevu talebi oluşturabilmek için web sitesi üzerinden hasta hesabı oluşturulması ve giriş yapılması gerekir. Hesap bilgilerinin ve parolanın gizliliğinden kullanıcı sorumludur.",
          "Web sitesi üzerinden uygun hizmet, tarih ve saat seçilerek randevu talebi oluşturulabilir.",
          "Oluşturulan randevu talebi, fizyoterapist tarafından onaylandığında kesinleşir. Talebin onaylanması, reddedilmesi, tarihinin değiştirilmesi veya iptal edilmesi halinde kullanıcı e-posta ile bilgilendirilir; güncel durum hasta panelinden takip edilebilir. Onaylı randevulardan bir gün önce hatırlatma e-postası gönderilir.",
          "Kullanıcının randevu sırasında verdiği ad, soyad, telefon, e-posta ve gerekli diğer bilgilerin doğru ve güncel olması kendi sorumluluğundadır.",
          "Bekleyen veya onaylanmış randevular, randevu saatine 24 saatten fazla süre varsa hasta panelinden iptal edilebilir. Daha yakın randevuların iptali, tarih değişikliği veya randevuya katılımın mümkün olmadığı durumlarda mümkün olduğunca erken telefonla iletişime geçilmesi rica edilir.",
          "Fizyoterapist; zorunlu hallerde randevunun tarih veya saatini değiştirebilir ya da randevuyu iptal edebilir. Bu durumda kullanıcı bilgilendirilir.",
          "Saati geçtiği hâlde onaylanmamış randevu talepleri sistem tarafından otomatik olarak düşürülür.",
          "Randevuların oluşturulması sırasında görüntülenen müsaitlik saatleri değişiklik gösterebilir.",
        ]}
      />
    ),
  },
  {
    id: "ucretlendirme",
    title: "Ücretlendirme",
    content: (
      <>
        <p>
          Hizmet ücretleri, hizmet türü ve kişiye özel planlamaya göre değişebileceğinden web sitesinde “Ücret için
          iletişim” şeklinde gösterilebilir.
        </p>
        <p>
          Güncel ücret, ödeme yöntemi ve varsa paket bilgileri hizmet alınmadan önce kullanıcıya ayrıca bildirilir. Web
          sitesi üzerinden online ödeme alınmamaktadır.
        </p>
        <p>
          Web sitesinde ileride online ödeme veya uzaktan sözleşme kurulmasına imkân veren bir sistem kullanılması
          halinde, Mesafeli Sözleşmeler Yönetmeliği kapsamındaki zorunlu ön bilgilendirmeler ayrıca sunulacaktır.
        </p>
      </>
    ),
  },
  {
    id: "evde-fizyoterapi",
    title: "Evde Fizyoterapi Hizmeti",
    content: (
      <>
        <p>
          Evde fizyoterapi hizmeti talep edilmesi halinde hizmetin gerçekleştirilebilmesi amacıyla adres ve gerekli
          konum bilgileri istenebilir.
        </p>
        <p>
          Evde hizmetin uygunluğu; konum, ulaşım, program ve hizmetin niteliği değerlendirilerek belirlenebilir.
        </p>
      </>
    ),
  },
  {
    id: "kullanici-sorumluluklari",
    title: "Kullanıcı Sorumlulukları",
    content: (
      <>
        <p>Kullanıcılar;</p>
        <List
          items={[
            "üyelik, randevu ve iletişim formlarına doğru bilgi vermeyi,",
            "hesap bilgilerini ve parolasını üçüncü kişilerle paylaşmamayı,",
            "siteyi hukuka aykırı amaçlarla kullanmamayı,",
            "web sitesinin güvenliğini veya çalışmasını bozabilecek işlemler yapmamayı,",
            "başka kişilere ait bilgileri yetkisiz şekilde paylaşmamayı",
          ]}
        />
        <p>kabul eder.</p>
      </>
    ),
  },
  {
    id: "fikri-mulkiyet",
    title: "Fikri Mülkiyet Hakları",
    content: (
      <>
        <p>
          Web sitesinde yer alan özgün metinler, tasarım unsurları, klinik fotoğrafları, marka unsurları ve{" "}
          {siteConfig.name}’a ait diğer içerikler, aksi belirtilmedikçe ilgili hak sahibine aittir.
        </p>
        <p>
          Bu içerikler önceden izin alınmadan ticari amaçla kopyalanamaz, çoğaltılamaz veya başka bir yerde
          yayımlanamaz.
        </p>
      </>
    ),
  },
  {
    id: "ucuncu-taraf-baglantilar",
    title: "Üçüncü Taraf Bağlantıları",
    content: (
      <>
        <p>Web sitesinde Google Haritalar, WhatsApp veya diğer üçüncü taraf platformlara bağlantılar bulunabilir.</p>
        <p>
          Bu bağlantılar üzerinden erişilen üçüncü taraf sitelerin içerik, gizlilik ve kullanım koşulları ilgili üçüncü
          tarafların sorumluluğundadır.
        </p>
      </>
    ),
  },
  {
    id: "veriler-ve-gizlilik",
    title: "Kişisel Veriler ve Gizlilik",
    content: (
      <p>
        Web sitesinin kullanımı sırasında elde edilen kişisel verilerin işlenmesine ilişkin ayrıntılı bilgiler için{" "}
        <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>,{" "}
        <InlineLink href="/gizlilik-politikasi">Gizlilik Politikası</InlineLink> ve{" "}
        <InlineLink href="/cerez-politikasi">Çerez Politikası</InlineLink> sayfalarını inceleyebilirsiniz.
      </p>
    ),
  },
  {
    id: "kullanilabilirlik",
    title: "Sitenin Kullanılabilirliği",
    content: (
      <p>
        Web sitesinin kesintisiz veya hatasız çalışacağı garanti edilmez. Bakım, teknik sorun, altyapı sağlayıcıları
        veya kontrolümüz dışında gelişen nedenlerle site veya randevu sistemi geçici olarak kullanılamayabilir. Bu
        durumda randevu için telefonla iletişime geçebilirsiniz.
      </p>
    ),
  },
  {
    id: "degisiklikler",
    title: "Değişiklikler",
    content: (
      <>
        <p>
          Bu Kullanım Koşulları; hizmetlerde, web sitesinde veya yürürlükteki mevzuatta meydana gelebilecek
          değişikliklere göre güncellenebilir.
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
        <p>Kullanım Koşulları veya hizmetler hakkında bizimle iletişime geçebilirsiniz:</p>
        <ContactCard title="İletişim" />
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Kullanım Koşulları"
      lastUpdated="19 Ekim 2026"
      intro={
        <>
          <p>
            Bu Kullanım Koşulları, {siteConfig.name} – {siteConfig.unit} tarafından işletilen {DOMAIN} internet
            sitesinin kullanımına ilişkin şartları düzenlemektedir.
          </p>
          <p>
            Web sitesini kullanarak aşağıdaki koşulları okuduğunuzu ve site kullanımında bu koşullara uygun hareket
            edeceğinizi kabul etmiş olursunuz. Yürürlükteki mevzuat kapsamında, 6502 sayılı Tüketicinin Korunması
            Hakkında Kanun başta olmak üzere tüketicilere tanınan zorunlu haklar saklıdır.
          </p>
        </>
      }
      sections={sections}
      currentPath={PATH}
    />
  );
}
