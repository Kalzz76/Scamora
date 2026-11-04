# Scamora AI - Frontend (React 19 + TypeScript 5)
**MIT-Week 2026 Innovation Challenge**

Aplikasi antarmuka modern untuk deteksi dini indikasi penipuan digital (URL phishing & WhatsApp social engineering), dibangun sesuai cetak biru arsitektur resmi (*Blueprint Proyek MIT-Week 2026*).

---

## 🚀 Cara Menjalankan Frontend

Pastikan Anda berada di direktori `frontend/`:

```bash
cd frontend

# Menjalankan server pengembangan (Hot Reload)
npm run dev

# Membangun bundle produksi (Production Build)
npm run build

# Menjalankan preview hasil build lokal
npm run preview
```

Server pengembangan lokal akan berjalan pada alamat `http://localhost:5173/`.

---

## 🔌 Cara Menghubungkan ke Backend Laravel (Teman Anda)

Secara default, frontend berjalan dalam mode **Mock Engine Aktif (`VITE_USE_MOCK=true`)**. Ini memungkinkan Anda mendemokan semua fitur (URL Checker, WhatsApp Chat Detector, Laporan Risiko, Kuis Guardian Challenge) secara instan tanpa perlu backend aktif.

Ketika rekan backend Anda telah selesai membuat API Laravel:
1. Buka berkas `.env` di folder `frontend/`.
2. Ubah konfigurasi:
   ```env
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Restart dev server (`npm run dev`). Frontend akan otomatis mengirimkan request ke Laravel backend melalui `Axios`!

---

## 📁 Struktur Modul & Fitur

```
frontend/src/
├── components/
│   ├── common/         # Modal privasi, panel simulasi demo, stepper diagnostic
│   └── layout/         # Sticky Navbar dengan logo & status, Footer etika AI
├── features/
│   ├── home/           # Halaman utama dengan hero console & kartu uji cepat
│   ├── url-checker/    # P0: Deteksi phishing URL, protocol lock, demo preset
│   ├── chat-detector/  # P0: Deteksi chat WA, live PII preview, counter 10-5000 char
│   ├── risk-report/    # P0: Laporan telemetri risiko, dial 0-100, bukti otentik
│   ├── panduan/        # P0/P1: Safety Action Guide & Interactive Checklist
│   ├── challenge/      # P1: Kuis interaktif Guardian Challenge 6 soal
│   └── knowledge/      # P1: Ensiklopedia taktik penipuan digital
├── lib/
│   ├── constants.ts    # Kategori risiko, preset data simulasi, metadata
│   └── utils.ts        # Helper formatting & sanitasi string
├── services/
│   ├── apiClient.ts    # Axios client standar HTTP & interceptor
│   ├── analysisService.ts # Switcher cerdas Mock vs Real API
│   └── mockAnalyzer.ts # Mesin heuristik lokal & regex PII scrubbing
└── types/
    ├── analysis.ts     # Type safety: RiskLevel, Indicator, PipelineCheck
    └── api.ts          # Kontrak request/response endpoint Laravel
```
