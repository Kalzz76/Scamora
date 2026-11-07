import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  Copy,
  Check,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { KnowledgeArticleItem, ScamCategoryItem } from '../../types/admin';
import { toast } from 'sonner';

export const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticleItem[]>([]);
  const [categories, setCategories] = useState<ScamCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Article for Detail Popup Modal
  const [activeDetailArticle, setActiveDetailArticle] = useState<KnowledgeArticleItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Copy state
  const [isCopied, setIsCopied] = useState(false);

  // Modal State for New Article
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState('apk_malware');
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formVictims, setFormVictims] = useState('');
  const [redFlagsList, setRedFlagsList] = useState<string[]>([]);
  const [currentRedFlagInput, setCurrentRedFlagInput] = useState('');
  const [stepsList, setStepsList] = useState<string[]>([]);
  const [currentStepInput, setCurrentStepInput] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editVictims, setEditVictims] = useState('');
  const [editStatus, setEditStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [editRedFlags, setEditRedFlags] = useState<string[]>([]);
  const [currentEditRedFlag, setCurrentEditRedFlag] = useState('');
  const [editSteps, setEditSteps] = useState<string[]>([]);
  const [currentEditStep, setCurrentEditStep] = useState('');

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

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (selectedCategory !== 'all' && art.categoryCode !== selectedCategory) {
        return false;
      }
      if (statusFilter !== 'all' && art.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = art.title.toLowerCase().includes(q);
        const inSummary = art.summary.toLowerCase().includes(q);
        const inCategory = art.categoryName.toLowerCase().includes(q);
        const inVictim = art.targetVictims.toLowerCase().includes(q);
        const inFlags = art.redFlags.some((f) => f.toLowerCase().includes(q));
        return inTitle || inSummary || inCategory || inVictim || inFlags;
      }
      return true;
    });
  }, [articles, selectedCategory, statusFilter, searchQuery]);

  // Copy full article guide to clipboard
  const handleCopyGuide = (art: KnowledgeArticleItem) => {
    const text = `🚨 [PANDUAN WASPADA SIBER: ${art.title.toUpperCase()}]\n\nKategori: ${art.categoryName}\nTarget Korban: ${art.targetVictims}\n\nRingkasan Kasus:\n${art.summary}\n\n⚠️ TANDA BAHAYA (RED FLAGS):\n${art.redFlags.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n🛡️ PROTOKOL MITIGASI DARURAT:\n${art.responseSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nSumber: Scamora Cyber Incident Intelligence`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Format panduan lengkap telah disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Toggle Published / Draft status
  const handleToggleStatus = async (art: KnowledgeArticleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    const updated = await adminService.updateArticle(art.id, { status: nextStatus });
    if (activeDetailArticle && activeDetailArticle.id === art.id && updated) {
      setActiveDetailArticle(updated);
    }
    toast.success(`Status materi diubah menjadi ${nextStatus.toUpperCase()}`);
    await loadData();
  };

  // Open Edit Modal
  const handleOpenEdit = (art: KnowledgeArticleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingArticleId(art.id);
    setEditCategory(art.categoryCode);
    setEditTitle(art.title);
    setEditSummary(art.summary);
    setEditVictims(art.targetVictims);
    setEditStatus(art.status);
    setEditRedFlags([...art.redFlags]);
    setEditSteps([...art.responseSteps]);
    setCurrentEditRedFlag('');
    setCurrentEditStep('');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticleId) return;
    if (!editTitle.trim()) {
      toast.error('Judul materi wajib diisi');
      return;
    }
    const catObj = categories.find((c) => c.code === editCategory);
    const updated = await adminService.updateArticle(editingArticleId, {
      categoryCode: editCategory,
      categoryName: catObj?.name || editCategory,
      title: editTitle.trim(),
      summary: editSummary.trim(),
      targetVictims: editVictims.trim() || 'Masyarakat umum & pengguna digital',
      status: editStatus,
      redFlags: editRedFlags.length > 0 ? editRedFlags : ['Tidak ada indikator spesifik'],
      responseSteps: editSteps.length > 0 ? editSteps : ['Laporkan ke pihak berwenang'],
    });

    if (updated) {
      if (activeDetailArticle && activeDetailArticle.id === editingArticleId) {
        setActiveDetailArticle(updated);
      }
      toast.success('Materi edukasi berhasil diperbarui!');
      setIsEditModalOpen(false);
      setEditingArticleId(null);
      await loadData();
    }
  };

  // Edit Chip helpers
  const addEditRedFlag = () => {
    if (currentEditRedFlag.trim()) {
      setEditRedFlags([...editRedFlags, currentEditRedFlag.trim()]);
      setCurrentEditRedFlag('');
    }
  };

  const removeEditRedFlag = (idx: number) => {
    setEditRedFlags(editRedFlags.filter((_, i) => i !== idx));
  };

  const addEditStep = () => {
    if (currentEditStep.trim()) {
      setEditSteps([...editSteps, currentEditStep.trim()]);
      setCurrentEditStep('');
    }
  };

  const removeEditStep = (idx: number) => {
    setEditSteps(editSteps.filter((_, i) => i !== idx));
  };

  // Delete article
  const handleDeleteArticle = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Hapus materi edukasi "${title}"?`)) {
      await adminService.deleteArticle(id);
      toast.info('Materi edukasi telah dihapus.');
      if (activeDetailArticle && activeDetailArticle.id === id) {
        setActiveDetailArticle(null);
      }
      await loadData();
    }
  };

  // Chip helpers for Modal Form
  const addRedFlagChip = () => {
    if (currentRedFlagInput.trim()) {
      setRedFlagsList([...redFlagsList, currentRedFlagInput.trim()]);
      setCurrentRedFlagInput('');
    }
  };

  const removeRedFlagChip = (index: number) => {
    setRedFlagsList(redFlagsList.filter((_, i) => i !== index));
  };

  const addStepChip = () => {
    if (currentStepInput.trim()) {
      setStepsList([...stepsList, currentStepInput.trim()]);
      setCurrentStepInput('');
    }
  };

  const removeStepChip = (index: number) => {
    setStepsList(stepsList.filter((_, i) => i !== index));
  };

  // Quick Preset Templates
  const applyPreset = (type: 'bank' | 'apk' | 'job') => {
    if (type === 'bank') {
      setFormCategory('bank_phishing');
      setFormTitle('Pencurian Kredensial via Situs Web Internet Banking Tiruan');
      setFormSummary('Pelaku menyebarkan tautan SMS/WhatsApp dengan manipulasi kepanikan (rekening diblokir atau kenaikan biaya transfer) menuju form login bank tiruan untuk merebut nomor kartu, PIN, dan kode OTP.');
      setFormVictims('Nasabah perbankan online & pengguna m-banking');
      setRedFlagsList([
        'Alamat website bukan domain resmi perbankan (menggunakan domain murah/aneh)',
        'Formulir meminta data rahasia seperti CVV/CVC kartu dan kode OTP SMS',
        'Pemberitahuan disertai ancaman pembekuan rekening jika tidak verifikasi dalam 1 jam',
      ]);
      setStepsList([
        'Jangan masukkan kode OTP, PIN, atau nomor kartu ATM pada halaman dari tautan',
        'Bila sempat mengisi, segera buka aplikasi m-banking resmi dan ubah kata sandi / kunci kartu',
        'Hubungi call center resmi bank terkait untuk membekukan akses transaksi',
      ]);
    } else if (type === 'apk') {
      setFormCategory('apk_malware');
      setFormTitle('Penyusupan Trojan SMS Berkedok Undangan Nikah / Resi Paket (.APK)');
      setFormSummary('Pelaku mengirim berkas aplikasi Android (.apk) berpura-pura menjadi dokumen surat undangan atau foto paket kurir. Saat diinstal, malware membajak izin aksesibilitas untuk meneruskan SMS OTP perbankan ke server pelaku.');
      setFormVictims('Masyarakat umum pemilik smartphone Android');
      setRedFlagsList([
        'Berkas yang dikirim berekstensi .apk bukan gambar (.jpg) atau PDF (.pdf)',
        'Aplikasi meminta izin berlebih saat dipasang (membaca SMS & aksesibilitas)',
        'Pengirim adalah nomor asing yang berpura-pura menjadi kurir atau kerabat',
      ]);
      setStepsList([
        'Jangan buka atau klik pasang file .APK yang dikirim oleh pihak tak dikenal',
        'Jika sudah terpasang, segera aktifkan Mode Pesawat (Airplane Mode) untuk memutus koneksi',
        'Hapus aplikasi melalui menu Pengaturan > Aplikasi, lalu cabut semua izin aksesibilitas',
        'Amankan akun perbankan melalui perangkat lain yang bersih',
      ]);
    } else {
      setFormCategory('fake_job');
      setFormTitle('Penipuan Kerja Paruh Waktu / Komisi Like Video (Task Scam)');
      setFormSummary('Korban dijanjikan penghasilan jutaan per hari dengan tugas mudah like video atau ulasan produk. Setelah diberikan komisi kecil di awal sebagai umpan, korban diwajibkan mentransfer deposit jutaan rupiah yang kemudian dibawa kabur.');
      setFormVictims('Pencari kerja tambahan, mahasiswa, ibu rumah tangga');
      setRedFlagsList([
        'Gaji harian tidak masuk akal untuk tugas yang sangat remeh',
        'Komunikasi diarahkan ke grup Telegram anonim dengan testimoni palsu',
        'Diminta menyetor uang jaminan (deposit) sebelum komisi bisa dicairkan',
      ]);
      setStepsList([
        'Tolak segala bentuk transfer uang dalam proses rekrutmen kerja online',
        'Tinggalkan dan blokir grup Telegram atau nomor WhatsApp pihak perekrut',
        'Laporkan nomor rekening penipu ke portal CekRekening.id',
      ]);
    }
  };

  // Submit Article Form
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) {
      toast.error('Judul dan ringkasan materi wajib diisi!');
      return;
    }

    const catObj = categories.find((c) => c.code === formCategory);

    const created = await adminService.createArticle({
      categoryCode: formCategory,
      categoryName: catObj ? catObj.name : formCategory,
      title: formTitle,
      summary: formSummary,
      targetVictims: formVictims || 'Masyarakat umum pengguna smartphone & perbankan',
      redFlags: redFlagsList.length > 0 ? redFlagsList : ['Permintaan data sensitif atau transfer dana tergesa-gesa'],
      responseSteps: stepsList.length > 0 ? stepsList : ['Hentikan komunikasi dan amankan akun perbankan'],
      status: formStatus,
    });

    toast.success('Materi edukasi baru berhasil disimpan!');
    setIsModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormSummary('');
    setFormVictims('');
    setRedFlagsList([]);
    setStepsList([]);
    await loadData();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 w-full">
      
      {/* 1. TOP BAR: TITLE & PRIMARY ACTION (FROSTED GLASS PANEL) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold tracking-wider uppercase">
                Pusat Intelijen Edukasi
              </span>
              <span className="text-[#476072] text-xs">&bull;</span>
              <span className="text-xs text-[#476072] font-medium">Scam Taxonomy &amp; Incident Protocols</span>
            </div>
            <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">
              Pusat Pengetahuan &amp; Ensiklopedia Modus
            </h1>
            <p className="text-xs text-[#476072]">
              Kelola anatomi penipuan digital, panduan mitigasi korban, dan tanda bahaya yang terhubung ke platform publik.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Tulis Materi Baru</span>
          </button>
        </div>

      {/* 2. CATEGORY PILLS BAR (Minimalist, Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-[#334257] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-[#476072] border border-slate-200'
          }`}
        >
          <span>Semua Kategori</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#476072]'
          }`}>
            {articles.length}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.code;
          const isCritical = cat.riskTier === 'CRITICAL';
          const count = articles.filter((a) => a.categoryCode === cat.code).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#334257] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-[#476072] border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#476072]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH & STATUS FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#476072] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari materi edukasi, judul, atau kata kunci tanda bahaya..."
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

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#476072] font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#334257] focus:outline-hidden cursor-pointer"
          >
            <option value="all">Semua Status ({articles.length})</option>
            <option value="published">Terbit ({articles.filter(a => a.status === 'published').length})</option>
            <option value="draft">Draf ({articles.filter(a => a.status === 'draft').length})</option>
          </select>
        </div>
      </div>
    </div>

      {/* 4. FULL-WIDTH RESPONSIVE CARD GRID FOR ARTICLES */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#476072] glass-panel rounded-2xl">
          Memuat basis materi edukasi...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#1A202C]">Tidak ada materi yang cocok</h3>
          <p className="text-xs text-[#476072] max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => {
            const isPublished = art.status === 'published';

            return (
              <div
                key={art.id}
                onClick={() => setActiveDetailArticle(art)}
                className="p-5 rounded-2xl glass-panel hover:border-[#548CA8] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4 relative"
              >
                {/* Card Top Meta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257]">
                      {art.categoryName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenEdit(art, e)}
                        className="p-1 rounded-md border border-slate-200 hover:border-[#548CA8] bg-white/70 hover:bg-white text-[#476072] hover:text-[#548CA8] transition cursor-pointer"
                        title="Edit materi ini"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleToggleStatus(art, e)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {art.status.toUpperCase()}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-[#1A202C] group-hover:text-[#548CA8] transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  {/* Summary Snippet */}
                  <p className="text-xs text-[#476072] line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {/* Card Footer: Metadata & Trigger */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-[#476072]">
                    <span className="flex items-center gap-1 text-[11px] font-medium truncate max-w-[170px]">
                      <Users className="w-3.5 h-3.5 text-[#548CA8] shrink-0" />
                      <span className="truncate">{art.targetVictims}</span>
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-[#548CA8]" />
                      <span>{art.views.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Open Detail Button Pill */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-[#5E6D7E]">
                      {art.redFlags.length} flags &bull; {art.responseSteps.length} langkah
                    </span>
                    <span className="text-xs font-bold text-[#548CA8] group-hover:text-[#334257] flex items-center gap-1 transition-colors">
                      <span>Lihat Detail Ilmu</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. DETAIL POPUP MODAL (Menggantikan display sebelah kanan) */}
      {activeDetailArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257] dark:text-cyan-300 font-mono text-xs font-bold">
                  {activeDetailArticle.categoryName}
                </span>
                <button
                  onClick={() => handleToggleStatus(activeDetailArticle)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                    activeDetailArticle.status === 'published'
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/30'
                  }`}
                  title="Klik untuk mengubah status terbit"
                >
                  {activeDetailArticle.status.toUpperCase()}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(activeDetailArticle)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-[#334257] dark:text-white transition cursor-pointer flex items-center gap-1.5"
                  title="Edit data materi ini"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#548CA8] dark:text-cyan-400" />
                  <span>Edit Materi</span>
                </button>

                <button
                  onClick={() => handleCopyGuide(activeDetailArticle)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-[#334257] dark:text-white transition cursor-pointer flex items-center gap-1.5"
                  title="Salin panduan lengkap untuk dibagikan"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Teks'}</span>
                </button>

                <button
                  onClick={() => handleDeleteArticle(activeDetailArticle.id, activeDetailArticle.title)}
                  className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 transition cursor-pointer"
                  title="Hapus materi ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveDetailArticle(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Tutup pop-up"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title & Audience */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#1A202C] dark:text-white leading-snug tracking-tight">
                {activeDetailArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#476072] dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#548CA8] dark:text-cyan-400" />
                  <span>Sasaran Korban: <strong className="text-[#1A202C] dark:text-slate-200">{activeDetailArticle.targetVictims}</strong></span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-[#548CA8] dark:text-cyan-400" />
                  <span>{activeDetailArticle.views.toLocaleString()} tayangan</span>
                </span>
              </div>
            </div>

            {/* Summary Description */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-bold font-mono text-[#476072] dark:text-slate-400 uppercase tracking-wider block">
                Ringkasan &amp; Cara Kerja Modus:
              </span>
              <p className="text-xs text-[#334257] dark:text-slate-200 leading-relaxed">
                {activeDetailArticle.summary}
              </p>
            </div>

            {/* Red Flags & Emergency Protocol Blocks */}
            <div className="space-y-4">
              
              {/* 1. Tanda Bahaya (Red Flags) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                    Ciri Khas &amp; Tanda Bahaya ({activeDetailArticle.redFlags.length} Indikator):
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {activeDetailArticle.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-500/30 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span className="leading-relaxed font-medium">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Protokol Tanggap Darurat */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                    Protokol Respon Darurat Korban ({activeDetailArticle.responseSteps.length} Langkah):
                  </h3>
                </div>
                <div className="space-y-2">
                  {activeDetailArticle.responseSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/30 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#334257] dark:bg-emerald-700 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#476072] dark:text-slate-400">
                ID: {activeDetailArticle.id} &bull; Diperbarui: {new Date(activeDetailArticle.updatedAt).toLocaleDateString('id-ID')}
              </span>
              <button
                type="button"
                onClick={() => setActiveDetailArticle(null)}
                className="px-4 py-2 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL FORM: TULIS MATERI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#548CA8] dark:text-cyan-400 uppercase">
                  Editor Pengetahuan Modus
                </span>
                <h3 className="text-base font-bold text-[#1A202C] dark:text-white">
                  Tulis Materi Edukasi Penipuan Baru
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[#476072] dark:text-slate-400 font-mono shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Template Cepat:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('bank')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#334257] dark:text-slate-200 font-semibold text-[11px] whitespace-nowrap cursor-pointer transition border border-transparent dark:border-white/10"
              >
                🏦 Phishing Bank
              </button>
              <button
                type="button"
                onClick={() => applyPreset('apk')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#334257] dark:text-slate-200 font-semibold text-[11px] whitespace-nowrap cursor-pointer transition border border-transparent dark:border-white/10"
              >
                📦 Berkas APK
              </button>
              <button
                type="button"
                onClick={() => applyPreset('job')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#334257] dark:text-slate-200 font-semibold text-[11px] whitespace-nowrap cursor-pointer transition border border-transparent dark:border-white/10"
              >
                💼 Lowongan Palsu
              </button>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-4">
              
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Kategori Modus:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.riskTier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Status Publikasi:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="published">Langsung Terbitkan (Published)</option>
                    <option value="draft">Simpan sebagai Draf (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Judul Materi Edukasi:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modus Penipuan Undian Berhadiah Mengatasnamakan Bank"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] font-semibold"
                />
              </div>

              {/* Target Victims */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Sasaran Korban:</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasabah bank, lansia, pengguna belanja online"
                  value={formVictims}
                  onChange={(e) => setFormVictims(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Ringkasan / Cara Kerja Modus:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan secara ringkas bagaimana penipuan ini bekerja..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] leading-relaxed"
                ></textarea>
              </div>

              {/* Red Flags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C] flex items-center justify-between">
                  <span>Tanda Bahaya (Red Flags):</span>
                  <span className="text-[10px] text-[#476072] font-normal">Tekan Enter atau klik Tambah</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Meminta biaya pajak hadiah di muka..."
                    value={currentRedFlagInput}
                    onChange={(e) => setCurrentRedFlagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRedFlagChip();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <button
                    type="button"
                    onClick={addRedFlagChip}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-[#334257] cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
                {redFlagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {redFlagsList.map((rf, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                      >
                        <span>{rf}</span>
                        <button
                          type="button"
                          onClick={() => removeRedFlagChip(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Response Steps Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C] flex items-center justify-between">
                  <span>Langkah Tanggap Darurat:</span>
                  <span className="text-[10px] text-[#476072] font-normal">Tekan Enter atau klik Tambah</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Jangan pernah mentransfer biaya administrasi..."
                    value={currentStepInput}
                    onChange={(e) => setCurrentStepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addStepChip();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <button
                    type="button"
                    onClick={addStepChip}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-[#334257] cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
                {stepsList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {stepsList.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950"
                      >
                        <span>{idx + 1}. {step}</span>
                        <button
                          type="button"
                          onClick={() => removeStepChip(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  Simpan Materi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL FORM: EDIT MATERI EDUKASI */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-[#548CA8] dark:text-cyan-400 uppercase">
                  Editor Pengetahuan Modus
                </span>
                <h3 className="text-base font-bold text-[#1A202C] dark:text-white">
                  Edit Materi Edukasi Penipuan
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Kategori Modus:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.riskTier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1A202C]">Status Publikasi:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="published">Terbit (Published - Tayang di Web Publik)</option>
                    <option value="draft">Draf (Hanya Admin Internal)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Judul Kasus / Modus Penipuan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Phishing Web Perbankan..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Target Victims */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Target Sasaran Korban:</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasabah m-banking, pencari kerja..."
                  value={editVictims}
                  onChange={(e) => setEditVictims(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1A202C]">Ringkasan Anatomi Modus:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan secara ringkas bagaimana penipuan ini beroperasi..."
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Red Flags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C] flex items-center justify-between">
                  <span>Tanda Bahaya (Red Flags):</span>
                  <span className="text-[10px] text-[#476072] font-normal">Tekan Enter atau klik Tambah</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Meminta kode OTP SMS..."
                    value={currentEditRedFlag}
                    onChange={(e) => setCurrentEditRedFlag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditRedFlag();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <button
                    type="button"
                    onClick={addEditRedFlag}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-[#334257] cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
                {editRedFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editRedFlags.map((rf, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                      >
                        <span>{rf}</span>
                        <button
                          type="button"
                          onClick={() => removeEditRedFlag(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Response Steps Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A202C] flex items-center justify-between">
                  <span>Langkah Tanggap Darurat:</span>
                  <span className="text-[10px] text-[#476072] font-normal">Tekan Enter atau klik Tambah</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Jangan pernah mentransfer biaya administrasi..."
                    value={currentEditStep}
                    onChange={(e) => setCurrentEditStep(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditStep();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <button
                    type="button"
                    onClick={addEditStep}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-[#334257] cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
                {editSteps.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {editSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950"
                      >
                        <span>{idx + 1}. {step}</span>
                        <button
                          type="button"
                          onClick={() => removeEditStep(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#476072] hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
