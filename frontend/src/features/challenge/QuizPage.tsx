import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Target, 
  ShieldCheck,
  FileQuestion,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { QuizArenaIllustration } from '../../components/illustrations/Illustrations2D';

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: { text: string; isCorrect: boolean; reason: string }[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    scenario: 'Anda menerima pesan WhatsApp dari nomor asing: "Selamat siang! Anda memenangkan undian Shopee 100jt. Silakan transfer biaya pajak pemenang sebesar Rp 500.000 ke rekening bendahara kami agar dana segera cair."',
    question: 'Tindakan apa yang paling tepat untuk Anda lakukan?',
    options: [
      { text: 'Langsung mentransfer dana agar hadiah tidak hangus.', isCorrect: false, reason: 'Salah! Penyelenggara undian resmi tidak pernah membebankan pajak hadiah melalui transfer rekening pribadi.' },
      { text: 'Abaikan, blokir nomor pengirim, dan laporkan pesan sebagai penipuan.', isCorrect: true, reason: 'Tepat! Ini adalah modus klasik Advance Fee Scam (biaya di muka). Jangan pernah mentransfer uang.' },
      { text: 'Membalas pesan untuk menanyakan apakah bisa dipotong langsung dari hadiah.', isCorrect: false, reason: 'Berbahaya! Membalas pesan mengonfirmasi bahwa nomor telepon Anda aktif dan akan menjadi target serangan lanjutan.' },
    ],
  },
  {
    id: 2,
    scenario: 'Seseorang yang mengaku kurir paket mengirimkan file bernama "Lihat_Foto_Resi_Paket_JNT.apk" di WhatsApp karena alamat pengiriman Anda tidak lengkap.',
    question: 'Mengapa file ini berbahaya dan dilarang diinstal?',
    options: [
      { text: 'Karena foto paket seharusnya berupa file gambar (.jpg/.png), bukan aplikasi Android (.apk) pencuri SMS/OTP.', isCorrect: true, reason: 'Tepat sekali! Ekstensi .apk adalah aplikasi program. Modus ini menyisipkan malware penguras rekening perbankan.' },
      { text: 'Karena paket tersebut sebenarnya sudah tiba di rumah tetangga.', isCorrect: false, reason: 'Salah. Pokok permasalahannya adalah manipulasi berkas eksekutabel malware .apk.' },
      { text: 'Karena hanya boleh diinstal saat terhubung jaringan WiFi kantor.', isCorrect: false, reason: 'Sangat keliru! File APK berbahaya tetap akan mencuri data di jaringan apa pun.' },
    ],
  },
  {
    id: 3,
    scenario: 'Anda menerima SMS dari bank dengan tautan: "http://bca-klik.com.secure-login.xyz/update-kartu".',
    question: 'Tanda bahaya apa yang paling mencolok pada alamat URL di atas?',
    options: [
      { text: 'Nama merek BCA ditaruh di subdomain, sedangkan domain induk aslinya adalah secure-login.xyz.', isCorrect: true, reason: 'Benar! Penipu mengecoh korban dengan menempatkan nama bank di subdomain dan menggunakan TLD murah berisiko (.xyz).' },
      { text: 'Tautan tersebut menggunakan huruf kecil semua.', isCorrect: false, reason: 'Format huruf kecil adalah hal normal pada URL peramban.' },
      { text: 'Alamat tautan terlalu singkat untuk dibaca.', isCorrect: false, reason: 'URL tersebut justru panjang dan memanipulasi struktur hierarki domain.' },
    ],
  },
  {
    id: 4,
    scenario: 'Seorang petugas yang mengaku dari Customer Service bank menelepon dan meminta Anda menyebutkan 6 digit kode OTP yang baru saja masuk ke SMS ponsel Anda.',
    question: 'Apakah pihak bank resmi berhak meminta kode OTP Anda?',
    options: [
      { text: 'Boleh, selama petugas menyebutkan nama lengkap dan tanggal lahir kita.', isCorrect: false, reason: 'Salah besar! Pelaku sering memiliki data pribadi bocor, namun mereka tetap butuh OTP Anda untuk eksekusi transaksi.' },
      { text: 'Tidak pernah! Bank dan institusi resmi tidak akan pernah meminta kode OTP atau PIN kepada nasabah dalam kondisi apa pun.', isCorrect: true, reason: 'Tepat! OTP adalah One-Time Password rahasia pribadi yang berfungsi sebagai kunci otentikasi ganda Anda.' },
      { text: 'Boleh, asalkan kode tersebut disebutkan secara berbisik.', isCorrect: false, reason: 'Salah total.' },
    ],
  },
  {
    id: 5,
    scenario: 'Tawaran pekerjaan paruh waktu online: "Hanya perlu like & subscribe 5 video YouTube setiap jam, gaji 1,5 juta per hari langsung transfer. Tapi wajib setor uang deposit sistem 100 ribu."',
    question: 'Ciri manipulasi psikologis apa yang dominan dalam kasus ini?',
    options: [
      { text: 'Penawaran komisi fantastis yang tidak realistis untuk tugas remeh disertai syarat deposit uang muka.', isCorrect: true, reason: 'Benar! Ini adalah sindikat penipuan Job Scam (Task Scam) yang menargetkan pencari kerja sampingan.' },
      { text: 'Pekerjaan tersebut terlalu berat untuk dilakukan.', isCorrect: false, reason: 'Sebaliknya, tugas dibuat sangat mudah untuk memikat calon korban.' },
      { text: 'Tidak ada tanda bahaya, ini program kemitraan resmi YouTube.', isCorrect: false, reason: 'Salah. YouTube dan platform besar tidak merekrut melalui pesan acak WhatsApp.' },
    ],
  },
  {
    id: 6,
    scenario: 'Anda menemukan tautan pendek "https://bit.ly/undian-bca-resmi" di grup media sosial.',
    question: 'Apa risiko terbesar dari layanan penyingkat tautan (URL Shortener) seperti bit.ly dalam konteks keamanan?',
    options: [
      { text: 'Tujuan akhir halaman web disembunyikan sehingga pengguna tidak bisa memeriksa domain asli sebelum mengklik.', isCorrect: true, reason: 'Tepat! Shortener menyamarkan alamat berbahaya di balik tautan pendek pihak ketiga.' },
      { text: 'Shortener memakan kuota internet 10 kali lebih besar.', isCorrect: false, reason: 'Salah, ukuran payload shortener justru sangat kecil.' },
      { text: 'Bit.ly secara otomatis menghapus file di ponsel Anda.', isCorrect: false, reason: 'Salah. Bit.ly hanya layanan redirect, bukan file perusak.' },
    ],
  },
];

