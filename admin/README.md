# Scamora Admin Command & Control Center

Aplikasi Admin Panel independen untuk mengelola seluruh ekosistem, telemetri, konfigurasi AI engine, skenario demo, pusat edukasi, dan moderasi komunitas **Scamora AI**.

---

## 🚀 Panduan Memulai Cepat

### 1. Jalankan Backend API
```bash
cd backend
npm run dev
```
*Backend berjalan di: `http://localhost:8000`*

### 2. Jalankan Admin Panel
```bash
cd admin
npm run dev
```
*Admin Command Center berjalan di: `http://localhost:5174`*

---

## 🎛️ Fitur & Modul Utama

| Modul | Rute | Deskripsi |
|---|---|---|
| **Dashboard Utama** | `/` | KPI metrik real-time: volume scan, rasio ancaman, situs phishing terblokir, latensi AI, dan tren modus penipuan. |
| **AI Engine & Crawler** | `/engine` | Pengaturan runtime LLM (`gemini-3.5-flash-lite`), tes latensi ping real-time, sandbox web crawler (timeout, max payload, proteksi SSRF, deteksi APK). |
| **Skenario Demo** | `/presets` | CRUD skenario interaktif simulasi URL dan Chat yang tampil di beranda Scamora untuk publik. Dilengkapi toggle status aktif dan filter tipe. |
| **Pusat Pengetahuan** | `/knowledge` | Manajemen ensiklopedia modus penipuan digital, red flags, dan panduan langkah mitigasi resmi. |
| **Guardian Challenge** | `/quiz` | Bank soal kuis edukasi simulasi ancaman digital, scoring, feedback penjelasan, dan opsi jawaban. |
| **Moderasi Komunitas** | `/moderation` | Antrean moderasi cerita pengguna, audit kepatuhan sensor PII (masking data pribadi), publish/unpublish, dan penanganan laporan konten. |
| **Log Audit & Telemetri** | `/audit-logs` | Jejak rekam aktivitas administratif yang immutable untuk transparansi dan auditabilitas keamanan. |

---

## 🛡️ Arsitektur Dual-Mode (Online & Offline Resilience)
- **Terhubung ke Backend (`Online`)**: Melakukan sinkronisasi langsung dengan endpoint API `/api/v1/admin/*`.
- **Backend Offline (`Resilience Mode`)**: Beralih secara otomatis ke penyimpanan lokal persisten (`localStorage`) dengan state awal mock berkualitas tinggi, memastikan admin panel tetap dapat diakses dan digunakan setiap saat tanpa hambatan.

