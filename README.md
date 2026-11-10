# Scamora AI — Platform Pendeteksi Potensi Penipuan Digital Berbasis AI
**MIT-Week 2026 Innovation Challenge — Studi Kasus: *"The Trust Trap"***

Scamora AI adalah platform intelijen ancaman siber dan higienitas digital (*cyber-hygiene*) berbasis kecerdasan buatan, pemindaian heuristik mendalam, dan verifikasi multi-lapis. Dirancang khusus untuk mendeteksi dini indikasi tautan phishing dan mengungkap manipulasi rekayasa sosial (*social engineering*) pada percakapan digital secara ramah awam, transparan, dan menjunjung tinggi privasi pengguna.

---

## 📌 Permasalahan yang Dipecahkan (*Problem Statement*)

1. **Eskalasi Penipuan Digital & Social Engineering:** Maraknya modus kejahatan siber di Indonesia seperti file APK berkedok undangan/surat tilang/paket, penipuan lowongan kerja (*task scam*), undian palsu, dan pencurian OTP/rekening.
2. **Jebakan Rasa Percaya (*The Trust Trap*):** Korban sering terjebak oleh pesan yang rapi, domain mirip merek resmi (*typosquatting* / homograf), atau tautan yang belum terdaftar di basis data ancaman global (*blacklist*).
3. **Kesenjangan Literasi Keamanan Siber:** Masyarakat awam kesulitan mengenali manipulasi psikologis seperti desakan waktu (*urgency*), ancaman blokir (*fear*), maupun iming-iming hadiah (*greed*).
4. **Privasi Terancam:** Banyak alat analisis siber daring meminta data tanpa transparansi, berisiko membocorkan identitas pribadi pelapor.

---

## 🎯 Tujuan Proyek (*Goals & Objectives*)

- **Deteksi Dini Cepat & Akurat:** Membantu masyarakat memeriksa tautan mencurigakan dan teks chat secara instan sebelum melakukan tindakan berisiko atau transfer uang.
- **Edukasi & Pemberdayaan Publik:** Menyajikan penjelasan dalam bahasa awam dengan kutipan bukti nyata (*evidence-based*), dilengkapi panduan mitigasi dan kuis interaktif berbasis AI.
- **Etika "Indikasi Risiko", Bukan Vonis:** Menyajikan asesmen risiko secara objektif tanpa pernah mengklaim "100% aman" atau "pasti penipuan".
- **Kepatuhan Privasi Tertinggi (*Zero-Retention Policy*):** Melakukan penyamaran data pribadi (*PII masking*) otomatis dan tidak pernah menyimpan teks mentah pengguna di basis data atau server log.

---

## ✨ Fitur Utama Aplikasi

### 1. 🏠 Beranda & Demo Interaktif (*Home & Quick Scan*)
- **Hero Banner Edukatif:** Pintu masuk cepat ke scanner, panduan darurat, dan data sebaran ancaman siber.
- **Simulasi Contoh Kasus Nyata (*Preset Scenarios*):** Pengguna dapat langsung mencoba simulasi modus populer (Undangan APK, Phishing Perbankan, Task Scam Telegram) hanya dengan satu klik tanpa perlu mencari contoh sendiri.
- **Batas Kuota Tamu (*Guest Scan Quota*):** Akses pemindaian publik instan dengan kuota tamu terkontrol dan opsi login untuk akses tanpa batas.

### 2. 🔍 Pemindaian Publik (*Public Threat Scanner*)
- **Pemeriksa URL (*URL Checker*):**
  - Heuristik lokal: deteksi *typosquatting*, nama institusi pada subdomain, *punycode/homograph*, *IP host*, *excessive subdomains*, port janggal, dan pengurai tautan pendek (*URL shorteners*).
  - *Page Crawler & Header Inspection*: Deteksi berkas `.apk` berbahaya, form login mencurigakan, dan meta redirect.
  - Integrasi reputasi global: Pengecekan terhadap Google Safe Browsing API.
- **Pendeteksi Chat Percakapan (*Chat Detector*):**
  - Penyaringan data pribadi (*PII scrubbing*): otomatis memasker nomor telepon, NIK, nomor rekening, dan OTP sebelum diproses.
  - Penalaran AI Multimodel (*Google Gemini & Anthropic Claude*): Analisis konteks manipulasi psikologis (*urgency*, *fear*, *greed*, *authority impersonation*).
