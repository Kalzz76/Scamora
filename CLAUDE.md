# CLAUDE.md - Gabungan Konteks & Instruksi Proyek

File ini menggabungkan dua dokumen proyek yang berbeda. Keduanya **tidak saling berlaku**: tech stack, gaya visual, dan aturan penulisan kode berbeda.

| Bagian | Proyek | Stack | Gaya |
| ------ | ------ | ----- | ---- |
| **A** | Scamora AI (frontend) | React 19 + TypeScript 5, Vite 6+, Tailwind CSS v4 | Clean Apple-style, layout Gainlove, palet navy-indigo |
| **B** | Portofolio Kaka Andrea Yahya | React 18 (JS/JSX), Vite, Tailwind CSS 3 | TODO (belum ditentukan) |

## Aturan Pemakaian Gabungan
1. Sebelum mengerjakan apa pun, tentukan proyek mana yang sedang dikerjakan, lalu **ikuti hanya bagian proyek itu**. Kalau belum jelas, tanya dulu.
2. Aturan di satu bagian **tidak boleh bocor** ke bagian lain. Contoh: larangan komentar kode dan batasan library di Bagian B tidak berlaku untuk Scamora; aturan etika "Indikasi Risiko" di Bagian A tidak berlaku untuk portofolio.
3. Jangan mencampur token warna, font, atau komponen antar proyek.
4. Kalau ada perbedaan antara bagian ini dan file lain di dalam proyek yang sama, bagian proyek yang bersangkutan yang jadi acuan final.
5. Desain referensi hanya acuan gaya dan tata letak. Jangan menyalin foto, ilustrasi, logo, atau teks dari referensi; semua visual harus buatan sendiri.

---

# BAGIAN A - Scamora AI Frontend

## 📌 Project Overview
**Scamora AI** is a digital threat intelligence and cyber-hygiene platform designed for the **MIT-Week 2026 Innovation Challenge**. It empowers users to detect early indications of phishing links and WhatsApp social engineering scams using rule-based heuristics and AI reasoning.

---

## 💻 Tech Stack
- **Framework:** React 19 + TypeScript 5 (Strict Mode)
- **Bundler:** Vite 6+
- **Styling:** Tailwind CSS v4 (configured via `@tailwindcss/vite` and `@theme` directives in `src/index.css`)
- **Icons:** `lucide-react` + Material Symbols Outlined
- **Routing:** `react-router-dom` (`HashRouter` for universal compatibility across static hosts/subpaths)
- **HTTP Client:** `axios` (with normalized error handling and mock switcher in `src/services/apiClient.ts`)
- **State Management:** In-memory React State + Local Storage bypass for zero-retention privacy compliance

---

## ⚡ Essential Commands
All frontend commands must be run inside the `frontend/` directory:

```bash
cd frontend

# Start local development server (with HMR)
npm run dev

# Run TypeScript check & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure (`frontend/src/`)

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── PrivacyModal.tsx   # Modal transparansi privasi, PII masking notice, & consent gate
│   │   ├── SimPanel.tsx       # Floating control widget to simulate failures (429, 503, partial Safe Browsing)
│   │   └── Stepper.tsx        # 4-stage diagnostic loading animation
│   └── layout/
│       ├── Navbar.tsx         # Sticky glass navigation with engine status badge & mobile menu
│       └── Footer.tsx         # Universal footer with ethical disclaimer & MIT-Week branding
├── features/
│   ├── home/
│   │   └── HomePage.tsx       # Hero dua kolom ala Gainlove, CTA langsung, kartu fitur, showcase demo
│   ├── url-checker/
│   │   └── UrlCheckerPage.tsx # P0: URL input, protocol badge (HTTPS/HTTP), 2048-char counter, demo pills
│   ├── chat-detector/
│   │   └── ChatDetectorPage.tsx # P0: WhatsApp chat textarea (10-5000 char), live PII masking preview
│   ├── risk-report/
│   │   └── ReportPage.tsx     # P0: Risk score gauge (0-100), 3 official categories, verified quotes, actions
│   ├── panduan/
│   │   └── PanduanPage.tsx    # P0/P1: Incident response guides & 6-point interactive security checklist
│   ├── challenge/
│   │   └── QuizPage.tsx       # P1: Guardian Challenge 6 interactive quiz cases with instant explanations
│   └── knowledge/
│       └── KnowledgePage.tsx  # P1: Scam encyclopedia (APK, Task scam, Bank phishing, Vishing OTP)
├── lib/
│   ├── constants.ts           # Risk categories, demo presets, scoring thresholds, metadata
│   └── utils.ts               # cn() helper (clsx + twMerge), escapeHtml(), formatDateTime()
├── services/
│   ├── apiClient.ts           # Axios client configured with VITE_API_BASE_URL
│   ├── analysisService.ts     # Smart switcher between Mock Engine & real Laravel API (VITE_USE_MOCK)
│   └── mockAnalyzer.ts        # Fully-typed client-side heuristic engine & PII scrubbing
├── types/
│   ├── analysis.ts            # Type definitions: RiskLevel, Indicator, PipelineCheck, AnalysisResult
│   └── api.ts                 # API contracts: AnalyzeUrlPayload, AnalyzeChatPayload, ApiResponse
├── App.tsx                    # Route definitions, global modals, and session state
├── index.css                  # Tailwind v4 @theme tokens, base styles, shared utilities, scrollbars
└── main.tsx                   # React root entry point
```

