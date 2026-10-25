/**
 * Yasal metinlerin ortak bilgileri.
 * Metinlerde değişiklik yapıldığında LEGAL_LAST_UPDATED ve (kayıt onayı için) CONSENT_VERSION güncellenmelidir.
 */
export const LEGAL_LAST_UPDATED = "25 Ekim 2026";

/**
 * Avukat metnindeki "[YAYIN ÖNCESİ]" notlarından teknik olarak doldurulamayanlar.
 * Hepsi tamamlanıp ilgili sayfalardan <PendingNote> kaldırılınca bu liste boşaltılmalıdır;
 * admin Genel Bakış'ta liste dolu olduğu sürece uyarı gösterilir.
 */
export const LEGAL_PENDING_ITEMS = [
  {
    page: "KVKK Aydınlatma Metni",
    item: "Yurt dışı aktarım: verilerin tutulduğu ülkeler ve fiilen kurulmuş KVKK m.9 dayanağı (standart sözleşme vb.) — avukat ve Berkay Bey tarafından tamamlanacak",
  },
  { page: "Tüm yasal metinler", item: "Son güncelleme tarihinin gerçek yayın tarihiyle güncellenmesi" },
] as const;
