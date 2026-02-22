package com.aractakip.belge;

public enum BelgeTuru {
    muayene, sigorta, kasko, arvato_gps, diger;

    public static boolean isValid(String val) {
        for (BelgeTuru t : values()) {
            if (t.name().equals(val)) return true;
        }
        return false;
    }
}
