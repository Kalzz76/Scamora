# Backend Scamora (SIGUARD): API Deteksi Penipuan Digital

Backend REST API untuk platform pendeteksi potensi penipuan digital (MIT-Week 2026, studi kasus "The Trust Trap"). Pengguna memeriksa URL mencurigakan atau menempelkan chat WhatsApp, lalu menerima laporan indikasi risiko berisi skor, bukti dari input, penjelasan, dan saran tindakan. Dibangun dengan Express.js v5 dan TypeScript. Frontend (React 19 + Vite) ada di folder `frontend/` dan sudah selesai, backend ini menggantikan mock analyzer yang sekarang berjalan di browser.

File ini berada di `backend/CLAUDE.md` dan khusus untuk pekerjaan backend. `CLAUDE.md` di root project tetap berlaku untuk hal umum dan frontend.

## URUTAN KERJA (BACA DULU SEBELUM MENGERJAKAN APA PUN)

1. Baca `CLAUDE.md` ini sampai selesai.
2. **Buka kontrak data frontend lebih dulu:** `frontend/src/types/api.ts` dan `frontend/src/types/analysis.ts`. Dua file itu adalah bentuk request dan response yang diharapkan frontend.
3. Buka `frontend/src/services/apiClient.ts` dan `frontend/src/services/analysisService.ts` untuk melihat cara frontend memanggil API (base URL, path endpoint, penanganan error).
4. Buka `frontend/src/services/mockAnalyzer.ts` sebagai contoh logika yang harus dipindahkan ke backend (heuristik URL, pola chat, masking, hitung skor).
5. Kalau perlu detail lain, baca blueprint `Plan_Website_Deteksi_Penipuan_AI*.docx` di root project.
6. Baru tulis kode, mengikuti ATURAN PENULISAN KODE di bawah.

**Urutan acuan kalau ada perbedaan:**

- **Bentuk request dan response (nama field, tipe, status HTTP)**: `frontend/src/types/*.ts` yang jadi acuan final, karena frontend yang memanggil backend.
- **Logika deteksi, bobot, ambang, dan aturan kategori**: bagian "Penilaian Risiko" di file ini (diambil dari blueprint). Kalau `mockAnalyzer.ts` berbeda dari file ini, jangan diam-diam memilih salah satu. Ikuti file ini, lalu laporkan perbedaannya ke pemilik project.
- Untuk hal lain, `CLAUDE.md` ini jadi acuan final.

## Keputusan Kontrak Frontend (Mapping Acuan)

Kontrak data frontend (`frontend/src/types/api.ts` dan `analysis.ts`) adalah acuan final untuk struktur data:

| Komponen | Kontrak Frontend (Dipakai) | Catatan / Mapping dari Spesifikasi Awal |
| --- | --- | --- |
| Field Consent Request | `privacy_consent` (boolean) | Nilai wajib `true`. Jangan buat alias. |
| Envelope Respons Sukses | `{ success: true, data: AnalysisResult }` | HTTP 200 untuk `complete` dan `partial`. |
| Envelope Respons Error | `{ success: false, error: { code, message, details? } }` | HTTP 422, 429, 500, 503 (`ANALYSIS_UNAVAILABLE`). |
| Status Pemeriksaan (`checks[].status`) | `completed`, `partial`, `failed`, `skipped` | Mapping: dari `ok` menjadi `completed`. |
| Alasan Kategori (`category_reason`) | `score`, `critical_indicator`, `inconclusive`, `partial_data` | `incomplete_check` → `partial_data`, `cannot_conclude` → `inconclusive`. |
| Jenis Penipuan (`scam_type`) | `phishing`, `job_scam`, `giveaway_scam`, `impersonation`, `banking_fraud`, `investment_scam`, `apk_malware`, `unknown` | Nilai di luar daftar diganti `unknown`. |
| Field Indikator (`indicators[]`) | `type`, `title`, `severity`, `weight`, `source`, `evidence`, `description` | `title` dan `source` diisi, `description` menggantikan `reason`. `title` per tipe disimpan di `config/scoring.ts`. |
| Field Tambahan Analisis | `analysis_type` (`url` \| `chat`), `input_sanitized`, `timestamp` | `input_sanitized` berisi versi bersih/dimasker (hanya di response, dilarang di-log/disimpan). |
| Port Server Lokal | `8000` | Menyesuaikan default `VITE_API_BASE_URL` di frontend. |

## ATURAN PENULISAN KODE (WAJIB DIPATUHI)

Kode di project ini harus sederhana dan bersih, terlihat ditulis manual oleh pelajar, bukan hasil generate.