- **Laporan Risiko Terstruktur (*Risk Report*):**
  - Skala skor risiko 0–100 dengan 3 kategori resmi:
    - 🔴 **Indikasi risiko tinggi:** Ditemukan tanda bahaya kuat atau indikator kritis.
    - 🟡 **Perlu ditinjau lebih lanjut:** Memerlukan kehati-hatian atau data analisis eksternal tidak lengkap.
    - 🟢 **Indikator risiko rendah:** Tidak ditemukan anomali pada pemeriksaan lengkap (*tetap bukan jaminan mutlak*).
  - Kutipan bukti otentik (*verifiable quotes*) langsung dari teks input.
  - Transparansi status pemeriksaan (*completed*, *partial*) dan batasan analisis sistem (*limitations*).

### 3. 🛡️ Panduan Edukasi & Tanggap Darurat (*Incident Playbook*)
- **Panduan Insiden Darurat (*Emergency Playbook*):** 6 langkah taktis penanganan korban penipuan (pemblokiran rekening bank, pelaporan ke portal resmi Patroli Siber / OJK, pengamanan kredensial digital, dan isolasi perangkat).
- **Checklist Keamanan Digital (*Digital Hygiene Checklist*):** Daftar periksa interaktif kesiapan keamanan akun pribadi dan higienitas digital warga.
- **Pusat Pengetahuan (*Scam Knowledge Base*):** Ensiklopedia mendalam tentang anatomi berbagai jenis modus penipuan digital terkini.

### 4. 🎮 Tantangan AI (*Guardian Challenge*)
- **Simulasi Percakapan Interaktif:** Pengguna menghadapi simulasi dialog dengan pelaku penipuan digital yang digerakkan oleh AI (Google Gemini Scenario Generator) atau skenario terkurasi.
- **Pilihan Keputusan Kritis:** Setiap pilihan respons dinilai secara real-time untuk menguji ketajaman insting keamanan pengguna.
- **Evaluasi & Skor Higienitas:** Mendapatkan umpan balik edukatif terperinci mengenai titik lemah dan cara merespons interaksi berisiko.

### 5. 👥 Komunitas Warga Waspada (*Community Hub*)
- **Forum Diskusi Kolaboratif:** Wadah warga berbagi pengalaman, berkonsultasi mengenai pesan mencurigakan, dan saling mengingatkan modus baru.
- **Diskusi Berjenjang (*Threaded Replies*):** Komentar dan balasan terstruktur untuk mempermudah alur pemecahan masalah.
- **Sistem Solusi Terbaik (*Best Solution*):** Pembuat thread atau moderator dapat menandai jawaban paling akurat sebagai solusi resmi.
- **Apresiasi Membantu (*Helpful Vote*):** Fitur voting berbasis reputasi dengan perlindungan anti-manipulasi ketat (mencegah voting diri sendiri).
- **Validasi Berkas Bukti Aman:** Verifikasi berkas gambar bukti laporan menggunakan validasi *magic bytes* asli (PNG/JPEG) guna mencegah injeksi file berbahaya.
- **Pelaporan & Moderasi Konten:** Mekanisme lapor konten pelanggaran atau kebocoran data pribadi untuk ditinjau oleh tim moderator.

### 6. 🔐 Registrasi, Login & Keamanan Autentikasi
- **Autentikasi Kredensial:** Pendaftaran menggunakan username, email aktif, nama lengkap, dan kata sandi yang di-hash dengan Bcrypt.
- **Proteksi Anti-Bot Cloudflare Turnstile:** Widget CAPTCHA modern tanpa gangguan privasi untuk menangkal serangan brute-force otomatis pada form login dan registrasi.
- **Rate Limiting Bertingkat:** Pembatasan frekuensi request berdasarkan IP (`app.set('trust proxy', 1)`) dan email guna mencegah serangan spam maupun brute force.

### 7. 🌐 Google OAuth 2.0 (SSO)
- **Login Satu-Klik:** Akses instan dan aman menggunakan Akun Google resmi (`google-auth-library`).
- **Account Linking Aman:** Sinkronisasi akun otomatis berdasarkan verifikasi identitas email Google.

### 8. 📧 Verifikasi Email SMTP OTP (Registrasi)
- **Pengiriman via Gmail SMTP:** Transporter reusable menggunakan Nodemailer STARTTLS (Port 587) dengan kredensial aman Gmail App Password.
- **Kriptografi Aman:** Kode OTP 6 digit acak yang dihasilkan via `crypto.randomInt` (Cryptographically Secure Random Generator).
- **Penyimpanan Ter-hash:** OTP disimpan dalam bentuk hash SHA-256 ber-salt per email di database (`auth_otps`), tanpa pernah menyimpan OTP plaintext.
- **Proteksi Anti-Replay & Cooldown:** Masa berlaku 5 menit, maksimal 5 kali percobaan salah, cooldown pengiriman ulang 60 detik, dan pencegahan race condition. Akun baru aktif setelah verifikasi OTP berhasil.

