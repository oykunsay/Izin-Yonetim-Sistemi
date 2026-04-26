const API_BASE = "http://localhost:8000";

export const api = {
  async izinTalepOlustur(data) {
    const res = await fetch(`${API_BASE}/izin-talep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      const detail = json.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e) => e.msg).join(", "));
      }
      throw new Error(detail || "Bir hata oluştu");
    }
    return json;
  },

  async izinleriGetir() {
    const res = await fetch(`${API_BASE}/izinler`);
    if (!res.ok) throw new Error("İzinler yüklenemedi");
    return res.json();
  },

  async izinDurumGuncelle(id, durum) {
    const res = await fetch(`${API_BASE}/izin-durum/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Güncelleme başarısız");
    return json;
  },
};

export function tarihFormatla(tarihStr) {
  if (!tarihStr) return "-";
  const [yil, ay, gun] = tarihStr.split("-");
  const aylar = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
  ];
  return `${parseInt(gun)} ${aylar[parseInt(ay) - 1]} ${yil}`;
}

export function gunHesapla(baslangic, bitis) {
  const b = new Date(baslangic);
  const e = new Date(bitis);
  const diff = Math.ceil((e - b) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}