1. **DILARANG menulis komentar di dalam kode.** Tidak ada `//`, tidak ada `/* */`, tidak ada JSDoc (`/** */`).
2. **Kode harus sederhana.** Tidak boleh ada abstraksi berlebihan: tidak perlu class berlapis, dependency injection, decorator, design pattern (Repository, Factory, dll), atau layer arsitektur tambahan. Tulis function biasa dan export per file.
3. **Hindari sintaks yang terlihat aneh atau canggih**: chaining `map/filter/reduce` bertingkat, generic atau conditional type yang rumit, optional chaining bertumpuk (`?.?.`), ternary bersarang, destructuring bersarang dalam. Pakai `if`, `for`, `for...of`, dan function biasa. `async/await` boleh karena memang dibutuhkan untuk memanggil API luar.
4. **Yang penting jalan dan tidak error.** Utamakan kode yang lurus dan mudah dibaca daripada kode yang pintar.
5. TypeScript strict tetap aktif. Tulis tipe sederhana dengan `type` atau `interface`, hindari `any`.
6. Nama file dan nama function memakai bahasa Inggris dalam camelCase (`riskScoring.ts`, `maskPii`, `cekReputasi` boleh campur Indonesia seperti `hitungSkor`). Nama field di JSON response **wajib persis** sesuai kontrak (snake_case: `risk_score`, `analysis_status`).
7. Semua teks yang tampil ke pengguna (`explanation`, `recommended_actions`, `limitations`, `note`, pesan error) ditulis dalam **Bahasa Indonesia**, bahasa awam, tanpa istilah teknis.
8. Validasi input dan output AI memakai **Zod**. Jangan percaya validasi frontend.
9. **Dilarang memakai ORM** (Prisma, TypeORM, Sequelize, dll). Kalau butuh database, pakai `@supabase/supabase-js`.
10. **Jangan menambah dependency baru** kalau bisa diselesaikan dengan Node.js bawaan atau paket yang sudah ada.
11. Aturan ini berlaku untuk semua perubahan berikutnya, tanpa perlu diingatkan lagi.

## Prinsip Sistem (Aturan Bisnis Utama)

Ini yang paling sering dinilai juri dan tidak boleh dilanggar:

- Hasil berupa **indikasi risiko**, bukan vonis. Dilarang menyatakan "pasti penipuan" atau "pasti aman".
- Skor risiko adalah ringkasan indikator berbasis aturan, **bukan probabilitas**.
- Hanya tiga kategori: `high` (indikasi risiko tinggi), `review` (perlu ditinjau lebih lanjut), `low` (indikator risiko rendah).
- Setiap hasil wajib memuat: indikator beserta bukti dari input, penjelasan, saran tindakan, status pemeriksaan (`checks`), dan keterbatasan (`limitations`).
- Hasil **harus berasal dari pemrosesan input pengguna yang sebenarnya**, bukan simulasi. Contoh demo diproses lewat alur analisis yang sama.
- URL yang tidak ditemukan di basis data ancaman **tidak boleh disimpulkan aman**. Tulis "tidak ditemukan pada daftar ancaman yang diperiksa".
- Kalau layanan eksternal gagal, tampilkan status gagal secara jujur, jangan pura-pura berhasil.
- Setiap indikator dari AI wajib didukung kalimat asli dari input. Indikator tanpa bukti valid dibuang.
- Backend **tidak membuka, mengunduh, atau mengeksekusi isi URL** milik pengguna, dan tidak mengikuti redirect.
- Data pribadi di teks chat dimasker sebelum dikirim ke AI.
- Input mentah (URL dan chat) **tidak disimpan** dan **tidak boleh masuk ke log**, pesan error, atau analitik.

## Tech Stack Backend

| Komponen | Pilihan |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js v5 |
| Bahasa | TypeScript (strict) |
| Dev runner | ts-node-dev (hot reload) |
| Validasi | Zod |
| AI analisis chat | Claude API lewat `@anthropic-ai/sdk` |
| Reputasi URL | Google Safe Browsing API (dipanggil dengan `fetch` bawaan Node) |
| Rate limit | `express-rate-limit` |
| Header keamanan dan CORS | `helmet` dan `cors` |
| Cache | In-memory (Map) berdasarkan hash URL |
| Database | Tidak dipakai di MVP (lihat bagian Database) |
| Test | Vitest |
| Deploy | Vercel (project terpisah, Root Directory `backend`) |

Frontend (referensi): React 19, Vite, Tailwind v4, Axios, Zod, React Query. Dev server di `http://localhost:5173`.

Model Claude dibaca dari environment variable `CLAUDE_MODEL`, jangan ditulis langsung di kode. Pilih model yang cepat dan murah karena timeout AI hanya 10 detik.

## Struktur Project

