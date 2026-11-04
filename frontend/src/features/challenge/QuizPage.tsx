import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    if (quizFinished && score >= 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0066cc', '#248a3d', '#316bf3', '#ffd700']
      });
    }
  }, [quizFinished, score]);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
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
    <div className="flex flex-col w-full pb-16">
      
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#E86A33]" />
            <span>Guardian Challenge AI &bull; P1 Interactive Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tantangan Deteksi Modus Penipuan Digital
          </h1>
          <p className="text-sm text-gray-200 max-w-3xl leading-relaxed">
            Uji literasi keamanan siber Anda melalui simulasi studi kasus penipuan nyata. Dapatkan umpan balik instan beserta alasan ilmiah di balik setiap keputusan.
          </p>
        </div>
      </section>

      {/* WORKSPACE */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!quizFinished ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-6">
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-secondary">SOAL {currentIdx + 1} DARI {QUIZ_QUESTIONS.length}</span>
                <span className="text-on-surface-variant">Skor Sesi: {score}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Scenario Card */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-1.5">
              <span className="font-mono text-[10px] font-bold uppercase text-on-surface-variant">
                Studi Kasus Skenario:
              </span>
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
                "{currentQ.scenario}"
              </p>
            </div>

            {/* Question */}
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const showFeedback = selectedOption !== null;

                let btnStyle = 'border-surface-container bg-surface-container-low/40 hover:bg-surface-container text-on-surface';
                if (showFeedback) {
                  if (opt.isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 font-bold';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'border-error bg-error-container text-on-error-container font-bold';
                  } else {
                    btnStyle = 'border-surface-container bg-surface-container-lowest opacity-50 text-on-surface-variant';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOption !== null}
                    type="button"
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-surface-container font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                    {showFeedback && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {showFeedback && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Explanation Box */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-secondary" />
                  <span className="font-mono text-xs font-bold uppercase text-on-surface">
                    Penjelasan Edukasi Keamanan:
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {currentQ.options[selectedOption].reason}
                </p>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleNext}
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-container transition-all shadow-xs"
                  >
                    <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* RESULT CARD */
          <div className="p-8 sm:p-10 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-surface-container mx-auto flex items-center justify-center text-secondary">
              <Award className="w-10 h-10 text-secondary" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-secondary-fixed text-secondary font-mono text-xs font-bold uppercase">
                Tantangan Selesai
              </span>
              <h2 className="text-2xl font-black text-on-surface">
                {score >= 5 ? 'Luar Biasa! Anda Guardian Sejati' : score >= 3 ? 'Bagus! Namun Tetap Waspada' : 'Perlu Meningkatkan Literasi Siber'}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                Anda berhasil menjawab <strong className="text-on-surface">{score} dari {QUIZ_QUESTIONS.length}</strong> skenario dengan benar ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Masyarakat yang teredukasi adalah benteng pertahanan terbaik melawan kejahatan siber rekayasa sosial (*social engineering*).
            </div>

            <div className="pt-2">
              <button
                onClick={handleRestart}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-container transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Tantangan Kuis</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