---

## 🎨 Design System & Theme Tokens (Tailwind CSS v4)
Design aesthetic: **Clean Apple-style dengan layout layanan publik ala Gainlove dan palet navy-indigo**. Canvas terang, kartu putih membulat, whitespace lega, bayangan lembut, navigasi kaca translusen. Kesan yang dikejar: tenang, tepercaya, dan mudah dipahami masyarakat umum, bukan "hacker console".

### Referensi desain (acuan, jangan disalin)
- **Layout utama: Gainlove (nonprofit).** Hero dua kolom (teks kiri, visual kanan), judul besar, tiga kartu program membulat, bagian "Tentang" yang bersih. Tiga kartu itu dipetakan ke **Cek Link, Deteksi Chat, dan Panduan**.
- **Tekstur: login berlapis daun.** Hanya dipinjam efek kaca buram (glassmorphism) untuk `PrivacyModal` dan kartu hasil, serta lengkung organik halus sebagai pembatas antarbagian. Scamora **tidak punya halaman login**.
- **Little Learners: tidak dipakai.** Gaya ilustrasi anak-anak dinilai terlalu ringan untuk topik penipuan.
- **Palet: navy-indigo dengan aksen emas** (lihat token di bawah).
- Semua ilustrasi, ikon, dan visual harus **buatan sendiri** (SVG, CSS, atau ikon `lucide-react`). Jangan memakai foto, ilustrasi, atau teks dari desain referensi.

### Token (`src/index.css` via `@theme`)
Nama token stabil; hanya nilai yang menentukan tampilan. **Jangan ganti nama token** karena komponen bergantung padanya.

- **Surface (Backgrounds):**
  - `--color-surface`: `#f5f6fa` (Canvas)
  - `--color-surface-container-lowest`: `#ffffff` (Kartu)
  - `--color-surface-container-low`: `#f9fafd`
  - `--color-surface-container`: `#eceef5` (Divider & pill aktif)
  - `--color-surface-container-high`: `#e0e3ee`
- **Teks & garis:**
  - `--color-on-surface`: `#2d3250` (Navy, teks utama)
  - `--color-on-surface-variant`: `#5b6185` (Teks sekunder, kontras minimal 4.5:1)
  - `--color-outline`: `#8b90ad`, `--color-outline-variant`: `#d5d8e6` (Garis tipis)
- **Brand & aksen:**
  - `--color-secondary`: `#424769` (Indigo, tombol dan tautan utama)
  - `--color-secondary-container`: `#2d3250` (Navy, hover, hero, footer)
  - `--color-secondary-fixed`: `#e6e8f3` (Latar chip lembut)
  - `--color-slate`: `#676f9d` (Dekoratif atau teks besar saja; kontras di bawah 4.5:1 untuk teks kecil)
  - `--color-accent`: `#f9b17a` (Emas, aksen kecil di atas latar navy)
- **Warna risiko (wajib tetap berbeda jelas dan tidak boleh diganti warna brand):**
  - **Risiko tinggi:** `--color-error`: `#d70015`, `--color-error-container`: `#ffe9ec`
  - **Perlu ditinjau:** palet amber (`bg-amber-500/10`, `text-amber-800`, `border-amber-500/40`)
  - **Risiko rendah:** `--color-on-tertiary-container`: `#248a3d` (hijau lembut)
  - Status risiko tidak boleh bergantung pada warna saja: selalu sertakan label resmi dan ikon.
  - **Emas `--color-accent` dilarang untuk tombol, status, atau indikator risiko.** Warnanya dekat dengan amber "Perlu ditinjau" dan bisa membingungkan pengguna.
