import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Tag,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { KnowledgeArticleItem, ScamCategoryItem } from '../../types/admin';
import { toast } from 'sonner';

export const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticleItem[]>([]);
  const [categories, setCategories] = useState<ScamCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState('apk_malware');
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formVictims, setFormVictims] = useState('');
  const [formRedFlags, setFormRedFlags] = useState('');
  const [formSteps, setFormSteps] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [arts, cats] = await Promise.all([
      adminService.getArticles(),
      adminService.getCategories(),
    ]);
    setArticles(arts);
    setCategories(cats);
    setLoading(false);
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      toast.error('Judul dan ringkasan artikel wajib diisi!');
      return;
    }

    const catObj = categories.find((c) => c.code === formCategory);

    await adminService.createArticle({
      categoryCode: formCategory,
      categoryName: catObj ? catObj.name : formCategory,
      title: formTitle,
      summary: formSummary,
      targetVictims: formVictims || 'Masyarakat umum pengguna smartphone',
      redFlags: formRedFlags.split('\n').filter((l) => l.trim()),
      responseSteps: formSteps.split('\n').filter((l) => l.trim()),
      status: 'published',
    });

    toast.success('Artikel edukasi baru berhasil diterbitkan!');
    setIsModalOpen(false);
    // Reset form
    setFormTitle('');
    setFormSummary('');
    setFormVictims('');
    setFormRedFlags('');
    setFormSteps('');
    await loadData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus artikel "${title}"?`)) {
      await adminService.deleteArticle(id);
      toast.info('Artikel telah dihapus.');
      await loadData();
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A202C] tracking-tight">Pusat Pengetahuan &amp; Ensiklopedia Modus</h2>
          <p className="text-xs text-[#476072] mt-0.5">
            Kelola artikel panduan respon insiden dan kategori penipuan yang tampil di halaman Ensiklopedia.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </button>
      </div>

      {/* CATEGORIES OVERVIEW GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#476072] uppercase tracking-wider font-mono">
          Kategori Modus Terdaftar ({categories.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="admin-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#334257] bg-[#548CA8]/15 px-2 py-0.5 rounded-md">
                  {cat.code}
                </span>
                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${cat.riskTier === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                >
                  {cat.riskTier}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#1A202C]">{cat.name}</h4>
              <p className="text-[11px] text-[#476072] line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="text-[10px] font-mono text-[#476072] pt-1 border-t border-[#D8E0E7] flex items-center justify-between">
                <span>{cat.articleCount} Artikel Edukasi</span>
                <span>{cat.quizCount} Bank Soal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLES LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#476072] uppercase tracking-wider font-mono">
          Daftar Artikel Diterbitkan ({articles.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#476072]">Memuat artikel...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {articles.map((art) => (
              <div key={art.id} className="admin-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#548CA8]/15 text-[#334257]">
                      {art.categoryName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold">
                      {art.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#476072] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{art.views.toLocaleString()} views</span>
                    </span>

                    <button
                      onClick={() => handleDelete(art.id, art.title)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                      title="Hapus artikel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1A202C]">{art.title}</h4>
                  <p className="text-xs text-[#476072] leading-relaxed">{art.summary}</p>
                </div>

                {/* Red Flags & Steps Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-1.5">
                    <span className="font-bold text-[#1A202C] text-[11px] block text-rose-700">
                      Tanda Bahaya (Red Flags):
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#476072]">
                      {art.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-1.5">
                    <span className="font-bold text-[11px] block text-[#334257]">
                      Langkah Tanggap Darurat:
                    </span>
                    <ul className="list-decimal pl-4 space-y-0.5 text-[11px] text-[#476072]">
                      {art.responseSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE ARTICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
              <h3 className="text-base font-bold text-[#1A202C]">Tulis Materi Edukasi Modus Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Kategori Modus:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Judul Artikel:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modus Penipuan Undian Berhadiah Mengatasnamakan Bank"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Ringkasan Materi:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan secara ringkas bagaimana penipuan ini bekerja..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              {/* Target Victims */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Sasaran Korban:</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasabah bank, lansia, pengguna belanja online"
                  value={formVictims}
                  onChange={(e) => setFormVictims(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Red Flags (per line) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">
                  Tanda Bahaya (Tulis 1 per baris):
                </label>
                <textarea
                  rows={3}
                  placeholder="Meminta biaya pajak hadiah di muka&#10;Nomor pengirim berupa nomor HP pribadi&#10;Memberikan tenggat waktu tergesa-gesa"
                  value={formRedFlags}
                  onChange={(e) => setFormRedFlags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                ></textarea>
              </div>

              {/* Steps (per line) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">
                  Langkah Tanggap Darurat (Tulis 1 per baris):
                </label>
                <textarea
                  rows={3}
                  placeholder="Jangan pernah mentransfer biaya administrasi&#10;Konfirmasi ke call center resmi perusahaan&#10;Laporkan nomor kontak penipu"
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
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
                  Terbitkan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


