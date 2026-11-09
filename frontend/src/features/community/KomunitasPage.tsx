import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  Share2, 
  PhoneCall, 
  Send, 
  Copy, 
  Check, 
  X, 
  CornerDownRight, 
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Tag,
  ArrowLeft,
  PlusCircle,
  Flag,
  Bell,
  Trash2,
  Award,
  Image as ImageIcon,
  Lock,
  ChevronRight,
  EyeOff,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CommunityShieldIllustration } from '../../components/illustrations/Illustrations2D';
import { adminAuth } from '../../admin/services/adminAuth';
import { communityService } from '../../services/communityService';
import type {
  CommunityDiscussion,
  CommunityCommentTree,
  CommunityNotification,
  DiscussionCategory,
  DiscussionStatus,
  ReportReason
} from '../../services/communityService';

export interface ChannelTab {
  id: DiscussionCategory;
  title: string;
  description: string;
  icon: string;
}

const CHANNELS: ChannelTab[] = [
  {
    id: 'tanya-jawab-warga',
    title: 'Tanya Jawab Warga',
    description: 'Tanyakan kecurigaan pesan, SMS, atau telepon yang Anda terima',
    icon: 'message-square',
  },
  {
    id: 'waspada-modus-baru',
    title: 'Waspada Modus Baru',
    description: 'Berbagi temuan link mencurigakan & file .apk berbahaya',
    icon: 'alert-triangle',
  },
  {
    id: 'posko-solusi-lapor',
    title: 'Posko Solusi & Bantuan',
    description: 'Panduan blokir rekening bank penipu & lapor kepolisian',
    icon: 'shield-check',
  },
];

const POPULAR_TAGS = [
  { id: 'apk', label: 'APK Kurir', query: 'APK' },
  { id: 'undangan', label: 'Undangan Nikah', query: 'Undangan' },
  { id: 'task', label: 'Task Scam Telegram', query: 'Telegram' },
  { id: 'bca', label: 'Phishing BCA', query: 'BCA' },
  { id: 'rekening', label: 'Blokir Rekening', query: 'rekening' },
];

