package com.aractakip.belge;

public enum BelgeDurum {
    VALID("green"),
    WARNING("orange"),
    CRITICAL("red"),
    EXPIRED("grey");

    private final String renk;

    BelgeDurum(String renk) {
        this.renk = renk;
    }

    public String getRenk() {
        return renk;
    }

    public static BelgeDurum of(long kalanGun) {
        if (kalanGun > 30)  return VALID;
        if (kalanGun >= 15) return WARNING;
        if (kalanGun >= 1)  return CRITICAL;
        return EXPIRED;
    }
}
