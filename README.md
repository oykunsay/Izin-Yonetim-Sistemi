# 🏢 İzin Yönetim Sistemi

Personel izin taleplerini oluşturmak ve yönetmek için geliştirilmiş full-stack bir web uygulaması.

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Backend** | Python + FastAPI |
| **Veritabanı** | JSON dosyası (izinler.json) |
| **Frontend** | React + Vite |
| **Stil** | Tailwind CSS |

---

## 📁 Klasör Yapısı

```
izin-yonetim/
├── backend/
│   ├── main.py            # FastAPI uygulaması, tüm endpoint'ler
│   ├── requirements.txt   # Python bağımlılıkları
│   └── izinler.json       # Otomatik oluşturulan veritabanı
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PersonelForm.jsx    # İzin talebi formu
│   │   │   └── YoneticiPanel.jsx   # Yönetici onay ekranı
│   │   ├── services/
│   │   │   └── api.js              # API istek fonksiyonları
│   │   ├── App.jsx                 # Ana uygulama + navigasyon
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Kurulum & Çalıştırma

### Ön Gereksinimler

- Python 3.9+
- Node.js 18+

---

### 1️⃣ Backend (FastAPI)

```bash
# Backend klasörüne gir
cd backend

# (Opsiyonel) Sanal ortam oluştur
python -m venv venv
source venv/bin/activate       # Linux/Mac
# venv\Scripts\activate        # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt

# Sunucuyu başlat
uvicorn main:app --reload --port 8000
```

✅ API şu adreste çalışıyor: `http://localhost:8000`  
📚 Swagger dökümantasyonu: `http://localhost:8000/docs`

---

### 2️⃣ Frontend (React)

```bash
# Frontend klasörüne gir
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

✅ Uygulama şu adreste çalışıyor: `http://localhost:5173`

---

## 📡 API Endpoint'leri

### `POST /izin-talep`
Yeni izin talebi oluşturur.

**Request Body:**
```json
{
  "ad_soyad": "Ahmet Yılmaz",
  "izin_turu": "Yıllık İzin",
  "baslangic_tarihi": "2025-06-01",
  "bitis_tarihi": "2025-06-05",
  "aciklama": "Yaz tatili"
}
```

**Başarılı Yanıt (201):**
```json
{
  "mesaj": "İzin talebi başarıyla oluşturuldu",
  "izin": { "id": "...", "durum": "Beklemede", ... }
}
```

**Hata Yanıtı (422):**
```json
{
  "detail": [{ "msg": "Bitiş tarihi başlangıç tarihinden önce olamaz" }]
}
```

---

### `GET /izinler`
Tüm izin taleplerini listeler.

**Yanıt:**
```json
{
  "izinler": [...],
  "toplam": 5
}
```

---

### `PUT /izin-durum/{id}`
Talebin durumunu günceller.

**Request Body:**
```json
{ "durum": "Onaylandı" }
```

Geçerli değerler: `"Onaylandı"` | `"Reddedildi"`

---

## ✅ Özellikler

### Personel Ekranı
- 3 izin türü arasından seçim (kart butonlar)
- Tarih aralığı validasyonu (bitiş, başlangıçtan önce olamaz)
- Anlık gün sayısı hesaplama
- Başarı/hata mesajları
- Boş alan kontrolleri

### Yönetici Paneli
- Tüm talepleri liste görünümünde listeler
- Durum filtreleme (Tümü / Beklemede / Onaylandı / Reddedildi)
- İstatistik kartları (toplam, beklemede, onaylanan, reddedilen)
- Anlık Onayla / Reddet butonları (API çağrısı sonrası ekran güncellenir)
- Tarihler okunabilir formatta (Örn: 15 Mayıs 2025)

### Hata Yönetimi
- Eksik alan → anlamlı hata mesajı
- API 400/422 → kullanıcıya gösterilir
- API bağlantı hatası → bilgilendirme mesajı

---

## 🧪 Hızlı Test (curl)

```bash
# İzin talebi oluştur
curl -X POST http://localhost:8000/izin-talep \
  -H "Content-Type: application/json" \
  -d '{"ad_soyad":"Test Kullanıcı","izin_turu":"Yıllık İzin","baslangic_tarihi":"2025-07-01","bitis_tarihi":"2025-07-05","aciklama":"Test"}'

# Tüm izinleri listele
curl http://localhost:8000/izinler

# Durumu güncelle (id'yi yukarıdaki çıktıdan alın)
curl -X PUT http://localhost:8000/izin-durum/{ID} \
  -H "Content-Type: application/json" \
  -d '{"durum":"Onaylandı"}'
```
