/**
 * Yasal metinlerin ortak bilgileri.
 * Metinlerde değişiklik yapıldığında LEGAL_LAST_UPDATED ve (kayıt onayı için) CONSENT_VERSION güncellenmelidir.
 */
export const LEGAL_LAST_UPDATED = "2 Kasım 2026";

/**
 * Avukat metnindeki "[YAYIN ÖNCESİ]" notlarından teknik olarak doldurulamayanlar.
 * Yalnızca admin panelinde uyarı olarak görünür; tamamlanınca bu liste boşaltılmalıdır;
 * admin Genel Bakış'ta liste dolu olduğu sürece uyarı gösterilir.
 */
export const LEGAL_PENDING_ITEMS = [
  {
    page: "KVKK Aydınlatma Metni",
    item: "Yurt dışı aktarım: fiilen kurulmuş KVKK m.9 dayanağı (standart sözleşme vb.) metne eklenecek — avukat ve Berkay Bey tarafından tamamlanacak (ülke bilgileri yazıldı)",
  },
] as const;
