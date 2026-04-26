import { useState } from "react";
import { api } from "../services/api";

const IzinTurleri = ["Yıllık İzin", "Sağlık İzni", "Mazeret İzni"];

const izinTuruIcon = {
  "Yıllık İzin": "🌴",
  "Sağlık İzni": "🏥",
  "Mazeret İzni": "📋",
};

export default function PersonelForm({ onSuccess }) {
  const bugun = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    ad_soyad: "",
    izin_turu: "",
    baslangic_tarihi: "",
    bitis_tarihi: "",
    aciklama: "",
  });
  const [hatalar, setHatalar] = useState({});
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState(false);

  const validate = () => {
    const yeniHatalar = {};
    if (!form.ad_soyad.trim()) yeniHatalar.ad_soyad = "Ad Soyad zorunludur";
    if (!form.izin_turu) yeniHatalar.izin_turu = "Lütfen bir izin türü seçiniz";
    if (!form.baslangic_tarihi) yeniHatalar.baslangic_tarihi = "Lütfen başlangıç tarihi seçiniz";
    if (!form.bitis_tarihi) yeniHatalar.bitis_tarihi = "Lütfen bitiş tarihi seçiniz";
    if (form.baslangic_tarihi && form.bitis_tarihi && form.bitis_tarihi < form.baslangic_tarihi) {
      yeniHatalar.bitis_tarihi = "Bitiş tarihi başlangıç tarihinden önce olamaz";
    }
    return yeniHatalar;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (hatalar[name]) setHatalar((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const yeniHatalar = validate();
    if (Object.keys(yeniHatalar).length > 0) {
      setHatalar(yeniHatalar);
      return;
    }
    setYukleniyor(true);
    try {
      await api.izinTalepOlustur(form);
      setBasari(true);
      setForm({ ad_soyad: "", izin_turu: "", baslangic_tarihi: "", bitis_tarihi: "", aciklama: "" });
      setHatalar({});
      setTimeout(() => { setBasari(false); if (onSuccess) onSuccess(); }, 3000);
    } catch (err) {
      setHatalar({ genel: err.message });
    } finally {
      setYukleniyor(false);
    }
  };

  const gunSayisi = form.baslangic_tarihi && form.bitis_tarihi && form.bitis_tarihi >= form.baslangic_tarihi
    ? Math.ceil((new Date(form.bitis_tarihi) - new Date(form.baslangic_tarihi)) / (1000*60*60*24)) + 1
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">İzin Talebi Oluştur</h1>
          <p className="text-slate-500 mt-1 text-sm">Talebinizi doldurun, yöneticiniz en kısa sürede değerlendirecektir.</p>
        </div>

        {/* Success Message */}
        {basari && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            İzin talebiniz başarıyla iletildi!
          </div>
        )}

        {hatalar.genel && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {hatalar.genel}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ad_soyad"
                value={form.ad_soyad}
                onChange={handleChange}
                placeholder="Örn: Ahmet Yılmaz"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                  ${hatalar.ad_soyad ? "border-red-400 bg-red-50" : "border-slate-300 bg-white hover:border-slate-400"}`}
              />
              {hatalar.ad_soyad && <p className="mt-1.5 text-xs text-red-600">{hatalar.ad_soyad}</p>}
            </div>

            {/* İzin Türü */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                İzin Türü <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {IzinTurleri.map((tur) => (
                  <button
                    key={tur}
                    type="button"
                    onClick={() => { setForm(p => ({...p, izin_turu: tur})); setHatalar(p => ({...p, izin_turu: ""})); }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border-2 text-xs font-medium transition-all
                      ${form.izin_turu === tur
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                  >
                    <span className="text-xl">{izinTuruIcon[tur]}</span>
                    {tur}
                  </button>
                ))}
              </div>
              {hatalar.izin_turu && <p className="mt-1.5 text-xs text-red-600">{hatalar.izin_turu}</p>}
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Başlangıç <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="baslangic_tarihi"
                  value={form.baslangic_tarihi}
                  min={bugun}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    ${hatalar.baslangic_tarihi ? "border-red-400 bg-red-50" : "border-slate-300 bg-white hover:border-slate-400"}`}
                />
                {hatalar.baslangic_tarihi && <p className="mt-1.5 text-xs text-red-600">{hatalar.baslangic_tarihi}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Bitiş <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="bitis_tarihi"
                  value={form.bitis_tarihi}
                  min={form.baslangic_tarihi || bugun}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    ${hatalar.bitis_tarihi ? "border-red-400 bg-red-50" : "border-slate-300 bg-white hover:border-slate-400"}`}
                />
                {hatalar.bitis_tarihi && <p className="mt-1.5 text-xs text-red-600">{hatalar.bitis_tarihi}</p>}
              </div>
            </div>

            {/* Gün özeti */}
            {gunSayisi && (
              <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-indigo-700 font-medium">Toplam <strong>{gunSayisi} iş günü</strong> izin talebi</span>
              </div>
            )}

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Açıklama</label>
              <textarea
                name="aciklama"
                value={form.aciklama}
                onChange={handleChange}
                rows={3}
                placeholder="İsteğe bağlı açıklama ekleyebilirsiniz..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {yukleniyor ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Gönderiliyor...
                </>
              ) : "Talebi Gönder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