- **Tipografi:**
  - UI: SF Pro dengan fallback Inter (`var(--font-sans)`), judul dengan letter-spacing rapat
  - Judul display (opsional): serif berlisensi bebas (misalnya Fraunces, OFL) lewat `var(--font-display)`, **hanya** untuk judul hero dan judul bagian di HomePage. Jangan dipakai di ReportPage, formulir, atau teks isi.
  - URL, kode, nilai teknis: SF Mono / JetBrains Mono (`var(--font-mono)`)
- **Bentuk & kedalaman:**
  - Radius: `--radius-lg` 0.875rem, `--radius-xl` 1.25rem, `--radius-2xl` 1.75rem
  - Bayangan: `--shadow-card` (diam), `--shadow-lift` (hover)
- **Utilitas bersama (`@layer components`):**
  - `.glass`: bar translusen blur untuk Navbar sticky dan `PrivacyModal`
  - `.card`: permukaan putih, `radius-xl`, `shadow-card`
  - `.card-interactive`: naik 2px dengan `shadow-lift` saat hover (hanya untuk kartu yang bisa diklik)

### Pola layout per halaman
- **HomePage:** hero dua kolom (kiri: judul dan CTA ganda "Cek Link" dan "Deteksi Chat"; kanan: mockup laporan risiko atau bentuk kapsul berisi ikon buatan sendiri). Di bawahnya tiga kartu fitur membulat, lalu bagian "Tentang" singkat dan showcase demo.
- **UrlChecker / ChatDetector:** satu kartu input besar di tengah, banyak ruang kosong, tombol utama indigo.
- **ReportPage:** kartu putih bersih, gauge tipis, label kategori resmi dengan warna risiko. Tanpa efek dekoratif yang mengganggu keterbacaan.
- **Mobile:** hero menumpuk satu kolom, visual di bawah teks; verifikasi di lebar 360px.

### Panduan visual
- Utamakan whitespace dan hierarki dibanding garis dan kotak. Satu warna aksen per tampilan selain warna risiko.
- Satu keluarga radius secara konsisten: besar untuk kartu, sedang untuk input dan tombol, penuh untuk pill.
- Gerak minimal dan bermakna (umpan balik aksi, Stepper pemuatan, kemunculan gauge skor). Tanpa animasi dekoratif di setiap elemen.
- Hormati `prefers-reduced-motion`.

---

## ⚖️ Strict Business Rules & Ethics (Non-Negotiable)
When modifying the UI or features, **you must preserve these rules**:
1. **Results are "Indikasi Risiko", NOT a Verdict:**
   - Never use words like *"100% Aman"* or *"Pasti Penipuan"*.
   - The 3 official categories are strictly:
     - `high`: **Indikasi risiko tinggi**
     - `review`: **Perlu ditinjau lebih lanjut**
     - `low`: **Indikator risiko rendah**
2. **Authentic Evidence is Mandatory:**
   - Every indicator card displayed in `ReportPage.tsx` must cite the authentic quote from user input (`ind.evidence`).
3. **Honest Failure Reporting:**
   - If external services fail (e.g. Safe Browsing or Claude AI timeout), the status must be `partial`. Category `low` is **forbidden** during partial/failed states (it must default to `review`).
4. **Zero-Retention Privacy:**
   - Raw chat text and URLs must never be saved in persistent local storage or transmitted unmasked.
   - PII (Indonesian phone numbers, NIK, bank accounts, OTPs) must be scrubbed before AI processing.

---

## 🔌 Backend Integration Contract
The frontend is ready to connect to a Laravel 13 backend.
Set in `frontend/.env`:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
Endpoints expected:
- `POST /api/v1/analyze/url` payload: `{ "url": string, "privacy_consent": boolean }`
- `POST /api/v1/analyze/chat` payload: `{ "text": string, "privacy_consent": boolean }`
- Expected JSON response schema is defined in `src/types/analysis.ts` (`AnalysisResult`).

---