```
Scamora/
├── CLAUDE.md                   pedoman umum (root)
├── Plan_Website_Deteksi_...docx blueprint
├── frontend/                   React + Vite (sudah selesai)
└── backend/
    ├── CLAUDE.md               file ini
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── src/
    │   ├── server.ts           jalankan server di port lokal (app.listen)
    │   ├── app.ts              setup Express dan export default app (dipakai Vercel)
    │   ├── config/
    │   │   ├── env.ts          baca dan validasi .env dengan Zod
    │   │   └── scoring.ts      bobot indikator, ambang kategori, daftar parameter sensitif
    │   ├── routes/
    │   │   ├── index.ts        pasang semua route di /api/v1
    │   │   ├── analyze.routes.ts
    │   │   ├── demo.routes.ts
    │   │   └── health.routes.ts
    │   ├── controllers/
    │   │   ├── analyze.controller.ts
    │   │   └── demo.controller.ts
    │   ├── schemas/
    │   │   ├── analyze.schema.ts      aturan input url dan chat
    │   │   └── aiOutput.schema.ts     skema JSON dari Claude
    │   ├── services/
    │   │   ├── urlAnalyzer/
    │   │   │   ├── index.ts           orkestrasi pemeriksaan URL
    │   │   │   ├── sanitizeUrl.ts     hapus userinfo dan token sensitif
    │   │   │   ├── structureCheck.ts  heuristik struktur URL
    │   │   │   └── safeBrowsing.ts    panggil Google Safe Browsing
    │   │   ├── chatAnalyzer/
    │   │   │   ├── index.ts           orkestrasi analisis chat
    │   │   │   ├── maskPii.ts         masking data pribadi
    │   │   │   ├── patternScan.ts     pemindaian pola lokal (fallback)
    │   │   │   ├── claudeClient.ts    panggil Claude, retry satu kali
    │   │   │   └── validateEvidence.ts cocokkan evidence_quote dengan teks input
    │   │   └── riskScoring/
    │   │       ├── index.ts           hitung raw_score, risk_score, kategori
    │   │       └── categoryRules.ts   aturan khusus kategori
    │   ├── middlewares/
    │   │   ├── rateLimit.ts
    │   │   ├── validate.ts            middleware pakai skema Zod
    │   │   └── errorHandler.ts        format error seragam, tanpa isi input
    │   ├── types/
    │   │   └── analysis.ts            tipe hasil analisis (samakan dengan frontend)
    │   └── data/
    │       └── demoExamples.ts        contoh URL dan chat fiktif
    └── tests/
        ├── riskScoring.test.ts
        ├── maskPii.test.ts
        ├── structureCheck.test.ts
        ├── validateEvidence.test.ts
        ├── contract.test.ts           contoh response dari blueprint
        └── fixtures/                  dataset uji berlabel (URL dan chat)
```

Jangan membuat folder yang belum dibutuhkan (`models/`, `auth/`, `moderation/`, dst). Itu untuk tahap P2.

## Alur Request

`routes → middleware (rate limit, validasi) → controller → service → riskScoring → response`

- **routes**: hanya daftar alamat endpoint, tanpa logika.
- **controllers**: ambil input, panggil service, kirim JSON.
- **services**: semua logika deteksi.
- **schemas**: tolak input atau output AI yang bentuknya salah.
- **config**: angka yang sering diubah (bobot, ambang) dipisah dari kode supaya bisa dikalibrasi.

Pipeline analisis:

1. Normalisasi dan validasi input.
2. Masking data pribadi (khusus chat).
3. Analisis aturan lokal menghasilkan indikator.
4. Pemeriksaan eksternal (Safe Browsing untuk URL, Claude untuk chat) menambah indikator dan dicatat statusnya.
5. Indikator tanpa bukti valid dibuang, skor dihitung, lalu dipetakan ke kategori.
6. Hasil dikembalikan dalam struktur yang sama untuk `complete`, `partial`, dan `failed`.

Express 5 menangani error dari function async otomatis, tetapi `errorHandler.ts` tetap wajib ada.

## Endpoint

Semua di bawah prefix `/api/v1`.

| Metode | Path | Fungsi | Prioritas |
| --- | --- | --- | --- |
| GET | `/health` | Cek server hidup | P0 |
| POST | `/analyze/url` | Analisis URL, kembalikan laporan risiko | P0 |
| POST | `/analyze/chat` | Analisis teks chat WhatsApp, kembalikan laporan risiko | P0 |
| GET | `/demo-examples` | Daftar contoh URL dan chat fiktif (berlabel simulasi) | P0 |

Endpoint lain di blueprint (`/checklists`, `/knowledge`, `/challenges`, auth, komunitas, admin) **ditunda**. Kerjakan hanya kalau frontend benar-benar memanggilnya (cek `analysisService.ts`). Tidak ada login dan tidak ada dashboard admin di MVP.

