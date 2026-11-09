import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  UserCheck,
  FileText,
  Edit3,
  Search,
  Bell,
  Mail,
  ChevronDown,
  Rocket,
  Plus,
  Flame,
  Trophy,
  Medal,
  Sparkles,
  Award,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  CornerDownRight,
  Trash2,
  Flag,
  Check,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Paperclip,
  Clock,
  Star,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Landmark,
  CreditCard,
  HelpCircle,
  ExternalLink,
  Filter,
  ChevronRight,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
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
  badgeCount?: number;
}

const CHANNELS: ChannelTab[] = [
  {
    id: 'tanya-jawab-warga',
    title: 'Tanya Jawab Warga',
    description: 'Tanyakan kecurigaan pesan, SMS, atau telepon yang Anda terima',
    icon: 'message-square',
    badgeCount: 128,
  },
  {
    id: 'waspada-modus-baru',
    title: 'Waspada Modus Baru',
    description: 'Berbagi temuan link mencurigakan & file .apk berbahaya',
    icon: 'alert-triangle',
    badgeCount: 95,
  },
  {
    id: 'posko-solusi-lapor',
    title: 'Posko Solusi & Bantuan',
    description: 'Panduan blokir rekening bank penipu & lapor kepolisian',
    icon: 'shield-check',
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
    weeklyPosts: '54 postingan per minggu',
    description: 'Bedah file APK berbahaya berkedok resi kurir, surat tilang ETLE, dan undangan pernikahan digital yang menguras rekening.',
    queryTag: 'APK',
    categoryTarget: 'waspada-modus-baru' as DiscussionCategory,
  },
  {
    id: 'grp-phishing',
    title: 'Deteksi Phishing Bank & Rekening Bodong',
    category: 'PHISHING PERBANKAN',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60',
    membersCount: '24.5 rb anggota',
    weeklyPosts: '89 postingan per minggu',
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
    weeklyPosts: '62 postingan per minggu',
    description: 'Investigasi sindikat like YouTube, review hotel, dan investasi abal-abal yang menjebak dengan skema deposit berulang.',
    queryTag: 'Telegram',
    categoryTarget: 'waspada-modus-baru' as DiscussionCategory,
  },
  {
    id: 'grp-pinjol',
    title: 'Posko Bantuan Pinjol Ilegal & Teror',
    category: 'HUKUM & MEDIASI',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60',
    membersCount: '9.8 rb anggota',
    weeklyPosts: '37 postingan per minggu',
    description: 'Pendampingan hukum dan psikologis bagi korban intimidasi kontak darurat oleh aplikasi pinjaman tanpa izin OJK.',
    queryTag: 'Pinjol',
    categoryTarget: 'posko-solusi-lapor' as DiscussionCategory,
  },
];

const LOCAL_GROUPS = [
  {
    id: 'loc-1',
    title: 'Posko Tanggap Darurat Rekening Jabodetabek',
    members: '12.4 rb anggota',
    activity: '16 postingan per bulan',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60',
    categoryTarget: 'posko-solusi-lapor' as DiscussionCategory,
  },
  {
    id: 'loc-2',
    title: 'Aliansi Relawan Siber Mahasiswa & Pelajar',
    members: '8.9 rb anggota',
    activity: '22 postingan per bulan',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=60',
    categoryTarget: 'tanya-jawab-warga' as DiscussionCategory,
  },
];

