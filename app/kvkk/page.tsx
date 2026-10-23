import LegalPage, { legalMetadata, type LegalSection } from "@/components/legal/LegalPage";
import { ContactCard, InlineLink, List, Note, Table, Term } from "@/components/legal/prose";

const PATH = "/kvkk";

export const metadata = legalMetadata({
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı KVKK kapsamında kişisel verilerinizin işlenmesi, korunması ve haklarınıza ilişkin aydınlatma metni.",
  path: PATH,
});

const sections: LegalSection[] = [
  {
    id: "veri-sorumlusu",
    title: "Veri Sorumlusu",
    content: (
      <>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında kişisel verileriniz, veri sorumlusu
          sıfatıyla aşağıda bilgileri yer alan veri sorumlusu tarafından, bu metinde açıklanan kapsam ve amaçlarla
          işlenebilmektedir.
        </p>
        <ContactCard />
      </>
    ),
  },
  {
    id: "islenen-veriler",
    title: "İşlenen Kişisel Veriler",
    content: (
      <>
        <p>
          Web sitesi, online randevu sistemi, iletişim kanalları ve fizyoterapi hizmetlerinin yürütülmesi kapsamında
          aşağıdaki kişisel veriler işlenebilir:
        </p>
        <Table
          head={["Veri Kategorisi", "Kapsam"]}
          rows={[
            [<Term key="k">Kimlik bilgileri</Term>, "Ad, soyad."],
            [<Term key="k">İletişim bilgileri</Term>, "Telefon numarası, e-posta adresi."],
            [
              <Term key="k">Randevu ve hizmet bilgileri</Term>,
              "Randevu tarihi ve saati, tercih edilen hizmet, randevu durumu, randevu notları ve iletişim kayıtları.",
            ],
            [
              <Term key="k">Adres bilgileri</Term>,
              "Evde fizyoterapi hizmeti talep edilmesi halinde adres, il/ilçe ve gerekli konum bilgileri.",
            ],
            [
              <Term key="k">Sağlık bilgileri</Term>,
              "İlgili kişinin kendisi tarafından iletilmesi veya sağlık hizmetinin yürütülmesi sırasında gerekli olması halinde şikâyet, sağlık geçmişi, değerlendirme bulguları ve fizyoterapi sürecine ilişkin bilgiler.",
            ],
            [
              <Term key="k">İşlem güvenliği ve internet kullanım bilgileri</Term>,
              "Kullanıcı hesabı bilgileri, geri döndürülemez şekilde şifrelenmiş parola, oturum bilgileri, IP adresi, çerez kayıtları ve web sitesi kullanımına ilişkin teknik kayıtlar.",
            ],
          ]}
        />
        <Note>
          Sağlık verileri KVKK kapsamında <strong>özel nitelikli kişisel veri</strong> niteliğindedir ve bunların
          işlenmesinde mevzuatta öngörülen ilave güvenlik ve işleme şartları dikkate alınır.
        </Note>
      </>
    ),
  },
  {
    id: "isleme-amaclari",
    title: "Kişisel Verilerin İşlenme Amaçları",
    content: (
      <>
        <p>Kişisel verileriniz;</p>
        <List
          items={[
            "randevu oluşturulması ve yönetilmesi,",
            "sizinle iletişim kurulması ve randevu bilgilendirmelerinin yapılması,",
            "fizyoterapi değerlendirme ve hizmet süreçlerinin planlanması ve yürütülmesi,",
            "evde fizyoterapi hizmetlerinde hizmet adresinin belirlenmesi,",
            "hasta ve danışan kayıtlarının mevzuata uygun şekilde tutulması,",
            "kullanıcı hesabının oluşturulması ve hesap güvenliğinin sağlanması,",
            "talep, soru ve başvuruların cevaplandırılması,",
            "hukuki ve idari yükümlülüklerin yerine getirilmesi,",
            "bilgi güvenliği ve web sitesi güvenliğinin sağlanması",
          ]}
        />
        <p>amaçlarıyla, işlendikleri amaçla bağlantılı, sınırlı ve ölçülü şekilde işlenebilir.</p>
      </>
    ),
  },
  {
    id: "toplanma-yontemi",
    title: "Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi",
    content: (
      <>
        <p>
          Kişisel verileriniz; web sitesindeki üyelik, randevu ve iletişim formları, hasta paneli, telefon, e-posta,
          yüz yüze görüşmeler ve hizmet sürecinde oluşturulan kayıtlar aracılığıyla elektronik veya fiziki yollarla
          toplanabilir.
        </p>
        <p>
          Kişisel veriler, somut işleme faaliyetine göre KVKK’nın 5. maddesinde yer alan sözleşmenin kurulması veya
          ifasıyla doğrudan ilgili olması, veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi, bir hakkın tesisi,
          kullanılması veya korunması ve ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri
          sorumlusunun meşru menfaatleri gibi hukuki sebeplere dayanılarak işlenebilir.
        </p>
        <p>
          Sağlık verileri ise gerekli olduğu ölçüde, KVKK’nın 6. maddesi kapsamında tıbbi teşhis, tedavi ve bakım
          hizmetleri ile sağlık hizmetlerinin yürütülmesi ve planlanması amacıyla, sır saklama yükümlülüğü altında
          bulunan kişilerce işlenebilir.
        </p>
      </>
    ),
  },
  {
    id: "aktarim",
    title: "Kişisel Verilerin Aktarılması",
    content: (
      <>
        <p>Kişisel verileriniz, işleme amacıyla sınırlı olmak üzere ve gerekli güvenlik önlemleri alınarak;</p>
        <List
          items={[
            "yetkili kamu kurum ve kuruluşlarına,",
            "mahkemeler ve diğer yetkili mercilere,",
            "muhasebe, bilişim ve teknik destek hizmeti sağlayan hizmet sağlayıcılara,",
            "web sitesi ve randevu altyapısının çalışmasını sağlayan hizmet sağlayıcılara",
          ]}
        />
        <p>mevzuatın izin verdiği ölçüde aktarılabilir.</p>
        <p>
          Web sitesi ve online randevu sistemi; barındırma (hosting) hizmeti, hesap ve randevu kayıtlarının saklandığı
          bulut veritabanı hizmeti (MongoDB Atlas), randevu bildirimlerinin iletildiği e-posta gönderim hizmeti
          (Resend) ve onaylanan randevuların planlandığı takvim hizmeti (Google Takvim) kullanılarak çalışmaktadır.
          Takvime yalnızca ad soyad, hizmet, randevu saati ve telefon numarası aktarılır; randevu notları aktarılmaz. Bu hizmet sağlayıcıların sunucuları yurt dışında bulunabilir. Yurt
          dışına veri aktarımı söz konusu olduğunda aktarım, KVKK’nın 9. maddesinde öngörülen şartlar ve uygun
          güvenceler çerçevesinde gerçekleştirilir.
        </p>
      </>
    ),
  },
  {
    id: "saklama",
    title: "Kişisel Verilerin Saklanması",
    content: (
      <p>
        Kişisel verileriniz, ilgili mevzuatta öngörülen süreler ile işlenme amaçlarının gerektirdiği süre boyunca
        muhafaza edilir. Saklama süresinin sona ermesi veya işleme şartlarının ortadan kalkması halinde veriler,
        mevzuata uygun şekilde silinir, yok edilir veya anonim hale getirilir.
      </p>
    ),
  },
  {
    id: "haklariniz",
    title: "KVKK Kapsamındaki Haklarınız",
    content: (
      <>
        <p>KVKK’nın 11. maddesi kapsamında veri sorumlusuna başvurarak;</p>
        <List
          items={[
            "kişisel verilerinizin işlenip işlenmediğini öğrenme,",
            "işlenmişse buna ilişkin bilgi talep etme,",
            "işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
            "yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme,",
            "eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,",
            "kanuni şartların oluşması halinde silinmesini veya yok edilmesini talep etme,",
            "düzeltme veya silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
            "işlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,",
            "kanuna aykırı veri işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme",
          ]}
        />
        <p>haklarına sahipsiniz.</p>
      </>
    ),
  },
  {
    id: "basvuru",
    title: "Başvuru ve İletişim",
    content: (
      <>
        <p>
          KVKK kapsamındaki taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak;
          yazılı olarak aşağıdaki adrese iletebilir veya daha önce tarafımıza bildirdiğiniz ve kayıtlarımızda bulunan
          e-posta adresinizden aşağıdaki e-posta adresine gönderebilirsiniz. Başvurunuzda ad, soyad, iletişim
          bilgileriniz ve talep konunuzun açıkça belirtilmesi gerekmektedir.
        </p>
        <ContactCard title="Başvuru Adresi" />
        <p>
          Başvurular, talebin niteliğine göre en kısa sürede ve en geç <Term>otuz (30) gün</Term> içinde ücretsiz
          olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulu
          tarafından belirlenen tarifedeki ücret alınabilir.
        </p>
        <p>
          Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hallerinde,
          KVKK’nın 14. maddesi uyarınca Kişisel Verileri Koruma Kurulu’na şikâyette bulunma hakkınız saklıdır.
        </p>
        <p>
          Web sitemizdeki uygulamalar hakkında ayrıca{" "}
          <InlineLink href="/gizlilik-politikasi">Gizlilik Politikası</InlineLink> ve{" "}
          <InlineLink href="/cerez-politikasi">Çerez Politikası</InlineLink> sayfalarımızı inceleyebilirsiniz.
        </p>
      </>
    ),
  },
];

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      lastUpdated="19 Ekim 2026"
      intro={<p className="font-medium text-slate-900">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni</p>}
      sections={sections}
      currentPath={PATH}
    />
  );
}
