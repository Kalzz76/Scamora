import React, { useEffect, useMemo, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Award,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  BookOpen,
  CheckCheck,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { QuizQuestionItem } from '../../types/admin';
import { toast } from 'sonner';

export const QuizManagerPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Question in Master-Detail
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Copy state
  const [isCopied, setIsCopied] = useState(false);

  // Simulation state for testing answers in Inspector
  const [simulatedAnswerIdx, setSimulatedAnswerIdx] = useState<number | null>(null);

  // Modal State for New Question
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scenario, setScenario] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [points, setPoints] = useState(25);
  const [categoryCode, setCategoryCode] = useState('phishing');

  // Options state
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await adminService.getQuestions();
    setQuestions(data);
    if (data.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(data[0].id);
    }
    setLoading(false);
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedCategory !== 'all' && q.categoryCode !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inScenario = q.scenario.toLowerCase().includes(query);
        const inQuestion = q.question.toLowerCase().includes(query);
        const inExplanation = q.explanation.toLowerCase().includes(query);
        const inCategory = q.categoryCode.toLowerCase().includes(query);
        const inOptions = q.options.some((o) => o.text.toLowerCase().includes(query));
        return inScenario || inQuestion || inExplanation || inCategory || inOptions;
      }
      return true;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchQuery]);

  // Selected Question Object
  const currentQuestion = useMemo(() => {
    if (!selectedQuestionId) return filteredQuestions[0] || questions[0] || null;
    return questions.find((q) => q.id === selectedQuestionId) || filteredQuestions[0] || null;
  }, [selectedQuestionId, questions, filteredQuestions]);

  // Reset simulated answer when switching questions
  useEffect(() => {
    setSimulatedAnswerIdx(null);
  }, [selectedQuestionId]);

  // Copy Question to clipboard
  const handleCopyQuestion = () => {
    if (!currentQuestion) return;
    const text = `🎯 [SOAL GUARDIAN CHALLENGE: ${currentQuestion.categoryCode.toUpperCase()}]\n\nTingkat: ${currentQuestion.difficulty} (+${currentQuestion.points} Poin)\n\nSkenario:\n"${currentQuestion.scenario}"\n\nPertanyaan:\n${currentQuestion.question}\n\nPilihan Jawaban:\n${currentQuestion.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text} ${opt.isCorrect ? '(KUNCI BENAR)' : ''}`).join('\n')}\n\nPenjelasan:\n${currentQuestion.explanation}\n\nPlatform: Scamora Cyber Learning`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Soal kuis telah disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Delete Question
  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus soal studi kasus kuis ini?')) {
      await adminService.deleteQuestion(id);
      toast.info('Soal kuis telah dihapus.');
      if (selectedQuestionId === id) {
        setSelectedQuestionId(null);
      }
      await loadQuestions();
    }
  };

  // Presets for quick generation
  const applyPreset = (type: 'apk' | 'spoofing' | 'task' | 'vishing') => {
    if (type === 'apk') {
      setCategoryCode('apk_malware');
      setDifficulty('Easy');
      setPoints(20);
      setScenario('Anda menerima pesan WhatsApp dari nomor kurir paket: "Paket Anda tertahan di gudang, silakan cek resi pelacakan di berkas terlampir: Resi_Pelacakan_JNT.apk"');
      setQuestionText('Tindakan paling aman yang harus Anda ambil adalah:');
      setOpt1('Mengunduh dan memasang aplikasi untuk mengetahui nomor resi asli');
      setOpt2('Meneruskan pesan ke keluarga untuk menanyakan apakah ada yang pesan paket');
      setOpt3('Tidak membuka berkas .APK, hapus pesan, dan cek resi melalui website atau aplikasi resmi ekspedisi');
      setOpt4('Membalas chat meminta foto fisik paket');
      setCorrectIdx(2);
      setExplanation('Kurir resmi tidak pernah mengirim berkas biner berekstensi .apk. Berkas ini adalah malware trojan pencuri SMS OTP.');
    } else if (type === 'spoofing') {
      setCategoryCode('phishing');
      setDifficulty('Medium');
      setPoints(25);
      setScenario('Anda menerima SMS dari bank ternama bahwa akun Anda terancam ditutup. Tautan yang disertakan adalah "https://bca.klik-login-verifikasi.xyz"');
      setQuestionText('Mengapa tautan tersebut sangat berbahaya?');
      setOpt1('Karena menggunakan protokol HTTPS');
      setOpt2('Karena nama BCA diletakkan di subdomain, sedangkan domain aslinya adalah klik-login-verifikasi.xyz');
      setOpt3('Karena pesan dikirim melalui SMS bukan email');
      setOpt4('Karena tidak menyertakan foto logo bank');
      setCorrectIdx(1);
      setExplanation('Teknik subdomain spoofing menyamarkan domain root asli (klik-login-verifikasi.xyz) dengan mencantumkan nama bank di awal.');
    } else if (type === 'task') {
      setCategoryCode('job_scam');
      setDifficulty('Medium');
      setPoints(25);
      setScenario('Anda dimasukkan ke dalam grup Telegram yang menawarkan tugas like video TikTok dengan komisi Rp 30.000 per misi. Setelah 3 misi awal cair, admin mewajibkan transfer deposit Rp 1.500.000 untuk "Misi VIP" agar bonus komisi Rp 5.000.000 bisa dicairkan.');
      setQuestionText('Ciri psikologis penipuan apa yang sedang dijalankan oleh pelaku?');
      setOpt1('Phishing kredensial browser');
      setOpt2('Baiting pyramid task scam (memberi umpan kecil di awal untuk memeras deposit besar)');
      setOpt3('Serangan distributed denial of service');
      setOpt4('Pencurian identitas e-KTP');
      setCorrectIdx(1);
      setExplanation('Task scam selalu menggunakan strategi baiting: mencairkan uang kecil di awal untuk membangun rasa percaya palsu korban sebelum meminta deposit besar.');
    } else {
      setCategoryCode('banking_fraud');
      setDifficulty('Hard');
      setPoints(30);
      setScenario('Seseorang mengaku dari customer service bank menelepon Anda dengan nomor identik call center resmi (+62 21-1500888). Ia menyatakan terjadi transaksi mencurigakan Rp 10 juta di akun Anda dan meminta Anda menyebutkan 6-digit kode OTP SMS untuk membatalkan transaksi.');
      setQuestionText('Bagaimana Anda menyikapi situasi panggilan darurat tersebut?');
      setOpt1('Segera sebutkan 6-digit kode OTP karena penelepon menggunakan nomor resmi call center bank');
      setOpt2('Tutup telepon segera, karena nomor pemanggil dimanipulasi (Caller ID Spoofing) dan pihak bank resmi tidak pernah meminta kode OTP');
      setOpt3('Minta penelepon menunggu lalu transfer saldo ke rekening lain');
      setOpt4('Kirimkan foto buku tabungan lewat WhatsApp');
      setCorrectIdx(1);
      setExplanation('Pelaku memanfaatkan teknologi VoIP Caller ID Spoofing untuk meniru nomor resmi. Bank resmi tidak pernah meminta kode OTP dalam situasi apapun.');
    }
  };

  // Submit Modal Form
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim() || !questionText.trim() || !explanation.trim()) {
      toast.error('Skenario, pertanyaan, dan penjelasan wajib diisi!');
      return;
    }

    if (!opt1.trim() || !opt2.trim() || !opt3.trim() || !opt4.trim()) {
      toast.error('Keempat opsi jawaban wajib diisi!');
      return;
    }

    const options = [
      { id: 'opt-a', text: opt1, isCorrect: correctIdx === 0 },
      { id: 'opt-b', text: opt2, isCorrect: correctIdx === 1 },
      { id: 'opt-c', text: opt3, isCorrect: correctIdx === 2 },
      { id: 'opt-d', text: opt4, isCorrect: correctIdx === 3 },
    ];

    const created = await adminService.createQuestion({
      categoryCode,
      scenario,
      question: questionText,
      options,
      explanation,
      points,
      difficulty,
    });

    toast.success('Soal kuis Guardian Challenge baru berhasil ditambahkan!');
    setIsModalOpen(false);

    // Reset Form
    setScenario('');
    setQuestionText('');
    setExplanation('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setCorrectIdx(0);
    setSelectedQuestionId(created.id);
    await loadQuestions();
  };

  // Calculate telemetry stats
  const stats = useMemo(() => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const easyCount = questions.filter((q) => q.difficulty === 'Easy').length;
    const mediumCount = questions.filter((q) => q.difficulty === 'Medium').length;
    const hardCount = questions.filter((q) => q.difficulty === 'Hard').length;
    return { totalPoints, easyCount, mediumCount, hardCount };
  }, [questions]);

  return (
    <div className="p-6 sm:p-8 space-y-6 w-full max-w-7xl mx-auto">
      
      {/* 1. TOP BAR: TITLE & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold tracking-wider uppercase">
              Bank Soal Interaktif
            </span>
            <span className="text-[#476072] text-xs">&bull;</span>
            <span className="text-xs text-[#476072] font-medium">Guardian Challenge Engine</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">
            Bank Soal Guardian Challenge
          </h1>
          <p className="text-xs text-[#476072]">
            Kelola skenario studi kasus penipuan, kunci jawaban, dan materi evaluasi interaktif peserta kuis.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Tambah Soal Kuis</span>
        </button>
      </div>

      {/* 2. CATEGORY & DIFFICULTY FILTER PILLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#334257] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-[#476072] border border-slate-200'
            }`}
          >
            <span>Semua Modus</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#476072]'
            }`}>
              {questions.length}
            </span>
          </button>

          {['phishing', 'apk_malware', 'job_scam', 'banking_fraud', 'giveaway_scam'].map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = questions.filter((q) => q.categoryCode === cat).length;
            const label = cat === 'apk_malware' ? 'APK Malware' : cat === 'phishing' ? 'Phishing' : cat === 'job_scam' ? 'Job Scam' : cat === 'banking_fraud' ? 'Perbankan' : 'Giveaway';

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#334257] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-[#476072] border border-slate-200'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#476072]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-[#476072] font-semibold hidden md:inline">Tingkat:</span>
          {['all', 'Easy', 'Medium', 'Hard'].map((diff) => {
            const isSelected = selectedDifficulty === diff;
            const label = diff === 'all' ? 'Semua' : diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#548CA8] text-white shadow-2xs'
                    : 'bg-white text-[#476072] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TWO-COLUMN MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: QUESTION BROWSER LIST (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#476072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari skenario, kata kunci soal, atau penjelasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#1A202C] placeholder-[#476072]/60 focus:outline-hidden focus:border-[#548CA8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Scrollable Questions List */}
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-[#476072] bg-white rounded-xl border border-slate-200">
                Memuat bank soal kuis...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-[#1A202C]">Tidak ada soal yang cocok</p>
                <p className="text-[11px] text-[#476072]">Coba sesuaikan kata kunci pencarian atau filter kesulitan.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isSelected = currentQuestion?.id === q.id;
                const isEasy = q.difficulty === 'Easy';
                const isMedium = q.difficulty === 'Medium';

                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-white border-[#334257] shadow-xs ring-2 ring-[#334257]/15'
                        : 'bg-white hover:border-[#548CA8] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#334257] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257]">
                          {q.categoryCode.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isEasy
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isMedium
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-[#548CA8]">
                          +{q.points}p
                        </span>
                      </div>
                    </div>

                    <h3 className={`text-xs font-bold leading-snug transition-colors line-clamp-2 ${
                      isSelected ? 'text-[#334257]' : 'text-[#1A202C] group-hover:text-[#548CA8]'
                    }`}>
                      {q.question}
                    </h3>

                    <p className="text-[11px] text-[#476072] italic line-clamp-1 mt-1">
                      "{q.scenario}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#476072] pt-2 mt-2 border-t border-slate-100">
                      <span>4 Pilihan Jawaban</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        <span>Kunci Tersedia</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION INSPECTOR & INTERACTIVE SIMULATOR (lg:col-span-7) */}
        <div className="lg:col-span-7">
          {currentQuestion ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-2xs sticky top-24">
              
              {/* Header Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257] font-mono text-xs font-bold">
                    {currentQuestion.categoryCode.toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                      currentQuestion.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentQuestion.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#548CA8] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{currentQuestion.points} Poin</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyQuestion}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#334257] transition cursor-pointer flex items-center gap-1.5"
                    title="Salin soal kuis untuk pengujian"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Soal'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(currentQuestion.id)}
                    className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Hapus soal kuis ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skenario Kasus */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold font-mono text-[#476072] uppercase tracking-wider block">
                  Skenario Kasus yang Dialami Peserta:
                </span>
                <p className="text-xs text-[#1A202C] leading-relaxed italic font-medium">
                  "{currentQuestion.scenario}"
                </p>
              </div>

              {/* Pertanyaan Utama */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-[#548CA8] uppercase tracking-wider block">
                  Pertanyaan Evaluasi:
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1A202C] leading-snug tracking-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* 4 Pilihan Jawaban (Interactive Simulator) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#476072]">
                  <span className="font-bold font-mono uppercase tracking-wider">
                    Pilihan Jawaban (Klik opsi untuk mencoba simulasi):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Hijau = Kunci Benar</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isCorrect = opt.isCorrect;
                    const isSimulatedChosen = simulatedAnswerIdx === idx;
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSimulatedAnswerIdx(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 text-emerald-950 font-medium'
                            : isSimulatedChosen
                            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300 text-rose-950 font-medium'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-[#334257]'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isSimulatedChosen
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-[#476072]'
                        }`}>
                          {letter}
                        </span>

                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs leading-relaxed">{opt.text}</p>
                        </div>

                        {isCorrect && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>KUNCI</span>
                          </span>
                        )}

                        {!isCorrect && isSimulatedChosen && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>SALAH</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Penjelasan Edukatif */}
              <div className="p-4 rounded-xl bg-[#548CA8]/10 border border-[#548CA8]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[#334257]">
                  <BookOpen className="w-4 h-4 text-[#548CA8]" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    Penjelasan Analisis &amp; Edukasi Peserta:
                  </span>
                </div>
                <p className="text-xs text-[#334257] leading-relaxed pl-5">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-[#476072]">
                <span>ID Soal: {currentQuestion.id}</span>
                <span>Tingkat Bobot: +{currentQuestion.points} Poin Kelulusan</span>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#1A202C]">Pilih Soal Kuis</h3>
              <p className="text-xs text-[#476072] max-w-sm mx-auto">
                Pilih salah satu soal studi kasus dari daftar di samping kiri untuk menginspeksi kunci jawaban, mencoba simulasi jawab, atau menyalin soal.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 4. MODAL: TAMBAH SOAL KUIS BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#548CA8] uppercase">
                  Editor Bank Soal
                </span>
                <h3 className="text-base font-bold text-[#1A202C]">
                  Tambah Soal Studi Kasus Kuis Baru
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[#476072] font-mono shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Template Kasus:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('apk')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#334257] font-semibold text-[11px] whitespace-nowrap cursor-pointer transition"
              >
                📦 Resi APK
              </button>
              <button
                type="button"
                onClick={() => applyPreset('spoofing')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#334257] font-semibold text-[11px] whitespace-nowrap cursor-pointer transition"
              >
                🏦 Subdomain Bank
              </button>
              <button
                type="button"
                onClick={() => applyPreset('task')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#334257] font-semibold text-[11px] whitespace-nowrap cursor-pointer transition"
              >
                💼 Task Scam
              </button>
              <button
                type="button"
                onClick={() => applyPreset('vishing')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#334257] font-semibold text-[11px] whitespace-nowrap cursor-pointer transition"
              >
                📞 Vishing Call
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Category, Difficulty, Points */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Kategori Modus:</label>
                  <select
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="phishing">Phishing</option>
                    <option value="apk_malware">APK Malware</option>
                    <option value="job_scam">Job Scam</option>
                    <option value="banking_fraud">Banking Fraud</option>
                    <option value="giveaway_scam">Giveaway</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Tingkat Kesulitan:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="Easy">Easy (Mudah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="Hard">Hard (Sulit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Poin Kelulusan:</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    step="5"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>
              </div>

              {/* Scenario */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Skenario Kasus / Situasi Kejadian:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Anda menerima email konfirmasi pemesanan tiket dengan lampiran e-tiket.exe..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              {/* Question */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Pertanyaan Evaluasi:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Apa tindakan pertama yang seharusnya diambil?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A202C] flex items-center justify-between">
                  <span>Pilihan Jawaban:</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Pilih tombol radio untuk kunci yang BENAR</span>
                </label>

                {[
                  { text: opt1, setter: setOpt1, idx: 0, label: 'Opsi A' },
                  { text: opt2, setter: setOpt2, idx: 1, label: 'Opsi B' },
                  { text: opt3, setter: setOpt3, idx: 2, label: 'Opsi C' },
                  { text: opt4, setter: setOpt4, idx: 3, label: 'Opsi D' },
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={correctIdx === item.idx}
                      onChange={() => setCorrectIdx(item.idx)}
                      className="w-4 h-4 accent-[#548CA8] cursor-pointer"
                      title="Tandai sebagai jawaban benar"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Jawaban ${item.label}...`}
                      value={item.text}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Penjelasan Edukatif (Analisis):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan mengapa pilihan tersebut merupakan tindakan paling tepat secara keamanan siber..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#476072] hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Simpan Soal Kuis
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