const EXPERTS = [
  {
    id: 'exp-1',
    name: 'Dimas Pratama, S.Kom',
    specialty: 'Analis Malware APK & Forensik Mobile',
    rating: '4.9',
    reviews: '320 ulasan',
    tags: ['Reverse Engineering', 'Android APK', 'Payload Audit'],
    isOnline: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'exp-2',
    name: 'Aulia Rizky, M.T',
    specialty: 'Praktisi Keamanan Web & Deteksi Phishing',
    rating: '4.9',
    reviews: '275 ulasan',
    tags: ['Domain Analysis', 'SSL Spoofing', 'Threat Intel'],
    isOnline: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'exp-3',
    name: 'Budi Santoso, S.H',
    specialty: 'Konsultan Hukum Pidana Siber & UU ITE',
    rating: '4.8',
    reviews: '190 ulasan',
    tags: ['Advokasi Korban', 'Laporan Kepolisian', 'OJK & Kominfo'],
    isOnline: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'exp-4',
    name: 'Sarah Lestari, CISA',
    specialty: 'Auditor Transaksi Finansial & Fraud E-Wallet',
    rating: '4.9',
    reviews: '215 ulasan',
    tags: ['Blacklist Rekening', 'Chargeback Perbankan', 'Anti-Pencucian'],
    isOnline: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

const TRENDING_TOPICS = [
  { id: 'tr-1', title: 'File Resi Paket JNT .APK via WhatsApp', query: 'APK Kurir', comments: 142 },
  { id: 'tr-2', title: 'Undangan Pernikahan Digital Kuras Saldo Bank', query: 'Undangan', comments: 118 },
  { id: 'tr-3', title: 'Cara Resmi Blokir Rekening Penipu 1x24 Jam', query: 'Blokir Rekening', comments: 95 },
  { id: 'tr-4', title: 'Grup Telegram Misi Like Video Berujung Deposit', query: 'Telegram', comments: 78 },
];

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Kevin Sanjaya', xp: '1,250 XP', isTop: true },
  { rank: 2, name: 'Maya Putri', xp: '980 XP', isTop: false },
  { rank: 3, name: 'Rizky Pratama', xp: '760 XP', isTop: false },
];

export const KomunitasPage: React.FC = () => {
  const location = useLocation();
  const currentUser = adminAuth.getUser();

  // Primary Navigation Tab (matching ClassQu: Beranda, Grup, Pakar, Postingan)
  const [mainTab, setMainTab] = useState<'beranda' | 'grup' | 'pakar' | 'postingan'>('beranda');

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

  // Form Buat Postingan Baru (Inline Tab & Modal)
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
      toast.info('Draf hasil pemindaian URL telah dimuat otomatis untuk didiskusikan!');
    }
  }, [location.state]);

  // Muat Statistik Komunitas
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

  // Muat Notifikasi jika Terautentikasi
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

  // Muat Daftar Diskusi berdasarkan filter
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

  // Muat Detail Diskusi saat dipilih
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

  // Upload Gambar dengan Validasi Magic Bytes & Sensor PII
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
          toast.success(`Gambar bukti terverifikasi (${val.mimeType}). Pastikan data sensitif sudah disensor.`);
        }
      } catch (err: any) {
        toast.error(err.message || 'Format gambar bukti ditolak oleh sistem keamanan.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Buat Postingan Baru
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

      toast.success('Postingan Anda berhasil dipublikasikan!');
      setIsNewPostModalOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostEvidenceSnippet('');
      setNewPostEvidenceImage(null);
      setNewPostIsAnonymous(false);

      // Pindahkan ke Beranda dan aktifkan kategori tersebut
      setActiveCategory(created.category);
      setMainTab('beranda');
      fetchDiscussions(1);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mempublikasikan postingan.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Quick submit from Beranda text area
  const handleQuickSubmit = () => {
    if (!quickDiscussText.trim() || quickDiscussText.trim().length < 5) {
      toast.error('Tuliskan ringkasan pertanyaan atau temuan Anda minimal 5 karakter.');
      return;
    }
    setNewPostTitle(quickDiscussText.slice(0, 80));
    setNewPostContent(quickDiscussText);
    setQuickDiscussText('');
    setMainTab('postingan');
    toast.info('Silakan lengkapi kategori dan rincian sebelum mempublikasikan!');
  };

  // Submit Komentar / Threaded Reply
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

      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim komentar.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Tandai / Batalkan Solusi Terbaik (Best Solution)
  const handleToggleBestSolution = async (commentId: string) => {
    if (!focusedDiscussion) return;
    try {
      const res = await communityService.toggleBestSolution(focusedDiscussion.id, commentId);
      toast.success(
        res.isBestSolution
          ? 'Jawaban dijadikan Solusi Terbaik! Status diskusi kini TERJAWAB.'
          : 'Tanda Solusi Terbaik dibatalkan. Status diskusi kembali TERBUKA.'
      );

      const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
      setFocusedDiscussion(updated);
      fetchDiscussions(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah Solusi Terbaik.');
    }
  };

  // Toggle Vote Membantu (Helpful)
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
        const updated = await communityService.getDiscussionDetail(focusedDiscussion.id);
        setFocusedDiscussion(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses vote.');
    }
  };

  // Hapus Postingan Sendiri
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

  // Hapus Komentar Sendiri
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

      toast.success('Laporan terkirim ke tim moderasi Scamora. Terima kasih atas kepedulian Anda!');
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
      toast.success('Seluruh notifikasi ditandai telah dibaca.');
    } catch {}
  };

  // Copy helper
  const handleCopyLink = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke papan klip!`);
  };

  // User details
  const displayUserName = currentUser?.username ? currentUser.username : 'Kevin Sanjaya';

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-[#FAF8F5] text-[#14161C] relative pb-16">
      
      {/* Background Soft Glows (retained from reference) */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#E86A33]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[40vw] h-[40vw] bg-[#0f9b8a]/5 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. COMMUNITY SUB-NAVBAR (CLASSQU AESTHETIC WITH PILL NAVIGATION) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 sticky top-16 z-30">
        <header className="bg-white/85 backdrop-blur-xl border border-gray-200/70 shadow-lg shadow-[#143826]/5 rounded-2xl sm:rounded-3xl flex justify-between items-center px-4 sm:px-6 py-2.5 sm:py-3 transition-all">
          
          {/* Left Brand Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#143826] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#A6F4C5]" />
            </div>
            <div className="hidden xs:block text-left">
              <h2 className="font-black text-sm sm:text-base text-[#143826] tracking-tight leading-none">Scamora Warga</h2>
              <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Komunitas Siber</span>
            </div>
          </div>

          {/* Center Navigation Tabs (Pill Buttons) */}
          <nav className="flex items-center gap-1 bg-[#14161c]/5 p-1 rounded-full border border-gray-200/50 overflow-x-auto scrollbar-none max-w-[280px] xs:max-w-none">
            <button
              onClick={() => setMainTab('beranda')}
              className={`rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 flex items-center gap-1.5 font-bold text-xs transition-all duration-200 cursor-pointer ${
                mainTab === 'beranda'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-[#E86A33]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setMainTab('grup')}
              className={`rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 flex items-center gap-1.5 font-bold text-xs transition-all duration-200 cursor-pointer ${
                mainTab === 'grup'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-[#E86A33]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Grup</span>
            </button>

            <button
              onClick={() => setMainTab('pakar')}
              className={`rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 flex items-center gap-1.5 font-bold text-xs transition-all duration-200 cursor-pointer ${
                mainTab === 'pakar'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-[#E86A33]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Pakar</span>
            </button>

            <button
              onClick={() => setMainTab('postingan')}
              className={`rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 flex items-center gap-1.5 font-bold text-xs transition-all duration-200 cursor-pointer ${
                mainTab === 'postingan'
                  ? 'bg-[#E86A33] text-white shadow-md shadow-[#E86A33]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>Postingan</span>
            </button>
          </nav>

          {/* Right Side Actions & Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-[#143826] hover:bg-white border border-gray-200/60 shadow-2xs bg-white/70 transition-all cursor-pointer"
              title="Cari diskusi"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                fetchNotifications();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-[#143826] hover:bg-white border border-gray-200/60 shadow-2xs bg-white/70 relative transition-all cursor-pointer"
              title="Notifikasi Komunitas"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E86A33] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* User Profile Pill */}
            <div
              onClick={() => toast.info(`Masuk sebagai ${displayUserName} (Warga Tingkat 12)`)}
              className="hidden md:flex items-center gap-2 border border-gray-200/70 shadow-2xs rounded-full px-3 py-1 bg-white/80 hover:bg-white cursor-pointer transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#143826] text-[#A6F4C5] font-bold text-xs flex items-center justify-center border border-[#143826]/20 shadow-xs">
                {displayUserName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-[11px] font-black text-gray-900">{displayUserName}</p>
                <p className="text-[9px] font-bold text-gray-400">Level 12 • 450 XP</p>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>

        </header>

        {/* Expandable Search Input Strip */}
        {showSearchInput && (
          <div className="mt-2 p-2 bg-white rounded-2xl border border-gray-200/80 shadow-md flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci (contoh: APK Resi, Rekening BCA, Loker Telegram)..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium py-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowSearchInput(false)}
              className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN WORKSPACE CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 sm:px-6 mt-6 items-start w-full">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: LEVEL KAMU + GRUP SAYA + INVITE & EARN (lg:col-span-3) */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-3 space-y-5 w-full">
          
          {/* Card 1: Level Kamu */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3.5 text-left">
            <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest font-mono">
              Level Kamu
            </h4>
            
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                <Rocket className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h5 className="text-sm font-black leading-tight text-gray-900">Level 12</h5>
                <p className="text-[11px] text-gray-500 font-bold font-mono">450 / 800 XP</p>
                <span className="text-[9.5px] font-bold text-emerald-700">Warga Detektor Senior</span>
              </div>
            </div>

            {/* Sleek Modern Progress Bar */}
            <div className="w-full h-2.5 bg-gray-100 border border-gray-200/50 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-[#E86A33] to-[#ff8c53] rounded-full shadow-sm transition-all duration-500"
                style={{ width: '56%' }}
              />
            </div>
          </div>

          {/* Card 2: Grup Saya */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3.5 text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest font-mono">
                Grup Saya
              </h4>
              <button 
                onClick={() => setMainTab('grup')} 
                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-[#143826] hover:text-white text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200/60 transition-colors cursor-pointer"
                title="Jelajahi Grup"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {/* Group 1: General (Active Highlight) */}
              <button 
                onClick={() => {
                  setActiveCategory('tanya-jawab-warga');
                  setSearchQuery('');
                  setMainTab('beranda');
                }} 
                className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeCategory === 'tanya-jawab-warga' && !searchQuery
                    ? 'border-[#E86A33]/30 bg-[#E86A33]/10 text-[#E86A33]'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#E86A33]/15 flex items-center justify-center text-[#E86A33] font-mono font-bold text-xs shrink-0">#</span>
                  <span className="text-xs font-black truncate">General Anti-Scam</span>
                </div>
                <span className="bg-white/90 border border-gray-200 text-[10px] font-mono font-bold text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                  128
                </span>
              </button>

              {/* Group 2: APK Kurir */}
              <button 
                onClick={() => {
                  setActiveCategory('waspada-modus-baru');
                  setSearchQuery('APK');
                  setMainTab('beranda');
                }} 
                className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'apk'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">Satgas Anti-APK Kurir</span>
                </div>
                <span className="bg-gray-100 text-[10px] font-mono font-bold text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                  95
                </span>
              </button>

              {/* Group 3: Phishing Bank */}
              <button 
                onClick={() => {
                  setActiveCategory('posko-solusi-lapor');
                  setSearchQuery('Bank');
                  setMainTab('beranda');
                }} 
                className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'bank'
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Landmark className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">Phishing &amp; Rekening Palsu</span>
                </div>
                <span className="bg-gray-100 text-[10px] font-mono font-bold text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                  86
                </span>
              </button>

              {/* Group 4: Telegram Task */}
              <button 
                onClick={() => {
                  setActiveCategory('waspada-modus-baru');
                  setSearchQuery('Telegram');
                  setMainTab('beranda');
                }} 
                className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'telegram'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">Telegram &amp; WA Task Scam</span>
                </div>
                <span className="bg-gray-100 text-[10px] font-mono font-bold text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                  112
                </span>
              </button>

              {/* Group 5: Pinjol */}
              <button 
                onClick={() => {
                  setActiveCategory('posko-solusi-lapor');
                  setSearchQuery('Pinjol');
                  setMainTab('beranda');
                }} 
                className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === 'pinjol'
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">Pinjol &amp; Pemerasan</span>
                </div>
                <span className="bg-gray-100 text-[10px] font-mono font-bold text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                  67
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: Invite & Earn XP (Teal Glassmorphic) */}
          <div className="rounded-2xl sm:rounded-3xl p-5 border border-[#0f9b8a]/20 bg-[#0f9b8a]/8 backdrop-blur-md flex flex-col gap-3.5 text-left">
            <h4 className="font-black text-[11px] text-[#0f9b8a] uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-[#0f9b8a]" />
              <span>Kontribusi &amp; Klaim XP</span>
            </h4>
            
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              Ajak kerabat waspada dan laporkan temuan nomor penipu baru untuk klaim 50 XP per verifikasi.
            </p>
            
            <button 
              onClick={() => handleCopyLink('https://scamora.vercel.app/#/komunitas?ref=WARGA-KEVIN-2026', 'Tautan Undangan Scamora')} 
              className="bg-[#0f9b8a] hover:bg-[#0c8072] text-white w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0f9b8a]/20 transition-all cursor-pointer"
            >
              <span>Salin Tautan Edukasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </aside>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: DYNAMIC BASED ON MAIN TAB (lg:col-span-6) */}
        {/* ========================================================================= */}
        <main className="lg:col-span-6 space-y-6 w-full">
          
          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: BERANDA FEED PANEL */}
          {/* ----------------------------------------------------------------------- */}
          {mainTab === 'beranda' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Quick Post Creator Box */}
              <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3.5 text-left">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#143826] text-[#A6F4C5] font-bold text-sm flex items-center justify-center shrink-0 border border-[#143826]/20 shadow-xs">
                    {displayUserName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <textarea 
                      value={quickDiscussText}
                      onChange={(e) => setQuickDiscussText(e.target.value)}
                      rows={2} 
                      className="w-full text-xs sm:text-sm font-medium border border-gray-200 bg-gray-50/70 focus:bg-white rounded-2xl focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] p-3 focus:outline-none placeholder-gray-400 transition" 
                      placeholder="Ada temuan mencurigakan atau pertanyaan hari ini?"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 justify-between items-center">
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      onClick={() => setMainTab('postingan')} 
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[10.5px] font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#E86A33]" />
                      <span>Tulis Postingan</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setMainTab('postingan');
                        toast.info('Silakan unggah bukti tangkapan layar pada formulir postingan.');
                      }} 
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[10.5px] font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#0f9b8a]" />
                      <span>Bagikan Bukti</span>
                    </button>

                    <button 
                      onClick={() => setMainTab('pakar')} 
                      className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[10.5px] font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Minta Pakar</span>
                    </button>
                  </div>

                  <button 
                    onClick={handleQuickSubmit}
                    className="px-4 py-1.5 bg-[#E86A33] hover:bg-[#d45823] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E86A33]/25 transition cursor-pointer"
                  >
                    Kirim
                  </button>
                </div>
              </div>

              {/* Feed Filters & Sorting Strip (Sticky on Mobile/Desktop) */}
              <div className="sticky top-32 z-20 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl p-2.5 px-4 shadow-xs flex flex-wrap justify-between items-center gap-2 select-none">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none font-bold text-xs">
                  <button 
                    onClick={() => {
                      setActiveCategory('tanya-jawab-warga');
                      setSearchQuery('');
                    }} 
                    className={`pb-1 border-b-2 transition-colors cursor-pointer ${
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
                    className={`pb-1 border-b-2 transition-colors cursor-pointer ${
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
                    className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                      activeCategory === 'posko-solusi-lapor' && !searchQuery
                        ? 'border-[#E86A33] text-[#E86A33]' 
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Posko Solusi
                  </button>
                </div>
                
                {/* Sort selector dropdown */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400 font-mono text-[10px]">Urutkan:</span>
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

              {/* Discussions Feed stream list */}
              {loading ? (
                <div className="p-12 text-center bg-white/80 rounded-3xl border border-gray-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#143826] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">Memuat diskusi dari basis data Scamora...</p>
                </div>
              ) : discussions.length === 0 ? (
                <div className="p-10 text-center bg-white/80 rounded-3xl border border-gray-200/80 space-y-3">
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
                    onClick={() => setMainTab('postingan')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143826] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A6F4C5]" />
                    <span>Buka Diskusi Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
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
                        className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col gap-3.5 text-left"
                      >
                        {/* Author Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-gray-200"
                              style={{ backgroundColor: disc.avatarColor || '#143826' }}
                            >
                              {disc.authorName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                                <span>{disc.authorName}</span>
                                <span className="text-[10px] font-bold text-[#0f9b8a]">Level 8</span>
                                {disc.authorBadge && (
                                  <span className="text-[9px] font-mono px-2 py-0.2 rounded-full font-bold bg-gray-100 text-gray-600">
                                    {disc.authorBadge}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] font-bold text-gray-400 font-mono mt-0.5">
                                {new Date(disc.createdAt).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} • <span className="text-[#E86A33]">#{disc.category}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPinned && (
                              <span className="bg-[#EFE9FF] text-[#6A4BFF] border border-[#6A4BFF]/20 rounded-lg px-2.5 py-0.5 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>PINNED</span>
                              </span>
                            )}
                            <span className={`text-[9.5px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
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
                          className="space-y-1.5 cursor-pointer group"
                        >
                          <h3 className="font-black text-sm sm:text-base leading-snug text-gray-900 group-hover:text-[#E86A33] transition-colors">
                            {disc.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 font-normal">
                            {disc.content}
                          </p>
                          <span className="text-xs font-bold text-[#E86A33] hover:underline inline-block mt-0.5">
                            selengkapnya &rarr;
                          </span>
                        </div>

                        {/* Evidence Snippet / Image preview */}
                        {disc.evidenceSnippet && (
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-[#143826]">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Bukti Teks Terdeteksi:</span>
                            "{disc.evidenceSnippet}"
                          </div>
                        )}

                        {disc.evidenceImageUrl && (
                          <div className="pt-1">
                            <img 
                              src={disc.evidenceImageUrl} 
                              alt="Bukti" 
                              className="max-h-44 rounded-xl border border-gray-200 object-cover w-full sm:w-auto"
                            />
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs">
                          <div className="flex items-center gap-2">
                            {/* Helpful button */}
                            <button
                              onClick={() => handleToggleHelpful('post', disc.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                                disc.userVoted
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${disc.userVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                              <span>Membantu ({disc.helpfulCount})</span>
                            </button>

                            {/* Comment count button */}
                            <button
                              onClick={() => handleOpenDiscussionDetail(disc.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#143826]" />
                              <span>{disc.commentCount} Tanggapan</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyLink(`https://scamora.vercel.app/#/komunitas?disc=${disc.id}`, 'Tautan Diskusi')}
                              className="p-1.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
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
                              className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
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
                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-gray-200 text-xs font-bold">
                      <button
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
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: GRUP MODUS (SUGGESTED & LOCAL CHANNELS HUB) */}
          {/* ----------------------------------------------------------------------- */}
          {mainTab === 'grup' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* Section 1: Disarankan Untuk Anda */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#E86A33] fill-[#E86A33]" />
                  <span>Disarankan Untuk Anda</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SUGGESTED_GROUPS.map((grp) => (
                    <div 
                      key={grp.id}
                      className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                        <img 
                          src={grp.coverImage} 
                          alt={grp.title} 
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-xs ${grp.tagColor}`}>
                          {grp.category}
                        </span>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-gray-900 uppercase tracking-tight leading-snug">
                            {grp.title}
                          </h5>
                          <p className="text-[10px] font-bold text-gray-400 font-mono">
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
                          className="w-full py-2 rounded-xl bg-[#E86A33] hover:bg-[#d45823] text-white font-bold text-xs uppercase tracking-wide shadow-sm shadow-[#E86A33]/20 transition cursor-pointer"
                        >
                          Buka Diskusi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Populer di Sekitar Anda */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-sm text-gray-900">Populer di Sekitar Anda</h4>
                    <p className="text-[10.5px] font-bold text-gray-400">Komunitas tanggap darurat regional berbasis wilayah warga.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LOCAL_GROUPS.map((loc) => (
                    <div 
                      key={loc.id}
                      className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
                        <img 
                          src={loc.coverImage} 
                          alt={loc.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-gray-900 uppercase tracking-tight leading-snug">
                            {loc.title}
                          </h5>
                          <p className="text-[10px] font-bold text-gray-400 font-mono">
                            {loc.members} • {loc.activity}
                          </p>
                        </div>

                        <button 
                          onClick={() => {
                            setActiveCategory(loc.categoryTarget);
                            setMainTab('beranda');
                            toast.success(`Bergabung ke posko ${loc.title}`);
                          }}
                          className="w-full py-2 rounded-xl bg-gray-100 hover:bg-[#143826] hover:text-white font-bold text-xs text-gray-700 transition cursor-pointer"
                        >
                          Gabung ke grup
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: PAKAR & MENTOR SIBER */}
          {/* ----------------------------------------------------------------------- */}
          {mainTab === 'pakar' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* Hero Spotlight Banner with Neo-Brutalist Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
                  <h2 className="font-black text-xl sm:text-2xl text-[#143826] leading-tight">
                    Konsultasi &amp; Verifikasi <br />
                    Bersama <span className="text-[#E86A33]">Pakar Keamanan Siber</span>
                  </h2>
                  <p className="text-gray-600 text-xs font-medium leading-relaxed max-w-md">
                    Dapatkan validasi teknis langsung dari praktisi forensik digital, hukum pidana siber, dan auditor perbankan Scamora.
                  </p>
                </div>

                {/* Neo-brutalist Stats Panel */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 bg-[#FAF6F0] border border-[#143826]/15 rounded-2xl p-3.5 shadow-xs select-none">
                  <div className="text-center flex flex-col justify-center p-2 bg-white rounded-xl border border-gray-200/60">
                    <span className="text-base font-black text-[#143826]">42+</span>
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-wide">Pakar Aktif</span>
                  </div>
                  <div className="text-center flex flex-col justify-center p-2 bg-white rounded-xl border border-gray-200/60">
                    <span className="text-base font-black text-[#6A4BFF]">3.850+</span>
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-wide">Kasus Terbantu</span>
                  </div>
                  <div className="text-center flex flex-col justify-center p-2 bg-white rounded-xl border border-gray-200/60">
                    <span className="text-base font-black text-amber-600">4.9/5</span>
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-wide">Rating Akurasi</span>
                  </div>
                  <div className="text-center flex flex-col justify-center p-2 bg-white rounded-xl border border-gray-200/60">
                    <span className="text-base font-black text-[#0f9b8a]">99.2%</span>
                    <span className="text-[8.5px] font-black text-gray-400 uppercase tracking-wide">Selesai Tuntas</span>
                  </div>
                </div>
              </div>

              {/* Selector Tabs bar */}
              <div className="bg-white/95 backdrop-blur-md border border-gray-200/80 py-2.5 px-4 flex justify-between items-center rounded-2xl shadow-xs select-none">
                <div className="flex gap-4 font-black text-xs">
                  <span className="text-[#E86A33] border-b-2 border-[#E86A33] pb-1">Semua Pakar</span>
                  <span className="text-gray-400 hover:text-gray-900 cursor-pointer pb-1">Forensik APK</span>
                  <span className="text-gray-400 hover:text-gray-900 cursor-pointer pb-1">Hukum Siber</span>
                  <span className="text-gray-400 hover:text-gray-900 cursor-pointer pb-1">Perbankan</span>
                </div>
                
                <span className="text-[10px] font-mono font-bold text-gray-500">Urutkan: Terpopuler</span>
              </div>

              {/* Expert Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPERTS.map((exp) => (
                  <div 
                    key={exp.id}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-gray-200/80 hover:border-[#143826]/30 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={exp.avatar} 
                          alt={exp.name} 
                          className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-black text-gray-900">{exp.name}</h4>
                          <p className="text-[9.5px] text-[#0f9b8a] font-bold leading-tight mt-0.5">{exp.specialty}</p>
                          <span className={`text-[9px] font-bold flex items-center gap-1 mt-1 ${exp.isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${exp.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {exp.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {exp.tags.map((t, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{exp.rating} ({exp.reviews})</span>
                      </span>
                      <button 
                        onClick={() => {
                          setNewPostTitle(`[Konsultasi Pakar] Kasus untuk ${exp.name}: `);
                          setMainTab('postingan');
                          toast.info(`Membuka formulir postingan untuk konsultasi dengan ${exp.name}`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Konsultasi Kasus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: POSTINGAN FORM & MY POSTS HISTORY */}
          {/* ----------------------------------------------------------------------- */}
          {mainTab === 'postingan' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* Form: Terbitkan Postingan Komunitas */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
                <h3 className="text-base sm:text-lg text-[#143826] font-black flex items-center gap-2 border-b border-gray-100 pb-3">
                  <FileText className="w-5 h-5 text-[#E86A33]" />
                  <span>Terbitkan Postingan Komunitas</span>
                </h3>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  {/* Judul */}
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                      Judul Postingan / Pertanyaan
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Tuliskan judul kasus atau pertanyaan yang menarik..." 
                      className="w-full text-xs font-bold py-2.5 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none transition"
                    />
                  </div>

                  {/* Kategori Tag & Cover Gambar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                        Kategori Tag
                      </label>
                      <select 
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value as DiscussionCategory)}
                        className="w-full text-xs font-bold py-2.5 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none cursor-pointer"
                      >
                        <option value="tanya-jawab-warga">Tanya Jawab Warga</option>
                        <option value="waspada-modus-baru">Waspada Modus Baru (.APK &amp; Link)</option>
                        <option value="posko-solusi-lapor">Posko Solusi &amp; Bantuan Blokir</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                        Tambahkan Cover / Bukti Gambar
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                          <span className="truncate">
                            {newPostEvidenceImage ? 'Gambar Terlampir' : 'Pilih Berkas Screenshot'}
                          </span>
                          <ImageIcon className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
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
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Hapus gambar"
                          >
                            <Trash2 className="w-4 h-4" />
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
                      placeholder="Contoh: No. WA +62 812-****-3312 / Rekening BCA 0123456789 a.n Penipu" 
                      className="w-full text-xs font-mono py-2.5 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none transition"
                    />
                  </div>

                  {/* Isi Diskusi */}
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono">
                      Isi Diskusi
                    </label>
                    <textarea 
                      rows={5} 
                      required 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Jelaskan pertanyaan, kronologi modus, atau informasi temuan Anda secara detail..." 
                      className="w-full text-xs font-medium p-4 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-[#E86A33]/20 focus:border-[#E86A33] focus:outline-none leading-relaxed transition"
                    />
                  </div>

                  {/* Anonim Toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="anonCheckPost" 
                      checked={newPostIsAnonymous} 
                      onChange={(e) => setNewPostIsAnonymous(e.target.checked)} 
                      className="w-4 h-4 rounded text-[#E86A33] cursor-pointer" 
                    />
                    <label htmlFor="anonCheckPost" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                      Posting sebagai Anonim (Nama Anda disamarkan untuk keamanan)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmittingPost}
                      className="w-full bg-[#E86A33] hover:bg-[#d45823] text-white font-black py-3 rounded-full text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-[#E86A33]/25 transition cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmittingPost ? 'Memproses Postingan...' : 'Kirim Postingan'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Section Divider / Label */}
              <div className="flex items-center gap-4 py-2 select-none">
                <div className="flex-grow h-px bg-gray-200" />
                <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Postingan Saya &amp; Balasan</span>
                </h4>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              {/* User Posts List */}
              <div className="space-y-4">
                {discussions.slice(0, 3).map((d) => (
                  <div 
                    key={d.id}
                    className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-gray-900 truncate">{d.title}</h5>
                      <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                        {d.commentCount} tanggapan • {d.helpfulCount} dukungan membantu
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenDiscussionDetail(d.id)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#143826] hover:text-white text-xs font-bold text-gray-700 transition cursor-pointer shrink-0"
                    >
                      Buka Utas
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PAKAR AKTIF + TRENDING DISCUSSION + LEADERBOARD (lg:col-span-3) */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-3 space-y-5 w-full">
          
          {/* Card 1: Mentor & Pakar Aktif */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3.5 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest font-mono">
                Pakar Aktif
              </h4>
              <button 
                onClick={() => setMainTab('pakar')} 
                className="text-[#0f9b8a] text-[10.5px] font-bold hover:underline whitespace-nowrap cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>
            
            <div className="space-y-3.5">
              {EXPERTS.slice(0, 2).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      alt={exp.name} 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0" 
                      src={exp.avatar}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-gray-900 leading-tight truncate">{exp.name}</p>
                      <p className="text-[9px] text-[#0f9b8a] font-bold leading-none mt-0.5 truncate">{exp.specialty}</p>
                      <p className="text-[8.5px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Online
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setNewPostTitle(`[Tanya Pakar] ${exp.name}: `);
                      setMainTab('postingan');
                    }} 
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center bg-white hover:bg-[#143826] hover:text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                    title="Kirim pesan konsultasi"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Trending Discussion (Amber Yellow Glassmorphic) */}
          <div className="rounded-2xl sm:rounded-3xl p-5 border border-amber-200/80 bg-amber-500/8 backdrop-blur-md flex flex-col gap-3.5 text-left">
            <h4 className="font-black text-[11px] text-amber-700 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Trending Discussion</span>
            </h4>
            
            <div className="flex flex-col gap-2">
              {TRENDING_TOPICS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSearchQuery(item.query);
                    setMainTab('beranda');
                    toast.info(`Menyaring diskusi dengan topik "${item.query}"`);
                  }}
                  className="w-full bg-white/90 border border-amber-200/60 rounded-xl p-2.5 flex justify-between items-center hover:translate-x-0.5 shadow-2xs transition-all text-left cursor-pointer"
                >
                  <span className="text-[11px] font-black text-gray-900 truncate mr-2">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 shrink-0 font-mono">
                    {item.comments} respon
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Leaderboard (Mingguan) */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="font-black text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard (Mingguan)</span>
              </h4>
              <span className="text-[10px] font-bold text-[#0f9b8a]">Top Warga</span>
            </div>
            
            <div className="space-y-2 font-bold text-[11px]">
              {LEADERBOARD_USERS.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                    user.isTop 
                      ? 'bg-amber-50 border border-amber-200/80 shadow-2xs' 
                      : 'bg-gray-50/70 border border-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center font-mono text-[10px] font-bold text-gray-700 shrink-0">
                      {user.rank}
                    </span>
                    <span className="font-black text-gray-900 truncate leading-none">
                      {user.name}
                    </span>
                  </span>
                  <span className="font-black text-gray-700 font-mono text-[10px] shrink-0">
                    {user.xp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Challenge Mingguan */}
          <div className="rounded-2xl sm:rounded-3xl p-5 border border-[#0f9b8a]/20 bg-[#0f9b8a]/8 backdrop-blur-md flex flex-col gap-3 text-left">
            <h4 className="font-black text-[11px] text-[#0f9b8a] uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Target className="w-4 h-4 text-[#0f9b8a]" />
              <span>Challenge Mingguan</span>
            </h4>
            
            <p className="text-xs font-bold text-gray-800 leading-snug">
              Bantu verifikasi 2 laporan phishing minggu ini untuk meraih lencana Detektor Aktif!
            </p>
            
            <button 
              onClick={() => {
                setActiveCategory('waspada-modus-baru');
                setMainTab('beranda');
                toast.success('Membuka daftar laporan yang menunggu verifikasi warga.');
              }}
              className="w-full py-2 bg-[#143826] hover:bg-[#1a4a32] text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Ikut Challenge
            </button>
          </div>

        </aside>

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
                      <span className="text-[10px] font-mono ml-2 px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
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

                        {/* Best Solution Banner */}
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
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful('comment', comment.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer"
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
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#143826] cursor-pointer ml-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Balas</span>
                            </button>

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

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 sm:pl-6 border-l-2 border-gray-200 space-y-2 pt-2">
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
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#E86A33] transition"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E86A33] hover:bg-[#d45823] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
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
                  className="w-3.5 h-3.5 rounded text-[#E86A33] cursor-pointer"
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
      {/* 4. MODAL LAPORKAN KONTEN PELANGGARAN */}
      {/* ========================================================================= */}
      {reportModalData.isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1000] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 touch-none"
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
                  placeholder="Jelaskan alasan mengapa konten ini melanggar pedoman komunitas..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-[#E86A33]"
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
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
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
