import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Power,
  Globe,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { DemoPresetItem, RiskLevel, ScamType } from '../../types/admin';
import { toast } from 'sonner';

export const DemoScenariosPage: React.FC = () => {
  const [presets, setPresets] = useState<DemoPresetItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'url' | 'chat'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<DemoPresetItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<'url' | 'chat'>('url');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<RiskLevel>('high');
  const [formScore, setFormScore] = useState<number>(85);
  const [formScamType, setFormScamType] = useState<ScamType>('phishing');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    const data = await adminService.getPresets();
    setPresets(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingPreset(null);
    setFormType('url');
    setFormTitle('');
    setFormSubtitle('');
    setFormContent('');
    setFormCategory('high');
    setFormScore(85);
    setFormScamType('phishing');
    setFormTags('Bank, Phishing, HTTP');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (preset: DemoPresetItem) => {
    setEditingPreset(preset);
    setFormType(preset.type);
    setFormTitle(preset.title);
    setFormSubtitle(preset.subtitle);
    setFormContent(preset.content);
    setFormCategory(preset.expectedCategory);
    setFormScore(preset.expectedScore);
    setFormScamType(preset.scamType);
    setFormTags(preset.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Judul dan konten skenario wajib diisi!');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPreset) {
      await adminService.updatePreset(editingPreset.id, {
        title: formTitle,
        subtitle: formSubtitle,
        content: formContent,
        expectedCategory: formCategory,
        expectedScore: formScore,
        scamType: formScamType,
        tags: tagsArray,
      });
      toast.success('Skenario demo berhasil diperbarui!');
    } else {
      await adminService.createPreset({
        type: formType,
        title: formTitle,
        subtitle: formSubtitle,
        content: formContent,
        expectedCategory: formCategory,
        expectedScore: formScore,
        scamType: formScamType,
        tags: tagsArray,
        isActive: true,
      });
      toast.success('Skenario demo baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
    await loadPresets();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus skenario demo "${title}"?`)) {
      await adminService.deletePreset(id);
      toast.info('Skenario demo telah dihapus.');
      await loadPresets();
    }
  };

  const handleToggle = async (id: string) => {
    await adminService.togglePreset(id);
    await loadPresets();
    toast.success('Status aktif skenario berhasil diubah.');
  };

  const filteredPresets = presets.filter((p) => {
    const matchType = filterType === 'all' || p.type === filterType;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A202C] tracking-tight">Manajemen Skenario Uji Demo</h2>
          <p className="text-xs text-[#476072] mt-0.5">
            Kelola data simulasi URL dan Chat yang dapat langsung dicoba oleh pengguna di web publik.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary cursor-pointer text-xs">
          <Plus className="w-4 h-4" />
          <span>Tambah Skenario Baru</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#D8E0E7] shadow-xs">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${filterType === 'all' ? 'bg-[#334257] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            Semua ({presets.length})
          </button>
          <button
            onClick={() => setFilterType('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${filterType === 'url' ? 'bg-[#334257] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL Phishing ({presets.filter((p) => p.type === 'url').length})</span>
          </button>
          <button
            onClick={() => setFilterType('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${filterType === 'chat' ? 'bg-[#548CA8] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat WA ({presets.filter((p) => p.type === 'chat').length})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#476072] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari skenario, kata kunci, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
          />
        </div>
      </div>

      {/* PRESETS LIST TABLE / CARDS */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#476072]">Memuat skenario demo...</div>
      ) : filteredPresets.length === 0 ? (
        <div className="admin-card p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#476072] mx-auto opacity-50" />
          <div className="text-sm font-bold text-[#1A202C]">Tidak ada skenario yang sesuai</div>
          <p className="text-xs text-[#476072]">Coba ubah filter atau tambahkan skenario baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className={`admin-card p-5 space-y-4 transition-all ${!preset.isActive ? 'opacity-60 bg-gray-50' : ''
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${preset.type === 'url' ? 'bg-[#334257]/10 text-[#334257]' : 'bg-[#548CA8]/15 text-[#548CA8]'
                      }`}
                  >
                    {preset.type === 'url' ? <Globe className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    <span>{preset.type.toUpperCase()}</span>
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${preset.expectedCategory === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : preset.expectedCategory === 'review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                  >
                    {preset.expectedCategory.toUpperCase()} (~{preset.expectedScore} Poin)
                  </span>

                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-700">
                    Modus: {preset.scamType.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(preset.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${preset.isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    title="Toggle tampil di frontend publik"
                  >
                    <Power className="w-3 h-3" />
                    <span>{preset.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(preset)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                    title="Edit skenario"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(preset.id, preset.title)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Hapus skenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1A202C]">{preset.title}</h4>
                <p className="text-xs text-[#476072]">{preset.subtitle}</p>
              </div>

              {/* Content Box */}
              <div className="p-3 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7]">
                <code className="text-xs font-mono text-[#334257] break-all block whitespace-pre-wrap">
                  {preset.content}
                </code>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {preset.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#D8E0E7] text-[10px] text-[#476072] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
              <h3 className="text-base font-bold text-[#1A202C]">
                {editingPreset ? 'Edit Skenario Demo' : 'Tambah Skenario Demo Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type selector */}
              {!editingPreset && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Tipe Input:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('url')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${formType === 'url' ? 'border-[#334257] bg-[#334257]/10 text-[#334257]' : 'border-[#D8E0E7] text-gray-600'
                        }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>URL Web Tautan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('chat')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${formType === 'chat' ? 'border-[#548CA8] bg-[#548CA8]/15 text-[#548CA8]' : 'border-[#D8E0E7] text-gray-600'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Judul Skenario:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Phishing Mandiri Livin Palsu"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Subjudul / Ringkasan Modus:</label>
                <input
                  type="text"
                  placeholder="Contoh: Form login palsu mencuri PIN & Password"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Content / URL / Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">
                  {formType === 'url' ? 'Alamat URL Lengkap:' : 'Isi Teks Chat WhatsApp:'}
                </label>
                {formType === 'url' ? (
                  <input
                    type="text"
                    required
                    placeholder="https://contoh-link-palsu.xyz/login"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                ) : (
                  <textarea
                    rows={4}
                    required
                    placeholder="Masukkan narasi chat penipuan..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  ></textarea>
                )}
              </div>

              {/* Grid 3 settings: Category, Score, Scam Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Kategori Risiko:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="high">HIGH (Tinggi)</option>
                    <option value="review">REVIEW (Perlu Tinjau)</option>
                    <option value="low">LOW (Rendah)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Ekspektasi Skor:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formScore}
                    onChange={(e) => setFormScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C]">Modus Kejahatan:</label>
                  <select
                    value={formScamType}
                    onChange={(e) => setFormScamType(e.target.value as ScamType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="phishing">Phishing</option>
                    <option value="job_scam">Job Scam</option>
                    <option value="apk_malware">APK Malware</option>
                    <option value="banking_fraud">Banking Fraud</option>
                    <option value="giveaway_scam">Giveaway</option>
                    <option value="investment_scam">Investasi</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C]">Tag Label (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  placeholder="Bank, Phishing, Typosquatting"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E0E7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary cursor-pointer text-xs">
                  Simpan Skenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