### 9. 🔑 Reset Password SMTP OTP
- **Pemulihan Kata Sandi Mandiri:** Permintaan reset sandi via email tanpa membocorkan status ketersediaan email (mencegah enumerasi akun).
- **Verifikasi OTP & Reset Token:** Verifikasi OTP yang berhasil menerbitkan `resetToken` terenkripsi dengan masa berlaku singkat dan hanya berlaku satu kali (*single-use*).
- **Pembaruan Password Aman:** Perubahan kata sandi memvalidasi kesesuaian token, meng-hash sandi baru dengan Bcrypt, dan langsung menonaktifkan seluruh sesi OTP terkait.

### 10. ⚙️ Panel Pengelola & Administrasi (*Admin Dashboard*)
- **Dashboard Overview:** Pemantauan statistik telemetri agregat anonim (total pemindaian, sebaran tingkat risiko, dan rasio jenis scam).
- **Manajemen Pengguna (*User Management*):** Pengelolaan akun pengguna, pemantauan status (aktif/ditangguhkan), dan penetapan lencana relawan terverifikasi.
- **Konfigurasi Mesin AI (*AI Engine Config*):** Pengaturan dinamis pemilihan model AI (Google Gemini / Anthropic Claude), bobot penilaian heuristik, dan parameter runtime.
- **Moderasi Komunitas (*Moderation Queue*):** Peninjauan laporan postingan/komentar mencurigakan disertai catatan tindakan moderator dan audit log tak terhapuskan (*audit trail*).

---

## ⚖️ Prinsip Produk & Kepatuhan Etika

1. **Hasil = Indikasi Risiko, Bukan Vonis:** Sistem menolak istilah mutlak seperti *"100% Aman"* atau *"Pasti Penipuan"*.
2. **Tiga Kategori Resmi:** Hanya menggunakan label `Indikasi risiko tinggi`, `Perlu ditinjau lebih lanjut`, dan `Indikator risiko rendah`.
3. **Kutipan Bukti Nyata (*Verifiable Quotes*):** Setiap indikator risiko yang disimpulkan AI wajib mengutip kalimat otentik dari input pengguna.
4. **Kejujuran Kegagalan Sistem (*Honest Failure*):** Jika layanan eksternal gagal (*timeout/offline*), sistem memberikan status `partial` dan melarang penetapan kategori `low`.
5. **Zero-Retention Policy:** Masukan URL dan teks chat pengguna diproses secara *in-memory* dan tidak disimpan ke basis data persisten atau server log.

---

## 💻 Tech Stack & Arsitektur

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Single Page Application dibangun dengan Vite 6+ / 8 |
| **Styling & UI System** | Tailwind CSS v4, Lucide React, Motion | Desain antarmuka modern, responsif, dan aksesibel |
| **State & HTTP Client** | TanStack React Query v5, Axios | Pengelolaan cache data server dan komunikasi REST API |
| **Security Widget** | Cloudflare Turnstile | Proteksi anti-bot pintar pada form autentikasi |
| **Backend Framework** | Express.js v5 (Node.js 18+) | REST API TypeScript berkekuatan tinggi |
| **Validasi Skema** | Zod v4 | Validasi data input ketat di seluruh endpoint |
| **Keamanan Backend** | Helmet, CORS, Express Rate Limit, Bcryptjs | Proteksi header HTTP, pembatasan laju request, dan hashing kata sandi |
| **AI Integration** | Google GenAI SDK (`@google/genai`) & Anthropic SDK (`@anthropic-ai/sdk`) | Multimodel AI (Gemini 2.5/Flash-Lite & Claude 3.5 Haiku) untuk deteksi rekayasa sosial |
| **Reputasi Ancaman** | Google Safe Browsing API | Pengecekan domain dan URL terhadap ancaman global |
| **Email Service** | Nodemailer (Gmail SMTP) | Pengiriman kode OTP via STARTTLS port 587 |
| **Autentikasi SSO** | Google Auth Library (`google-auth-library`) | Integrasi Google OAuth 2.0 resmi |
| **Basis Data** | PostgreSQL 15+ / Supabase | Penyimpanan relasional dengan Fallback In-Memory Engine |
| **Testing** | Vitest | Automated unit, integration, and penetration test suite |
| **Deployment** | Vercel Serverless / Node.js Runtime | Dikonfigurasi dengan `trust proxy` dan edge-ready |

