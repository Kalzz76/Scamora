import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  FileText,
  Edit3,
  Search,
  Bell,
  Plus,
  Flame,
  Award,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  CornerDownRight,
  Trash2,
  Flag,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Paperclip,
  Star,
  Smartphone,
  Landmark,
  CreditCard,
  PhoneCall,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../admin/services/adminAuth';
import { communityService } from '../../services/communityService';
import type {
  CommunityDiscussion,
  CommunityNotification,
  DiscussionCategory,
  DiscussionStatus,
  ReportReason
} from '../../services/communityService';

export interface ChannelTab {
  id: DiscussionCategory;
  title: string;
  description: string;
  badgeCount?: number;
}

const CHANNELS: ChannelTab[] = [
  {
    id: 'tanya-jawab-warga',
    title: 'Tanya Jawab Warga',
    description: 'Tanyakan kecurigaan pesan, SMS, atau telepon yang Anda terima',
    badgeCount: 128,
  },
  {
    id: 'waspada-modus-baru',
    title: 'Waspada Modus Baru',
    description: 'Berbagi temuan link mencurigakan & file .apk berbahaya',
    badgeCount: 95,
  },
  {
    id: 'posko-solusi-lapor',
    title: 'Posko Solusi & Bantuan',
    description: 'Panduan blokir rekening bank penipu & lapor kepolisian',
    badgeCount: 74,
  },
];

const SUGGESTED_GROUPS = [
  {
    id: 'grp-apk',
    title: 'Satgas Anti-APK Kurir & Undangan',
    category: 'APK MALWARE',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
    membersCount: '18.2 rb anggota',
    weeklyPosts: '54 postingan minggu ini',
    description: 'Bedah file APK berbahaya berkedok resi kurir, surat tilang ETLE, dan undangan pernikahan digital pencuri SMS OTP.',
    queryTag: 'APK',
    categoryTarget: 'waspada-modus-baru' as DiscussionCategory,
  },
  {
    id: 'grp-phishing',
    title: 'Deteksi Phishing Bank & Rekening Bodong',
    category: 'PHISHING BANK',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60',
    membersCount: '24.5 rb anggota',
    weeklyPosts: '89 postingan minggu ini',
    description: 'Identifikasi domain tiruan bank (BCA, Mandiri, BRI, BNI) dan konsolidasi data rekening penipu untuk percepatan blokir.',
    queryTag: 'Bank',
    categoryTarget: 'posko-solusi-lapor' as DiscussionCategory,
  },
  {
    id: 'grp-telegram',
    title: 'Bongkar Modus Telegram Task & Loker',
    category: 'TASK SCAM',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
    membersCount: '14.1 rb anggota',
    weeklyPosts: '62 postingan minggu ini',
    description: 'Investigasi sindikat like video komisi instan dan investasi crypto fiktif yang menjebak dengan deposit bertingkat.',
    queryTag: 'Telegram',
    categoryTarget: 'waspada-modus-baru' as DiscussionCategory,
  },
  {
    id: 'grp-pinjol',
    title: 'Posko Bantuan Pinjol Ilegal & Teror',
    category: 'HUKUM SIBER',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60',
    membersCount: '9.8 rb anggota',
    weeklyPosts: '37 postingan minggu ini',
    description: 'Pendampingan hukum dan etika siber bagi korban intimidasi kontak darurat oleh aplikasi pinjaman tanpa izin OJK.',
    queryTag: 'Pinjol',
    categoryTarget: 'posko-solusi-lapor' as DiscussionCategory,
  },
];

const TRENDING_TOPICS = [
  { id: 'tr-1', title: 'File Resi Paket JNT .APK via WhatsApp', query: 'APK Kurir', comments: 142 },
  { id: 'tr-2', title: 'Undangan Pernikahan Digital Kuras Saldo Bank', query: 'Undangan', comments: 118 },
  { id: 'tr-3', title: 'Cara Resmi Blokir Rekening Penipu 1x24 Jam', query: 'Blokir Rekening', comments: 95 },
  { id: 'tr-4', title: 'Grup Telegram Misi Like Video Berujung Deposit', query: 'Telegram', comments: 78 },
];

