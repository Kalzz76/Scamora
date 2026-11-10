# Scamora AI - Platform Pendeteksi Potensi Penipuan Digital Berbasis AI
**MIT-Week 2026 Innovation Challenge — Studi Kasus: *"The Trust Trap"***

Scamora AI adalah platform intelijen ancaman siber dan higienitas digital (*cyber-hygiene*) berbasis kecerdasan buatan dan pemindaian heuristik. Dirancang khusus untuk mendeteksi dini indikasi tautan phishing dan mengungkap manipulasi rekayasa sosial (*social engineering*) pada percakapan digital (khususnya WhatsApp) secara ramah awam, transparan, dan menjunjung privasi pengguna.

---

## 📌 Permasalahan yang Dipecahkan (*Problem Statement*)

1. **Eskalasi Penipuan Digital & Social Engineering:** Maraknya modus kejahatan siber di Indonesia seperti file APK berkedok undangan/surat tilang/paket, penipuan lowongan kerja (*task scam*), undian palsu, dan pencurian OTP/rekening.
2. **Jebakan Rasa Percaya (*The Trust Trap*):** Korban sering terjebak oleh pesan yang rapi, domain mirip merek resmi (*typosquatting* / homograf), atau tautan yang belum terdaftar di basis data ancaman global (*blacklist*).
3. **Kesenjangan Literasi Keamanan Siber:** Masyarakat awam kesulitan mengenali manipulasi psikologis seperti desakan waktu (*urgency*), ancaman blokir (*fear*), maupun iming-iming hadiah (*greed*).
4. **Privasi Terancam:** Banyak alat analisis siber daring meminta data tanpa transparansi, berisiko membocorkan identitas pribadi pelapor.

---

## 🎯 Tujuan Proyek (*Goals & Objectives*)

- **Deteksi Dini Cepat & Akurat:** Membantu masyarakat memeriksa tautan mencurigakan dan teks chat secara instan sebelum melakukan tindakan berisiko atau transfer uang.
- **Edukasi & Pemberdayaan Publik:** Menyajikan penjelasan dalam bahasa awam dengan kutipan bukti nyata (*evidence-based*), dilengkapi panduan mitigasi dan kuis interaktif.
- **Etika "Indikasi Risiko", Bukan Vonis:** Menyajikan asesmen risiko secara objektif tanpa pernah mengklaim "100% aman" atau "pasti penipuan".
- **Kepatuhan Privasi Tertinggi (*Zero-Retention Policy*):** Melakukan penyamaran data pribadi (*PII masking*) otomatis dan tidak pernah menyimpan teks mentah pengguna di basis data atau server log.

---

## ✨ Fitur Utama

- 🔍 **Pemeriksa URL (*URL Checker*):**
  - Heuristik lokal: deteksi *typosquatting*, nama bank pada subdomain, *punycode/homograph*, *IP host*, *excessive subdomains*, port janggal, dan tautan pendek (*shorteners*).
  - Integrasi reputasi: pengecekan terhadap basis data Google Safe Browsing API.
- 💬 **Pendeteksi Chat Percakapan (*Chat Detector*):**
  - Penyaringan data pribadi (*PII scrubbing*): otomatis memasker nomor telepon, NIK, nomor rekening, dan OTP.
  - Kombinasi pemindaian pola lokal (*regex heuristics*) dan penalaran bahasa AI (*Claude API / Gemini*) untuk mengungkap manipulasi psikologis.
- 📊 **Laporan Risiko Terstruktur (*Risk Report*):**
  - Skala skor risiko 0–100 dan 3 kategori resmi:
    - 🔴 **Indikasi risiko tinggi:** Ditemukan tanda bahaya kuat atau indikator kritis (permintaan OTP / masuk blacklist).
    - 🟡 **Perlu ditinjau lebih lanjut:** Memerlukan kehati-hatian atau data analisis eksternal tidak lengkap.
    - 🟢 **Indikator risiko rendah:** Tidak ditemukan anomali pada pemeriksaan lengkap (*tetap bukan jaminan mutlak*).
  - Transparansi status pemeriksaan (*completed*, *partial*, *failed*) dan keterbatasan sistem (*limitations*).
- 🛡️ **Pusat Edukasi & Respon Cepat:**
  - **Ensiklopedia Penipuan:** Modul modus APK malware, job scam, phishing perbankan, dan vishing OTP.
  - **Guardian Challenge:** Kuis interaktif berbasis skenario percakapan nyata.
  - **Panduan Insiden & Checklist Keamanan:** 6 langkah taktis penanganan darurat bagi korban.
- ⚙️ **Panel Pengelola / Admin:**
  - Pemantauan telemetri agregat anonim dan kurasi data contoh simulasi.

