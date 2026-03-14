package com.aractakip.arac.dto;

import java.util.UUID;

public record AracRequest(
        String plaka,
        UUID turId,
        Boolean aktif,
        // envanter alanları
        String marka,
        Integer modelYili,
        String cinsi,
        String renk,
        Integer motorGucu,
        Integer silindirHacmi,
        String saseNo,
        Integer firmaId,
        Integer bosAgirlik,
        String lastikTipi,
        Integer arventoNo,
        Integer bolgeId,
        String oncekiPlaka,
        String durumu
) {}