## 🎯 Guidance for UI Customization
When Claude is tasked with modifying or restyling the frontend:
- **Visual-only changes.** Do not modify scoring logic (`mockAnalyzer.ts`, thresholds in `constants.ts`), service behavior, or API contracts. Restyle by changing classes, markup structure, and `@theme` values only.
- Keep all existing props and TypeScript interfaces intact in `src/types/analysis.ts`.
- Tailwind CSS v4 is used: use standard utility classes or customize `@theme` in `src/index.css`. Use theme tokens (`bg-surface`, `text-on-surface`, `text-secondary`, etc.) instead of hardcoded hex values in components.
- Ensure all interactive elements have visible focus outlines for WCAG AA compliance (global `:focus-visible` style lives in `index.css`; do not remove it).
- Maintain text contrast of at least 4.5:1 for body text and 3:1 for large text and UI components. `--color-slate` and `--color-accent` do not meet 4.5:1 on light backgrounds; use them only decoratively or on navy.
- Do not copy photos, illustrations, or text from design references; all visuals must be original.
- Maintain responsive layouts across mobile (`sm`), tablet (`md`), and desktop (`lg/xl`); verify at 360px width.
- Changes to risk category labels, evidence quotes, partial-state handling, or privacy notices are out of scope for styling tasks. If a design change seems to require them, ask first.
- After any change, run `npm run build` to confirm the TypeScript check passes.

---

# BAGIAN B - Portofolio Kaka Andrea Yahya

Website portofolio pribadi milik **Kaka Andrea Yahya**, siswa SMKN 13 Bandung jurusan Rekayasa Perangkat Lunak (RPL) yang fokus pada pengembangan web dan mobile. Dibangun dengan **Vite + React + Tailwind CSS**, berupa **situs statis** tanpa backend dan tanpa database, dihosting gratis di **Cloudflare Pages**. Tidak ada login dan tidak ada halaman admin. Semua konten diubah lewat file data di `src/data/` dan `src/i18n/`.

## Konsep Visual
**TODO, belum ditentukan.** Tema, palet warna, font judul, dan gaya komponen belum dipilih. Jangan menentukan sendiri; **tanya dulu** dan minta referensi desain sebelum menulis styling.

Yang sudah pasti:
- **Satu layout untuk semua perangkat.** Scroll biasa, mobile first.
- **Bahasa**: dwibahasa, Indonesia (default) dan Inggris.
- **Target pengunjung**: calon pemberi kerja magang, juri lomba, guru, dan kolaborator. **Keterbacaan lebih penting daripada efek.**
- Animasi seperlunya dan bisa dimatikan lewat `prefers-reduced-motion`.

### Aturan Orisinalitas (WAJIB)
- Dilarang menyalin website atau karya orang lain: ilustrasi, karakter, logo, teks, dan tata letak harus buatan sendiri.
- Dilarang memakai nama, logo, karakter, atau gaya visual khas franchise berhak cipta.
- Font harus buatan sendiri atau berlisensi bebas (CC0/MIT/OFL), dicatat di `docs/CREDITS.md`.

## URUTAN KERJA (BACA DULU SEBELUM MENGERJAKAN APA PUN)

1. Baca bagian ini sampai selesai.
2. Kalau ada folder `referensi/` berisi desain (screenshot atau HTML), CV lama, atau kode lama buatan sendiri, baca untuk memahami selera visual dan gaya penulisan kode.
3. Baru tulis kode, mengikuti ATURAN PENULISAN KODE di bawah.

Kalau ada perbedaan antara file lain dan dokumen ini, **dokumen ini yang jadi acuan final**. Kalau ada bagian bertanda `TODO` atau data yang belum jelas, **tanya dulu**, jangan mengarang.

## ATURAN PENULISAN KODE (WAJIB DIPATUHI)

Kode di project ini harus sederhana dan bersih, terlihat ditulis manual oleh pelajar, bukan hasil generate.