---

## 📁 Struktur Repositori

```
Scamora/
├── backend/                        # Layanan REST API (Express v5 + TypeScript)
│   ├── database/
│   │   └── schema.sql              # Skema DDL lengkap PostgreSQL & Supabase
│   ├── src/
│   │   ├── config/                 # Konfigurasi env, database pool, dan scoring
│   │   ├── controllers/            # Handler HTTP (auth, analyze, community, admin, challenges)
│   │   ├── middlewares/            # Rate limiting, Turnstile, admin auth, error handler
│   │   ├── routes/                 # Endpoint router /api/v1
│   │   ├── schemas/                # Skema validasi Zod
│   │   └── services/               # Layanan bisnis (OTP, Mail, AI, Heuristik URL, Crawler, PII)
│   └── tests/                      # Suite pengujian otomatis Vitest
├── frontend/                       # Aplikasi antarmuka pengguna (React 19 + Vite + Tailwind v4)
│   ├── src/
│   │   ├── admin/                  # Modul Admin Dashboard (Overview, Users, Engine, Moderasi)
│   │   ├── components/             # Komponen global (Navbar, Footer, OtpInput, TurnstileWidget)
│   │   ├── features/               # Modul publik (Home, Report, Panduan, Kuis, Komunitas)
│   │   ├── services/               # Axios API client, auth service, analysis service
│   │   └── types/                  # Definisi TypeScript untuk API dan kontrak data
│   └── public/                     # Aset statis publik
├── package.json                    # Workspace root scripts
├── schema.sql                      # DDL skema database root
└── README.md                       # Dokumentasi resmi proyek
```

---

## 🚀 Panduan Menjalankan Proyek Lokal (*Local Development Guide*)

### 1. Prasyarat Instalasi
Pastikan perangkat Anda telah terpasang:
- **Node.js** (versi 18.x atau lebih baru, direkomendasikan Node.js 20 LTS)
- **npm** (versi 9.x atau lebih baru)
- **Git**
- *(Opsional)* **PostgreSQL 15+** atau akun **Supabase** jika ingin mengaktifkan database persisten. Jika tidak disetel, backend akan berjalan otomatis menggunakan **Resilient In-Memory Mode**.
- *(Opsional)* Kredensial **Google AI Studio (Gemini)** atau **Anthropic Claude** untuk analisis AI nyata. Jika tidak diisi, sistem menggunakan pemindaian heuristik lokal.
- *(Opsional)* Akun **Gmail & App Password** untuk pengiriman email OTP nyata. Jika tidak diisi, kode OTP disimulasikan secara aman di console log server.

---

### 2. Clone Repository
```bash
git clone https://github.com/Kalzz76/Scamora.git
cd Scamora
```

---

### 3. Install Dependencies
Anda dapat memasang dependensi untuk seluruh sub-proyek langsung dari root atau secara terpisah:

**Opsi A — Pemasangan Terpisah (Direkomendasikan):**
```bash
# Pasang dependensi backend
cd backend
npm install
cd ..

# Pasang dependensi frontend
cd frontend
npm install
cd ..
```

**Opsi B — Pemasangan Workspace dari Root:**
```bash
npm install
```

---

### 4. Konfigurasi Environment Variables

Salin berkas template environment ke direktori `backend` dan `frontend`:

