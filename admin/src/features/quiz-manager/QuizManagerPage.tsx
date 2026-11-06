import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Award,
  Layers,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { QuizQuestionItem } from '../../types/admin';
import { toast } from 'sonner';

export const QuizManagerPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
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
    setLoading(false);
  };

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

    await adminService.createQuestion({
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
    // Reset
    setScenario('');
    setQuestionText('');
    setExplanation('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setCorrectIdx(0);
    await loadQuestions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus soal kuis ini?')) {
      await adminService.deleteQuestion(id);
      toast.info('Soal kuis telah dihapus.');
      await loadQuestions();
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A202C] tracking-tight">
            Bank Soal Guardian Challenge (Kuis Edukasi)
          </h2>
          <p className="text-xs text-[#5E6D7E] mt-0.5">
            Kelola skenario studi kasus, kunci jawaban, dan materi evaluasi interaktif pengguna.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary cursor-pointer text-xs">
          <Plus className="w-4 h-4" />
          <span>Tambah Soal Kuis</span>
        </button>
      </div>

      {/* QUESTIONS LIST */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#476072]">Memuat bank soal kuis...</div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {questions.map((q, idx) => (
            <div key={q.id} className="admin-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#D8E0E7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#334257] text-white font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#548CA8]/15 text-[#334257]">
                    {q.categoryCode.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#548CA8] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{q.points} Poin</span>
                  </span>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Hapus soal kuis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scenario */}
              <div className="p-3.5 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#476072] uppercase">
                  Skenario Kasus Penipuan:
                </span>
                <p className="text-xs text-[#1A202C] italic">"{q.scenario}"</p>
              </div>

              {/* Question */}
              <h4 className="text-sm font-bold text-[#1A202C]">{q.question}</h4>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${opt.isCorrect
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-white border-[#D8E0E7] text-gray-700'
                      }`}
                  >
                    {opt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Explanation Note */}
              <div className="p-3 rounded-xl bg-[#548CA8]/15 border border-[#D8E0E7] text-xs text-[#334257] flex items-start gap-2">
                <span className="font-bold shrink-0">Penjelasan Edukatif:</span>
                <p className="leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE QUIZ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
              <h3 className="text-base font-bold text-[#1A202C]">Tambah Soal Studi Kasus Kuis Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Kategori Modus:</label>
                  <select
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="phishing">Phishing</option>
                    <option value="apk_malware">APK Malware</option>
                    <option value="job_scam">Job Scam</option>
                    <option value="banking_fraud">Banking</option>
                    <option value="giveaway_scam">Giveaway</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Tingkat Kesulitan:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="Easy">Easy (Mudah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="Hard">Hard (Sulit)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Poin Kelulusan:</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    step="5"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>
              </div>

              {/* Scenario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Skenario Kasus / Cerita Masukan:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Anda menerima email tagihan pajak dengan lampiran Tagihan_DJP.zip..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Pertanyaan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Apa yang sebaiknya Anda lakukan sebelum mengekstrak berkas tersebut?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A202C] block">
                  Pilihan Jawaban (Pilih radio untuk jawaban yang BENAR):
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
                      name="correct_answer"
                      checked={correctIdx === item.idx}
                      onChange={() => setCorrectIdx(item.idx)}
                      className="w-4 h-4 accent-[#548CA8] cursor-pointer"
                      title="Tandai sebagai jawaban benar"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`${item.label}...`}
                      value={item.text}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Penjelasan Edukatif:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan alasan teknis mengapa jawaban tersebut benar..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E0E7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary cursor-pointer text-xs">
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