export const QuizPage: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (quizFinished && score >= 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#143826', '#E86A33', '#255D40', '#EAF2ED']
      });
    }
  }, [quizFinished, score]);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (currentQ.options[idx].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-transparent text-[#0F172A] relative overflow-hidden">
      
      {/* Background Soft Aura */}
      <div 
        className="absolute top-0 right-1/4 w-[750px] h-[550px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full relative z-10 space-y-8">
        
        {/* 1. DETECTIVE GAME HUD STRIP */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2ED] text-[#143826] flex items-center justify-center font-bold">
              <Target className="w-5 h-5 text-[#E86A33]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#143826]">
                  Arena Detektif Siber
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  GUARDIAN HUD
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Uji ketajaman insting menghadapi ancaman rekayasa sosial
              </p>
            </div>
          </div>

          {/* Right Status Counters */}
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase">Berkas Perkara</div>
              <div className="font-extrabold text-[#143826]">
                0{currentIdx + 1} <span className="text-gray-400 font-normal">/ 0{QUIZ_QUESTIONS.length}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase">Skor Akurasi</div>
              <div className="font-extrabold text-[#E86A33]">
                {score * 100} XP
              </div>
            </div>
          </div>

        </div>

        {/* 2. MAIN ARENA INVESTIGATION DESK */}
        {!quizFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: EVIDENCE DOSSIER & 2D CARTOON ILLUSTRATION (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Evidence Case File Card */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-lg p-6 space-y-4">
                
                {/* Dossier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#143826]">
                    <FileText className="w-4 h-4 text-[#E86A33]" />
                    <span>BUKTI SITAAN KASUS #{currentIdx + 1}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold">
                    PERLU EVALUASI
                  </span>
                </div>

                {/* Scenario Speech / Incident Memo */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 relative space-y-2">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>Laporan Kronologi Warga:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-900 leading-relaxed font-medium italic">
                    "{currentQ.scenario}"
                  </p>
                </div>

                {/* Investigation Guidance Note */}
                <div className="flex items-start gap-2.5 text-[11px] text-gray-500 bg-[#EAF2ED]/60 p-3 rounded-xl border border-[#143826]/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Teliti nama pengirim, format berkas, penawaran dana tidak wajar, dan urgensi mendesak sebelum mengambil langkah hukum.
                  </span>
                </div>

              </div>

              {/* 2D Quiz Arena Visual Plinth */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#EAF2ED]/60 to-white border border-[#143826]/10 flex flex-col items-center justify-center">
                <QuizArenaIllustration className="w-56 h-40 sm:w-64 sm:h-44" />
                <span className="text-[11px] font-mono text-gray-500 mt-2">
                  Laboratorium Forensik Kasus Lapangan
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: DECISION CONSOLE & LOGICAL DEBRIEF (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl shadow-gray-200/60 p-6 sm:p-8 space-y-6">
                
                {/* Question Eyebrow & Title */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-mono font-bold">
                    <FileQuestion className="w-3.5 h-3.5 text-[#143826]" />
                    <span>PERTANYAAN PENYELIDIK</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-[#143826] leading-snug">
                    {currentQ.question}
                  </h2>
                </div>

                {/* 3 Decision Option Tiles */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const showFeedback = selectedOption !== null;

                    let tileStyle = 'border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#143826] text-gray-800 shadow-2xs';
                    let badgeStyle = 'bg-white text-[#143826] border border-gray-200';

                    if (showFeedback) {
                      if (opt.isCorrect) {
                        tileStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm';
                        badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                      } else if (isSelected && !opt.isCorrect) {
                        tileStyle = 'border-red-400 bg-red-50 text-red-950 font-bold shadow-sm';
                        badgeStyle = 'bg-red-600 text-white border-red-600';
                      } else {
                        tileStyle = 'border-gray-200 bg-gray-50 opacity-40 text-gray-400';
                        badgeStyle = 'bg-gray-100 text-gray-400 border-gray-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={selectedOption !== null}
                        type="button"
                        className={`w-full p-4 sm:p-5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 cursor-pointer ${tileStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition shadow-2xs ${badgeStyle}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed pt-0.5">{opt.text}</span>
                        {showFeedback && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {showFeedback && isSelected && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Educational Debriefing Box */}
                <AnimatePresence>
                  {selectedOption !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 rounded-2xl bg-[#EAF2ED]/90 border border-[#143826]/25 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#143826]" />
                        <span className="font-mono text-xs font-bold uppercase text-[#143826] tracking-wider">
                          Evaluasi Logis Detektif:
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                        {currentQ.options[selectedOption].reason}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleNext}
                          type="button"
                          className="btn-animate inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E86A33] hover:bg-[#D75922] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 cursor-pointer transition"
                        >
                          <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Lanjut ke Berkas Berikutnya' : 'Buka Lembar Evaluasi Akhir'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

          </div>
        ) : (
          /* 3. GRAND DETECTIVE CLEARANCE CERTIFICATE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200/90 shadow-2xl p-8 sm:p-10 text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-[#EAF2ED] mx-auto flex items-center justify-center text-[#143826] shadow-sm">
              <Award className="w-10 h-10 text-[#143826]" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
                Sertifikat Evaluasi Literasi Siber
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {score >= 5 ? 'Luar Biasa! Detektif Siber Tingkat Tinggi 🛡️' : score >= 3 ? 'Bagus! Pengawasan Digital Cukup Tajam 🟡' : 'Perlu Memperkuat Literasi Keamanan ⚠️'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Anda berhasil menyelesaikan evaluasi dengan <strong className="text-gray-900">{score} dari {QUIZ_QUESTIONS.length} kasus terpecahkan</strong> secara tepat ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}% tingkat ketepatan).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200 text-xs text-gray-700 max-w-md mx-auto leading-relaxed">
              Masyarakat yang peka terhadap taktik manipulasi sosial adalah pertahanan digital paling kuat. Terus bagikan wawasan ini ke keluarga dan rekan kerja!
            </div>

            <div className="pt-2">
              <button
                onClick={handleRestart}
                type="button"
                className="btn-animate inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Uji Kasus</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
};