### Validasi input

| Endpoint | Aturan |
| --- | --- |
| `/analyze/url` | `url` wajib; skema `http` atau `https`; maksimum 2.048 karakter; host valid; `privacy_consent` harus `true` |
| `/analyze/chat` | `text` wajib setelah trim; 10 sampai 5.000 karakter (dapat dikonfigurasi); `privacy_consent` harus `true` |

Teks yang terlalu panjang **ditolak**, tidak dipotong diam-diam.

### Kode error

| HTTP | Kode | Keterangan |
| --- | --- | --- |
| 422 | `VALIDATION_ERROR` | Input kosong, terlalu panjang, atau format salah. Body hanya berisi `error` (dengan `fields`) |
| 429 | `RATE_LIMITED` | Terlalu banyak permintaan |
| 503 | `ANALYSIS_UNAVAILABLE` | Analisis gagal total. Dikembalikan sebagai envelope error HTTP 503 |
| 500 | `INTERNAL_ERROR` | Kesalahan server. Pesan **tidak boleh** memuat isi input pengguna |

`complete` dan `partial` dikirim dengan HTTP 200 di dalam envelope `{ success: true, data: AnalysisResult }`. `failed` dikirim dengan envelope error HTTP 503 `ANALYSIS_UNAVAILABLE`.

## Struktur Respons Analisis

Semua respons hasil analisis punya field yang sama. **Field tidak pernah dihilangkan**, nilai yang tidak berlaku diisi `null` atau array kosong.

| Field | Tipe | complete | partial | failed |
| --- | --- | --- | --- | --- |
| `analysis_status` | string | wajib | wajib | wajib |
| `risk_level` | string atau null | terisi | terisi | null |
| `raw_score` | integer atau null | terisi | terisi | null |
| `risk_score` | integer atau null | terisi | terisi | null |
| `category_reason` | string atau null | terisi | terisi | null |
| `scam_type` | string atau null | boleh null | boleh null | null |
| `indicators` | array | wajib (boleh kosong) | wajib (boleh kosong) | array kosong |
| `checks` | array | wajib | wajib | wajib |
| `explanation` | string atau null | wajib | wajib | null |
| `recommended_actions` | array | wajib | wajib | saran umum |
| `limitations` | array | wajib | wajib | wajib |
| `error` | object | tidak ada | tidak ada | wajib |

- `analysis_status`: `complete`, `partial`, atau `failed`.
- `risk_level`: `high`, `review`, atau `low`.
- `category_reason`: `score`, `critical_indicator`, `inconclusive`, atau `partial_data`.
- Setiap item `indicators`: `type`, `title`, `severity`, `weight`, `source`, `evidence`, `description`.
- Setiap item `checks`: `name`, `status` (`completed`, `partial`, `failed`, atau `skipped`), dan `note` (opsional). Nama check: `structure`, `reputation`, `domain_age` untuk URL; `pattern_scan`, `ai_analysis` untuk chat; `pipeline` untuk gagal total.
- `scam_type` hanya boleh salah satu: `phishing`, `job_scam`, `giveaway_scam`, `impersonation`, `banking_fraud`, `investment_scam`, `apk_malware`, `unknown`. Nilai dari AI di luar daftar diganti `unknown`.

**Status ditentukan hanya oleh pemeriksaan wajib:**

- Pemeriksaan wajib URL: `structure` dan `reputation` (Safe Browsing). Chat: `pattern_scan` dan `ai_analysis`.
- `complete`: semua pemeriksaan wajib `ok`. `partial`: ada pemeriksaan wajib yang gagal. `failed`: tidak ada hasil yang bisa dihasilkan.
- RDAP (usia domain) adalah opsional P1: pada MVP **tidak dipanggil** dan dicatat `skipped` di `checks`. Ini tidak memengaruhi status maupun skor.
- Keterbatasan bawaan metode (misalnya tujuan URL pendek tidak diikuti) ditulis di `limitations` dan tidak mengubah status.

## Penilaian Risiko

Rumus: `raw_score` = jumlah bobot indikator **unik** yang valid. `risk_score = min(100, raw_score)`. Kedua nilai dikirim. Kalau `raw_score` lebih dari 100, `explanation` menjelaskan bahwa skor dibatasi maksimal 100.

- Setiap **tipe** indikator dihitung satu kali, berapa pun jumlah kemunculannya.
- Rincian bobot ditampilkan di `indicators` sehingga `raw_score` bisa diverifikasi dengan menjumlahkannya.
- Bobot dan ambang disimpan di `config/scoring.ts`, bukan ditulis langsung di logika.
- `severity` ditetapkan backend dari bobot: **30 atau lebih = `high`, 15 sampai 29 = `medium`, di bawah 15 = `low`**. Nilai severity dari AI tidak dipakai.