1. **DILARANG menulis komentar di dalam kode.** Tidak ada `//`, `/* */`, `{/* */}` di JSX, dan komentar di CSS atau JSON.
2. **Kode harus sederhana.** Tidak boleh ada pola arsitektur rumit: tanpa Redux/Zustand, tanpa React Query, tanpa `useReducer`, tanpa higher-order component, tanpa render props, tanpa class component. State cukup `useState`, `useEffect`, `useRef`, dan `useContext` (untuk bahasa). `requestAnimationFrame` dan canvas: tanya dulu. Custom hook: tanya dulu.
3. **Hindari sintaks yang terlihat canggih**: `reduce` bertingkat, chaining `map().filter().map()` panjang, ternary bersarang, optional chaining bertumpuk, destructuring bertingkat, closure kompleks, `&&` berantai di JSX. Pakai `if`, `for`, `map` sederhana, dan fungsi biasa dengan nama jelas.
4. **Yang penting jalan dan tidak error.** Utamakan kode yang lurus dan mudah dibaca daripada kode yang pintar.
5. Nama variabel, fungsi, dan state boleh campur Indonesia/Inggris (`daftarProyek`, `bukaModal`, `bahasaAktif`, `handleKirim`). Nama komponen memakai PascalCase, satu komponen per file.
6. Semua teks untuk pengunjung (label, tombol, pesan error, pesan sukses) **tidak boleh ditulis langsung di komponen**. Ambil dari kamus bahasa lewat fungsi `t('kunci')`, dan tulis di `id.json` dan `en.json`.
7. Konten proyek, sertifikat, dan skill ditulis di `src/data/`, bukan di dalam komponen.
8. Styling memakai **Tailwind CSS**. Warna memakai token tema, jangan menulis kode hex langsung di komponen. Hex hanya boleh di `tailwind.config.js` dan blok `:root` di `src/styles/index.css` (sebagai variabel `--warna-*` yang dipakai CSS buatan sendiri). CSS buatan sendiri hanya untuk hal yang tidak bisa dengan Tailwind (font, `@keyframes`, tekstur).
9. Library tambahan yang diizinkan hanya: **framer-motion** (animasi). IntersectionObserver adalah API bawaan browser dan boleh dipakai. Library lain **tanya dulu**.
10. Fitur yang tidak ada di dokumen ini tidak boleh ditambahkan hanya karena terpikir bagus. Kalau ragu, tanya dulu.
11. `localStorage` dan `window` selalu dibungkus pemeriksaan aman (`try ... catch` untuk `localStorage`).
12. Jangan hardcode secret. Kunci layanan form dibaca dari `import.meta.env.VITE_WEB3FORMS_KEY`.
13. Teks yang **tampil di layar** boleh berisi tanda kutip atau simbol apa pun. Larangan komentar hanya berlaku untuk **kode sumber**.

Aturan ini berlaku untuk semua perubahan berikutnya, tanpa perlu diingatkan lagi.

## Tech Stack

- **Build tool**: Vite. **UI**: React 18 (JavaScript/JSX, bukan TypeScript).
- **Styling**: Tailwind CSS 3 lewat npm, token warna di `tailwind.config.js`.
- **Animasi**: framer-motion (`motion`, `whileInView`) dan CSS `@keyframes`, seperlunya.
- **Ikon**: SVG inline buatan sendiri. Tanpa library ikon.
- **Font** (Google Fonts, OFL, `display=swap`): **Inter** untuk isi dan paragraf. Font judul `TODO`. Semua harus berlisensi OFL dan dicatat di `docs/CREDITS.md`.
- **Form kontak**: Web3Forms, dipanggil dengan `fetch`. **Hosting**: Cloudflare Pages.

Perintah: `npm install`, `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

## Struktur Project

```
portfolio-kaka/
├── public/
│   ├── cv/                    CV_Kaka_ID.pdf, CV_Kaka_EN.pdf
│   ├── favicon.png
│   └── og-image.png           1200x630
├── src/
│   ├── assets/                logo-kaka.svg, potret-kaka.webp (opsional), proyek/
│   ├── components/
│   │   ├── sections/          Hero, Tentang, Keahlian, Proyek, Pencapaian, Kontak
│   │   └── ui/                Navbar, KartuInfo, KartuTeknologi, KartuProyek, KartuPencapaian, Modal, Tombol, TombolBahasa, Footer
│   ├── data/                  proyek.js, sertifikat.js, keahlian.js, profil.js, bab.js
│   ├── i18n/                  id.json, en.json, KonteksBahasa.jsx
│   ├── styles/                index.css
│   ├── App.jsx
│   └── main.jsx
├── docs/CREDITS.md
├── referensi/
├── .env.example               VITE_WEB3FORMS_KEY=
├── tailwind.config.js
└── vite.config.js
```

Nama komponen di atas adalah usulan awal dan boleh disesuaikan.

## Akses dan Pengelolaan Konten

- Tidak ada login, role, atau admin. Memperbarui konten cukup mengedit `src/data/` dan `src/i18n/`, lalu `git push`.
- Tombol unduh CV mengikuti bahasa aktif: `CV_Kaka_ID.pdf` atau `CV_Kaka_EN.pdf`.

## Navigasi
- **Navbar** sticky: logo "Kaka", menu **Home, About, Skills, Projects, Achievements, Contact** (label ikut bahasa), hash `#hero`, `#tentang`, `#keahlian`, `#proyek`, `#pencapaian`, `#kontak`. Kanan: `TombolBahasa` dan hamburger (mobile). **Di mobile semua tombol tampil bersamaan di lebar 360 px.**
- Klik menu menggulir halus ke bab tujuan (`scroll-behavior: smooth`, nonaktif saat reduced-motion). Link dengan hash yang dibuka langsung dari URL melompat tanpa animasi.
- Bab aktif ditandai dengan IntersectionObserver (ambang 0.5). `scroll-margin-top` sebesar tinggi navbar.

