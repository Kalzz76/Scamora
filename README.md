# Scamora AI - Platform Pendeteksi Potensi Penipuan Digital Berbasis AI
**MIT-Week 2026 Innovation Challenge**

Scamora AI adalah platform deteksi dini ancaman kejahatan siber berbasis kecerdasan buatan dan pemindaian heuristik. Sistem ini dirancang untuk mendeteksi indikasi tautan phishing dan mengungkap manipulasi rekayasa sosial (*social engineering*) pada percakapan WhatsApp.

---

## 💻 Tech Stack
- **Frontend:** React 19 + TypeScript 5 (Vite 6+)
- **Styling:** Tailwind CSS v4 (`@theme`, Clean Apple-style design system)
- **Icons:** `lucide-react`
- **Routing:** `react-router-dom` (HashRouter)
- **API Client:** Axios (mendukung peralihan mulus antara Mock Engine & Backend Laravel)
- **Backend (Dikerjakan Terpisah):** Laravel 13 REST API + Supabase PostgreSQL

---

## 🚀 Cara Menjalankan Frontend

Pastikan Anda berada di direktori `frontend/`:

```bash
cd frontend

# Install dependencies (jika belum)
npm install

# Menjalankan server pengembangan lokal (Hot Module Replacement)
npm run dev

# Membangun bundle produksi
npm run build

# Menjalankan preview build produksi
npm run preview
```

Server lokal akan berjalan di `http://localhost:5173/`.

---

## 📁 Struktur Repositori

```
Scamora/
├── CLAUDE.md                   # Dokumen instruksi & konteks bagi AI agent
├── Plan_Website_Deteksi_...    # Dokumen cetak biru resmi MIT-Week 2026 (.docx)
├── README.md                   # Dokumentasi repositori
└── frontend/                   # Aplikasi React 19 TypeScript
    ├── src/
    │   ├── components/         # Navbar, Footer, PrivacyModal, SimPanel, Stepper
    │   ├── features/           # Halaman utama, URL Checker, Chat Detector, Report, Panduan, Kuis, Edukasi
    │   ├── lib/                # Konfigurasi konstanta, data demo, helper
    │   ├── services/           # ApiClient, AnalysisService, MockAnalyzer
    │   └── types/              # Type safety contracts
    ├── package.json
    └── vite.config.ts
```

---

## ⚖️ Prinsip Produk & Kepatuhan Etika
1. **Hasil = Indikasi Risiko, Bukan Vonis:** Sistem tidak pernah menyatakan kepastian "100% aman" atau "pasti penipuan".
2. **Tiga Kategori Resmi:** `Indikasi risiko tinggi`, `Perlu ditinjau lebih lanjut`, dan `Indikator risiko rendah`.
3. **Kutipan Bukti Nyata:** Setiap indikator AI wajib didukung kutipan kalimat otentik dari masukan pengguna.
4. **Zero-Retention Policy:** Teks percakapan dan URL masukan tidak pernah disimpan permanen di server log atau database.
