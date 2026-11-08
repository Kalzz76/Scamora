import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Eye,
  Check,
  X,
  MessageSquare,
  Shield,
  UserCheck,
  Pencil,
  Trash2,
  Plus,
  Search,
  Filter,
  DollarSign,
  User,
  Calendar,
  AlertOctagon,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { CommunityPostItem, ModerationReportItem } from '../../types/admin';
import { toast } from 'sonner';

export const ModerationQueuePage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [reports, setReports] = useState<ModerationReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  // Detail Modal State
  const [activeDetailPost, setActiveDetailPost] = useState<CommunityPostItem | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('job_scam');
  const [editStatus, setEditStatus] = useState<'published' | 'under_review' | 'hidden'>('published');
  const [editLoss, setEditLoss] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editPiiScrubbed, setEditPiiScrubbed] = useState(true);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('job_scam');
  const [newStatus, setNewStatus] = useState<'published' | 'under_review' | 'hidden'>('under_review');
  const [newLoss, setNewLoss] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newPiiScrubbed, setNewPiiScrubbed] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [pList, rList] = await Promise.all([
      adminService.getCommunityPosts(),
      adminService.getReports(),
    ]);
    setPosts(pList);
    setReports(rList);
    setLoading(false);
  };

  // Filtered Community Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory !== 'all' && post.categoryCode !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && post.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = post.title.toLowerCase().includes(query);
        const inAuthor = post.authorPseudonym.toLowerCase().includes(query);
        const inStory = post.story.toLowerCase().includes(query);
        const inCategory = post.categoryCode.toLowerCase().includes(query);
        return inTitle || inAuthor || inStory || inCategory;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedStatus, searchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (reportFilter !== 'all' && rep.status !== reportFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = rep.postTitle.toLowerCase().includes(query);
        const inReporter = rep.reporterPseudonym.toLowerCase().includes(query);
        const inReason = rep.reason.toLowerCase().includes(query);
        const inNotes = (rep.notes || '').toLowerCase().includes(query);
        return inTitle || inReporter || inReason || inNotes;
      }
      return true;
    });
  }, [reports, reportFilter, searchQuery]);

  // Status updates
  const handleUpdateStatus = async (id: string, status: 'published' | 'hidden' | 'under_review', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await adminService.updatePostStatus(id, status);
    toast.success(`Status postingan diubah menjadi ${status.toUpperCase()}`);
    if (activeDetailPost && activeDetailPost.id === id) {
      setActiveDetailPost({ ...activeDetailPost, status });
    }
    await loadData();
  };

  // Delete post
  const handleDeletePost = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus postingan cerita "${title}"?`)) {
      await adminService.deleteCommunityPost(id);
      toast.info('Postingan komunitas telah dihapus.');
      if (activeDetailPost && activeDetailPost.id === id) {
        setActiveDetailPost(null);
      }
      await loadData();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (post: CommunityPostItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditAuthor(post.authorPseudonym);
    setEditCategory(post.categoryCode);
    setEditStatus(post.status);
    setEditLoss(post.financialLossEstimate || '');
    setEditStory(post.story);
    setEditPiiScrubbed(post.piiScrubbed);
    setIsEditModalOpen(true);
  };

  // Save Edit Post
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostId) return;

    if (!editTitle.trim() || !editStory.trim()) {
      toast.error('Judul dan isi cerita wajib diisi!');
      return;
    }

    const updatedPost: CommunityPostItem = {
      id: editingPostId,
      title: editTitle.trim(),
      authorPseudonym: editAuthor.trim() || 'Anonim',
      categoryCode: editCategory,
      status: editStatus,
      financialLossEstimate: editLoss.trim() || undefined,
      story: editStory.trim(),
      piiScrubbed: editPiiScrubbed,
      reportCount: posts.find((p) => p.id === editingPostId)?.reportCount || 0,
      createdAt: posts.find((p) => p.id === editingPostId)?.createdAt || new Date().toISOString(),
    };

    await adminService.updateCommunityPost(updatedPost);
    toast.success('Postingan komunitas berhasil diperbarui!');
    setIsEditModalOpen(false);
    if (activeDetailPost && activeDetailPost.id === editingPostId) {
      setActiveDetailPost(updatedPost);
    }
    await loadData();
  };

  // Create New Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStory.trim()) {
      toast.error('Judul dan isi cerita penipuan wajib diisi!');
      return;
    }

    await adminService.createCommunityPost({
      title: newTitle.trim(),
      authorPseudonym: newAuthor.trim() || 'Korban_Anonim',
      categoryCode: newCategory,
      status: newStatus,
      financialLossEstimate: newLoss.trim() || undefined,
      story: newStory.trim(),
      piiScrubbed: newPiiScrubbed,
      reportCount: 0,
    });

    toast.success('Cerita komunitas baru berhasil ditambahkan!');
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewAuthor('');
    setNewLoss('');
    setNewStory('');
    setNewPiiScrubbed(true);
    await loadData();
  };

  // Report resolution
  const handleResolveReport = async (id: string, action: 'resolve' | 'dismiss') => {
    await adminService.resolveReport(id, action);
    toast.success(`Laporan pengaduan telah ${action === 'resolve' ? 'diselesaikan (ditindak)' : 'diabaikan'}`);
    await loadData();
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const categoryFilters = [
    { code: 'all', label: 'Semua Kategori' },
    { code: 'job_scam', label: 'Job Scam' },
    { code: 'apk_malware', label: 'APK Malware' },
    { code: 'banking_fraud', label: 'Banking Fraud' },
    { code: 'phishing', label: 'Phishing' },
    { code: 'investment_scam', label: 'Investasi Bodong' },
    { code: 'giveaway_scam', label: 'Giveaway Palsu' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 w-full">
      
      {/* 1. TOP HEADER & MAIN CONTROLS (FROSTED GLASS PANEL) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold tracking-wider uppercase">
                Moderasi Komunitas
              </span>
              <span className="text-[#476072] text-xs">&bull;</span>
              <span className="text-xs text-[#476072] font-medium">Citizen Reporting & PII Scrubbing</span>
            </div>
            <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">
              Moderasi Komunitas &amp; Laporan Konten
            </h1>
            <p className="text-xs text-[#476072]">
              Kelola testimoni korban kejahatan siber, kurasi masker data pribadi (PII), dan tindak lanjuti laporan konten publik.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Create Story Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tambah Cerita Kasus</span>
            </button>
          </div>
        </div>

        {/* Tab switch & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/70 border border-slate-200 shadow-2xs w-fit">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-[#334257] text-white shadow-2xs'
                  : 'text-[#476072] hover:text-[#1A202C]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Cerita Komunitas ({posts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#548CA8] text-white shadow-2xs'
                  : 'text-[#476072] hover:text-[#1A202C]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pengaduan Laporan</span>
              {pendingReportsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs text-[#476072]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Terbit: <strong>{posts.filter((p) => p.status === 'published').length}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Review: <strong>{posts.filter((p) => p.status === 'under_review').length}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Disembunyikan: <strong>{posts.filter((p) => p.status === 'hidden').length}</strong></span>
            </span>
          </div>
        </div>

        {/* 2. CATEGORY PILLS BAR (when posts active) */}
        {activeTab === 'posts' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categoryFilters.map((cat) => {
              const isSelected = selectedCategory === cat.code;
              const count =
                cat.code === 'all'
                  ? posts.length
                  : posts.filter((p) => p.categoryCode === cat.code).length;

              return (
                <button
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat.code)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#334257] text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-[#476072] border border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#476072]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. SEARCH & STATUS FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'posts' ? "Cari judul, penulis @username, atau isi cerita penipuan..." : "Cari laporan pengaduan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white/90 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          {activeTab === 'posts' ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#476072] font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {[
                { val: 'all', label: 'Semua' },
                { val: 'published', label: 'Terbit' },
                { val: 'under_review', label: 'Perlu Review' },
                { val: 'hidden', label: 'Sembunyi' },
              ].map(({ val, label }) => {
                const isSelected = selectedStatus === val;
                return (
                  <button
                    key={val}
                    onClick={() => setSelectedStatus(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#334257] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-[#476072] border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#476072] font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status Laporan:
              </span>
              {[
                { val: 'all', label: 'Semua' },
                { val: 'pending', label: 'Menunggu Tindakan' },
                { val: 'resolved', label: 'Selesai' },
                { val: 'dismissed', label: 'Diabaikan' },
              ].map(({ val, label }) => {
                const isSelected = reportFilter === val;
                return (
                  <button
                    key={val}
                    onClick={() => setReportFilter(val as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#334257] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-[#476072] border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. FULL-WIDTH RESPONSIVE CARD GRID FOR COMMUNITY POSTS (Mirrors KnowledgeBasePage & QuizManagerPage) */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#476072] glass-panel rounded-2xl">
          Memuat antrean postingan komunitas...
        </div>
      ) : activeTab === 'posts' ? (
        filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#1A202C]">Tidak ada postingan yang sesuai</h3>
            <p className="text-xs text-[#476072] max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter kategori dan status publikasi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post, idx) => {
              const isPublished = post.status === 'published';
              const isReview = post.status === 'under_review';

              return (
                <div
                  key={post.id}
                  onClick={() => setActiveDetailPost(post)}
                  className="p-5 rounded-2xl glass-panel hover:border-[#548CA8] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4 relative"
                >
                  {/* Card Top Meta */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-[#334257] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257]">
                          {post.categoryCode.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isReview
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPublished ? 'TERBIT' : isReview ? 'REVIEW' : 'SEMBUNYI'}
                        </span>

                        {/* Quick Edit Button */}
                        <button
                          onClick={(e) => handleOpenEdit(post, e)}
                          className="p-1 rounded-md border border-slate-200 hover:border-[#548CA8] bg-white/70 hover:bg-white text-[#476072] hover:text-[#548CA8] transition cursor-pointer ml-1"
                          title="Edit postingan ini"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>

                        {/* Quick Delete Button */}
                        <button
                          onClick={(e) => handleDeletePost(post.id, post.title, e)}
                          className="p-1 rounded-md border border-rose-200 hover:border-rose-400 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Hapus postingan ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Author & PII Badge */}
                    <div className="flex items-center justify-between text-xs text-[#476072]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>@{post.authorPseudonym}</span>
                      </span>

                      {post.piiScrubbed ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-mono flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>PII Aman</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-mono flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Perlu Sensor</span>
                        </span>
                      )}
                    </div>

                    {/* Post Title */}
                    <h3 className="text-sm font-bold text-[#1A202C] group-hover:text-[#548CA8] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Story Snippet */}
                    <p className="text-xs text-[#476072] line-clamp-3 leading-relaxed">
                      {post.story}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* Financial Loss Pill if available */}
                    {post.financialLossEstimate && (
                      <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[#476072] flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-rose-500" /> Kerugian:
                        </span>
                        <span className="font-mono font-bold text-rose-600">
                          {post.financialLossEstimate}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#476072]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>

                      {post.reportCount > 0 ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" /> {post.reportCount} Laporan
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium text-[10px]">
                          0 Aduan Konten
                        </span>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <span className="text-[10px] text-[#548CA8] font-bold group-hover:underline flex items-center gap-1">
                        Detail Kasus &rarr;
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {post.status !== 'published' && (
                          <button
                            onClick={(e) => handleUpdateStatus(post.id, 'published', e)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            title="Setujui dan tayangkan ke komunitas"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>
                        )}
                        {post.status !== 'hidden' && (
                          <button
                            onClick={(e) => handleUpdateStatus(post.id, 'hidden', e)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                            title="Sembunyikan dari web publik"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Sembunyi</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* REPORTS QUEUE TAB */
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-[#1A202C]">Tidak ada laporan pengaduan aktif</h3>
              <p className="text-xs text-[#476072] max-w-sm mx-auto">
                Semua laporan pengaduan dari komunitas telah diverifikasi dan diselesaikan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="glass-panel rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#548CA8]"></span>
                        <span className="font-mono text-xs font-bold text-[#1A202C]">#{rep.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            rep.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : rep.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rep.status.toUpperCase()}
                        </span>
                      </div>

                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {rep.reason.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Target Postingan:</span>
                      <h4 className="text-xs font-bold text-[#1A202C] line-clamp-2 leading-snug">
                        {rep.postTitle}
                      </h4>
                    </div>

                    <div className="text-xs text-[#476072] space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Pelapor: <strong>@{rep.reporterPseudonym}</strong></span>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(rep.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      {rep.notes && (
                        <p className="text-xs text-[#334257] italic pt-1 border-t border-slate-200/60 mt-1">
                          "{rep.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Report */}
                  <div className="pt-2 border-t border-slate-100">
                    {rep.status === 'pending' ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'resolve')}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Selesaikan</span>
                        </button>

                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismiss')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Abaikan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[11px] font-mono text-slate-400 py-1">
                        Tindakan selesai ({rep.status})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. POPUP DETAIL MODAL FOR COMMUNITY POST (activeDetailPost) */}
      {activeDetailPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-dark rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#548CA8]/20 text-cyan-300 font-mono text-[10px] font-bold">
                    {activeDetailPost.categoryCode.toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      activeDetailPost.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeDetailPost.status === 'under_review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    STATUS: {activeDetailPost.status.toUpperCase()}
                  </span>
                  {activeDetailPost.piiScrubbed && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> PII Terproteksi
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-white tracking-tight pt-1">
                  {activeDetailPost.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Penulis: <strong className="text-slate-200">@{activeDetailPost.authorPseudonym}</strong></span>
                  <span>&bull;</span>
                  <span>Dibuat: {new Date(activeDetailPost.createdAt).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveDetailPost(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Loss Callout */}
            {activeDetailPost.financialLossEstimate && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  Estimasi Kerugian Finansial Korban:
                </span>
                <span className="font-mono font-black text-rose-300 text-sm">
                  {activeDetailPost.financialLossEstimate}
                </span>
              </div>
            )}

            {/* Story / Narration */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Kronologi &amp; Pengakuan Korban:
              </label>
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {activeDetailPost.story}
              </div>
            </div>

            {/* Moderation Actions in Detail Modal */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(activeDetailPost)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Edit Postingan</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePost(activeDetailPost.id, activeDetailPost.title)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activeDetailPost.status !== 'published' && (
                  <button
                    onClick={() => handleUpdateStatus(activeDetailPost.id, 'published')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui &amp; Tayangkan</span>
                  </button>
                )}

                {activeDetailPost.status !== 'hidden' && (
                  <button
                    onClick={() => handleUpdateStatus(activeDetailPost.id, 'hidden')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Sembunyikan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT POSTINGAN MODAL (isEditModalOpen) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-dark rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Edit Postingan Komunitas</h3>
                <p className="text-xs text-slate-300">
                  Ubah data narasi, kategori, estimasi kerugian, atau status moderasi.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Kategori Penipuan:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-800 text-xs font-bold text-white focus:outline-hidden focus:border-[#548CA8]"
                  >
                    {categoryFilters.filter(c => c.code !== 'all').map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Status Moderasi:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-800 text-xs font-bold text-white focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="published" className="bg-slate-800 text-white">Terbit (Published)</option>
                    <option value="under_review" className="bg-slate-800 text-white">Perlu Review (Under Review)</option>
                    <option value="hidden" className="bg-slate-800 text-white">Disembunyikan (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Author Pseudonym & Loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Pseudonym Penulis:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Korban_Bandung..."
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Estimasi Kerugian:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 2.500.000 atau Rp 0..."
                    value={editLoss}
                    onChange={(e) => setEditLoss(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Judul Cerita / Modus:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penipuan Tugas Telegram..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Story */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Kronologi Cerita Lengkap:</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Ceritakan detail kronologi bagaimana penipuan terjadi..."
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* PII Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="piiCheckbox"
                  checked={editPiiScrubbed}
                  onChange={(e) => setEditPiiScrubbed(e.target.checked)}
                  className="rounded border-slate-400 text-[#548CA8] focus:ring-[#548CA8] cursor-pointer"
                />
                <label htmlFor="piiCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Data pribadi telah disensor / dimasker (PII Scrubbed)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#548CA8] hover:bg-[#476072] text-xs font-bold text-white transition cursor-pointer shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CREATE NEW POST MODAL (isCreateModalOpen) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-dark rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Tambah Cerita Kasus Komunitas</h3>
                <p className="text-xs text-slate-300">
                  Input laporan atau studi kasus baru dari pelaporan masyarakat.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Kategori Penipuan:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-800 text-xs font-bold text-white focus:outline-hidden focus:border-[#548CA8]"
                  >
                    {categoryFilters.filter(c => c.code !== 'all').map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Status Awal:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-800 text-xs font-bold text-white focus:outline-hidden focus:border-[#548CA8]"
                  >
                    <option value="under_review" className="bg-slate-800 text-white">Perlu Review (Under Review)</option>
                    <option value="published" className="bg-slate-800 text-white">Langsung Terbit (Published)</option>
                    <option value="hidden" className="bg-slate-800 text-white">Disembunyikan (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Author & Loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Pseudonym Penulis:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Korban_Waspada..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Estimasi Kerugian:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 1.500.000..."
                    value={newLoss}
                    onChange={(e) => setNewLoss(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Judul Kasus / Modus:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penipuan Giveaway Mengatasnamakan Artis..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* Story */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Kronologi Lengkap Kejadian:</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan pengalaman korban secara mendalam agar menjadi edukasi publik..."
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs text-white focus:outline-hidden focus:border-[#548CA8]"
                />
              </div>

              {/* PII Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newPiiCheckbox"
                  checked={newPiiScrubbed}
                  onChange={(e) => setNewPiiScrubbed(e.target.checked)}
                  className="rounded border-slate-400 text-[#548CA8] focus:ring-[#548CA8] cursor-pointer"
                />
                <label htmlFor="newPiiCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Data pribadi telah disensor / dimasker (PII Scrubbed)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#548CA8] hover:bg-[#476072] text-xs font-bold text-white transition cursor-pointer shadow-md"
                >
                  Tambahkan Kasus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