### Indikator URL

| Tipe | Indikator | Bobot | Sumber |
| --- | --- | --- | --- |
| `safe_browsing_match` | URL terdaftar sebagai ancaman di Google Safe Browsing (kritis) | 60 | Reputasi |
| `typosquatting` | Nama domain mirip merek atau bank yang dikenal | 35 | Struktur URL |
| `punycode_homograph` | Karakter punycode atau homograf yang menyerupai huruf lain | 30 | Struktur URL |
| `brand_in_subdomain` | Nama merek di subdomain sementara domain utama berbeda | 30 | Struktur URL |
| `ip_host` | Host berupa alamat IP | 25 | Struktur URL |
| `userinfo_in_url` | Tanda `@` atau informasi login di dalam URL | 20 | Struktur URL |
| `url_shortener` | Layanan pemendek URL (tujuan akhir tidak diperiksa, dicatat di `limitations`) | 15 | Struktur URL |
| `excessive_subdomains` | Subdomain berlebihan (empat level atau lebih) | 10 | Struktur URL |
| `risky_tld` | TLD yang sering disalahgunakan | 10 | Struktur URL |
| `no_https` | Tanpa HTTPS | 10 | Struktur URL |
| `sensitive_keywords` | Kata sensitif di path atau query (login, verifikasi, OTP, hadiah) | 10 | Struktur URL |
| `unusual_port` | Port tidak lazim | 10 | Struktur URL |
| `long_encoded_url` | URL sangat panjang atau banyak karakter ter-encode | 5 | Struktur URL |
| `domain_age_young` | Domain berusia kurang dari 30 hari (RDAP) | tidak dihitung di MVP (P1: 20) | RDAP |

`userinfo_in_url` dihitung dari URL **asli sebelum pembersihan**.

### Indikator Chat

AI dan pemindaian lokal **hanya boleh memakai tipe berikut** (daftar tertutup):

| Tipe | Keterangan | Bobot |
| --- | --- | --- |
| `otp_request` | Meminta OTP, PIN, atau kode verifikasi (kritis) | 30 |
| `advance_fee` | Meminta transfer atau biaya di muka | 30 |
| `threat_link` | Tautan disertai ancaman akun diblokir | 30 |
| `impersonation_data` | Mengaku pihak resmi sambil meminta data | 30 |
| `unrealistic_offer` | Gaji atau hadiah tidak wajar | 15 |
| `time_pressure` | Tekanan waktu agar segera bertindak | 15 |
| `move_platform` | Ajakan pindah ke platform lain | 15 |
| `guaranteed_profit` | Janji keuntungan pasti | 15 |
| `odd_language` | Gaya bahasa janggal | 5 |
| `unknown_sender` | Pengirim tidak dikenal tanpa tuntutan lain | 5 |

### Aturan penggabungan

- Tipe yang sama hanya dihitung sekali.
- Kalau AI dan pemindaian lokal menemukan tipe yang sama, digabung menjadi satu indikator dengan satu bobot. Kutipan dari AI dipakai kalau valid, kalau tidak pakai kutipan pemindaian lokal.
- Dua tipe berbeda dihitung sebagai dua indikator.

### Ambang kategori

| Kategori | Skor | Arti |
| --- | --- | --- |
| `high` | 60 sampai 100 | Banyak atau kuat tanda bahaya; hindari bertindak sebelum diverifikasi |
| `review` | 30 sampai 59 | Ada tanda yang perlu diverifikasi, atau bukti belum cukup |
| `low` | 0 sampai 29 | Tidak ditemukan tanda bahaya signifikan pada pemeriksaan lengkap. **Tetap bukan jaminan aman** |

### Aturan khusus (diterapkan berurutan)

1. Hitung skor dan kategori dasar dari ambang. `category_reason` = `score`.
2. **Pemeriksaan tidak lengkap**: kalau pemeriksaan wajib gagal dan kategori dasar `low`, naikkan menjadi `review`, `category_reason` = `incomplete_check`. Berlaku juga kalau AI gagal dan pemindaian lokal tidak menemukan indikator.
3. **Indikator kritis** (`safe_browsing_match` dan `otp_request`): kategori minimal `high` walaupun skor total rendah, `category_reason` = `critical_indicator`. Skor tetap ditampilkan apa adanya.
4. **AI tidak dapat menyimpulkan** (`can_conclude` false): kategori `review`, `category_reason` = `cannot_conclude`.
5. **`low` hanya boleh muncul kalau semua pemeriksaan wajib berstatus `ok`** (status `complete`).
6. Kalau pemeriksaan wajib gagal tetapi indikator lokal menunjukkan risiko tinggi, kategori tetap `high` sesuai skor dan status `partial` dengan banner peringatan di frontend.

