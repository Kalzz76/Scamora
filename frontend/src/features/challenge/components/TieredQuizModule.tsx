import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Shield,
  Layers,
  Check,
  Flame,
  ArrowLeft,
  Play,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TIERED_QUIZ_QUESTIONS,
  DIFFICULTY_METADATA,
  type QuizDifficulty,
  type QuizQuestion,
} from '../data/quizQuestions';

const STORAGE_PASSED_LEVELS = 'scamora_passed_quiz_levels';

function getPassedLevels(): QuizDifficulty[] {
  try {
    const raw = localStorage.getItem(STORAGE_PASSED_LEVELS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePassedLevel(level: QuizDifficulty) {
  try {
    const current = getPassedLevels();
    if (!current.includes(level)) {
      const updated = [...current, level];
      localStorage.setItem(STORAGE_PASSED_LEVELS, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
}

function prepareQuizSession(difficulty: QuizDifficulty): QuizQuestion[] {
  const pool = [...TIERED_QUIZ_QUESTIONS[difficulty]];
  // Shuffle questions randomly
  const shuffled = pool.sort(() => 0.5 - Math.random());
  // Pick up to 5 questions
  const selected = shuffled.slice(0, 5);

  // Also shuffle options within each question
  return selected.map((q) => ({
    ...q,
    options: [...q.options].sort(() => 0.5 - Math.random()),
  }));
}

export const TieredQuizModule: React.FC = () => {
  // Navigation Stage: 'level_select' -> 'in_quiz' -> 'quiz_result'
  const [stage, setStage] = useState<'level_select' | 'in_quiz' | 'quiz_result'>('level_select');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('pemula');
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [passedLevels, setPassedLevels] = useState<QuizDifficulty[]>([]);

  // Load passed levels on mount
  useEffect(() => {
    setPassedLevels(getPassedLevels());
  }, []);

  const meta = DIFFICULTY_METADATA[selectedDifficulty];
  const currentQ = sessionQuestions[currentIdx];
  const totalQuestions = sessionQuestions.length || 5;
  const isPassed = Math.round((score / totalQuestions) * 100) >= meta.passScorePercentage;

  // Start a quiz session for the chosen difficulty
  const handleStartLevel = (difficulty: QuizDifficulty) => {
    setSelectedDifficulty(difficulty);
    const qs = prepareQuizSession(difficulty);
    setSessionQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setStage('in_quiz');
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(idx);
    if (currentQ.options[idx].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setStage('quiz_result');
    }
  };

  // Trigger confetti upon passing on result screen
  useEffect(() => {
    if (stage === 'quiz_result' && isPassed) {
      savePassedLevel(selectedDifficulty);
      setPassedLevels(getPassedLevels());

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#143826', '#E86A33', '#248a3d', '#ffd700'],
      });
    }
  }, [stage, isPassed, selectedDifficulty]);

  const handleRestartCurrentLevel = () => {
    const qs = prepareQuizSession(selectedDifficulty);
    setSessionQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setStage('in_quiz');
  };

  const handleAdvanceToNextTier = () => {
    if (selectedDifficulty === 'pemula') {
      handleStartLevel('menengah');
    } else if (selectedDifficulty === 'menengah') {
      handleStartLevel('sulit');
    }
  };

  const handleBackToLevelSelect = () => {
    if (stage === 'in_quiz' && selectedOption === null && currentIdx > 0) {
      if (!confirm('Apakah Anda yakin ingin kembali ke menu tingkatan? Progres kuis saat ini akan direset.')) {
        return;
      }
    }
    setStage('level_select');
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TAHAP 1: TAMPILAN PILIHAN TINGKATAN LEVEL DULU */}
      {/* ======================================================== */}
      {stage === 'level_select' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner Tingkatan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold text-[#E86A33] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#E86A33]" />
                  <span>Tahap 1: Pilih Tingkatan Kuis Keamanan Siber</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                  Pilih Tingkat Kesulitan untuk Memulai Soal
                </h2>
              </div>

              {/* Progress Level Summary */}
              <div className="px-4 py-2 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3 shrink-0">
                <TrendingUp className="w-4 h-4 text-[#143826]" />
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
                    Progres Kelulusan
                  </span>
                  <span className="text-xs font-bold text-[#143826]">
                    {passedLevels.length} dari 3 Tingkat Dikuasai
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Uji literasi digital Anda secara bertahap mulai dari tingkat dasar hingga investigasi forensik tingkat lanjut. Setiap tingkatan memiliki kumpulan soal skenario nyata yang bervariasi.
            </p>
          </div>

          {/* 3 Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['pemula', 'menengah', 'sulit'] as const).map((diffKey) => {
              const dMeta = DIFFICULTY_METADATA[diffKey];
              const isLevelPassed = passedLevels.includes(diffKey);

              return (
                <div
                  key={diffKey}
                  className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container hover:border-[#143826]/40 transition-all shadow-xs flex flex-col justify-between space-y-5 group hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#143826] bg-[#143826]/10 px-2.5 py-1 rounded-full">
                        Level {dMeta.level}
                      </span>
                      {isLevelPassed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Lulus</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-on-surface-variant font-medium">
                          Target: {dMeta.passScorePercentage}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-on-surface group-hover:text-[#143826] transition-colors">
                        {dMeta.badge}
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {dMeta.description}
                      </p>
                    </div>

                    {/* Highlights Topics */}
                    <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container text-[11px] text-on-surface space-y-1">
                      <span className="font-bold block text-on-surface">Cakupan Topik Soal:</span>
                      <span className="text-on-surface-variant block leading-snug">
                        {diffKey === 'pemula' && '• Undian biaya di muka, Kurir APK dasar, Telp Vishing, Modus OTP'}
                        {diffKey === 'menengah' && '• Domain Spoofing, Taktik Baiting komisi awal, Quishing QRIS, Urgency'}
                        {diffKey === 'sulit' && '• Izin Accessibility Service, SIM Swap fraud, AI Deepfake voice, Mitigasi'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartLevel(diffKey)}
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all shadow-xs group-hover:shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 text-[#E86A33] fill-[#E86A33]" />
                    <span>Mulai Soal {diffKey === 'pemula' ? 'Pemula' : diffKey === 'menengah' ? 'Menengah' : 'Sulit'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAHAP 2: TAMPILAN SOAL KUIS (SETELAH LEVEL DIPILIH) */}
      {/* ======================================================== */}
      {stage === 'in_quiz' && currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Header Navigation & Info Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToLevelSelect}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ganti Tingkatan Level</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase ${meta.tagColor}`}>
                  {meta.title}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#143826]">Soal {currentIdx + 1} dari {totalQuestions}</span>
                <span className="text-on-surface-variant">&bull;</span>
                <span className="text-on-surface-variant hidden sm:inline">{currentQ.category}</span>
              </div>
              <span className="font-bold text-[#E86A33]">
                Skor: {score}/{currentIdx + (selectedOption !== null ? 1 : 0)}
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-[#143826] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario Case Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E86A33] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#E86A33]" />
                <span>Studi Kasus Skenario Nyata:</span>
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant font-medium sm:hidden">
                {currentQ.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium italic">
              "{currentQ.scenario}"
            </p>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase font-bold tracking-wider">
              Pertanyaan Analisis:
            </span>
            <h3 className="text-sm sm:text-base font-bold text-on-surface leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const showFeedback = selectedOption !== null;

              let btnStyle =
                'border-surface-container bg-surface-container-lowest hover:border-[#143826]/40 hover:bg-surface-container-low text-on-surface';
              if (showFeedback) {
                if (opt.isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 font-bold ring-1 ring-emerald-500';
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-950 font-bold ring-1 ring-rose-500';
                } else {
                  btnStyle = 'border-surface-container bg-surface-container-lowest opacity-40 text-on-surface-variant';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  type="button"
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 shadow-xs ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-surface-container font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt.text}</span>
                  {showFeedback && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {showFeedback && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Educational Feedback Box */}
          {selectedOption !== null && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#143826]/5 border border-[#143826]/15 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E86A33]" />
                <span className="font-mono text-xs font-bold uppercase text-[#143826]">
                  Penjelasan Edukasi Keamanan:
                </span>
              </div>
              <p className="text-xs text-on-surface leading-relaxed">
                {currentQ.options[selectedOption].reason}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>
                    {currentIdx < totalQuestions - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAHAP 3: TAMPILAN HASIL KUIS */}
      {/* ======================================================== */}
      {stage === 'quiz_result' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-[#143826] mx-auto flex items-center justify-center text-white shadow-md">
            {isPassed ? (
              <Award className="w-10 h-10 text-[#E86A33]" />
            ) : (
              <Shield className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <div className="space-y-2">
            <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${meta.tagColor}`}>
              {meta.title} &bull; Selesai
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface">
              {isPassed
                ? `Selamat! Anda Lulus ${meta.badge}`
                : 'Belum Mencapai Nilai Kelulusan Minimum'}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
              Anda berhasil menjawab <strong className="text-on-surface font-bold">{score} dari {totalQuestions}</strong> soal dengan benar ({Math.round((score / totalQuestions) * 100)}%).
            </p>
          </div>

          {/* Score Counter Highlights */}
          <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-surface-container-low border border-surface-container">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
                Persentase
              </span>
              <span className="text-2xl font-black text-[#143826] font-mono">
                {Math.round((score / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="h-8 w-px bg-surface-container-high" />
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
                Syarat Lulus
              </span>
              <span className="text-sm font-bold text-on-surface">
                Min. {meta.passScorePercentage}%
              </span>
            </div>
            <div className="h-8 w-px bg-surface-container-high" />
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
                Status
              </span>
              <span className={`text-sm font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isPassed ? 'LULUS' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          {/* Action Buttons (Progression / Next Level) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* If passed and next tier exists, provide prominent advance button */}
            {isPassed && selectedDifficulty !== 'sulit' && (
              <button
                onClick={handleAdvanceToNextTier}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E86A33] hover:bg-[#d45c27] text-white text-xs font-bold transition-all shadow-md"
              >
                <TrendingUp className="w-4 h-4" />
                <span>
                  {selectedDifficulty === 'pemula'
                    ? 'Lanjut ke Tingkat Menengah (Level 2) ➔'
                    : 'Tantang Tingkat Sulit (Level 3) ➔'}
                </span>
              </button>
            )}

            {isPassed && selectedDifficulty === 'sulit' && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-900 w-full sm:w-auto flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Luar Biasa! Anda telah menaklukkan seluruh tingkatan kuis keamanan siber!</span>
              </div>
            )}

            <button
              onClick={handleRestartCurrentLevel}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Acak Soal Baru di Tingkat Ini</span>
            </button>

            <button
              onClick={handleBackToLevelSelect}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-surface-container text-on-surface hover:bg-surface-container text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Menu Tingkatan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