---

## ⚖️ Prinsip Produk & Kepatuhan Etika

1. **Hasil = Indikasi Risiko, Bukan Vonis:** Sistem menolak istilah mutlak seperti *"100% Aman"* atau *"Pasti Penipuan"*.
2. **Tiga Kategori Resmi:** Hanya menggunakan label `Indikasi risiko tinggi`, `Perlu ditinjau lebih lanjut`, dan `Indikator risiko rendah`.
3. **Kutipan Bukti Nyata (*Verifiable Quotes*):** Setiap indikator risiko yang disimpulkan AI wajib mengutip kalimat otentik dari input pengguna.
4. **Kejujuran Kegagalan Sistem (*Honest Failure*):** Jika layanan eksternal gagal (*timeout/offline*), sistem memberikan status `partial` dan melarang penetapan kategori `low`.
5. **Zero-Retention Policy:** Masukan URL dan teks chat diproses secara *in-memory* dan tidak disimpan ke basis data persisten.

---

## 💻 Tech Stack & Arsitektur

### Frontend (`frontend/`)
- **Framework:** React 19 + TypeScript 5 (Vite 6+)
- **Styling:** Tailwind CSS v4 (`@theme`, Clean Apple-style design system ala Gainlove nirlaba)
- **Icons & UI:** `lucide-react`, Material Symbols
- **Routing:** `react-router-dom` (HashRouter)
- **HTTP Client:** Axios (mendukung peralihan instan antara *Mock Engine* lokal dan REST API backend)

### Backend (`backend/`)
- **Runtime & Framework:** Node.js + Express.js v5 (TypeScript Strict)
- **Validation:** Zod Schema
- **Security & Middleware:** Helmet, CORS, Express Rate Limit
- **Integrasi Keamanan & AI:** Anthropic Claude API (`@anthropic-ai/sdk`), Google Safe Browsing API / Google GenAI SDK
- **Database (Roadmap P1/P2):** PostgreSQL / Supabase (`@supabase/supabase-js`, `pg`)

### Admin Dashboard (`admin/`)
- **Framework:** Vite + React + TypeScript untuk pengelolaan data dan monitoring.

---

## 📁 Struktur Repositori

```
Scamora/
├── CLAUDE.md                   # Petunjuk instruksi, aturan desain & panduan agen AI
├── SCHEMA.md / schema.sql      # Dokumentasi & DDL skema basis data PostgreSQL/Supabase
├── README.md                   # Dokumentasi resmi proyek
├── frontend/                   # Aplikasi antarmuka publik (React 19 + TypeScript + Tailwind v4)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, PrivacyModal, Stepper, SimPanel
│   │   ├── features/           # URL Checker, Chat Detector, Report, Panduan, Kuis, Edukasi
│   │   ├── services/           # ApiClient, AnalysisService, MockAnalyzer
│   │   └── types/              # Kontrak type safety API & Analisis
├── backend/                    # Layanan REST API (Express v5 + TypeScript)
│   ├── src/
│   │   ├── config/             # Bobot penilaian (scoring), batas ambang, env
│   │   ├── controllers/        # Handler HTTP endpoint
│   │   ├── routes/             # Routing /api/v1
│   │   ├── schemas/            # Skema validasi Zod
│   │   └── services/           # Deteksi heuristik URL, masking PII, analisis Claude
└── admin/                      # Dashboard administrasi internal
```

---

## 🚀 Panduan Menjalankan Proyek Lokal

### 1. Menjalankan Frontend
```bash
cd frontend

# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Bangun versi produksi
npm run build
```
Frontend berjalan di: `http://localhost:5173/`

### 2. Menjalankan Backend
```bash
cd backend

# Pasang dependensi
npm install

# Siapkan environment (.env)
cp .env.example .env
# Isi kredensial API yang diperlukan (ANTHROPIC_API_KEY, GOOGLE_SAFE_BROWSING_KEY)

# Jalankan server pengembangan
npm run dev
```
Backend berjalan di: `http://localhost:8000/`

---

## 🔌 Kontrak Endpoint API Utama

Semua endpoint backend berada di bawah prefiks `/api/v1`:

| Metode | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Pemeriksaan kesehatan layanan |
| `POST` | `/api/v1/analyze/url` | Analisis struktur dan reputasi URL |
| `POST` | `/api/v1/analyze/chat` | Analisis manipulasi psikologis & pemindaian chat |
| `GET` | `/api/v1/demo-examples` | Mendapatkan contoh data simulasi phishing & scam |

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk **MIT-Week 2026 Innovation Challenge**. Seluruh hak kekayaan intelektual kode sumber dan materi dirancang secara orisinal untuk kepentingan literasi keamanan digital publik.