## Pemeriksaan URL

1. Validasi ulang format, normalisasi, lalu bersihkan bagian sensitif (lihat Privasi).
2. **Struktur URL (lokal, wajib)**: heuristik tanpa jaringan sesuai tabel indikator URL.
3. **Reputasi (Google Safe Browsing, wajib)**: kirim URL yang sudah dibersihkan. Timeout 5 detik. Cache hasil sementara berdasarkan **hash URL** (SHA-256), bukan URL mentah.
4. Usia domain (RDAP): dilewati, `skipped`.
5. Hitung skor lalu bentuk laporan lengkap dengan daftar apa yang sudah dan belum diperiksa.

Kondisi khusus:

- **URL pendek**: tujuan akhir tidak diikuti. Beri catatan di `limitations` dan sarankan membuka pratinjau dengan aman atau meminta tautan asli.
- **Redirect**: tidak diikuti, cukup dinyatakan sebagai batasan.
- **Domain belum dikenal**: nyatakan bukti belum cukup, bukan aman.
- **Safe Browsing gagal**: `reputation` berstatus `failed`, status `partial`, dan jelaskan dampaknya.

## Analisis Chat dengan AI

Alur: validasi panjang → masking data pribadi → pemindaian pola lokal → kirim ke Claude → validasi output → gabungkan indikator → hitung skor → laporan.

- Teks chat diperlakukan sebagai **data tidak tepercaya**: dipisahkan dari instruksi sistem dengan pembatas, dan model diminta tidak mengikuti instruksi di dalam chat. Ini bukan jaminan teknis, jadi pertahanannya berlapis: model **tidak diberi tool atau data lain**, output selalu divalidasi skema dan bukti, nilai di luar daftar ditolak.
- Claude diminta mengembalikan **JSON saja**: `scam_type` (dari daftar resmi), `can_conclude`, `summary`, dan `indicators` yang masing-masing berisi `type` (dari daftar tipe indikator chat), `evidence_quote`, dan `reason`. `severity` dan `weight` **tidak** diminta dari AI.
- Timeout AI 10 detik. Tidak ada tool, tidak ada streaming.
- Validasi di backend: skema JSON (Zod), `type` ada di daftar tertutup, `reason` tidak kosong, dan `evidence_quote` benar-benar ada di teks input (yang sudah dimasker) setelah normalisasi spasi. Indikator yang gagal dibuang.
- Penjelasan ditulis dalam bahasa awam dan merujuk kalimat yang ditandai.

### Penanganan kegagalan AI

| Kondisi | Perilaku |
| --- | --- |
| Timeout atau error layanan AI | Coba ulang satu kali. Kalau tetap gagal, pakai pemindaian lokal, status `partial`, dan beri tahu bahwa analisis AI tidak tersedia |
| AI gagal dan pemindaian lokal tidak menemukan indikator | Kategori `review`, status `partial`, `category_reason` = `incomplete_check`. **Tidak boleh `low`** |
| Respons AI bukan JSON atau tidak sesuai skema | Coba ulang satu kali, lalu perlakukan seperti kegagalan layanan |
| AI menyatakan tidak dapat menyimpulkan | Kategori `review`, `category_reason` = `cannot_conclude` |
| Chat percakapan biasa tanpa indikator (AI berhasil) | Kategori `low` dengan catatan keterbatasan, tidak disebut penipuan |
| `scam_type` atau `type` di luar daftar resmi | `scam_type` jadi `lainnya` atau `null`, indikator tipe tidak dikenal dibuang, kejadian dicatat **tanpa isi input** |
| Kutipan AI tidak cocok dengan teks | Indikator dibuang dan dicatat di `limitations`. Kalau tidak ada indikator tersisa, kategori minimal `review` dengan `cannot_conclude` |
| Seluruh pipeline gagal | Status `failed`, `risk_level` dan `risk_score` `null`, HTTP 503, sarankan coba lagi nanti |

## Privasi dan Masking

### Masking data pribadi (teks chat, sebelum dikirim ke AI)

| Data | Penanda |
| --- | --- |
| Nomor telepon | `[TELEPON]` |
| Alamat email | `[EMAIL]` |
| Nomor rekening atau kartu | `[REKENING]` |
| OTP, PIN, kode verifikasi | `[KODE_RAHASIA]` (adanya permintaan kode tetap dianalisis sebagai indikator) |
| NIK | `[NIK]` |
| Nama dan alamat | `[NAMA]`, `[ALAMAT]` (deteksi terbatas berdasarkan pola umum) |