## Isi Tiap Bab

Elemen muncul dengan `whileInView` sederhana (opacity 0 ke 1, naik 24 px, sekali), dan dimatikan saat reduced-motion.

### 1. Hero — `#hero`
Layar penuh. Label kecil "PENGEMBANG WEB & MOBILE · BANDUNG", judul "Kaka Andrea Yahya", peran "Software Engineering Student", tagline satu kalimat, dan dua tombol: **Lihat Proyek** (gulir ke `#proyek`) dan **Unduh CV** (tulisan tombol diatur lewat i18n). Teks utama, tombol bahasa, dan tombol menu muncul tanpa menunggu animasi.

### 2. Tentang — `#tentang`
- Potret (`potret-kaka.webp`, kalau tidak ada tampilkan inisial "K" sebagai pengganti), nama, gelar "Pengembang Web & Mobile", dan paragraf bio.
- Empat `KartuInfo`: **Asal** (Bandung), **Akademi** (SMKN 13 Bandung, RPL), **Organisasi** (IRMA), **Bahasa** (Indonesia aktif, Inggris dasar, Sunda dasar).
- **Dilarang** menampilkan level, statistik, atau angka kemampuan karangan.

### 3. Keahlian — `#keahlian`
Empat kelompok, tiap kelompok berisi `KartuTeknologi`: **simbol 2 huruf** besar (contoh `Js`) dan nama teknologi di bawahnya.

| Kelompok            | Isi                                  |
| ------------------- | ------------------------------------ |
| Bahasa Pemrograman  | HTML, CSS, JavaScript, PHP, C#, Dart |
| Framework           | Laravel, Flutter                     |
| Database & Cloud    | MySQL, AWS                           |
| Desain              | Figma, Canva                         |

**Dilarang persentase, bar, atau level.** Nama teknologi asli selalu tampil.

### 4. Proyek — `#proyek`
Judul, filter pil **Semua, Web, Mobile, Lainnya**, dan grid 1 kolom di HP, 2 di tablet, 3 di desktop. Semua proyek tampil (tanpa pagination).

`KartuProyek`:
- Gambar proyek (atau placeholder), **judul**, ringkasan, dan badge teknologi.
- Label status "Selesai" kalau `status` proyek `Selesai`.
- Tombol **Lihat Detail** membuka `Modal`: gambar, deskripsi lengkap, daftar teknologi, serta tombol link demo dan GitHub (hanya kalau ada). Ditutup lewat tombol Tutup, klik di luar kotak, atau `Esc`, dan fokus kembali ke pemicu.

### 5. Pencapaian — `#pencapaian`
Dua tab: **Lomba** dan **Sertifikat**. Tiap item berupa `KartuPencapaian`: nama, penyelenggara, tahun, keterangan, dan link kalau ada. Dilarang menampilkan juara atau gelar yang belum benar-benar diraih.

### 6. Kontak — `#kontak`
Dua kolom (bertumpuk di HP):
- Kiri: tautan **GitHub, LinkedIn, Email, Unduh CV** (dengan `aria-label`).
- Kanan: form kontak.
- Saat berhasil: pesan sukses dari kamus bahasa.

### Footer
Teks hak cipta, ringkasan kredit aset, dan tombol kembali ke atas.

### Form Kontak
- Kolom: Nama, Email, Pesan, dan kolom jebakan tersembunyi `website` (honeypot, harus kosong).
- Validasi sederhana dengan `if` di `handleKirim`: nama dan pesan tidak boleh kosong, email harus mengandung `@` dan titik, pesan maksimal 1000 karakter. Pesan error dari kamus bahasa.
- Kalau honeypot terisi, berhenti diam-diam tanpa mengirim.
- Kirim dengan `fetch` ke `https://api.web3forms.com/submit` memakai `VITE_WEB3FORMS_KEY`. Cek dokumentasi Web3Forms sebelum menulis parameter.
- Tombol dinonaktifkan saat mengirim dan 30 detik setelah berhasil.
- Kalau gagal: pesan ramah dan tombol alternatif **Kirim lewat Email** (`mailto:`). Jangan tampilkan error teknis mentah.

