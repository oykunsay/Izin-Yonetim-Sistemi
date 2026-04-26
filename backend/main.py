from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import date
import json
import os
import uuid

app = FastAPI(title="İzin Yönetim Sistemi", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "izinler.json"

def load_db() -> List[dict]:
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data: List[dict]):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


class IzinTalep(BaseModel):
    ad_soyad: str
    izin_turu: str
    baslangic_tarihi: date
    bitis_tarihi: date
    aciklama: Optional[str] = ""

    @validator("ad_soyad")
    def ad_soyad_bos_olamaz(cls, v):
        if not v or not v.strip():
            raise ValueError("Ad Soyad alanı boş olamaz")
        return v.strip()

    @validator("izin_turu")
    def izin_turu_gecerli(cls, v):
        gecerli_turler = ["Yıllık İzin", "Sağlık İzni", "Mazeret İzni"]
        if v not in gecerli_turler:
            raise ValueError(f"İzin türü şunlardan biri olmalıdır: {', '.join(gecerli_turler)}")
        return v

    @validator("bitis_tarihi")
    def bitis_baslangictan_once_olamaz(cls, v, values):
        if "baslangic_tarihi" in values and v < values["baslangic_tarihi"]:
            raise ValueError("Bitiş tarihi başlangıç tarihinden önce olamaz")
        return v


class DurumGuncelle(BaseModel):
    durum: str

    @validator("durum")
    def durum_gecerli(cls, v):
        if v not in ["Onaylandı", "Reddedildi"]:
            raise ValueError("Durum 'Onaylandı' veya 'Reddedildi' olmalıdır")
        return v


@app.post("/izin-talep", status_code=201)
def izin_talep_olustur(talep: IzinTalep):
    izinler = load_db()
    yeni_izin = {
        "id": str(uuid.uuid4()),
        "ad_soyad": talep.ad_soyad,
        "izin_turu": talep.izin_turu,
        "baslangic_tarihi": str(talep.baslangic_tarihi),
        "bitis_tarihi": str(talep.bitis_tarihi),
        "aciklama": talep.aciklama,
        "durum": "Beklemede",
        "olusturma_tarihi": str(date.today()),
    }
    izinler.append(yeni_izin)
    save_db(izinler)
    return {"mesaj": "İzin talebi başarıyla oluşturuldu", "izin": yeni_izin}


@app.get("/izinler")
def izinleri_listele():
    izinler = load_db()
    return {"izinler": izinler, "toplam": len(izinler)}


@app.put("/izin-durum/{izin_id}")
def izin_durum_guncelle(izin_id: str, guncelleme: DurumGuncelle):
    izinler = load_db()
    for izin in izinler:
        if izin["id"] == izin_id:
            izin["durum"] = guncelleme.durum
            save_db(izinler)
            return {"mesaj": f"İzin durumu '{guncelleme.durum}' olarak güncellendi", "izin": izin}
    raise HTTPException(status_code=404, detail="İzin talebi bulunamadı")


@app.get("/")
def root():
    return {"mesaj": "İzin Yönetim Sistemi API'ye hoş geldiniz"}