export const KomunitasPage: React.FC = () => {
  const location = useLocation();
  const currentUser = adminAuth.getUser();

  // State Data Komunitas
  const [activeCategory, setActiveCategory] = useState<DiscussionCategory>('tanya-jawab-warga');
  const [statusFilter, setStatusFilter] = useState<'all' | DiscussionStatus>('all');
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'paling_membantu' | 'terpopuler'>('terbaru');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Stats & Trending
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    'tanya-jawab-warga': 0,
    'waspada-modus-baru': 0,
    'posko-solusi-lapor': 0,
  });
  const [trendingScams, setTrendingScams] = useState<any[]>([]);

  // Modals & Panels State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [focusedDiscussion, setFocusedDiscussion] = useState<CommunityDiscussion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reporting State
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetType: 'post' | 'comment';
    targetId: string;
    title: string;
  }>({
    isOpen: false,
    targetType: 'post',
    targetId: '',
    title: '',
  });
  const [reportReason, setReportReason] = useState<ReportReason>('penipuan');
  const [reportNotes, setReportNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Form Buat Postingan Baru
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<DiscussionCategory>('tanya-jawab-warga');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostEvidenceSnippet, setNewPostEvidenceSnippet] = useState('');
  const [newPostEvidenceImage, setNewPostEvidenceImage] = useState<string | null>(null);
  const [newPostIsAnonymous, setNewPostIsAnonymous] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Form Balas / Komentar
  const [commentInput, setCommentInput] = useState('');
  const [commentReplyTo, setCommentReplyTo] = useState<{ id: string; author: string; content: string } | null>(null);
  const [commentIsAnonymous, setCommentIsAnonymous] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // 1. Inisialisasi: Periksa apakah ada prefill draft dari URL Scanner
  useEffect(() => {
    let draft = (location.state as any)?.prefillDraft;
    if (!draft) {
      try {
        const stored = sessionStorage.getItem('community_prefill_draft');
        if (stored) {
          draft = JSON.parse(stored);
          sessionStorage.removeItem('community_prefill_draft');
        }
      } catch {}
    }

    if (draft) {
      setNewPostTitle(draft.title || '');
      setNewPostCategory(draft.category || 'waspada-modus-baru');
      setNewPostContent(draft.content || '');
      setNewPostEvidenceSnippet(draft.evidenceSnippet || '');
      setActiveCategory(draft.category || 'waspada-modus-baru');
      setIsNewPostModalOpen(true);
      toast.info('Draf hasil pemindaian URL telah dimuat otomatis untuk didiskusikan!');
    }
  }, [location.state]);

  // 2. Muat Statistik Komunitas
  const fetchStats = async () => {
    try {
      const stats = await communityService.getStats();
      if (stats) {
        setCategoryCounts(stats.categoryCounts);
        setTrendingScams(stats.trendingScams);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 3. Muat Notifikasi jika Terautentikasi
  const fetchNotifications = async () => {
    if (!adminAuth.isAuthenticated()) return;
    try {
      const res = await communityService.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 4. Muat Daftar Diskusi berdasarkan filter
  const fetchDiscussions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await communityService.getDiscussions({
        category: activeCategory,
        status: statusFilter,
        search: searchQuery,
        sort: sortOrder,
        page,
        limit: 10,
      });
      setDiscussions(res.discussions);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat diskusi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions(1);
  }, [activeCategory, statusFilter, sortOrder]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiscussions(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 5. Muat Detail Diskusi saat dipilih
  const handleOpenDiscussionDetail = async (discId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await communityService.getDiscussionDetail(discId);
      setFocusedDiscussion(detail);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuka detail diskusi.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 6. Handle Upload Gambar dengan Validasi Magic Bytes & Sensor PII
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const val = await communityService.validateEvidence(base64);
        if (val.valid) {
          setNewPostEvidenceImage(base64);
          toast.success(`Gambar bukti terverifikasi (${val.mimeType}). Jangan lupa pastikan data sensitif sudah disensor.`);
        }
      } catch (err: any) {
        toast.error(err.message || 'Format gambar bukti ditolak oleh sistem keamanan.');
      }
    };
    reader.readAsDataURL(file);
  };

  // 7. Submit Buat Postingan Baru
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || newPostTitle.trim().length < 5) {
      toast.error('Judul diskusi wajib diisi minimal 5 karakter.');
      return;
    }
    if (!newPostContent.trim() || newPostContent.trim().length < 10) {
      toast.error('Isi cerita / pertanyaan wajib diisi minimal 10 karakter.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const created = await communityService.createDiscussion({
        category: newPostCategory,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        evidenceSnippet: newPostEvidenceSnippet.trim() || undefined,
        evidenceImageUrl: newPostEvidenceImage || undefined,
        isAnonymous: newPostIsAnonymous,
      });

      toast.success('Postingan Anda berhasil dipublikasikan!');
      setIsNewPostModalOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostEvidenceSnippet('');
      setNewPostEvidenceImage(null);
      setNewPostIsAnonymous(false);

      // Pindahkan aktif ke kategori tersebut dan refresh
      setActiveCategory(created.category);
      fetchDiscussions(1);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mempublikasikan postingan.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // 8. Submit Komentar / Threaded Reply
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedDiscussion) return;
    if (!commentInput.trim() || commentInput.trim().length < 3) {
      toast.error('Komentar harus minimal 3 karakter.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await communityService.addComment(focusedDiscussion.id, {
        content: commentInput.trim(),
        parentId: commentReplyTo?.id || null,
        isAnonymous: commentIsAnonymous,
      });

      toast.success('Tanggapan Anda berhasil dikirim!');
      setCommentInput('');
      setCommentReplyTo(null);

      // Refresh detail diskusi
      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim komentar.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 9. Tandai / Batalkan Solusi Terbaik (Best Solution)
  const handleToggleBestSolution = async (commentId: string) => {
    if (!focusedDiscussion) return;
    try {
      const res = await communityService.toggleBestSolution(focusedDiscussion.id, commentId);
      toast.success(
        res.isBestSolution
          ? 'Jawaban berhasil dijadikan Solusi Terbaik! Status diskusi kini TERJAWAB.'
          : 'Tanda Solusi Terbaik dibatalkan. Status diskusi kembali TERBUKA.'
      );

      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah Solusi Terbaik.');
    }
  };

  // 10. Toggle Vote Membantu (Helpful)
  const handleToggleHelpful = async (targetType: 'post' | 'comment', targetId: string) => {
    try {
      const res = await communityService.toggleHelpfulVote(targetType, targetId);
      toast.success(res.voted ? 'Dukungan Membantu diberikan!' : 'Dukungan Membantu dibatalkan.');

      if (targetType === 'post') {
        setDiscussions(prev =>
          prev.map(d => (d.id === targetId ? { ...d, helpfulCount: res.helpfulCount, userVoted: res.voted } : d))
        );
        if (focusedDiscussion && focusedDiscussion.id === targetId) {
          setFocusedDiscussion({ ...focusedDiscussion, helpfulCount: res.helpfulCount, userVoted: res.voted });
        }
      } else if (focusedDiscussion) {
        // Refresh detail for updated comment vote
        const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
        setFocusedDiscussion(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses vote.');
    }
  };

  // 11. Hapus Postingan Sendiri
  const handleDeletePost = async (discId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus postingan diskusi ini?')) return;
    try {
      await communityService.deleteDiscussion(discId);
      toast.success('Postingan berhasil dihapus.');
      if (focusedDiscussion?.id === discId) {
        setFocusedDiscussion(null);
      }
      fetchDiscussions(1);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus postingan.');
    }
  };

  // 12. Hapus Komentar Sendiri
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await communityService.deleteComment(commentId);
      toast.success('Komentar berhasil dihapus.');
      if (focusedDiscussion) {
        const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
        setFocusedDiscussion(updated);
        fetchDiscussions(pagination.page);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus komentar.');
    }
  };

  // 13. Laporkan Konten
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReason === 'lainnya' && (!reportNotes.trim() || reportNotes.trim().length < 5)) {
      toast.error('Keterangan laporan wajib diisi minimal 5 karakter untuk opsi "Lainnya".');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await communityService.reportContent({
        targetType: reportModalData.targetType,
        targetId: reportModalData.targetId,
        reason: reportReason,
        notes: reportNotes.trim() || undefined,
      });

      toast.success('Laporan berhasil dikirim ke tim moderasi Scamora. Terima kasih atas kepedulian Anda!');
      setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' });
      setReportReason('penipuan');
      setReportNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 14. Tandai Notifikasi Terbaca
  const handleMarkAllNotifications = async () => {
    try {
      await communityService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Seluruh notifikasi ditandai telah dibaca.');
    } catch {}
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-[#FAF8F5] text-[#14161C] relative">
      
      {/* 1. HEADER HERO BANNER DOCK */}
      <section className="w-full bg-white border-b border-gray-200/80 pt-6 pb-6 sm:pb-8 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-mono font-bold border border-[#143826]/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FORUM KEAMANAN DIGITAL MASYARAKAT</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#143826] tracking-tight leading-tight">
                Tanya &amp; Waspada Bersama <span className="text-[#E86A33]">Komunitas Warga.</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Dapatkan konfirmasi langsung dari sesama warga dan relawan siber Scamora sebelum Anda mengeklik tautan atau mentransfer uang.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                {/* Tombol Buat Postingan Baru */}
                <button
                  type="button"
                  onClick={() => {
                    if (!adminAuth.isAuthenticated()) {
                      toast.error('Silakan masuk ke akun Scamora Anda terlebih dahulu.');
                      return;
                    }
                    setIsNewPostModalOpen(true);
                  }}
                  className="btn-animate inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#143826] hover:bg-[#1a4a32] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#143826]/20 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#A6F4C5]" />
                  <span>Mulai Diskusi Baru</span>
                </button>

                {/* Notifikasi Lonceng */}
                {adminAuth.isAuthenticated() && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      fetchNotifications();
                    }}
                    className="relative inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#143826]" />
                    <span>Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#E86A33] text-white text-[10px] font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 2D Illustration */}
            <div className="shrink-0 hidden sm:flex justify-center">
              <CommunityShieldIllustration className="w-48 h-36 sm:w-56 sm:h-40 drop-shadow-sm" />
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN TWO-PANEL WORKSPACE */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: TOPIC SWITCHER & STATS (4 COLS) */}
          <div className="w-full lg:col-span-4 space-y-4">
            
            {/* Topic Switcher Card */}
            <div className="p-4 sm:p-5 rounded-3xl border border-gray-200 bg-white shadow-2xs space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider px-1">
                Kategori Ruang Diskusi
              </div>

              <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CHANNELS.map(channel => {
                  const isActive = activeCategory === channel.id;
                  const count = categoryCounts[channel.id] || 0;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveCategory(channel.id)}
                      className={`shrink-0 min-w-[220px] lg:min-w-0 lg:w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3 border ${
                        isActive
                          ? 'bg-[#143826] text-white border-[#143826] shadow-sm'
                          : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {channel.id === 'tanya-jawab-warga' && <MessageSquare className="w-4 h-4" />}
                        {channel.id === 'waspada-modus-baru' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {channel.id === 'posko-solusi-lapor' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {channel.title}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-emerald-200 font-bold' : 'bg-gray-100 text-gray-600 font-semibold'
                          }`}>
                            {count} Topik
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                          {channel.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tren Modus Minggu Ini */}
            <div className="p-4 sm:p-5 rounded-3xl border border-gray-200 bg-white shadow-2xs space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Tren Modus Minggu Ini</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                  Aktif
                </span>
              </div>

              <div className="space-y-2">
                {trendingScams.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.tag);
                      toast.info(`Menyaring kasus terkait "${item.title}"`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gray-50/80 hover:bg-[#FAF9F6] border border-gray-200/80 hover:border-gray-300 transition-all flex items-start justify-between gap-2 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-[#143826] transition-colors block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        Konsultasi #{item.tag} • {item.consultationCount} laporan
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      item.severity === 'Kritis' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saluran Darurat Penipuan */}
            <div className="p-4 sm:p-5 rounded-3xl border border-gray-200 bg-white shadow-2xs space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-[#143826]">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saluran Darurat Penipuan</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Jika sudah terlanjur mentransfer uang atau membagikan OTP:
              </p>
              <div className="space-y-1.5 pt-1">
                {[
                  { name: 'Call Center Polri', contact: '110' },
                  { name: 'Satgas Waspada Investasi OJK', contact: '157' },
                  { name: 'Aduan Rekening Kominfo', contact: 'cekrekening.id' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <span className="text-[11px] font-semibold text-gray-700">{item.name}</span>
                    <button
                      onClick={() => handleCopy(item.contact, item.name)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[10px] font-mono font-bold hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === item.contact ? <Check className="w-3 h-3 text-[#143826]" /> : <Copy className="w-3 h-3" />}
                      <span>{item.contact}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: DISCUSSIONS STREAM & FILTERS (8 COLS) */}
          <div className="w-full lg:col-span-8 space-y-4">
            
            {/* Filter & Search Bar Card */}
            <div className="p-4 sm:p-5 rounded-3xl border border-gray-200 bg-white shadow-2xs space-y-4">
              
              {/* Search Box */}
              <div className="relative bg-gray-50 rounded-2xl p-2.5 px-3.5 flex items-center gap-2 border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#143826]/20 focus-within:border-[#143826] transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik diskusi (misal: APK Kurir, BCA Phishing, Loker Telegram)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter & Sort Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
                
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {[
                    { id: 'all', label: 'Semua Status' },
                    { id: 'TERBUKA', label: 'Terbuka' },
                    { id: 'TERJAWAB', label: 'Terjawab' },
                    { id: 'DITUTUP', label: 'Ditutup' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        statusFilter === tab.id
                          ? 'bg-white text-gray-900 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400 font-mono text-[11px]">Urutkan:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="paling_membantu">Paling Membantu</option>
                    <option value="terpopuler">Terbanyak Komentar</option>
                  </select>
                </div>

              </div>

              {/* Popular Tags Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase shrink-0 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#E86A33]" />
                  <span>Topik Populer:</span>
                </span>
                {POPULAR_TAGS.map((tag) => {
                  const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSearchQuery(isSelected ? '' : tag.query)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                        isSelected
                          ? 'bg-[#143826] text-white border-[#143826] shadow-2xs'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      #{tag.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Discussions List */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#143826] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Memuat diskusi dari basis data Scamora...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">Belum ada diskusi untuk kriteria ini</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Jadilah yang pertama membuka konsultasi atau berbagi temuan modus penipuan baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143826] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#A6F4C5]" />
                  <span>Buka Diskusi Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {discussions.map((disc) => {
                  const isAuthor = currentUser && (disc.userId === currentUser.id || disc.userId === `usr-${currentUser.username}`);
                  return (
                    <div
                      key={disc.id}
                      className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all space-y-3 text-left"
                    >
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: disc.avatarColor || '#143826' }}
                          >
                            {disc.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-gray-900">{disc.authorName}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                                disc.authorBadge === 'Relawan Komunitas'
                                  ? 'bg-[#EAF2ED] text-[#143826] border border-[#143826]/20'
                                  : disc.authorBadge === 'Kontributor Aktif'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : disc.authorBadge === 'Anonim'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {disc.authorBadge}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(disc.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            disc.status === 'TERJAWAB'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : disc.status === 'DITUTUP'
                              ? 'bg-gray-100 text-gray-600 border border-gray-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {disc.status === 'TERJAWAB' && '✓ '}
                            {disc.status}
                          </span>

                          {/* Delete if author */}
                          {isAuthor && (
                            <button
                              type="button"
                              onClick={() => handleDeletePost(disc.id)}
                              className="p-1 text-gray-300 hover:text-red-600 transition cursor-pointer"
                              title="Hapus postingan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Preview */}
                      <button
                        type="button"
                        onClick={() => handleOpenDiscussionDetail(disc.id)}
                        className="w-full text-left space-y-1.5 cursor-pointer group"
                      >
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#143826] transition-colors leading-snug">
                          {disc.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {disc.content}
                        </p>
                      </button>

                      {/* Evidence Snippet if present */}
                      {disc.evidenceSnippet && (
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-[#143826]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Bukti Kasus Terdeteksi:</span>
                          "{disc.evidenceSnippet}"
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          {/* Helpful Vote Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleHelpful('post', disc.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                              disc.userVoted
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${disc.userVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                            <span>Membantu ({disc.helpfulCount})</span>
                          </button>

                          {/* Comment count trigger */}
                          <button
                            type="button"
                            onClick={() => handleOpenDiscussionDetail(disc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#143826]" />
                            <span>{disc.commentCount} Tanggapan</span>
                          </button>
                        </div>

                        {/* Report button */}
                        <button
                          type="button"
                          onClick={() => setReportModalData({
                            isOpen: true,
                            targetType: 'post',
                            targetId: disc.id,
                            title: disc.title,
                          })}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                          title="Laporkan konten pelanggaran"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 text-xs font-bold">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchDiscussions(pagination.page - 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                    >
                      &larr; Halaman Sebelumnya
                    </button>

                    <span className="text-gray-500 font-mono">
                      Halaman {pagination.page} dari {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchDiscussions(pagination.page + 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                    >
                      Halaman Selanjutnya &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL BUAT POSTINGAN BARU */}
      {/* ========================================================================= */}
      {isNewPostModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNewPostModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 relative my-auto max-h-[92vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-left overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2ED] text-[#143826] flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">Buka Topik Diskusi Warga</h3>
                  <p className="text-[11px] text-gray-400 font-mono">Konsultasikan kecurigaan atau laporkan modus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PII REMINDER BANNER */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1 shrink-0">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>PENTING: Lindungi Data Pribadi Anda!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Mohon sensor nomor rekening bank, nomor WhatsApp, nomor telepon, alamat rumah, atau nomor identitas (KTP/KK) sebelum menulis atau melampirkan gambar.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              
              {/* Kategori */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Kategori Ruang Diskusi *</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as DiscussionCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:border-[#143826] transition"
                >
                  <option value="tanya-jawab-warga">Tanya Jawab Warga (Pertanyaan &amp; Konsultasi Kasus)</option>
                  <option value="waspada-modus-baru">Waspada Modus Baru (Temuan Link &amp; File APK Bahaya)</option>
                  <option value="posko-solusi-lapor">Posko Solusi &amp; Bantuan (Langkah Blokir &amp; Laporan Polisi)</option>
                </select>
              </div>

              {/* Judul */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Judul Postingan (Singkat &amp; Jelas) *</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Contoh: Pesan WA File Resi_Paket_JNT.apk Padahal Tidak Belanja..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition font-medium"
                />
              </div>

              {/* Isi Cerita / Pertanyaan */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Kronologi / Pertanyaan Lengkap *</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Ceritakan detail kecurigaan Anda: nomor pengirim, nama aplikasi, atau penawaran yang diberikan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition leading-relaxed font-normal"
                />
              </div>

              {/* Bukti Teks (Defanged URL / Info) */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Cuplikan Bukti Teks (Opsional)</label>
                <input
                  type="text"
                  value={newPostEvidenceSnippet}
                  onChange={(e) => setNewPostEvidenceSnippet(e.target.value)}
                  placeholder="Contoh: Pengirim: +62 812-****-3312 | Berkas: Resi_JNE.apk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono text-[11px] text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition"
                />
              </div>

              {/* Lampirkan Screenshot (JPG, PNG, WEBP) */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center justify-between">
                  <span>Lampirkan Screenshot Bukti (Maks. 5MB)</span>
                  <span className="text-[10px] text-gray-400 font-mono">JPG / PNG / WEBP Asli</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition">
                    <ImageIcon className="w-4 h-4 text-[#143826]" />
                    <span>Pilih Berkas Screenshot</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {newPostEvidenceImage && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Gambar Siap</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewPostEvidenceImage(null)}
                        className="text-red-500 hover:text-red-700 text-[11px] underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox Anonim */}
              <div className="pt-1 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={newPostIsAnonymous}
                  onChange={(e) => setNewPostIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#143826] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="anonymousCheck" className="cursor-pointer select-none text-gray-700 font-medium">
                  Posting sebagai Anonim (Nama &amp; Akun Disamarkan di Forum Publik)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="btn-animate px-5 py-2 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPost ? 'Memublikasikan...' : 'Publikasikan Postingan'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL THREAD DETAIL & THREADED COMMENTS */}
      {/* ========================================================================= */}
      {focusedDiscussion && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFocusedDiscussion(null);
          }}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 relative my-auto max-h-[92vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFocusedDiscussion(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E86A33]">
                    Utas Diskusi Kasus
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                    {focusedDiscussion.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFocusedDiscussion(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Root Post Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: focusedDiscussion.avatarColor || '#143826' }}
                    >
                      {focusedDiscussion.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-gray-900">{focusedDiscussion.authorName}</span>
                      <span className={`text-[10px] font-mono ml-2 px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800`}>
                        {focusedDiscussion.authorBadge}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                    focusedDiscussion.status === 'TERJAWAB' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {focusedDiscussion.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-line">
                  {focusedDiscussion.content}
                </p>

                {focusedDiscussion.evidenceSnippet && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-xs font-mono text-[#143826]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Bukti Kasus Terdeteksi:</span>
                    "{focusedDiscussion.evidenceSnippet}"
                  </div>
                )}

                {focusedDiscussion.evidenceImageUrl && (
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-gray-500 block mb-1">Lampiran Tangkapan Layar:</span>
                    <img
                      src={focusedDiscussion.evidenceImageUrl}
                      alt="Bukti Screenshot"
                      className="max-h-48 rounded-xl border border-amber-200 object-contain bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Threaded Comments Chain */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                    Tanggapan &amp; Solusi Mitigasi ({focusedDiscussion.comments?.length || 0})
                  </span>
                </div>

                {(!focusedDiscussion.comments || focusedDiscussion.comments.length === 0) ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">Belum ada tanggapan pada diskusi ini.</p>
                    <p className="text-[11px] text-gray-400">Jadilah yang pertama memberikan saran atau rekomendasi mitigasi di bawah.</p>
                  </div>
                ) : (
                  focusedDiscussion.comments.map((comment) => {
                    const isQuestionAuthor = currentUser && (
                      focusedDiscussion.userId === currentUser.id ||
                      focusedDiscussion.userId === `usr-${currentUser.username}`
                    );
                    const isCommentAuthor = currentUser && (
                      comment.userId === currentUser.id ||
                      comment.userId === `usr-${currentUser.username}`
                    );

                    return (
                      <div
                        key={comment.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 ${
                          comment.isBestSolution
                            ? 'bg-gradient-to-br from-emerald-50 to-[#EAF2ED] border-emerald-300 shadow-sm ring-1 ring-emerald-300'
                            : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0"
                              style={{ backgroundColor: comment.avatarColor || '#0f9b8a' }}
                            >
                              {comment.authorName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-gray-900">{comment.authorName}</span>
                            <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              comment.authorBadge === 'Relawan Komunitas'
                                ? 'bg-[#EAF2ED] text-[#143826]'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {comment.authorBadge}
                            </span>
                          </div>

                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* SOLUSI TERBAIK BANNER */}
                        {comment.isBestSolution && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold font-mono border border-emerald-300">
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            <span>SOLUSI TERVERIFIKASI OLEH PENANYA</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                          {comment.content}
                        </p>

                        {/* Actions for Comment */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-2">
                            {/* Tombol Membantu */}
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful('comment', comment.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Membantu ({comment.helpfulCount})</span>
                            </button>

                            {/* Tombol Balas */}
                            <button
                              type="button"
                              onClick={() => setCommentReplyTo({
                                id: comment.id,
                                author: comment.authorName,
                                content: comment.content.slice(0, 50),
                              })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer ml-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Balas</span>
                            </button>

                            {/* Tandai / Batalkan Solusi Terbaik (Hanya Pemilik Pertanyaan) */}
                            {isQuestionAuthor && (
                              <button
                                type="button"
                                onClick={() => handleToggleBestSolution(comment.id)}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer ml-1 transition ${
                                  comment.isBestSolution
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                }`}
                              >
                                <Award className="w-3 h-3" />
                                <span>{comment.isBestSolution ? 'Batalkan Solusi Terbaik' : 'Jadikan Solusi Terbaik'}</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {isCommentAuthor && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-300 hover:text-red-600 p-1 cursor-pointer"
                                title="Hapus komentar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setReportModalData({
                                isOpen: true,
                                targetType: 'comment',
                                targetId: comment.id,
                                title: `Komentar oleh ${comment.authorName}`,
                              })}
                              className="text-gray-300 hover:text-red-600 p-1 cursor-pointer"
                              title="Laporkan komentar"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* REPLIES BERSARANG (THREADED SUB-REPLIES) */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 sm:pl-6 border-l-2 border-gray-200 space-y-2 pt-2">
                            {comment.replies.map((reply) => {
                              const isReplyAuthor = currentUser && (
                                reply.userId === currentUser.id ||
                                reply.userId === `usr-${currentUser.username}`
                              );
                              return (
                                <div key={reply.id} className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gray-900">{reply.authorName}</span>
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                                        {reply.authorBadge}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {new Date(reply.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed">{reply.content}</p>
                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHelpful('comment', reply.id)}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>Membantu ({reply.helpfulCount})</span>
                                    </button>
                                    {isReplyAuthor && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-gray-300 hover:text-red-600 p-0.5 cursor-pointer"
                                        title="Hapus balasan"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Bottom Comment Input */}
            <form onSubmit={handleSendComment} className="pt-2 border-t border-gray-100 space-y-2 shrink-0">
              {commentReplyTo && (
                <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-[#EAF2ED] border border-[#143826]/20 text-xs text-[#143826]">
                  <div className="flex items-center gap-1.5 truncate">
                    <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
                    <span>Membalas <strong>@{commentReplyTo.author}</strong>: "{commentReplyTo.content}..."</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommentReplyTo(null)}
                    className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={commentReplyTo ? `Balas @${commentReplyTo.author}...` : "Berikan tanggapan atau solusi mitigasi Anda..."}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="btn-animate inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <span>{isSubmittingComment ? 'Mengirim...' : 'Kirim'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-gray-500">
                <input
                  type="checkbox"
                  id="commentAnonCheck"
                  checked={commentIsAnonymous}
                  onChange={(e) => setCommentIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#143826] cursor-pointer"
                />
                <label htmlFor="commentAnonCheck" className="cursor-pointer select-none">
                  Kirim tanggapan sebagai Anonim
                </label>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL LAPORKAN KONTEN PELANGGARAN */}
      {/* ========================================================================= */}
      {reportModalData.isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' })}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 sm:p-6 text-left space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>Laporkan Konten Pelanggaran</span>
              </div>
              <button
                type="button"
                onClick={() => setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' })}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Melaporkan: <strong>"{reportModalData.title.slice(0, 50)}..."</strong>
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Alasan Pelaporan *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:border-[#143826]"
                >
                  <option value="penipuan">Penipuan / Modus Berbahaya</option>
                  <option value="spam">Spam / Iklan Bodong</option>
                  <option value="misinformasi">Informasi Menyesatkan</option>
                  <option value="bocor_pii">Kebocoran Data Pribadi (PII Leak)</option>
                  <option value="ujaran_kebencian">Ujaran Kebencian / Pelecehan</option>
                  <option value="lainnya">Alasan Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Keterangan Tambahan {reportReason === 'lainnya' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Jelaskan alasan mengapa konten ini melanggar pedoman komunitas..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-[#143826]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' })}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="btn-animate px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL NOTIFIKASI KOMUNITAS */}
      {/* ========================================================================= */}
      {isNotificationsOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-[#14161c]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 text-left space-y-3.5 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 text-[#143826] font-bold text-sm">
                <Bell className="w-4 h-4" />
                <span>Pusat Notifikasi Komunitas</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotifications}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Tandai Semua Terbaca
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Belum ada notifikasi baru untuk Anda.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1 transition ${
                      n.isRead ? 'bg-white border-gray-100 text-gray-600' : 'bg-emerald-50/70 border-emerald-200 font-medium text-gray-900'
                    }`}
                  >
                    <p className="leading-snug">{n.message}</p>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      {new Date(n.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