## Dwibahasa (ID/EN)
- Default Indonesia. Kunjungan pertama membaca `navigator.language`. Pilihan disimpan di `localStorage` kunci `bahasaPilihan`.
- `KonteksBahasa.jsx` menyediakan `bahasaAktif`, `gantiBahasa`, `t('kunci')`. Kunci bertingkat dipisah titik dan dibaca dengan perulangan `for`, bukan `reduce`.
- `id.json` dan `en.json` harus punya kunci identik. Kunci tidak ditemukan: `t` mengembalikan kunci itu sendiri.
- Data berbahasa ganda: `{ id: '...', en: '...' }`, dibaca `data[bahasaAktif]`. Perbarui `document.documentElement.lang` dan `document.title` saat bahasa berganti.
- Nama orang, proyek, teknologi, dan lomba tidak diterjemahkan.

## Daftar Aset

| Aset                | Keterangan                                                         | Wajib? |
| ------------------- | ------------------------------------------------------------------ | ------ |
| `logo-kaka.svg`     | Logo teks "Kaka"                                                   | Ya (boleh dari teks dulu) |
| `potret-kaka.webp`  | Foto atau ilustrasi, rasio 1:1, sekitar 600 x 600                   | Opsional, `TODO` |
| Gambar proyek       | Screenshot di `src/assets/proyek/`, rasio 16:10                     | `TODO` per proyek |
| `og-image.png`      | 1200 x 630                                                          | Ya |
| `CV_Kaka_ID.pdf`, `CV_Kaka_EN.pdf` | CV dua bahasa di `public/cv/`                          | Ya |

Gunakan **placeholder** untuk aset yang belum ada dan beri tahu. Jangan mengambil gambar dari internet tanpa lisensi jelas.

## Struktur Data
- **`profil.js`**: `nama`, `peran`, `tagline`, `tentang` (semuanya `{ id, en }` bila teks), `lokasi`, `github`, `linkedin`, `email`, `pendidikan`, `organisasi`, `bahasa`.
- **`proyek.js`**: `id`, `judul`, `kategori` (`Web` / `Mobile` / `Lainnya`), `status` (`Selesai` / `Berjalan`), `ringkasan` dan `deskripsi` (`{ id, en }`), `teknologi` (array), `gambar` atau `null`, `linkDemo` atau `null`, `linkGithub` atau `null`, `tahun`.
- **`sertifikat.js`**: `id`, `nama`, `jenis` (`Lomba` / `Sertifikat`), `penyelenggara`, `tahun`, `keterangan` (`{ id, en }`), `link` atau `null`.
- **`keahlian.js`**: array kelompok `{ kelompok: 'bahasa' | 'framework' | 'database' | 'desain', nama: { id, en }, daftar: [{ nama, simbol }] }`, hanya 4 kelompok. Contoh simbol: HTML `Ht`, CSS `Cs`, JavaScript `Js`, PHP `Ph`, C# `C#`, Dart `Da`, Laravel `La`, Flutter `Fl`, MySQL `My`, AWS `Aw`, Figma `Fi`, Canva `Ca`.
- **`bab.js`**: hash dan kunci i18n per bab.

## Data Awal (dari CV, perlu diverifikasi)
Titik awal dari CV lama. Item bertanda `TODO` menunggu jawaban Kaka. **Jangan mengarang** angka, tahun, link, atau pencapaian.

**Profil**: Kaka Andrea Yahya, Bandung. Peran Software Engineering Student, Web & Mobile Developer. GitHub `https://github.com/Kalzz76`. LinkedIn `TODO`. Email publik `TODO` (di CV tertulis rafliar99@gmail.com, konfirmasi dulu). Nomor telepon **tidak ditampilkan** di website. Pendidikan SMKN 13 Bandung, RPL, tahun `TODO` (CV tertulis 2024-2026). Organisasi IRMA (Ikatan Remaja Masjid). Bahasa: Indonesia (aktif), Inggris (dasar, A1), Sunda (dasar). Bio singkat `TODO` (Kaka menulis 2 sampai 3 kalimat).

