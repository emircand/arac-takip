package com.aractakip.export;

import java.util.List;

/**
 * Rapor verisi taşıyıcı — hem XLSX hem PDF için ortak yapı.
 * Her sayfa bir Excel sheet'i veya PDF'de ayrı bir tablo olarak işlenir.
 */
public class RaporVeri {

    public record Sayfa(
            String ad,                  // sheet adı / tablo başlığı
            String[] kolonlar,          // sütun başlıkları
            List<Object[]> satirlar,    // veri satırları
            Object[] toplamSatiri       // null → toplam satırı yok
    ) {}

    private final String baslik;
    private final String filtreBilgisi;
    private final List<Sayfa> sayfalar;
    private final boolean landscape;    // true → A4 yatay

    public RaporVeri(String baslik, String filtreBilgisi, List<Sayfa> sayfalar, boolean landscape) {
        this.baslik = baslik;
        this.filtreBilgisi = filtreBilgisi;
        this.sayfalar = sayfalar;
        this.landscape = landscape;
    }

    /** Tek sayfalı rapor için kolaylık factory */
    public static RaporVeri tekSayfa(String baslik, String filtreBilgisi,
                                      String sayfaAd, String[] kolonlar,
                                      List<Object[]> satirlar, Object[] toplam) {
        return new RaporVeri(baslik, filtreBilgisi,
                List.of(new Sayfa(sayfaAd, kolonlar, satirlar, toplam)),
                kolonlar.length > 7);
    }

    public String getBaslik()          { return baslik; }
    public String getFiltreBilgisi()   { return filtreBilgisi; }
    public List<Sayfa> getSayfalar()   { return sayfalar; }
    public boolean isLandscape()       { return landscape; }
}