export const KomunitasPage: React.FC = () => {
  const location = useLocation();
  const currentUser = adminAuth.getUser();

  // Navigation Tabs: Beranda (Feed), Kanal Modus (Grup), Tulis Laporan (Postingan)
  const [mainTab, setMainTab] = useState<'beranda' | 'grup' | 'postingan'>('beranda');

  // Discussion state
  const [activeCategory, setActiveCategory] = useState<DiscussionCategory>('tanya-jawab-warga');
  const [statusFilter, setStatusFilter] = useState<'all' | DiscussionStatus>('all');
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'paling_membantu' | 'terpopuler'>('terbaru');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Quick discussion input on Beranda
  const [quickDiscussText, setQuickDiscussText] = useState('');

  // Modals & Panels State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [focusedDiscussion, setFocusedDiscussion] = useState<CommunityDiscussion | null>(null);

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

  // Search input visible toggle
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Lock mobile body scroll when modal is open to prevent background leaks
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      isNewPostModalOpen ||
      focusedDiscussion ||
      reportModalData.isOpen ||
      isNotificationsOpen
    );

    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsNewPostModalOpen(false);
          setFocusedDiscussion(null);
          setReportModalData(prev => ({ ...prev, isOpen: false }));
          setIsNotificationsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isNewPostModalOpen, focusedDiscussion, reportModalData.isOpen, isNotificationsOpen]);

  // Inisialisasi: Periksa apakah ada prefill draft dari URL Scanner
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
      setMainTab('postingan');
      toast.info('Draf hasil pemindaian URL dimuat otomatis.');
    }
  }, [location.state]);

  // Muat Notifikasi
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

  // Muat Daftar Diskusi
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

  // Buka Detail Diskusi
  const handleOpenDiscussionDetail = async (discId: string) => {
    try {
      const detail = await communityService.getDiscussionDetail(discId);
      setFocusedDiscussion(detail);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuka detail diskusi.');
    }
  };

  // Upload Gambar
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const val = await communityService.validateEvidence(base64);
        if (val.valid) {
          setNewPostEvidenceImage(base64);
          toast.success('Gambar bukti terverifikasi. Pastikan data sensitif sudah disensor.');
        }
      } catch (err: any) {
        toast.error(err.message || 'Format gambar ditolak oleh sistem keamanan.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Postingan Baru
  const handleCreatePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      toast.success('Postingan berhasil dipublikasikan!');
      setIsNewPostModalOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostEvidenceSnippet('');
      setNewPostEvidenceImage(null);
      setNewPostIsAnonymous(false);

      setActiveCategory(created.category);
      setMainTab('beranda');
      fetchDiscussions(1);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mempublikasikan postingan.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Quick submit from Beranda
  const handleQuickSubmit = () => {
    if (!quickDiscussText.trim() || quickDiscussText.trim().length < 5) {
      toast.error('Tuliskan ringkasan pertanyaan Anda minimal 5 karakter.');
      return;
    }
    setNewPostTitle(quickDiscussText.slice(0, 80));
    setNewPostContent(quickDiscussText);
    setQuickDiscussText('');
    setMainTab('postingan');
    toast.info('Silakan lengkapi kategori dan rincian sebelum mengirim.');
  };

  // Submit Komentar
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

      toast.success('Tanggapan berhasil dikirim!');
      setCommentInput('');
      setCommentReplyTo(null);

      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim komentar.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Toggle Best Solution
  const handleToggleBestSolution = async (commentId: string) => {
    if (!focusedDiscussion) return;
    try {
      const res = await communityService.toggleBestSolution(focusedDiscussion.id, commentId);
      toast.success(
        res.isBestSolution
          ? 'Jawaban dijadikan Solusi Terbaik!'
          : 'Tanda Solusi Terbaik dibatalkan.'
      );
      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status solusi.');
    }
  };

  // Toggle Vote Membantu
  const handleToggleHelpful = async (targetType: 'post' | 'comment', targetId: string) => {
    try {
      const res = await communityService.toggleHelpfulVote(targetType, targetId);
      toast.success(res.voted ? 'Dukungan diberikan!' : 'Dukungan dibatalkan.');

      if (targetType === 'post') {
        setDiscussions(prev =>
          prev.map(d => (d.id === targetId ? { ...d, helpfulCount: res.helpfulCount, userVoted: res.voted } : d))
        );
        if (focusedDiscussion && focusedDiscussion.id === targetId) {
          setFocusedDiscussion({ ...focusedDiscussion, helpfulCount: res.helpfulCount, userVoted: res.voted });
        }
      } else if (focusedDiscussion) {
        const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
        setFocusedDiscussion(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses vote.');
    }
  };

  // Hapus Postingan
  const handleDeletePost = async (discId: string) => {
    if (!window.confirm('Hapus postingan ini?')) return;
    try {
      await communityService.deleteDiscussion(discId);
      toast.success('Postingan berhasil dihapus.');
      if (focusedDiscussion?.id === discId) setFocusedDiscussion(null);
      fetchDiscussions(1);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus postingan.');
    }
  };

  // Hapus Komentar
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

  // Laporkan Konten
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReason === 'lainnya' && (!reportNotes.trim() || reportNotes.trim().length < 5)) {
      toast.error('Keterangan laporan minimal 5 karakter untuk opsi "Lainnya".');
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

      toast.success('Laporan terkirim ke tim moderasi. Terima kasih!');
      setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' });
      setReportReason('penipuan');
      setReportNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Tandai Notifikasi Terbaca
  const handleMarkAllNotifications = async () => {
    try {
      await communityService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Seluruh notifikasi ditandai dibaca.');
    } catch {}
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full lg:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] bg-[#FAF8F5] text-[#14161C] relative overflow-y-auto lg:overflow-hidden">
      
      {/* Sleek Custom Scrollbar Style for Desktop Internal Columns */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(20, 56, 38, 0.15);
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 56, 38, 0.3);
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. UNIFIED ACTION & SEARCH SUB-NAVBAR (OPTION A) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 shrink-0 z-20">
        <header className="bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-xs rounded-2xl flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 transition-all">
          
          {/* Left: View Switching Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-full border border-gray-200/60 shrink-0">
            <button
              onClick={() => setMainTab('beranda')}
              className={`rounded-full px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                mainTab === 'beranda'
                  ? 'bg-[#143826] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setMainTab('grup')}
              className={`rounded-full px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                mainTab === 'grup'
                  ? 'bg-[#143826] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kanal Modus</span>
            </button>
          </nav>

          {/* Center: Always-Visible Interactive Search Bar */}
          <div className="flex-1 max-w-lg relative min-w-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (mainTab !== 'beranda') setMainTab('beranda');
              }}
              placeholder="Cari modus, rekening, atau tag..."
              className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-gray-50/80 hover:bg-gray-100/70 focus:bg-white border border-gray-200/80 focus:border-[#143826] rounded-xl focus:outline-none transition font-medium text-gray-900 placeholder:text-gray-400 shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Action & Notification */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMainTab(mainTab === 'postingan' ? 'beranda' : 'postingan')}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-xs cursor-pointer ${
                mainTab === 'postingan'
                  ? 'bg-[#143826] text-white ring-2 ring-[#143826]/30'
                  : 'bg-[#E86A33] hover:bg-[#d45823] text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tulis Postingan</span>
              <span className="sm:hidden">Tulis</span>
            </button>

            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                fetchNotifications();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-[#143826] hover:bg-gray-50 border border-gray-200/80 shadow-2xs bg-white relative transition cursor-pointer"
              title="Pusat Notifikasi"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E86A33] rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>

        </header>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN WORKSPACE CONTAINER (WITH INDEPENDENT DESKTOP SCROLL) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-3 flex-1 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full lg:h-full lg:overflow-hidden">
          
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR (lg:col-span-3 - Independent Scroll) */}
          {/* ======================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 w-full lg:h-full lg:overflow-y-auto custom-scroll pr-1 pb-6">
            
            {/* Kanal Modus Penipuan */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-[10.5px] text-gray-400 uppercase tracking-widest font-mono">
                  Kanal Modus Penipuan
                </h4>
                <button 
                  onClick={() => setMainTab('grup')} 
                  className="w-5 h-5 rounded-md bg-gray-100 hover:bg-[#143826] hover:text-white text-gray-700 text-xs flex items-center justify-center transition cursor-pointer"
                  title="Lihat semua kanal"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {/* Channel 1: General */}
                <button 
                  onClick={() => {
                    setActiveCategory('tanya-jawab-warga');
                    setSearchQuery('');
                    setMainTab('beranda');
                  }} 
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    activeCategory === 'tanya-jawab-warga' && !searchQuery
                      ? 'border-[#E86A33]/30 bg-[#E86A33]/10 text-[#E86A33]'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[#E86A33]/15 flex items-center justify-center text-[#E86A33] font-mono font-bold text-xs shrink-0">#</span>
                    <span className="text-xs font-bold truncate">General Anti-Scam</span>
                  </div>
                  <span className="bg-white/90 border border-gray-200 text-[9.5px] font-mono font-bold text-gray-600 px-1.5 py-0.2 rounded-full shrink-0">
                    128
                  </span>
                </button>

                {/* Channel 2: APK Kurir */}
                <button 
                  onClick={() => {
                    setActiveCategory('waspada-modus-baru');
                    setSearchQuery('APK');
                    setMainTab('beranda');
                  }} 
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    searchQuery.toLowerCase() === 'apk'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">Satgas Anti-APK Kurir</span>
                  </div>
                  <span className="bg-gray-100 text-[9.5px] font-mono font-bold text-gray-500 px-1.5 py-0.2 rounded-full shrink-0">
                    95
                  </span>
                </button>

                {/* Channel 3: Phishing Bank */}
                <button 
                  onClick={() => {
                    setActiveCategory('posko-solusi-lapor');
                    setSearchQuery('Bank');
                    setMainTab('beranda');
                  }} 
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    searchQuery.toLowerCase() === 'bank'
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Landmark className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">Phishing &amp; Rekening Palsu</span>
                  </div>
                  <span className="bg-gray-100 text-[9.5px] font-mono font-bold text-gray-500 px-1.5 py-0.2 rounded-full shrink-0">
                    86
                  </span>
                </button>

                {/* Channel 4: Telegram */}
                <button 
                  onClick={() => {
                    setActiveCategory('waspada-modus-baru');
                    setSearchQuery('Telegram');
                    setMainTab('beranda');
                  }} 
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    searchQuery.toLowerCase() === 'telegram'
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">Telegram Task Scam</span>
                  </div>
                  <span className="bg-gray-100 text-[9.5px] font-mono font-bold text-gray-500 px-1.5 py-0.2 rounded-full shrink-0">
                    112
                  </span>
                </button>

                {/* Channel 5: Pinjol */}
                <button 
                  onClick={() => {
                    setActiveCategory('posko-solusi-lapor');
                    setSearchQuery('Pinjol');
                    setMainTab('beranda');
                  }} 
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    searchQuery.toLowerCase() === 'pinjol'
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">Pinjol &amp; Pemerasan</span>
                  </div>
                  <span className="bg-gray-100 text-[9.5px] font-mono font-bold text-gray-500 px-1.5 py-0.2 rounded-full shrink-0">
                    67
                  </span>
                </button>
              </div>
            </div>

          </aside>

          {/* ======================================================================= */}
          {/* CENTER FEED COLUMN (lg:col-span-6 - INDEPENDENT INTERNAL SCROLL STREAM) */}
          {/* ======================================================================= */}
          <main className="lg:col-span-6 space-y-4 w-full lg:h-full lg:overflow-y-auto custom-scroll px-1 pb-6">
            
            {/* --------------------------------------------------------------------- */}
            {/* VIEW 1: BERANDA DISKUSI (THE MAIN STREAM) */}
            {/* --------------------------------------------------------------------- */}
            {mainTab === 'beranda' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Quick Post Creator Box */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col gap-3 text-left">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-9 h-9 rounded-full bg-[#143826] text-[#A6F4C5] font-bold text-xs flex items-center justify-center shrink-0 border border-[#143826]/20 shadow-xs">
                      {currentUser?.username ? currentUser.username.slice(0, 2).toUpperCase() : 'DR'}
                    </div>
                    <div className="flex-grow">
                      <textarea 
                        value={quickDiscussText}
                        onChange={(e) => setQuickDiscussText(e.target.value)}
                        rows={2} 
                        className="w-full text-xs sm:text-sm font-medium border border-gray-200 bg-gray-50/70 focus:bg-white rounded-xl focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] p-2.5 focus:outline-none placeholder-gray-400 transition" 
                        placeholder="Ada temuan mencurigakan atau pertanyaan hari ini?"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100 justify-between items-center">
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => setMainTab('postingan')} 
                        className="px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[10.5px] font-bold text-gray-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#E86A33]" />
                        <span>Tulis Postingan</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setMainTab('postingan');
                          toast.info('Silakan unggah berkas bukti di formulir laporan.');
                        }} 
                        className="px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[10.5px] font-bold text-gray-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Paperclip className="w-3 h-3 text-[#0f9b8a]" />
                        <span>Lampirkan Bukti</span>
                      </button>
                    </div>

                    <button 
                      onClick={handleQuickSubmit}
                      className="px-4 py-1.5 bg-[#E86A33] hover:bg-[#d45823] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
                    >
                      Kirim
                    </button>
                  </div>
                </div>

                {/* Filter & Sort Bar (Sticky inside Center Container) */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl p-2 px-3 shadow-xs flex flex-wrap justify-between items-center gap-2 select-none">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none font-bold text-xs">
                    <button 
                      onClick={() => {
                        setActiveCategory('tanya-jawab-warga');
                        setSearchQuery('');
                      }} 
                      className={`pb-0.5 border-b-2 transition cursor-pointer ${
                        activeCategory === 'tanya-jawab-warga' && !searchQuery
                          ? 'border-[#E86A33] text-[#E86A33]' 
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Tanya Jawab
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveCategory('waspada-modus-baru');
                        setSearchQuery('');
                      }} 
                      className={`pb-0.5 border-b-2 transition cursor-pointer ${
                        activeCategory === 'waspada-modus-baru' && !searchQuery
                          ? 'border-[#E86A33] text-[#E86A33]' 
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Modus Baru
                    </button>

                    <button 
                      onClick={() => {
                        setActiveCategory('posko-solusi-lapor');
                        setSearchQuery('');
                      }} 
                      className={`pb-0.5 border-b-2 transition cursor-pointer ${
                        activeCategory === 'posko-solusi-lapor' && !searchQuery
                          ? 'border-[#E86A33] text-[#E86A33]' 
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Posko Solusi
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-400 font-mono text-[10px]">Urutkan:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-0.5 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="paling_membantu">Paling Membantu</option>
                      <option value="terpopuler">Terpopuler</option>
                    </select>
                  </div>
                </div>

                {/* Discussions Feed List */}
                {loading ? (
                  <div className="p-10 text-center bg-white/80 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="w-7 h-7 rounded-full border-2 border-[#143826] border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs text-gray-500 font-medium">Memuat diskusi dari basis data Scamora...</p>
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="p-8 text-center bg-white/80 rounded-2xl border border-gray-200/80 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">Belum ada diskusi untuk kriteria ini</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Jadilah yang pertama membuka konsultasi atau berbagi temuan modus baru.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => setMainTab('postingan')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#143826] text-white text-xs font-bold shadow-xs hover:bg-[#1b4b33] transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#A6F4C5]" />
                        <span>Buka Diskusi Sekarang</span>
                      </button>
                      {(searchQuery || statusFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reset Filter</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((disc, idx) => {
                      const isAuthor = Boolean(
                        currentUser && (
                          disc.userId === currentUser.id ||
                          disc.userId === `usr-${currentUser.username}` ||
                          disc.userId === currentUser.username ||
                          currentUser.role === 'admin' ||
                          currentUser.role === 'moderator' ||
                          currentUser.role === 'superadmin'
                        )
                      );
                      const isPinned = idx === 0 && pagination.page === 1;

                      return (
                        <article 
                          key={disc.id}
                          className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col gap-3 text-left"
                        >
                          {/* Author Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-gray-200"
                                style={{ backgroundColor: disc.avatarColor || '#143826' }}
                              >
                                {disc.authorName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                                  <span>{disc.authorName}</span>
                                  {disc.authorBadge && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-gray-100 text-gray-600">
                                      {disc.authorBadge}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[9.5px] font-bold text-gray-400 font-mono">
                                  {new Date(disc.createdAt).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} • <span className="text-[#E86A33]">#{disc.category}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isPinned && (
                                <span className="bg-[#EFE9FF] text-[#6A4BFF] border border-[#6A4BFF]/20 rounded-md px-2 py-0.5 font-black text-[9px] uppercase tracking-wider">
                                  PINNED
                                </span>
                              )}
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                disc.status === 'TERJAWAB'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : disc.status === 'DITUTUP'
                                  ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {disc.status}
                              </span>
                              {isAuthor && (
                                <button
                                  onClick={() => handleDeletePost(disc.id)}
                                  className="p-1 text-gray-300 hover:text-red-600 transition cursor-pointer"
                                  title="Hapus postingan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Title & Preview Content */}
                          <div 
                            onClick={() => handleOpenDiscussionDetail(disc.id)}
                            className="space-y-1 cursor-pointer group"
                          >
                            <h3 className="font-black text-xs sm:text-sm leading-snug text-gray-900 group-hover:text-[#E86A33] transition-colors">
                              {disc.title}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-normal">
                              {disc.content}
                            </p>
                          </div>

                          {/* Evidence Snippet / Image */}
                          {disc.evidenceSnippet && (
                            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-[#143826]">
                              <span className="text-[9.5px] font-bold text-gray-400 uppercase block">Bukti Kasus Terdeteksi:</span>
                              "{disc.evidenceSnippet}"
                            </div>
                          )}

                          {disc.evidenceImageUrl && (
                            <div className="pt-0.5">
                              <img 
                                src={disc.evidenceImageUrl} 
                                alt="Bukti" 
                                className="max-h-36 rounded-xl border border-gray-200 object-cover w-full"
                              />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleHelpful('post', disc.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                  disc.userVoted
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${disc.userVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                                <span>Membantu ({disc.helpfulCount})</span>
                              </button>

                              <button
                                onClick={() => handleOpenDiscussionDetail(disc.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3 text-[#143826]" />
                                <span>{disc.commentCount} Tanggapan</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopy(`https://scamora.vercel.app/#/komunitas?disc=${disc.id}`, 'Tautan Diskusi')}
                                className="p-1 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                                title="Bagikan diskusi"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setReportModalData({
                                  isOpen: true,
                                  targetType: 'post',
                                  targetId: disc.id,
                                  title: disc.title,
                                })}
                                className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                                title="Laporkan konten"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </article>
                      );
                    })}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between p-3 bg-white/90 rounded-2xl border border-gray-200 text-xs font-bold">
                        <button
                          disabled={pagination.page <= 1}
                          onClick={() => fetchDiscussions(pagination.page - 1)}
                          className="px-3 py-1 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                        >
                          &larr; Sebelumnya
                        </button>

                        <span className="text-gray-500 font-mono text-[11px]">
                          Hal {pagination.page} / {pagination.totalPages}
                        </span>

                        <button
                          disabled={pagination.page >= pagination.totalPages}
                          onClick={() => fetchDiscussions(pagination.page + 1)}
                          className="px-3 py-1 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                        >
                          Selanjutnya &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* VIEW 2: KANAL MODUS (GRUP PENIPUAN SPESIFIK) */}
            {/* --------------------------------------------------------------------- */}
            {mainTab === 'grup' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-left">
                <div className="space-y-2.5">
                  <h4 className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#E86A33] fill-[#E86A33]" />
                    <span>Disarankan Untuk Anda</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {SUGGESTED_GROUPS.map((grp) => (
                      <div 
                        key={grp.id}
                        className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full bg-gray-100 overflow-hidden">
                          <img src={grp.coverImage} alt={grp.title} className="w-full h-full object-cover" />
                          <span className={`absolute top-2 left-2 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border shadow-xs ${grp.tagColor}`}>
                            {grp.category}
                          </span>
                        </div>

                        <div className="p-3.5 flex-grow flex flex-col justify-between gap-2.5">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-black text-gray-900 leading-snug">
                              {grp.title}
                            </h5>
                            <p className="text-[9.5px] font-bold text-gray-400 font-mono">
                              {grp.membersCount} • {grp.weeklyPosts}
                            </p>
                            <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed pt-1">
                              {grp.description}
                            </p>
                          </div>

                          <button 
                            onClick={() => {
                              setActiveCategory(grp.categoryTarget);
                              setSearchQuery(grp.queryTag);
                              setMainTab('beranda');
                              toast.success(`Membuka saluran diskusi "${grp.title}"`);
                            }}
                            className="w-full py-1.5 rounded-xl bg-[#E86A33] hover:bg-[#d45823] text-white font-bold text-xs uppercase tracking-wide transition cursor-pointer"
                          >
                            Buka Diskusi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* VIEW 3: FORMULIR TERBITKAN POSTINGAN / LAPORAN */}
            {/* --------------------------------------------------------------------- */}
            {mainTab === 'postingan' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-left">
                
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                  <h3 className="text-sm sm:text-base text-[#143826] font-black flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <FileText className="w-4 h-4 text-[#E86A33]" />
                    <span>Terbitkan Postingan Komunitas</span>
                  </h3>

                  <form onSubmit={handleCreatePost} className="space-y-3.5">
                    {/* Judul */}
                    <div className="space-y-1">
                      <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                        Judul Postingan / Kasus
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Tuliskan judul kasus atau pertanyaan yang jelas..." 
                        className="w-full text-xs font-bold py-2 px-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none transition"
                      />
                    </div>

                    {/* Kategori Tag & Cover Gambar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Kategori Saluran
                        </label>
                        <select 
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value as DiscussionCategory)}
                          className="w-full text-xs font-bold py-2 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none cursor-pointer"
                        >
                          <option value="tanya-jawab-warga">Tanya Jawab Warga</option>
                          <option value="waspada-modus-baru">Waspada Modus Baru (.APK &amp; Link)</option>
                          <option value="posko-solusi-lapor">Posko Solusi &amp; Bantuan Blokir</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Tangkapan Layar Bukti
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="w-full flex items-center justify-between px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                            <span className="truncate">
                              {newPostEvidenceImage ? 'Gambar Siap' : 'Pilih Screenshot'}
                            </span>
                            <ImageIcon className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                            <input 
                              type="file" 
                              accept="image/png,image/jpeg,image/webp" 
                              onChange={handleImageFileChange} 
                              className="hidden" 
                            />
                          </label>
                          {newPostEvidenceImage && (
                            <button
                              type="button"
                              onClick={() => setNewPostEvidenceImage(null)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg transition"
                              title="Hapus gambar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Text Snippet */}
                    <div className="space-y-1">
                      <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                        Cuplikan Bukti Teks / Nomor Rekening (Opsional)
                      </label>
                      <input 
                        type="text" 
                        value={newPostEvidenceSnippet}
                        onChange={(e) => setNewPostEvidenceSnippet(e.target.value)}
                        placeholder="Contoh: No. WA +62 812-****-3312 / Rekening BCA a.n Penipu" 
                        className="w-full text-xs font-mono py-2 px-3 border border-gray-200 rounded-xl bg-white focus:outline-none transition"
                      />
                    </div>

                    {/* Isi Diskusi */}
                    <div className="space-y-1">
                      <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                        Isi Rincian Diskusi
                      </label>
                      <textarea 
                        rows={4} 
                        required 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Jelaskan pertanyaan atau kronologi temuan Anda secara detail..." 
                        className="w-full text-xs font-medium p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none leading-relaxed transition"
                      />
                    </div>

                    {/* Anonim Toggle */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input 
                        type="checkbox" 
                        id="anonCheckPost" 
                        checked={newPostIsAnonymous} 
                        onChange={(e) => setNewPostIsAnonymous(e.target.checked)} 
                        className="w-4 h-4 rounded text-[#E86A33] cursor-pointer" 
                      />
                      <label htmlFor="anonCheckPost" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                        Posting sebagai Anonim (Nama disamarkan untuk keamanan)
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button 
                        type="submit" 
                        disabled={isSubmittingPost}
                        className="w-full bg-[#E86A33] hover:bg-[#d45823] text-white font-black py-2.5 rounded-full text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <span>{isSubmittingPost ? 'Memproses...' : 'Kirim Postingan'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Section Divider: Postingan Saya */}
                <div className="flex items-center gap-3 py-1 select-none">
                  <div className="flex-grow h-px bg-gray-200" />
                  <span className="font-black text-[10.5px] text-gray-400 uppercase tracking-widest font-mono">
                    Postingan Saya &amp; Balasan
                  </span>
                  <div className="flex-grow h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {discussions.slice(0, 3).map((d) => (
                    <div 
                      key={d.id}
                      className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-gray-900 truncate">{d.title}</h5>
                        <span className="text-[9.5px] font-mono text-gray-400 block mt-0.5">
                          {d.commentCount} tanggapan • {d.helpfulCount} dukungan
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenDiscussionDetail(d.id)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#143826] hover:text-white text-xs font-bold text-gray-700 transition cursor-pointer shrink-0"
                      >
                        Buka Utas
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </main>

          {/* ======================================================================= */}
          {/* RIGHT SIDEBAR (lg:col-span-3 - Independent Scroll) */}
          {/* ======================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 w-full lg:h-full lg:overflow-y-auto custom-scroll pl-1 pb-6">
            
            {/* Card 1: Trending Discussion */}
            <div className="rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-amber-500/8 backdrop-blur-md flex flex-col gap-3 text-left">
              <h4 className="font-black text-[10.5px] text-amber-700 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Trending Discussion</span>
              </h4>
              
              <div className="flex flex-col gap-1.5">
                {TRENDING_TOPICS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setMainTab('beranda');
                      toast.info(`Menyaring diskusi dengan kata kunci "${item.query}"`);
                    }}
                    className="w-full bg-white/90 border border-amber-200/60 rounded-xl p-2 flex justify-between items-center hover:translate-x-0.5 shadow-2xs transition text-left cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-gray-900 truncate mr-2">
                      {item.title}
                    </span>
                    <span className="text-[8.5px] font-bold text-gray-400 shrink-0 font-mono">
                      {item.comments} respon
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Saluran Darurat Cepat */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-[#143826]">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saluran Darurat Penipuan</span>
              </div>
              <div className="space-y-1 pt-1">
                {[
                  { name: 'Call Center Polri', contact: '110' },
                  { name: 'Satgas OJK', contact: '157' },
                  { name: 'Aduan Rekening', contact: 'cekrekening.id' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <span className="text-[10.5px] font-semibold text-gray-700">{item.name}</span>
                    <button
                      onClick={() => handleCopy(item.contact, item.name)}
                      className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[9.5px] font-mono font-bold hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === item.contact ? <Check className="w-2.5 h-2.5 text-[#143826]" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{item.contact}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL THREAD DETAIL & THREADED COMMENTS */}
      {/* ========================================================================= */}
      {focusedDiscussion && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 touch-none"
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
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
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
            <div className="flex-1 overflow-y-auto custom-scroll space-y-3.5 pr-1">
              
              {/* Root Post Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: focusedDiscussion.avatarColor || '#143826' }}
                    >
                      {focusedDiscussion.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900">{focusedDiscussion.authorName}</span>
                      <span className="text-[9.5px] font-mono ml-2 px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
                        {focusedDiscussion.authorBadge}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                    focusedDiscussion.status === 'TERJAWAB' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {focusedDiscussion.status}
                  </span>
                </div>

                <p className="text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-line">
                  {focusedDiscussion.content}
                </p>

                {focusedDiscussion.evidenceSnippet && (
                  <div className="p-2 rounded-xl bg-white border border-amber-200/80 text-xs font-mono text-[#143826]">
                    <span className="text-[9.5px] uppercase font-bold text-gray-400 block mb-0.5">Bukti Kasus Terdeteksi:</span>
                    "{focusedDiscussion.evidenceSnippet}"
                  </div>
                )}

                {focusedDiscussion.evidenceImageUrl && (
                  <div className="pt-1">
                    <img
                      src={focusedDiscussion.evidenceImageUrl}
                      alt="Bukti Screenshot"
                      className="max-h-44 rounded-xl border border-amber-200 object-contain bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Threaded Comments Chain */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block px-1">
                  Tanggapan &amp; Solusi Mitigasi ({focusedDiscussion.comments?.length || 0})
                </span>

                {(!focusedDiscussion.comments || focusedDiscussion.comments.length === 0) ? (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">Belum ada tanggapan pada diskusi ini.</p>
                    <p className="text-[10.5px] text-gray-400">Jadilah yang pertama memberikan solusi di bawah.</p>
                  </div>
                ) : (
                  focusedDiscussion.comments.map((comment) => {
                    const isQuestionAuthor = Boolean(
                      currentUser && (
                        focusedDiscussion.userId === currentUser.id ||
                        focusedDiscussion.userId === `usr-${currentUser.username}` ||
                        focusedDiscussion.userId === currentUser.username ||
                        currentUser.role === 'admin' ||
                        currentUser.role === 'moderator' ||
                        currentUser.role === 'superadmin'
                      )
                    );
                    const isCommentAuthor = Boolean(
                      currentUser && (
                        comment.userId === currentUser.id ||
                        comment.userId === `usr-${currentUser.username}` ||
                        comment.userId === currentUser.username ||
                        currentUser.role === 'admin' ||
                        currentUser.role === 'moderator' ||
                        currentUser.role === 'superadmin'
                      )
                    );

                    return (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                          comment.isBestSolution
                            ? 'bg-gradient-to-br from-emerald-50 to-[#EAF2ED] border-emerald-300 shadow-sm'
                            : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[9px] shrink-0"
                              style={{ backgroundColor: comment.avatarColor || '#0f9b8a' }}
                            >
                              {comment.authorName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-gray-900">{comment.authorName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-gray-200 text-gray-700">
                              {comment.authorBadge}
                            </span>
                          </div>

                          <span className="text-[9.5px] text-gray-400 font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {comment.isBestSolution && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[9.5px] font-bold font-mono border border-emerald-300">
                            <Award className="w-3 h-3 text-emerald-700" />
                            <span>SOLUSI TERVERIFIKASI OLEH PENANYA</span>
                          </div>
                        )}

                        <p className="text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                          {comment.content}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful('comment', comment.id)}
                              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Membantu ({comment.helpfulCount})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCommentReplyTo({
                                id: comment.id,
                                author: comment.authorName,
                                content: comment.content.slice(0, 50),
                              })}
                              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer ml-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Balas</span>
                            </button>

                            {isQuestionAuthor && (
                              <button
                                type="button"
                                onClick={() => handleToggleBestSolution(comment.id)}
                                className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md cursor-pointer ml-1 transition ${
                                  comment.isBestSolution
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                }`}
                              >
                                <Award className="w-3 h-3" />
                                <span>{comment.isBestSolution ? 'Batalkan Solusi' : 'Jadikan Solusi Terbaik'}</span>
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

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-3 sm:pl-4 border-l-2 border-gray-200 space-y-1.5 pt-1.5">
                            {comment.replies.map((reply) => {
                              const isReplyAuthor = Boolean(
                                currentUser && (
                                  reply.userId === currentUser.id ||
                                  reply.userId === `usr-${currentUser.username}` ||
                                  reply.userId === currentUser.username ||
                                  currentUser.role === 'admin' ||
                                  currentUser.role === 'moderator' ||
                                  currentUser.role === 'superadmin'
                                )
                              );
                              return (
                                <div key={reply.id} className="p-2.5 rounded-xl bg-white border border-gray-200 space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gray-900">{reply.authorName}</span>
                                      <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-gray-100 text-gray-600">
                                        {reply.authorBadge}
                                      </span>
                                    </div>
                                    <span className="text-[9.5px] text-gray-400 font-mono">
                                      {new Date(reply.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed text-[11px]">{reply.content}</p>
                                  <div className="flex items-center justify-between pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHelpful('comment', reply.id)}
                                      className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer"
                                    >
                                      <ThumbsUp className="w-2.5 h-2.5" />
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
                <div className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-[#EAF2ED] border border-[#143826]/20 text-xs text-[#143826]">
                  <div className="flex items-center gap-1 truncate">
                    <CornerDownRight className="w-3 h-3 shrink-0" />
                    <span>Membalas <strong>@{commentReplyTo.author}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommentReplyTo(null)}
                    className="p-0.5 text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={commentReplyTo ? `Balas @${commentReplyTo.author}...` : "Berikan tanggapan atau solusi mitigasi Anda..."}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#E86A33] transition"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#E86A33] hover:bg-[#d45823] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <span>Kirim</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5 text-[10.5px] text-gray-500">
                <input
                  type="checkbox"
                  id="commentAnonCheck"
                  checked={commentIsAnonymous}
                  onChange={(e) => setCommentIsAnonymous(e.target.checked)}
                  className="w-3 h-3 rounded text-[#E86A33] cursor-pointer"
                />
                <label htmlFor="commentAnonCheck" className="cursor-pointer select-none">
                  Kirim sebagai Anonim
                </label>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL LAPORKAN KONTEN PELANGGARAN */}
      {/* ========================================================================= */}
      {reportModalData.isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 touch-none"
          onClick={() => setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' })}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 text-left space-y-3.5 animate-in zoom-in-95 duration-200"
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

            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Alasan Pelaporan *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:border-[#E86A33]"
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
                  placeholder="Jelaskan alasan pelanggaran..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-[#E86A33]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReportModalData({ isOpen: false, targetType: 'post', targetId: '', title: '' })}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
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
      {/* 5. MODAL NOTIFIKASI KOMUNITAS */}
      {/* ========================================================================= */}
      {isNotificationsOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-[#14161c]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 touch-none"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 text-left space-y-3 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col"
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
                    Tandai Semua Dibaca
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

            <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Belum ada notifikasi baru untuk Anda.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-0.5 transition ${
                      n.isRead ? 'bg-white border-gray-100 text-gray-600' : 'bg-emerald-50/70 border-emerald-200 font-medium text-gray-900'
                    }`}
                  >
                    <p className="leading-snug">{n.message}</p>
                    <span className="text-[9.5px] text-gray-400 font-mono block">
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