Masking bersifat upaya terbaik dan tidak menjamin semua data pribadi terdeteksi. Bukti kutipan di hasil berasal dari teks yang **sudah dimasker**.

### Pembersihan URL (sebelum dikirim ke layanan eksternal, ditampilkan, atau dicatat)

- Hapus bagian `userinfo` (nama pengguna dan kata sandi sebelum `@`).
- Nilai parameter query bernama sensitif diganti `[DIHAPUS]`: `token`, `access_token`, `api_key`, `key`, `secret`, `password`, `otp`, `code`, `session`, `sid`, `auth`, `signature`. Daftar disimpan di `config/scoring.ts`.
- Kalau ada bagian yang dibersihkan, `limitations` menyebut bahwa akurasi pemeriksaan reputasi dapat berkurang dan pengguna diingatkan mengganti kredensial kalau URL itu pernah dibagikan.

### Penyimpanan dan log

- Input mentah URL dan chat **tidak disimpan**.
- **Dilarang** memasukkan isi request ke `console.log`, log error, atau pesan exception. Jangan log `req.body`. Error handler hanya mencatat kode dan jenis error.
- Fitur salin hasil (di frontend) hanya menyalin ringkasan, indikator, dan saran, tanpa teks input asli.

## Keamanan

- API key hanya di environment variable backend, **tidak pernah** di frontend atau repository.
- CORS dibatasi ke domain frontend resmi (`FRONTEND_ORIGIN`). Untuk development, `http://localhost:5173`.
- Rate limiting pada endpoint `/analyze/*` (per IP) untuk mencegah penyalahgunaan dan melindungi kuota API. Lewat batas, balas 429 `RATE_LIMITED`.
- Pakai `helmet` untuk header keamanan. HTTPS wajib di production (otomatis di Vercel).
- Batasi ukuran body request (cukup beberapa KB, sesuai batas 5.000 karakter).
- Risiko SSRF rendah karena backend hanya menganalisis teks URL dan memanggil layanan reputasi, tidak mengunduh konten URL. Kalau kelak ada fitur ikuti redirect atau ambil konten, wajib: tolak IP privat, loopback, dan link-local setelah resolusi DNS; batasi jumlah redirect, timeout, dan ukuran respons; validasi ulang tiap tujuan redirect.
- Pesan error tidak boleh membocorkan stack trace atau isi input.

## Environment Variable

File `.env` tidak masuk repository. Sediakan `.env.example` tanpa nilai rahasia:

```
PORT=8000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
ANTHROPIC_API_KEY=
CLAUDE_MODEL=
SAFE_BROWSING_API_KEY=
```

Gunakan key terpisah untuk development dan production. Baca dan validasi semua variabel di `config/env.ts` dengan Zod, dan hentikan server dengan pesan jelas kalau ada yang kosong.

## Database

MVP **tidak memakai database**. Input tidak disimpan, dan satu-satunya data tetap adalah contoh demo yang cukup berupa file `src/data/demoExamples.ts` (contoh URL dan chat fiktif, berlabel simulasi). Supabase (PostgreSQL) dari blueprint dipakai nanti hanya kalau fitur P1 atau P2 membutuhkannya, dengan aturan:

- Akses lewat `@supabase/supabase-js`, kredensial hanya di backend, frontend tidak pernah mengakses database langsung.
- RLS aktif pada semua tabel.
- Tabel dibuat bersamaan dengan fiturnya, bukan lebih awal.
- Input mentah tetap tidak disimpan. Riwayat analisis hanya boleh dibuat kalau disetujui dan dijelaskan ke pengguna, dengan masa retensi dan mekanisme hapus.

## Deploy (Vercel)

Frontend dan backend sama-sama di Vercel sebagai **dua project terpisah dari satu repo**:

| Project | Root Directory |
| --- | --- |
| Frontend | `frontend` |
| Backend | `backend` |

- Vercel mendeteksi Express otomatis. Pastikan `src/app.ts` memakai `export default app`, dan `src/server.ts` hanya dipakai untuk `app.listen` saat development lokal.
- `express.static()` tidak berlaku di Vercel (backend ini memang tidak menyajikan file statis).
- Environment variable diisi di dashboard Vercel.
- Setelah deploy, isi `FRONTEND_ORIGIN` dengan domain frontend yang resmi, dan arahkan base URL API di frontend ke domain backend.
- **Cek dulu sebelum demo:** batas durasi function dan kuota paket yang dipakai di Vercel, karena analisis chat memanggil Claude API (timeout 10 detik). Kalau ada masalah batas durasi, backend bisa dipindah ke Railway atau Render tanpa mengubah kode Express.
- Setelah deploy, uji satu URL dan satu chat nyata sampai menghasilkan laporan lengkap, cek CORS, cek rate limiting aktif, dan cek log tidak memuat isi input.

