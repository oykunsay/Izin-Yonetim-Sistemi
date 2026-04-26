import { useState } from "react";
import PersonelForm from "./components/PersonelForm";
import YoneticiPanel from "./components/YoneticiPanel";

export default function App() {
  const [aktifSayfa, setAktifSayfa] = useState("personel");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-0 flex items-center">
          <span className="font-bold text-lg mr-8 py-4 tracking-tight">🏢 İzin Yönetimi</span>
          <div className="flex">
            {[
              { key: "personel", label: "İzin Talebi", icon: "📝" },
              { key: "yonetici", label: "Yönetici Paneli", icon: "📊" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setAktifSayfa(s.key)}
                className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all
                  ${aktifSayfa === s.key
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:text-white hover:border-indigo-300"}`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {aktifSayfa === "personel" ? (
        <PersonelForm onSuccess={() => {}} />
      ) : (
        <YoneticiPanel />
      )}
    </div>
  );
}
