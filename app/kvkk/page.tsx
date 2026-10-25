import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, List, Note, PendingNote, Table, Term } from "@/components/legal/prose";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

const PATH = "/kvkk";

export const metadata = legalMetadata({
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı KVKK kapsamında fztberkaytan.com ve online randevu sistemi üzerinden işlenen kişisel verilere ilişkin aydınlatma metni.",
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "veri-sorumlusu",
    title: "Veri sorumlusu ve kapsam",
    content: (
      <>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, fztberkaytan.com internet sitesi ve online
          randevu sistemi üzerinden elde edilen kişisel verilerinizin veri sorumlusu <Term>Fizyoterapist Berkay TAN</Term>’dır.
        </p>
        <ContactCard title="Veri sorumlusu / faaliyet yeri" />
        <p>
          Bu metin; site ziyaretleri, üyelik, iletişim ve online randevu işlemlerini kapsar. Klinik ortamında yürütülen
          fizyoterapi hizmeti ve hasta dosyası işlemleri hakkında ilgili aşamada ayrıca aydınlatma yapılır. Bu metin bir açık
          rıza veya tıbbi uygulama onamı değildir.
        </p>
      </>
    ),
  },
  {
    id: "islenen-veriler",
    title: "İşlenen kişisel veriler",
    content: (
      <>
        <Table
          head={["Veri kategorisi", "Kapsam"]}
          rows={[
            [<Term key="k">Kimlik ve iletişim</Term>, "Ad, soyad, telefon numarası ve e-posta adresi"],
            [
              <Term key="k">Hesap ve oturum</Term>,
              "Üyelik bilgileri, kimlik doğrulama kayıtları, parola doğrulama verileri ve oturum bilgileri",
            ],
            [
              <Term key="k">Randevu ve iletişim</Term>,
              "Seçilen hizmet, talep edilen tarih/saat, randevu durumu, değişiklik ve iptal bilgileri, talep/yanıt kayıtları",
            ],
            [
              <Term key="k">İşlem güvenliği</Term>,
              "IP adresi, erişim zamanı, güvenlik ve hata kayıtları ile hizmetin çalışması için gereken cihaz/tarayıcı bilgileri",
            ],
            [<Term key="k">Çerez verileri</Term>, "Çerez Politikasında açıklanan oturum ve güvenlik verileri"],
            [
              <Term key="k">Sağlık verileri</Term>,
              "Randevu formundaki şikâyet açıklaması ve sağlık durumunu ortaya koyan hizmet/iletişim bilgileri",
            ],
          ]}
        />
        <Note>
          Randevu formunda ad, soyad, e-posta adresi, telefon numarası ve şikâyet açıklaması alınır. Şikâyet alanına yazılan
          sağlık bilgileri KVKK kapsamında <strong>özel nitelikli kişisel veridir</strong>. Açıklamanızı başvuru nedenini
          anlatmaya yetecek kısa bilgiyle sınırlayınız; gereksiz ayrıntılı sağlık geçmişi veya üçüncü kişilere ait sağlık
          bilgisi paylaşmayınız. Randevu tarih, saat ve durum bilgileri sistemde ayrıca oluşur.
        </Note>
      </>
    ),
  },
  {
    id: "amaclar-hukuki-sebepler",
    title: "Amaçlar ve hukuki sebepler",
    content: (
      <>
        <Table
          head={["İşleme faaliyeti ve amacı", "Hukuki sebep"]}
          rows={[
            [
              "Talebiniz üzerine hesap oluşturulması, randevu talebinin alınması, hizmet öncesi iletişim ve randevu durumunun bildirilmesi",
              "Sözleşmenin kurulması veya ifasıyla doğrudan ilgili ve gerekli olması — KVKK m.5/2-c",
            ],
            [
              "Yetkili makam taleplerinin karşılanması ve mevzuatın zorunlu tuttuğu işlemlerin yürütülmesi",
              "Hukuki yükümlülüğün yerine getirilmesi — KVKK m.5/2-ç; kanunda açıkça öngörülen hâllerde m.5/2-a",
            ],
            [
              "Uyuşmazlıklarda gerekli kayıtların kullanılması ve hak arama süreçlerinin yürütülmesi",
              "Bir hakkın tesisi, kullanılması veya korunması için zorunluluk — KVKK m.5/2-e",
            ],
            [
              "Yetkisiz erişimin önlenmesi, hesap ve sistem güvenliğinin sağlanması, gerekli hata kayıtlarının değerlendirilmesi",
              "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaat için zorunluluk — KVKK m.5/2-f",
            ],
            [
              "Şikâyet açıklamasının, sağlık hizmetinin planlanması ve yürütülmesi için gerekli olduğu ölçüde, mesleki yetki kapsamında ve sır saklama yükümlülüğü altında değerlendirilmesi",
              "KVKK m.6/3-e",
            ],
          ]}
        />
        <p>
          Her hukuki sebep yalnızca koşullarını sağlayan işlem ve gerekli veri bakımından uygulanır. Meşru menfaat, sağlık
          verilerinin işlenmesi için tek başına dayanak oluşturmaz. Kanundaki diğer işleme şartlarının bulunmadığı ve açık
          rızanın hukuken uygun dayanak olduğu ayrı işlemler, ilgili aydınlatma ve açık rıza süreci tamamlanmadan
          gerçekleştirilmez.
        </p>
      </>
    ),
  },
  {
    id: "toplama-yontemleri",
    title: "Toplama yöntemleri",
    content: (
      <p>
        Veriler; üyelik, randevu ve iletişim formları, hasta paneli, telefon ve e-posta iletişimi, sunucu kayıtları ve Çerez
        Politikasında açıklanan çerezler aracılığıyla elektronik ortamda, tamamen veya kısmen otomatik yollarla elde edilir.
        Bu süreçlerle bağlantılı yazılı başvurular veri kayıt sisteminin parçası olarak otomatik olmayan yollarla da
        işlenebilir.
      </p>
    ),
  },
  {
    id: "alicilar-aktarim",
    title: "Alıcılar ve aktarım amaçları",
    content: (
      <>
        <p>
          Randevu formuna yazdığınız şikâyet açıklaması, başvurunuzun değerlendirilmesi ve hizmetin planlanması amacıyla
          fizyoterapistin yönetim panelinde görüntülenir veya kendisine e-posta ile iletilir; randevu kaydıyla birlikte
          Google Takvim’e de aktarılır. Bu akış sağlık verisi içerdiğinden alıcılar, yetkilendirme ve aktarım koşulları
          sağlık verilerinin korunmasına ilişkin kurallara göre değerlendirilir.
        </p>
        <p>
          Veriler, gerekli veriyle sınırlı olmak üzere; sitenin işletilmesi için barındırma/veritabanı ve yetkilendirilmiş
          teknik destek sağlayıcılarına, işlem bildirimleri için e-posta hizmeti sağlayıcısına, randevu planlaması için
          takvim hizmeti sağlayıcısına ve hukuki yükümlülük veya yetkili talep kapsamında kamu kurumları ile yargı
          mercilerine aktarılabilir. Yurt içi aktarımlarda KVKK m.8 koşulları gözetilir. Her alıcıya bütün kayıtlar verilmez.
        </p>
        <Table
          head={["Altyapı", "Amaç ve veri kapsamı"]}
          rows={[
            [
              <Term key="k">Hosting</Term>,
              <span key="v">
                Sitenin çalışması, isteklerin işlenmesi ve gerekli teknik kayıtların tutulması.{" "}
                <span className="font-semibold text-amber-700">[Sağlayıcının adı yayın öncesi eklenecek]</span>
              </span>,
            ],
            [
              <Term key="k">MongoDB Atlas</Term>,
              "Kullanıcı hesabı ve randevu kayıtlarının saklanması; randevu formundaki şikâyet açıklaması da randevu kaydıyla birlikte bu veritabanında tutulur",
            ],
            [
              <Term key="k">Resend / e-posta altyapısı</Term>,
              "Randevu bildirimlerinin iletilmesi. Fizyoterapiste gönderilen başvuru bildirimleri şikâyet açıklamasını da içerir; bu e-postalar Resend aracılığıyla gönderilir ve fizyoterapistin Google (Gmail) e-posta kutusunda saklanır",
            ],
            [
              <Term key="k">Google Takvim</Term>,
              "Onaylanan randevunun ad-soyad, seçilen hizmet, tarih/saat ve telefon bilgileriyle takvimde planlanması; hastanın randevu formuna yazdığı şikâyet açıklaması da Google Takvim’e aktarılır",
            ],
          ]}
        />
        <PendingNote>
          Her sağlayıcı için verilerin tutulduğu/erişildiği ülkeler ve fiilen kurulmuş KVKK m.9 aktarım dayanağı (ör. standart
          sözleşme ve türü, kapsadığı aktarımlar) burada açıklanacaktır. Kurulmamış bir güvence varmış gibi yazılmamalıdır.
          İncelenecek akışlar: barındırma, MongoDB Atlas, Resend, Google Takvim ve Gmail üzerinden yazışma. (Sitede gömülü
          harita kullanılmamaktadır.)
        </PendingNote>
      </>
    ),
  },
  {
    id: "saklama-imha",
    title: "Saklama ve imha",
    content: (
      <p>
        Veriler, ilgili veri türü için mevzuatta zorunlu tutulan süreler ve işleme amacının gerektirdiği sürelerle sınırlı
        olarak saklanır. Hesap kapatılması, saklanması için geçerli hukuki sebep bulunan bütün kayıtların aynı anda silinmesi
        anlamına gelmez. İşleme şartları ortadan kalktığında veriler, yedekleme ve imha süreçleri de dikkate alınarak
        mevzuata uygun şekilde silinir, yok edilir veya anonim hâle getirilir.
      </p>
    ),
  },
  {
    id: "haklariniz",
    title: "Haklarınız",
    content: (
      <>
        <p>KVKK m.11 kapsamında;</p>
        <List
          items={[
            "kişisel verilerinizin işlenip işlenmediğini öğrenme,",
            "işlenmişse bilgi isteme,",
            "işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
            "yurt içinde/yurt dışında aktarıldığı üçüncü kişileri öğrenme,",
            "eksik veya yanlış verileri düzelttirme,",
            "kanuni şartlar oluştuğunda silinmesini veya yok edilmesini isteme,",
            "düzeltme/silme işlemlerinin alıcılara bildirilmesini talep etme",
          ]}
        />
        <p>
          haklarınız vardır. Ayrıca münhasıran otomatik sistemlerle yapılan analiz sonucunda aleyhinize bir sonucun ortaya
          çıkmasına itiraz edebilir ve kanuna aykırı işleme nedeniyle uğradığınız zararın giderilmesini isteyebilirsiniz.
        </p>
      </>
    ),
  },
  {
    id: "basvuru",
    title: "Başvuru",
    content: (
      <>
        <p>
          Başvurunuzu Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun şekilde yukarıdaki adrese yazılı
          olarak veya daha önce bildirdiğiniz ve kayıtlarımızda bulunan e-posta adresinizden <Term>fztberkay@gmail.com</Term>{" "}
          adresine gönderebilirsiniz. Mevzuatta tanınan diğer başvuru yöntemleri saklıdır.
        </p>
        <p>
          Başvuruda ad-soyad, yazılı başvuruda imza, T.C. vatandaşları için T.C. kimlik numarası; yabancılar için uyruğu,
          pasaport numarası veya varsa kimlik numarası, tebligata esas yerleşim/iş yeri adresi, varsa bildirime esas
          e-posta/telefon/faks ve talep konusu bulunmalıdır. Konuyla ilgili bilgi ve belgeler eklenebilir. Gereksiz sağlık
          belgesi veya kimlik belgesi kopyası göndermeyiniz.
        </p>
        <p>
          Başvurular talebin niteliğine göre en kısa sürede ve en geç <Term>30 gün</Term> içinde ücretsiz sonuçlandırılır.
          İşlem ayrıca maliyet gerektiriyorsa Kurulun belirlediği tarifedeki ücret alınabilir. Başvuruya hatamız sebep olmuşsa
          alınan ücret iade edilir. Ret, yetersiz yanıt veya süresinde yanıt verilmemesi hâlinde KVKK m.14 kapsamında Kurula
          şikâyet hakkınız saklıdır.
        </p>
      </>
    ),
  },
];

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={<p className="font-medium text-slate-900">Web Sitesi ve Online Randevu Sistemi KVKK Aydınlatma Metni</p>}
      sections={sections}
      currentPath={PATH}
    />
  );
}
