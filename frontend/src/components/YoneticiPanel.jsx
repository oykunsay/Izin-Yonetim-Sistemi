import { useState, useEffect, useCallback } from "react";
import { api, tarihFormatla, gunHesapla } from "../services/api";

const durumRenk = {
  Beklemede: "bg-amber-100 text-amber-800 border-amber-200",
  Onaylandı: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Reddedildi: "bg-red-100 text-red-800 border-red-200",
};

const durumIcon = {
  Beklemede: "⏳",
  Onaylandı: "✅",
  Reddedildi: "❌",
};

const izinTuruRenk = {
  "Yıllık İzin": "bg-blue-50 text-blue-700",
  "Sağlık İzni": "bg-rose-50 text-rose-700",
  "Mazeret İzni": "bg-violet-50 text-violet-700",
};

export default function YoneticiPanel() {
  const [izinler, setIzinler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [islemler, setIslemler] = useState({});
  const [filtre, setFiltre] = useState("Tümü");

  const verileriYukle = useCallback(async () => {
    try {
      const data = await api.izinleriGetir();
      setIzinler(data.izinler.reverse());
      setHata("");
    } catch (e) {
      setHata("Veriler yüklenirken hata oluştu. API çalışıyor mu?");
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { verileriYukle(); }, [verileriYukle]);

  const durumGuncelle = async (id, durum) => {
    setIslemler((p) => ({ ...p, [id]: durum }));
    try {
      await api.izinDurumGuncelle(id, durum);
      setIzinler((prev) =>
        prev.map((i) => (i.id === id ? { ...i, durum } : i))
      );
    } catch (e) {
      setHata(e.message);
    } finally {
      setIslemler((p) => { const n = {...p}; delete n[id]; return n; });
    }
  };

  const filtreliIzinler = filtre === "Tümü" ? izinler : izinler.filter((i) => i.durum === filtre);

  const istatistikler = {
    toplam: izinler.length,
    beklemede: izinler.filter((i) => i.durum === "Beklemede").length,
    onaylandi: izinler.filter((i) => i.durum === "Onaylandı").length,
    reddedildi: izinler.filter((i) => i.durum === "Reddedildi").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">Yönetici Paneli</h1>
              <p className="text-xs text-slate-500 mt-0.5">İzin Talep Yönetimi</p>
            </div>
          </div>
          <button
            onClick={verileriYukle}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Toplam Talep", value: istatistikler.toplam, color: "text-slate-700", bg: "bg-white" },
            { label: "Beklemede", value: istatistikler.beklemede, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Onaylandı", value: istatistikler.onaylandi, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Reddedildi", value: istatistikler.reddedildi, color: "text-red-600", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-slate-200 rounded-xl p-4 text-center shadow-sm`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hata */}
        {hata && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {hata}
          </div>
        )}

        {/* Filtre */}
        <div className="flex items-center gap-2 mb-5">
          {["Tümü", "Beklemede", "Onaylandı", "Reddedildi"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                ${filtre === f
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
            >
              {f}
              {f !== "Tümü" && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({izinler.filter(i => i.durum === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        {yukleniyor ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Yükleniyor...
            </div>
          </div>
        ) : filtreliIzinler.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium">Kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtreliIzinler.map((izin) => (
              <div key={izin.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-slate-800">{izin.ad_soyad}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${durumRenk[izin.durum]}`}>
                        {durumIcon[izin.durum]} {izin.durum}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${izinTuruRenk[izin.izin_turu] || "bg-slate-100 text-slate-600"}`}>
                        {izin.izin_turu}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {tarihFormatla(izin.baslangic_tarihi)} — {tarihFormatla(izin.bitis_tarihi)}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {gunHesapla(izin.baslangic_tarihi, izin.bitis_tarihi)} gün
                      </span>
                    </div>

                    {izin.aciklama && (
                      <p className="mt-2 text-sm text-slate-500 italic">"{izin.aciklama}"</p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      Talep tarihi: {tarihFormatla(izin.olusturma_tarihi)}
                    </p>
                  </div>

                  {/* Butonlar */}
                  {izin.durum === "Beklemede" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => durumGuncelle(izin.id, "Onaylandı")}
                        disabled={!!islemler[izin.id]}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {islemler[izin.id] === "Onaylandı" ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Onayla
                      </button>
                      <button
                        onClick={() => durumGuncelle(izin.id, "Reddedildi")}
                        disabled={!!islemler[izin.id]}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {islemler[izin.id] === "Reddedildi" ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