**Proyek** (semua `TODO` untuk gambar, link demo, link GitHub, tahun, dan konfirmasi `status`)
1. Website Mapping Klinik Pratama Bumi Sehat Bahagia. Web, Laravel. Sistem informasi layanan kesehatan dan pemetaan.
2. Classio, sistem manajemen sekolah terintegrasi. Web, teknologi `TODO` (CV tertulis C#, pastikan ASP.NET atau Blazor).
3. Sistem Peminjaman Perpustakaan. Web, Laravel. Aplikasi manajemen sirkulasi buku.
4. `TODO` proyek terbaru sejak CV terakhir.

**Pencapaian dan sertifikat** (tahun dan link `TODO`)
- Lomba: Jagoan Hosting Infra Competition (JHIC) 2025, Semi-Finalist. Samsung Innovation Campus Batch 6 (2024/2025), peserta.
- Sertifikat: AWS Academy Cloud Foundations. AWS Academy Architecting. Dicoding Pemrograman Dart (Dasar).
- `TODO` lomba dan sertifikat terbaru.

**Keahlian** (hanya yang ada di CV): Bahasa Pemrograman HTML, CSS, JavaScript, PHP, C#, Dart. Framework Laravel, Flutter (`TODO` konfirmasi React dan Tailwind CSS). Database & Cloud MySQL, AWS. Desain Figma, Canva.

**Perbaikan ejaan** dari CV lama: "Pemrograman", "Batch", "AWS", "PHP".

## Keamanan dan Privasi
- Nomor HP, alamat rumah, dan data pribadi sensitif tidak boleh muncul di kode atau teks website.
- `VITE_WEB3FORMS_KEY` ada di `.env` (tidak di-commit) dan di environment Cloudflare Pages. `.env.example` hanya berisi nama variabel.
- Link eksternal memakai `target="_blank"` dan `rel="noopener noreferrer"`. Jangan tampilkan error teknis ke pengunjung.

## Performa, Aksesibilitas, dan SEO
- Target Lighthouse mobile: Performance minimal 85, Accessibility minimal 95, SEO minimal 95. Muat awal di bawah 1 MB.
- Animasi hanya `transform` dan `opacity`. `will-change: transform` hanya pada elemen yang sedang bergerak. Hindari `filter: blur` pada elemen besar yang beranimasi.
- **Keamanan visual (fotosensitif)**: tidak ada elemen yang berkedip lebih dari 3 kali per detik dan tidak ada kilatan putih layar penuh.
- Gambar bermakna punya `alt`; elemen dekoratif memakai `aria-hidden="true"`.
- Semua bisa dioperasikan dengan keyboard, fokus terlihat jelas, modal mengembalikan fokus ke pemicu.
- Kontras teks minimal 4.5:1.
- **Mobile first.** Semua bab nyaman di lebar 360 px.
- `index.html`: `title`, `meta description`, Open Graph, `theme-color`, favicon.

## Deploy ke Cloudflare Pages
1. Push repo ke GitHub (akun Kalzz76). 2. Cloudflare Pages, Create project, hubungkan repo. 3. Build command `npm run build`, output `dist`. 4. Environment variables `NODE_VERSION` = `20` dan `VITE_WEB3FORMS_KEY`. 5. Setiap `git push` ke `main` otomatis ter-deploy. 6. Domain sendiri bisa ditambahkan belakangan.

## Urutan Pengerjaan Modul
Setelah tiap tahap pastikan `npm run dev` jalan dan `npm run build` berhasil.

1. **Fondasi**: Vite + React + Tailwind (token, font), `index.css`, struktur folder, `docs/CREDITS.md`. Konsep visual harus sudah ditentukan lebih dulu (lihat `Konsep Visual`).
2. **Bahasa**: `KonteksBahasa`, `id.json`, `en.json`, `TombolBahasa`.
3. **Kerangka**: `Navbar`, `Tombol`, `Footer`, enam section kosong dengan data dan judul.
4. **Konten inti**: Tentang (`KartuInfo`), Keahlian (`KartuTeknologi`), Pencapaian (tab).
5. **Proyek**: `KartuProyek`, filter, `Modal`.
6. **Form kontak** dengan validasi, honeypot, Web3Forms, dan `mailto:` cadangan.
7. **Animasi masuk** sederhana dan dukungan reduced-motion.
8. **Penutup**: uji di HP asli, aksesibilitas, optimasi, SEO, deploy.

## Catatan Penting
- Semua konten di `src/data/` dan `src/i18n/`, kedua bahasa harus selalu lengkap.
- Aset yang belum ada: pakai placeholder dan beri tahu. Jangan commit file mentah besar atau `.env`. Commit kecil dan jelas.
- **Belum dikerjakan (ditunda, jangan ditambahkan kecuali diminta):** 3D, video intro, peta interaktif, parallax kompleks, game mini, blog, CMS atau admin, login, database, mode terang/gelap tambahan, bahasa ketiga, PWA, React Router, integrasi API GitHub, chatbot, statistik skill berbentuk persen atau level, kursor kustom, pintasan keyboard satu tombol, suara atau musik latar.
- **Tampilan awal harus sudah bisa dinavigasi oleh screen reader**: Hero muncul tanpa menunggu animasi atau interaksi. Teks utama, tombol bahasa, dan tombol menu harus sudah ada di DOM sejak awal dengan `aria-label` yang proper.