## Pengujian

Keberhasilan tidak cukup dilihat dari HTTP 200, tapi dari **kebenaran isi hasil**. Pakai Vitest.

Skenario minimum:

- URL mencurigakan: indikator dan alasan sesuai muncul.
- URL normal: sistem tidak mengarang indikator bahaya.
- URL tidak dikenal: dijelaskan bahwa bukti belum cukup.
- URL pendek: ada catatan tujuan akhir tidak diperiksa.
- URL berisi kredensial atau token: dibersihkan sebelum dikirim dan ditampilkan, indikator `userinfo_in_url` tetap dihitung.
- Chat berisi pola penipuan: kalimat yang ditandai benar-benar ada di input.
- Chat percakapan biasa: tidak otomatis disebut penipuan.
- Input kosong atau terlalu panjang: ditolak dengan 422.
- Safe Browsing atau AI gagal: status `partial`, keterbatasan tampil, tidak dianggap berhasil.
- AI gagal dan pemindaian lokal kosong: `review`, `partial`, tidak pernah `low`.
- Indikator berulang atau tumpang tindih: tiap tipe dihitung sekali, skor sama dengan jumlah bobot pada rincian.
- Indikator kritis dengan skor total rendah: `high` dengan `category_reason` = `critical_indicator`.
- Bobot melebihi 100: `raw_score` mentah, `risk_score` dibatasi 100, ada penjelasan.
- RDAP `skipped` sementara pemeriksaan wajib berhasil: status tetap `complete`.
- Struktur respons `complete`, `partial`, `failed` sesuai tabel field.
- Input mengandung data pribadi: dimasker dan tidak muncul di log.
- Input berisi instruksi "abaikan aturan" (prompt injection): output tetap sesuai skema, kalau menyimpang validasi menolak dan fallback berjalan.
- Contoh response di blueprint dijalankan sebagai `contract.test.ts` supaya skor dan kategori selalu sesuai algoritma.

Siapkan dataset uji berlabel (minimal 10 contoh per kelas: mencurigakan, normal, tidak pasti, untuk URL dan untuk chat) di `tests/fixtures/`. Dataset yang sama dipakai untuk kalibrasi bobot dan regression test. **Bobot tidak dinaikkan hanya agar hasil terlihat meyakinkan**, setiap perubahan dicatat dengan alasan dan contoh yang mendasarinya.

## Urutan Pengerjaan

Kerjakan bertahap, dan setelah tiap tahap pastikan `npm run build` dan `npm test` lolos sebelum lanjut.

1. **Fondasi**: `config/env.ts`, `config/scoring.ts`, `app.ts`, `server.ts`, `GET /health`, `.env.example`, `errorHandler.ts`.
2. **Skor**: `services/riskScoring` (hitung skor, kategori, aturan khusus) beserta testnya. Murni logika, paling gampang dites.
3. **URL**: `sanitizeUrl.ts`, `structureCheck.ts`, `safeBrowsing.ts`, lalu `POST /analyze/url`.
4. **Chat**: `maskPii.ts`, `patternScan.ts`, `claudeClient.ts`, `validateEvidence.ts`, lalu `POST /analyze/chat`.
5. **Pelengkap**: `GET /demo-examples`, rate limiting, CORS, `helmet`.
6. **Integrasi frontend**: arahkan `apiClient.ts` ke backend (mode Live API), samakan bentuk response dengan `types/`, lalu uji tiap halaman dengan data nyata.
7. **Deploy dan hardening**: deploy ke Vercel, uji skenario nyata, cek log tidak memuat input, siapkan demo.
8. Setelah MVP stabil dan kalau frontend membutuhkannya: endpoint P1 (checklist, knowledge, challenge).

## Catatan Penting

- Semua query atau panggilan eksternal punya timeout. Jangan biarkan request menggantung.
- Jangan tampilkan error teknis mentah ke pengguna. Pakai pesan umum Bahasa Indonesia.
- Jangan pernah menampilkan skor atau kategori `low` saat pemeriksaan wajib gagal.
- Logika yang ada di `mockAnalyzer.ts` frontend adalah contoh. Setelah backend jalan, frontend memakai mode Live API dan mock hanya jadi cadangan demo.

**Belum dikerjakan (ditunda, jangan ditambahkan kecuali diminta):** login dan akun pengguna, dashboard admin, komunitas dan moderasi, riwayat analisis tersimpan, pemeriksaan usia domain (RDAP), pengikutan redirect URL, multi-bahasa, queue dan scheduler, integrasi VirusTotal, pemblokiran atau pelaporan otomatis ke pihak berwenang, pemeriksaan isi halaman web, integrasi langsung ke WhatsApp.