#### A. Backend (`backend/.env`)
Salin file `.env.example`:
```bash
cp backend/.env.example backend/.env
```
Sesuaikan nilai pada `backend/.env` sesuai kebutuhan (lihat bagian [Environment Variables](#-dokumentasi-environment-variables) untuk detail lengkap).

#### B. Frontend (`frontend/.env`)
Salin file `.env.example`:
```bash
cp frontend/.env.example frontend/.env
```
Secara default, `VITE_API_BASE_URL` diatur ke `http://localhost:8000/api/v1` dan `VITE_USE_MOCK=false`.

---

### 5. Setup Database & Menjalankan Migration

Scamora dirancang dengan arsitektur **Zero-Downtime Resilience**:
1. **Mode Tanpa Database (Default / Quick Start):**
   - Jika Anda tidak mengisi `DATABASE_URL` di `backend/.env`, backend akan otomatis berjalan menggunakan **in-memory data store** lengkap dengan data simulasi awal. Anda tidak perlu menginstal PostgreSQL untuk mulai mengembangkan atau menguji aplikasi!
2. **Mode Database PostgreSQL / Supabase:**
   - Masukkan string koneksi ke `DATABASE_URL` di `backend/.env`.
   - Backend memiliki mekanisme **Auto-Migration** saat koneksi pertama kali terhubung (`initDatabaseTables()` di `backend/src/config/db.ts`), yang secara otomatis membuat tabel-tabel penting jika belum ada.
   - Untuk menginisialisasi skema lengkap beserta indeks, RLS, dan seeder data awal secara manual, Anda dapat mengeksekusi berkas SQL DDL:
     - **Melalui Supabase Dashboard:** Buka menu **SQL Editor**, salin seluruh isi teks file `backend/database/schema.sql`, lalu klik **Run**.
     - **Melalui psql CLI:**
       ```bash
       psql "postgresql://postgres:password@localhost:5432/scamora" -f backend/database/schema.sql
       ```

---

### 6. Menjalankan Development Server

Buka dua jendela terminal untuk menjalankan backend dan frontend secara bersamaan:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
```
Backend akan aktif di: **`http://localhost:8000/`** (Status cek: `http://localhost:8000/api/v1/health`)

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
```
Frontend akan aktif di: **`http://localhost:5173/`**

> **Tips:** Anda juga dapat menjalankan keduanya dari root repository menggunakan perintah:
> ```bash
> npm run dev:backend   # Terminal 1
> npm run dev:frontend  # Terminal 2
> ```

---

### 7. Menjalankan Testing dan Build

#### Menjalankan Test Otomatis (Vitest)
Backend Scamora dilengkapi 14 test suite komprehensif (133 test) yang mencakup kontrak API, heuristik URL, masking PII, autentikasi, Turnstile, OTP SMTP, dan verifikasi keamanan:
```bash
cd backend
npm test
```

#### Menjalankan Build Produksi
Pastikan tidak ada kesalahan kompilasi sebelum rilis:
```bash
# Build Backend (TypeScript compilation)
cd backend
npm run build

# Build Frontend (Vite production bundle)
cd ../frontend
npm run build
```

---

## 🔐 Dokumentasi Environment Variables

Gunakan contoh konfigurasi berikut sebagai referensi. **Jangan pernah mengunggah kredensial atau API key asli ke repository publik.**

### Konfigurasi Backend (`backend/.env`)

```ini
# ==============================================================================
# SERVER & NETWORK CONFIGURATION
# ==============================================================================
PORT=8000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# ==============================================================================
# AI PROVIDER CONFIGURATION
# ==============================================================================
# Pilihan provider AI: 'auto' | 'gemini' | 'anthropic'
AI_PROVIDER=auto

# Google Gemini API (Dapatkan dari: https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Anthropic Claude API (Opsional: https://console.anthropic.com/)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-3-5-haiku-20241022

# ==============================================================================
# THREAT INTELLIGENCE & REPUTATION
# ==============================================================================
# Google Safe Browsing API (Opsional: https://developers.google.com/safe-browsing)
SAFE_BROWSING_API_KEY=your_safe_browsing_api_key_here

# ==============================================================================
# DATABASE CONFIGURATION (Opsional - Default In-Memory jika dikosongkan)
# ==============================================================================
# Format URI: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/scamora

# Supabase Client SDK (Opsional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key_here

# ==============================================================================
# ADMIN CREDENTIALS & JWT SECRET
# ==============================================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_SECRET=scamora-super-secret-admin-key-2026

# ==============================================================================
# GOOGLE OAUTH 2.0 (Opsional - Google SSO Login)
# ==============================================================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback

# ==============================================================================
# CLOUDFLARE TURNSTILE (Anti-Bot CAPTCHA)
# ==============================================================================
# Gunakan dummy testing keys untuk localhost (selalu lolos tanpa error):
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_ENABLED=true

# ==============================================================================
# GMAIL SMTP OTP SERVICE
# ==============================================================================
# Jika dikosongkan, OTP akan disimulasikan dan ditampilkan di console server
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_google_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=Scamora Security Team <your_email@gmail.com>
```

#### Penjelasan Variabel Backend:
- `PORT`: Port lokal tempat REST API backend Express berjalan (default: `8000`).
- `NODE_ENV`: Mode lingkungan (`development`, `production`, atau `test`).
- `FRONTEND_ORIGIN`: URL asal frontend untuk konfigurasi CORS yang diizinkan (default: `http://localhost:5173`).
- `AI_PROVIDER`: Prioritas pemilihan provider AI (`auto` akan mendeteksi Gemini terlebih dahulu lalu fallback ke Claude).
- `GEMINI_API_KEY` & `GEMINI_MODEL`: Kunci API dan nama model untuk analisis percakapan dan generator skenario kuis.
- `DATABASE_URL`: URI koneksi database PostgreSQL / Supabase. Jika tidak disetel, sistem beralih ke penyimpanan *in-memory*.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SECRET`: Kredensial superadmin dan kunci enkripsi token JWT.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Kredensial OAuth dari Google Cloud Console untuk fitur Single Sign-On (SSO).
- `TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY`: Pasangan kunci Cloudflare Turnstile untuk validasi anti-bot.
- `GMAIL_USER` & `GMAIL_APP_PASSWORD`: Kredensial Gmail dan Google App Password (16 digit) untuk pengiriman email OTP nyata.

---

### Konfigurasi Frontend (`frontend/.env`)

```ini
# Endpoint REST API Backend
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Mode Mock Simulator (set false untuk terhubung ke REST API backend nyata)
VITE_USE_MOCK=false

# Cloudflare Turnstile Site Key untuk widget frontend
# (Gunakan 1x00000000000000000000AA untuk mode testing localhost)
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

---

## 🔌 Ringkasan Endpoint API Utama

Seluruh endpoint backend berada di bawah prefiks `/api/v1`:

| Kategori | Metode | Endpoint | Fungsi |
| :--- | :--- | :--- | :--- |
| **Sistem** | `GET` | `/api/v1/health` | Pemeriksaan status dan kesehatan layanan |
| **Analisis** | `POST` | `/api/v1/analyze/url` | Pemindaian struktur, heuristik, dan reputasi URL |
| **Analisis** | `POST` | `/api/v1/analyze/chat` | Analisis manipulasi psikologis & pemindaian chat dengan AI |
| **Simulasi** | `GET` | `/api/v1/demo-examples` | Daftar contoh skenario simulasi serangan siber |
| **Autentikasi** | `POST` | `/api/v1/auth/register` | Pendaftaran akun baru (menerbitkan OTP) |
| **Autentikasi** | `POST` | `/api/v1/auth/register/verify` | Verifikasi 6-digit OTP pendaftaran & aktivasi akun |
| **Autentikasi** | `POST` | `/api/v1/auth/login` | Masuk akun dengan proteksi Cloudflare Turnstile |
| **Autentikasi** | `POST` | `/api/v1/auth/otp/resend` | Pengiriman ulang kode OTP dengan cooldown 60 detik |
| **Autentikasi** | `POST` | `/api/v1/auth/password/forgot` | Permintaan pemulihan kata sandi via email OTP |
| **Autentikasi** | `POST` | `/api/v1/auth/password/verify-otp` | Verifikasi OTP reset sandi & penerbitan reset token |
| **Autentikasi** | `POST` | `/api/v1/auth/password/reset` | Pengubahan kata sandi baru dengan reset token |
| **OAuth** | `GET` | `/api/v1/auth/google` | Inisiasi alur autentikasi Google OAuth 2.0 |
| **OAuth** | `POST` | `/api/v1/auth/google/token` | Verifikasi token kredensial Google Sign-In |
| **Tantangan AI** | `POST` | `/api/v1/challenges/sessions` | Membuka sesi kuis interaktif Guardian Challenge |
| **Tantangan AI** | `POST` | `/api/v1/challenges/sessions/:id/decisions` | Mengevaluasi keputusan pengguna dalam dialog kuis |
| **Komunitas** | `GET` | `/api/v1/community/discussions` | Mengambil daftar postingan diskusi terverifikasi |
| **Komunitas** | `POST` | `/api/v1/community/discussions` | Membuat topik diskusi konsultasi atau temuan baru |
| **Komunitas** | `POST` | `/api/v1/community/vote` | Apresiasi vote *Membantu* pada postingan/jawaban |
| **Admin** | `POST` | `/api/v1/admin/login` | Autentikasi pengelola/administrator sistem |
| **Admin** | `GET` | `/api/v1/admin/stats` | Telemetri agregat anonim sistem dan operasional |

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk **MIT-Week 2026 Innovation Challenge**. Seluruh hak kekayaan intelektual kode sumber dan materi dirancang secara orisinal untuk kepentingan literasi keamanan digital publik.
