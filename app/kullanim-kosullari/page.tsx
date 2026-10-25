import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, Note } from "@/components/legal/prose";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";
import { links, siteConfig } from "@/lib/site";

const PATH = "/kullanim-kosullari";

export const metadata = legalMetadata({
  title: "Kullanım Koşulları",
  description: "fztberkaytan.com web sitesi kullanım şartları, randevu sistemi koşulları ve yasal sorumluluklar.",
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "isletmeci",
    title: "İşletmeci ve amaç",
    content: (
      <>
        <p>
          fztberkaytan.com, Özel Sağlık Meslek Hizmet Birimi bünyesinde faaliyet gösteren Fizyoterapist Berkay TAN
          tarafından işletilir. Site, mesleki yetki kapsamındaki hizmetler hakkında genel bilgi vermek ve randevu
          taleplerini almak amacıyla kullanılır.
        </p>
        <p>
          Bu koşullar, site ve randevu sisteminin kullanımını düzenler. Siteyi ziyaret etmek tek başına sağlık hizmeti
          sözleşmesi, ödeme yükümlülüğü, kişisel veri işlemeye açık rıza veya tıbbi uygulama onamı oluşturmaz. 6502 sayılı
          Kanun ve ilgili mevzuattan doğan emredici haklar saklıdır.
        </p>
      </>
    ),
  },
  {
    id: "saglik-bilgilendirmesi",
    title: "Sağlık bilgilendirmesi ve hizmet sınırları",
    content: (
      <>
        <p>
          Sitedeki içerikler genel bilgilendirmedir; kişiye özel tıbbi teşhis, hekim muayenesi veya tedavi önerisinin yerine
          geçmez. Fizyoterapi değerlendirmesi ve uygulamalar, fizyoterapistin mevzuatta tanımlanan mesleki yetkileriyle
          sınırlıdır.
        </p>
        <p>
          Hasta bireylere yönelik fizyoterapi hizmetleri, ilgili hekimin tanısı ve düzenlediği tedavi planı veya reçete
          doğrultusunda, mesleki yetki ve hasta güvenliği koşulları gözetilerek yürütülür. Randevu onayı, bu şartların yerine
          geçtiği veya belirli bir uygulamanın mutlaka yapılacağı anlamına gelmez.
        </p>
        <p>
          Sağlıklı bireylere yönelik fiziksel aktivite, egzersiz ve diğer koruyucu/geliştirici uygulamalar mesleki yetki
          kapsamında değerlendirilir. Sitedeki klinik pilates, klasik masaj veya benzeri bir hizmet seçimi, hastalık varsa
          gerekli hekim değerlendirmesini ortadan kaldırmaz. Uygulama öncesinde gerekli bilgilendirme yapılır ve ilgili onam
          alınır.
        </p>
        <Note>
          Acil sağlık sorunlarında siteye veya randevu formuna başvurmak yerine <strong>112 Acil Çağrı Merkezi</strong> ile
          iletişime geçiniz. Site acil sağlık hizmeti sunmaz.
        </Note>
      </>
    ),
  },
  {
    id: "hesap-randevu",
    title: "Hesap ve randevu talebi",
    content: (
      <>
        <p>
          Online randevu için hesap oluşturulması ve giriş yapılması gerekir. Kullanıcı doğru ve güncel bilgi vermeli,
          parolasını korumalı ve başka kişilere ait bilgileri yetkisiz kullanmamalıdır. Hesap güvenliğine ilişkin
          kullanıcının yükümlülükleri, işletmecinin veri güvenliği sorumluluklarını ortadan kaldırmaz.
        </p>
        <p>
          Hizmet, tarih ve saat seçimiyle oluşturulan kayıt bir randevu talebidir. Randevu, fizyoterapistin onayından sonra
          kesinleşir. Talebin onay/ret/iptal durumu e-posta ve hasta paneli üzerinden bildirilir. Onaylanan randevu için bir
          gün önce hatırlatma e-postası gönderilir; teknik nedenlerle veya e-posta sağlayıcınız nedeniyle iletim/teslim
          gecikebilir. Randevunun güncel durumu panelden veya telefonla kontrol edilebilir.
        </p>
        <p>
          Saati geçtiği hâlde onaylanmamış talepler sistem tarafından kapatılır. Görüntülenen müsaitlik, talep onaylanıncaya
          kadar değişebilir. Randevu talebi veya onayı, tek başına paket satın alımı ya da ücret tahsilatı anlamına gelmez.
        </p>
      </>
    ),
  },
  {
    id: "iptal-degisiklik",
    title: "İptal ve değişiklik",
    content: (
      <>
        <p>
          Bekleyen veya onaylanmış randevular, randevu saatine 24 saatten fazla süre varsa hasta panelinden iptal edilebilir.
          Randevuya 24 saat veya daha az süre kaldığında ya da tarih değişikliği gerektiğinde{" "}
          <a href={links.tel} className="font-medium text-teal-700">
            {siteConfig.phoneDisplay}
          </a>{" "}
          numaralı telefondan iletişime geçiniz.
        </p>
        <p>
          Bu süre paneldeki iptal işlevine ilişkindir; tek başına ücret kesintisi, paket seansı düşümü veya kanuni hak kaybı
          oluşturmaz. Ayrı bir hizmet/paket sözleşmesi varsa onun hukuka uygun ve önceden bildirilen hükümleri ile emredici
          mevzuat uygulanır.
        </p>
        <p>
          Zorunlu nedenlerle randevuya devam edilemezse kullanıcı bilgilendirilir. Önerilen yeni tarih/saat, kullanıcının
          kabulüyle kesinleşir. Kullanıcı yeni zamanı kabul etmek zorunda değildir. Hizmet sağlayıcı kaynaklı iptal nedeniyle
          sunulmayan seans, sunulmuş gibi paket hakkından düşülmez; varsa ön ödeme ve iade işlemleri sözleşme ve kanuni
          haklar gözetilerek sonuçlandırılır.
        </p>
      </>
    ),
  },
  {
    id: "ucretlendirme",
    title: "Ücretlendirme",
    content: (
      <>
        <p>
          Web sitesi üzerinden online ödeme alınmamaktadır. Hizmetin kapsamı, süresi, vergiler dahil toplam bedeli, ödeme
          yöntemi ve varsa paket, geçerlilik, iptal/iade koşulları hizmete ilişkin anlaşma kurulmadan önce kişiye bildirilir.
          Kullanıcı bilgilendirilip kabul etmeden ek ücretli uygulama yapılmaz.
        </p>
        <p>
          Randevu sisteminin ileride ücretli hizmet sözleşmesi veya online ödeme içerecek şekilde değiştirilmesi hâlinde,
          işlemin niteliğine göre uygulanması gereken ön bilgilendirme, sözleşme ve tüketici hakları düzenlemeleri işlemden
          önce sunulur. Online ödeme bulunmaması, başka kanallarda kurulabilecek sözleşmeler bakımından kanuni yükümlülükleri
          ortadan kaldırmaz.
        </p>
      </>
    ),
  },
  {
    id: "kullanici-yukumlulukleri",
    title: "Kullanıcının yükümlülükleri",
    content: (
      <p>
        Kullanıcı; doğru bilgi vermek, hesap bilgilerini korumak, başkalarının kişisel verilerini yetkisiz paylaşmamak, siteyi
        hukuka aykırı kullanmamak ve sistemin güvenliğini veya işleyişini bozacak işlemlerden kaçınmakla yükümlüdür. Randevu
        formunda ad, soyad, e-posta adresi, telefon numarası ve şikâyet açıklaması istenir. Şikâyet alanına başvuru nedeni
        kısa olarak yazılmalı; gereksiz sağlık ayrıntıları ve başka kişilere ait bilgiler paylaşılmamalıdır. Şikâyet
        iletilmesi veya randevunun onaylanması, hekim tanısı, tedavi planı/reçete ya da uygulama onamının yerine geçmez.
      </p>
    ),
  },
  {
    id: "fikri-haklar",
    title: "Fikri haklar ve bağlantılar",
    content: (
      <>
        <p>
          Sitedeki özgün metin, tasarım, görsel ve diğer içeriklerin hakları ilgili hak sahiplerine aittir. Kanuni istisnalar
          saklı olmak üzere, izin gerektiren kopyalama, çoğaltma ve yayımlama işlemleri hak sahibinin iznine tabidir.
        </p>
        <p>
          Google Haritalar, WhatsApp ve diğer dış platform bağlantılarında ilgili platformların koşulları uygulanır. Bu
          açıklama, kendi entegrasyonlarımız ve işlemlerimizden doğan kanuni sorumluluklarımızı kaldırmaz.
        </p>
      </>
    ),
  },
  {
    id: "kisisel-veriler",
    title: "Kişisel veriler ve sistemin kullanılabilirliği",
    content: (
      <>
        <p>
          Veri işleme hakkında <InlineLink href="/kvkk">KVKK Aydınlatma Metni</InlineLink>,{" "}
          <InlineLink href="/gizlilik-politikasi">Gizlilik Politikası</InlineLink> ve{" "}
          <InlineLink href="/cerez-politikasi">Çerez Politikası</InlineLink> incelenebilir. Bu koşulların kabulü, kişisel veri
          işlemenin açık rızaya tabi olduğu hâllerde ayrıca alınması gereken rızanın yerine geçmez.
        </p>
        <p>
          Bakım, altyapı sorunu veya başka teknik nedenlerle site geçici olarak kullanılamayabilir. Böyle bir durumda randevu
          için telefonla iletişim kurulabilir. Kesintisiz çalışma garantisi verilmemesi, işletmecinin kanundan doğan
          sorumluluğunu ortadan kaldırmaz.
        </p>
      </>
    ),
  },
  {
    id: "degisiklikler",
    title: "Değişiklikler ve başvuru yolları",
    content: (
      <>
        <p>
          Koşullar hizmet, sistem veya mevzuat değişiklikleriyle güncellenebilir. Değişiklikler önceden kurulmuş
          sözleşmelerdeki hakları kendiliğinden geriye dönük değiştirmez. Mevcut işlemleri etkileyen önemli değişikliklerde
          gerekli bilgilendirme ve kabul süreçleri uygulanır.
        </p>
        <p>
          Uyuşmazlıklarda mevzuatın yetkili kıldığı tüketici hakem heyetleri, mahkemeler ve diğer başvuru yollarına ilişkin
          haklar saklıdır.
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

export default function TermsPage() {
  return <LegalPage title="Kullanım Koşulları" lastUpdated={LEGAL_LAST_UPDATED} sections={sections} currentPath={PATH} />;
}
