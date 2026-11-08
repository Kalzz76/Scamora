import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CommunityShieldIllustration } from '../../components/illustrations/Illustrations2D';

// Types
export type MessageType = 'question' | 'answer' | 'warning' | 'general';
export type AuthorBadge = 'Warga Waspada' | 'Relawan Komunitas' | 'Korban Melapor' | 'Anonim';

export interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  authorBadge: AuthorBadge;
  avatarColor: string;
  timestamp: string;
  type: MessageType;
  content: string;
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
  evidenceSnippet?: string;
  helpfulCount: number;
  userLiked?: boolean;
  isVerifiedSolution?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  activeCount: number;
}

export interface TrendingScam {
  id: string;
  title: string;
  tag: string;
  consultationCount: number;
  severity: 'Kritis' | 'Tinggi';
}

const POPULAR_TAGS = [
  { id: 'apk', label: 'APK Kurir', query: 'APK' },
  { id: 'undangan', label: 'Undangan Nikah', query: 'Undangan' },
  { id: 'task', label: 'Task Scam Telegram', query: 'Telegram' },
  { id: 'bca', label: 'Phishing BCA', query: 'BCA' },
  { id: 'rekening', label: 'Blokir Rekening', query: 'rekening' },
];

const TRENDING_SCAMS: TrendingScam[] = [
  {
    id: 'tr-1',
    title: 'Berkas .APK Berkedok Resi Kurir',
    tag: 'APK',
    consultationCount: 38,
    severity: 'Kritis',
  },
  {
    id: 'tr-2',
    title: 'Lowongan Freelance Like Video (Deposit)',
    tag: 'Telegram',
    consultationCount: 29,
    severity: 'Tinggi',
  },
  {
    id: 'tr-3',
    title: 'Pemberitahuan Tarif Bank Rp 150rb',
    tag: 'BCA',
    consultationCount: 19,
    severity: 'Kritis',
  },
];

const CHANNELS: Channel[] = [
  {
    id: 'tanya-jawab',
    name: 'tanya-jawab-warga',
    title: 'Tanya Jawab Warga',
    description: 'Tanyakan kecurigaan pesan, SMS, atau telepon yang Anda terima',
    icon: '',
    activeCount: 94,
  },
  {
    id: 'lapor-modus',
    name: 'waspada-modus-baru',
    title: 'Waspada Modus Baru',
    description: 'Berbagi bukti link mencurigakan & file .apk berbahaya',
    icon: '',
    activeCount: 41,
  },
  {
    id: 'solusi-korban',
    name: 'posko-solusi-lapor',
    title: 'Posko Solusi & Bantuan',
    description: 'Panduan blokir rekening bank penipu & lapor kepolisian',
    icon: '',
    activeCount: 21,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    channelId: 'tanya-jawab',
    author: 'Rahmat Hidayat',
    authorBadge: 'Warga Waspada',
    avatarColor: 'bg-emerald-700',
    timestamp: '09:12',
    type: 'question',
    content: 'Pagi bapak/ibu sekalian, mau tanya. Barusan saya dapat pesan WA dari nomor kurir kirim file bernama "Resi_Paket_JNT.apk". Katanya paket saya tertahan di gudang dan wajib instal itu untuk cek resi. Padahal saya lagi tidak pesan barang apapun di olshop. Apakah ini aman untuk dibuka ya?',
    evidenceSnippet: 'Pengirim: +62 857-****-4912 | Berkas: Resi_Paket_JNT.apk',
    helpfulCount: 28,
    userLiked: false,
  },
  {
    id: 'msg-2',
    channelId: 'tanya-jawab',
    author: 'Budi Prasetyo',
    authorBadge: 'Relawan Komunitas',
    avatarColor: 'bg-[#143826]',
    timestamp: '09:15',
    type: 'answer',
    replyTo: {
      id: 'msg-1',
      author: 'Rahmat Hidayat',
      content: 'Barusan saya dapat pesan WA dari nomor kurir kirim file bernama "Resi_Paket_JNT.apk"...',
    },
    content: 'JANGAN DIINSTAL PAK RAHMAT! Itu 100% trojan perbankan pencuri SMS OTP m-banking. Kurir resmi tidak pernah kirim file instalasi via WhatsApp. Segera hapus berkasnya dan blokir nomor pengirimnya!',
    helpfulCount: 52,
    userLiked: true,
    isVerifiedSolution: true,
  },
  {
    id: 'msg-3',
    channelId: 'tanya-jawab',
    author: 'Siti Rahma',
    authorBadge: 'Warga Waspada',
    avatarColor: 'bg-[#E86A33]',
    timestamp: '09:18',
    type: 'answer',
    replyTo: {
      id: 'msg-1',
      author: 'Rahmat Hidayat',
      content: 'Barusan saya dapat pesan WA dari nomor kurir kirim file bernama "Resi_Paket_JNT.apk"...',
    },
    content: 'Betul kata Pak Budi. Tetangga saya bulan lalu kena modus serupa sampai saldo tabungannya ludes. Cek nomor resi resmi ekspedisi hanya lewat web atau aplikasi resmi Google Play Store.',
    helpfulCount: 21,
    userLiked: false,
  },
  {
    id: 'msg-4',
    channelId: 'tanya-jawab',
    author: 'Rahmat Hidayat',
    authorBadge: 'Warga Waspada',
    avatarColor: 'bg-emerald-700',
    timestamp: '09:21',
    type: 'general',
    replyTo: {
      id: 'msg-2',
      author: 'Budi Prasetyo',
      content: 'JANGAN DIINSTAL PAK RAHMAT! Itu 100% trojan perbankan...',
    },
    content: 'Alhamdulillah terima kasih banyak Pak Budi & Bu Siti atas respon cepatnya! Untung sempat tanya di sini dulu. Filenya sudah langsung saya hapus permanen dan nomornya saya blokir.',
    helpfulCount: 15,
    userLiked: false,
  },
  {
    id: 'msg-5',
    channelId: 'tanya-jawab',
    author: 'Anonim (Disamarkan)',
    authorBadge: 'Anonim',
    avatarColor: 'bg-gray-600',
    timestamp: '09:34',
    type: 'question',
    content: 'Halo semua, mau konsultasi penting. Tiga hari lalu saya dimasukkan ke grup Telegram kerja sampingan freelancer online. Tugasnya cuma like video YouTube dan follow akun medsos, tugas pertama beneran ditransfer 50rb. Tapi hari ini adminnya bilang ada "Misi Pesanan Mall", saya wajib deposit Rp 2.000.000 ke rekening mereka dulu untuk cairkan komisi 1.2jt. Kalau ga deposit uang saya sebelumnya hangus. Apakah ini scam? Saya bingung dan takut uang hilang.',
    evidenceSnippet: 'Rekening Tujuan: Bank Permata 8921-****-3319 a.n. CV Berkah Digital Makmur',
    helpfulCount: 37,
    userLiked: false,
  },
  {
    id: 'msg-6',
    channelId: 'tanya-jawab',
    author: 'Dian Permata',
    authorBadge: 'Relawan Komunitas',
    avatarColor: 'bg-[#143826]',
    timestamp: '09:37',
    type: 'answer',
    replyTo: {
      id: 'msg-5',
      author: 'Anonim (Disamarkan)',
      content: 'Misi Pesanan Mall, saya wajib deposit Rp 2.000.000 ke rekening bendahara...',
    },
    content: 'STOP JANGAN TRANSFER SEPESER PUN! Ini skema penipuan klasik "Job Task Scam". Uang 50rb di awal itu murni umpan psikologis agar Anda percaya. Uang deposit 2 juta itu TIDAK AKAN PERNAH KEMBALI. Begitu ditransfer, mereka akan beralasan tugas salah dan menuntut deposit 5jt sampai 20jt lagi. Segera keluar dari grup itu dan blokir semua kontaknya!',
    helpfulCount: 64,
    userLiked: false,
    isVerifiedSolution: true,
  },
  {
    id: 'msg-7',
    channelId: 'lapor-modus',
    author: 'Andi Nugroho',
    authorBadge: 'Korban Melapor',
    avatarColor: 'bg-amber-600',
    timestamp: '08:40',
    type: 'warning',
    content: 'WASPADA SEMUA! Sedang marak beredar pesan WhatsApp mengatasnamakan Bank BCA terkait "Surat Edaran Kenaikan Biaya Transaksi Jadi Rp 500.000/Bulan". Di dalam surat disisipkan tautan tiruan internet banking untuk mencuri PIN dan OTP nasabah.',
    evidenceSnippet: 'Domain Phishing: http://bca-tarif-update.info-nasabah-bank.xyz',
    helpfulCount: 45,
    userLiked: false,
  },
  {
    id: 'msg-8',
    channelId: 'solusi-korban',
    author: 'Bambang Setyawan',
    authorBadge: 'Relawan Komunitas',
    avatarColor: 'bg-[#143826]',
    timestamp: '07:50',
    type: 'answer',
    content: 'LANGKAH DARURAT JIKA SUDAH TERLANJUR TRANSFER: 1) Segera hubungi call center bank Anda dan bank penipu untuk minta pembekuan darurat rekening penampung (dalam 1x24 jam), 2) Datangi Polsek/Polres terdekat untuk membuat STPL (Surat Tanda Penerimaan Laporan), 3) Laporkan nomor rekening penipu di portal cekrekening.id agar di-blacklist perbankan nasional.',
    helpfulCount: 92,
    userLiked: true,
    isVerifiedSolution: true,
  },
];

export const KomunitasPage: React.FC = () => {
  const [activeChannelId, setActiveChannelId] = useState<string>('tanya-jawab');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Chat input state
  const [inputText, setInputText] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('question');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  
  // Filter inside room
  const [activeFilter, setActiveFilter] = useState<'all' | 'question' | 'answer'>('all');

  // Thread Detail Modal State (Inspired by community_post_detail.html)
  const [focusedThread, setFocusedThread] = useState<ChatMessage | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState<string>('');

  // Lock background scroll when thread modal is open
  useEffect(() => {
    if (focusedThread) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setFocusedThread(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusedThread]);

  const getRepliesCount = (msgId: string) => {
    return messages.filter(m => m.replyTo?.id === msgId).length;
  };

  const getThreadReplies = (rootMsg: ChatMessage) => {
    return messages.filter(m => m.replyTo?.id === rootMsg.id || (m.replyTo && m.replyTo.author === rootMsg.author));
  };

  const handleSendThreadReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadReplyInput.trim() || !focusedThread) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newReply: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: focusedThread.channelId,
      author: 'Anda (Warga Waspada)',
      authorBadge: 'Warga Waspada',
      avatarColor: 'bg-[#143826]',
      timestamp: timeString,
      type: 'answer',
      content: threadReplyInput.trim(),
      replyTo: {
        id: focusedThread.id,
        author: focusedThread.author,
        content: focusedThread.content.slice(0, 65) + (focusedThread.content.length > 65 ? '...' : '')
      },
      helpfulCount: 1,
      userLiked: true,
    };

    setMessages(prev => [...prev, newReply]);
    setThreadReplyInput('');
    toast.success('Balasan Anda berhasil dikirim ke utas ini!');
  };

  // Copy helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Internal chat scroll container ref (scrolls only inside the chat box, never the whole window)
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const currentChannel = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];

  // Scroll internal chat container to bottom when messages change or channel changes
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, activeChannelId]);

  // Ensure browser window starts at the top when opening or switching to this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleLike = (msgId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const isLiked = !!m.userLiked;
      return {
        ...m,
        helpfulCount: isLiked ? m.helpfulCount - 1 : m.helpfulCount + 1,
        userLiked: !isLiked
      };
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error('Ketikkan pertanyaan atau tanggapan Anda terlebih dahulu.');
      return;
    }

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      author: isAnonymous ? 'Anonim (Disamarkan)' : 'Anda (Warga Waspada)',
      authorBadge: isAnonymous ? 'Anonim' : 'Warga Waspada',
      avatarColor: isAnonymous ? 'bg-gray-600' : 'bg-[#143826]',
      timestamp: timeString,
      type: messageType,
      content: inputText.trim(),
      replyTo: replyTarget ? {
        id: replyTarget.id,
        author: replyTarget.author,
        content: replyTarget.content.slice(0, 65) + (replyTarget.content.length > 65 ? '...' : '')
      } : undefined,
      helpfulCount: 1,
      userLiked: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setReplyTarget(null);
    toast.success('Pesan Anda berhasil dikirim ke ruang diskusi!');

    // Simulated community volunteer reply if user asked a question
    if (messageType === 'question') {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          channelId: activeChannelId,
          author: 'Relawan Komunitas Scamora',
          authorBadge: 'Relawan Komunitas',
          avatarColor: 'bg-[#143826]',
          timestamp: 'Baru saja',
          type: 'answer',
          replyTo: {
            id: newMsg.id,
            author: newMsg.author,
            content: newMsg.content.slice(0, 50) + '...'
          },
          content: 'Halo! Pertanyaan Anda sudah kami terima di forum warga. Sedang ditelaah polanya oleh relawan siber kami. Mohon jangan klik link atau transfer uang apapun sebelum ada verifikasi lengkap ya!',
          helpfulCount: 4,
          userLiked: false,
          isVerifiedSolution: false,
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1500);
    }
  };

  const handleShareMessage = (msg: ChatMessage) => {
    const text = `*FORUM TANYA JAWAB WARGA - SCAMORA*\n\n` +
      `Dari: ${msg.author} (${msg.authorBadge})\n` +
      `Isi: "${msg.content}"\n\n` +
      `Mari saling jaga dari penipuan digital di Scamora!`;
    navigator.clipboard.writeText(text);
    toast.success('Pesan diskusi berhasil disalin!');
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (msg.channelId !== activeChannelId) return false;
    if (activeFilter !== 'all' && msg.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return msg.content.toLowerCase().includes(q) || msg.author.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent text-[#0F172A]">
      
      {/* 1. CLEAN EDITORIAL HEADER WITH 2D COMMUNITY VISUAL */}
      <section className="w-full pt-8 pb-6 relative overflow-hidden border-b border-slate-200/80 bg-white/60">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[350px] pointer-events-none opacity-50"
          style={{
            background: 'radial-gradient(circle at 50% 15%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-[#143826] tracking-tight">
                Tanya Jawab &amp; <span className="text-[#E86A33]">Diskusi Waspada.</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Ruang terbuka sesama masyarakat untuk saling bertanya, menjawab, dan membedah kecurigaan penipuan tanpa campur tangan bot AI.
              </p>

              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>156 Warga Sedang Aktif Membantu</span>
                </div>
              </div>
            </div>

            {/* 2D Cartoon Illustration on the right */}
            <div className="shrink-0 flex justify-center">
              <CommunityShieldIllustration className="w-52 h-40 sm:w-60 sm:h-44" />
            </div>

          </div>
        </div>
      </section>

      {/* 2. SIMPLE & SPACIOUS TWO-PANEL LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-6">
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          
          {/* TOPIC SWITCHER (Left Column on Desktop, Top on Mobile) */}
          <div className="w-full lg:col-span-4 space-y-4">
            
            {/* Topic Switcher Card */}
            <div className="apple-card p-4 sm:p-5 border border-gray-200 bg-white shadow-2xs space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider px-1">
                Pilih Ruang Diskusi
              </div>

              <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CHANNELS.map(channel => {
                  const isActive = activeChannelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannelId(channel.id);
                        setReplyTarget(null);
                      }}
                      className={`shrink-0 min-w-[200px] lg:min-w-0 lg:w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3 sm:gap-3.5 border ${
                        isActive
                          ? 'bg-[#143826] text-white border-[#143826] shadow-sm'
                          : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {channel.id === 'tanya-jawab' && <MessageSquare className="w-4 h-4" />}
                        {channel.id === 'lapor-modus' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {channel.id === 'solusi-korban' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs sm:text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                            {channel.title}
                          </span>
                          <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-300' : 'text-gray-400'}`}>
                            {channel.activeCount} online
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

            {/* Desktop Only: Tren Modus Minggu Ini (On mobile, rendered under chat for chat-first UX) */}
            <div className="hidden lg:block apple-card p-4 sm:p-5 border border-gray-200 bg-white shadow-2xs space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Tren Modus Minggu Ini</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                  Update
                </span>
              </div>

              <div className="space-y-2">
                {TRENDING_SCAMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.tag);
                      toast.info(`Menyaring obrolan terkait "${item.title}"`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gray-50/80 hover:bg-[#FAF9F6] border border-gray-200/80 hover:border-gray-300 transition-all flex items-start justify-between gap-2 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-[#143826] transition-colors block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                        {item.consultationCount} warga berkonsultasi
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      item.severity === 'Kritis' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {item.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Only: Helpline Fast Access Card */}
            <div className="hidden lg:block apple-card p-4 sm:p-5 border border-gray-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5 text-[#E86A33]" />
                <span>Saluran Darurat Penipuan</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Salin kontak aduan resmi jika sudah terlanjur transfer dana:
              </p>
              
              <div className="space-y-2">
                {[
                  { name: 'OJK (Investasi & Pinjol)', contact: '157' },
                  { name: 'Cek Rekening Bank Penipu', contact: 'cekrekening.id' },
                  { name: 'Aduan Konten Kominfo', contact: 'aduankonten.id' },
                  { name: 'Patroli Siber Polri', contact: 'patrolisiber.id' },
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

          {/* MAIN CHAT FORUM WINDOW */}
          <div className="w-full lg:col-span-8 flex flex-col h-[560px] sm:h-[660px] lg:h-[720px] bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
            
            {/* Chat Header Bar */}
            <div className="p-3.5 px-4 sm:p-4 sm:px-6 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-[#143826] flex items-center justify-center shrink-0">
                  {currentChannel.id === 'tanya-jawab' && <MessageSquare className="w-4 h-4 text-[#143826]" />}
                  {currentChannel.id === 'lapor-modus' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {currentChannel.id === 'solusi-korban' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-gray-900 leading-none">
                    #{currentChannel.name}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {currentChannel.description}
                  </p>
                </div>
              </div>

              {/* Simple Filter Pills */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'question', label: 'Tanya' },
                  { id: 'answer', label: 'Jawab' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search & Popular Scam Topic Tags Strip (Inspired by community_search.html) */}
            <div className="p-3 sm:p-4 bg-gray-50/90 border-b border-gray-100 space-y-2.5 shrink-0">
              {/* Search input */}
              <div className="relative bg-white rounded-2xl p-2.5 px-3.5 flex items-center gap-2 border border-gray-200 focus-within:ring-2 focus-within:ring-[#143826]/20 focus-within:border-[#143826] transition-all shadow-2xs">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kata kunci kasus (misal: APK, J&T, Telegram, BCA, rekening)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Popular Scam Topic Tags (Pencarian Populer) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
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
                      onClick={() => {
                        if (isSelected) {
                          setSearchQuery('');
                        } else {
                          setSearchQuery(tag.query);
                        }
                      }}
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

            {/* CHAT MESSAGES BODY */}
            <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F6]">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-2xs">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-xs sm:text-sm font-bold text-gray-700">
                      Tidak ada obrolan untuk "{searchQuery}"
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Belum ada warga yang menanyakan kata kunci ini. Anda dapat menjadi yang pertama berkonsultasi tentang kasus ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText(`Apakah ada yang tahu tentang modus "${searchQuery}"? Mohon bantuan informasinya...`);
                      setMessageType('question');
                      setSearchQuery('');
                    }}
                    className="btn-animate inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143826] text-white text-xs font-bold hover:bg-[#1D4E36] transition shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Tanyakan Kasus Ini Sekarang</span>
                  </button>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isQuestion = msg.type === 'question';
                  const isAnswer = msg.type === 'answer';
                  const repliesCount = getRepliesCount(msg.id);

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2.5 ${
                        isQuestion
                          ? 'bg-amber-50/60 border-amber-200/90 shadow-2xs'
                          : isAnswer
                          ? 'bg-white border-gray-200 shadow-2xs'
                          : 'bg-white border-gray-200 shadow-2xs'
                      }`}
                    >
                      {/* Replying quote */}
                      {msg.replyTo && (
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-lg border-l-2 border-[#143826]">
                          <CornerDownRight className="w-3 h-3 text-[#143826] shrink-0" />
                          <span className="font-bold text-gray-700">Membalas @{msg.replyTo.author}:</span>
                          <span className="truncate italic">"{msg.replyTo.content}"</span>
                        </div>
                      )}

                      {/* Header row: Author + Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${msg.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                            {msg.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-gray-900">{msg.author}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-md font-bold ${
                                msg.authorBadge === 'Relawan Komunitas'
                                  ? 'bg-[#EAF2ED] text-[#143826]'
                                  : msg.authorBadge === 'Anonim'
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-orange-50 text-[#E86A33]'
                              }`}>
                                {msg.authorBadge}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{msg.timestamp}</span>
                          </div>
                        </div>

                        {/* Question / Answer Pill */}
                        {isQuestion && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                            PERTANYAAN
                          </span>
                        )}
                        {isAnswer && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>JAWABAN</span>
                          </span>
                        )}
                      </div>

                      {/* Message content */}
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                        {msg.content}
                      </p>

                      {/* Evidence snippet */}
                      {msg.evidenceSnippet && (
                        <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-mono text-[#143826]">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                            Bukti Terkait:
                          </span>
                          "{msg.evidenceSnippet}"
                        </div>
                      )}

                      {/* Verified solution badge */}
                      {msg.isVerifiedSolution && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Solusi Paling Membantu Menurut Warga</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <button
                            onClick={() => {
                              setReplyTarget(msg);
                              setMessageType(isQuestion ? 'answer' : 'general');
                            }}
                            className="inline-flex items-center gap-1.5 font-bold text-[#143826] hover:text-[#E86A33] transition cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Balas / Jawab</span>
                          </button>

                          <button
                            onClick={() => setFocusedThread(msg)}
                            className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-600 hover:text-[#143826] transition cursor-pointer bg-gray-100/90 hover:bg-gray-200/80 px-2.5 py-1 rounded-lg"
                            title="Buka seluruh utas obrolan untuk topik ini"
                          >
                            <MessageSquare className="w-3 h-3 text-gray-500" />
                            <span>
                              {repliesCount > 0 
                                ? `Utas (${repliesCount} balasan)` 
                                : 'Buka Utas'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleLike(msg.id)}
                            className={`inline-flex items-center gap-1 font-bold transition cursor-pointer ${
                              msg.userLiked ? 'text-[#E86A33]' : 'text-gray-400 hover:text-gray-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Membantu ({msg.helpfulCount})</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleShareMessage(msg)}
                          className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded hover:bg-gray-100"
                          title="Bagikan obrolan"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>

            {/* CHAT INPUT BAR (CLEAN & FAMILIAR) */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 space-y-2 shrink-0">
              
              {/* Replying target preview */}
              <AnimatePresence>
                {replyTarget && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-2 px-3 rounded-xl bg-[#EAF2ED] border border-[#143826]/20 text-xs text-[#143826]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#143826] shrink-0" />
                      <span className="font-bold">Membalas @{replyTarget.author}:</span>
                      <span className="truncate italic">"{replyTarget.content.slice(0, 50)}..."</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="text-gray-500 hover:text-red-600 transition shrink-0 ml-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tag Selector & Anonim Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-500 font-semibold text-[11px]">Kirim sebagai:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'question', label: 'Pertanyaan' },
                      { id: 'answer', label: 'Jawaban' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMessageType(t.id as any)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          messageType === t.id
                            ? 'bg-[#143826] text-white border-[#143826]'
                            : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#143826] focus:ring-0"
                  />
                  <span>Kirim Anonim</span>
                </label>
              </div>

              {/* Text Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    replyTarget
                      ? `Tulis balasan Anda untuk @${replyTarget.author}...`
                      : messageType === 'question'
                      ? 'Tuliskan pertanyaan kecurigaan Anda di sini...'
                      : 'Tuliskan jawaban atau saran Anda untuk warga...'
                  }
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition"
                />

                <button
                  type="submit"
                  className="btn-animate inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E86A33] hover:bg-[#D75922] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 cursor-pointer shrink-0 transition"
                >
                  <span>Kirim</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>

          {/* Mobile Only: Supporting Panels (Tren Modus + Helpline placed beneath chat for fast chatting UX) */}
          <div className="w-full lg:hidden space-y-4">
            
            {/* Tren Modus Minggu Ini (Mobile) */}
            <div className="apple-card p-4 border border-gray-200 bg-white shadow-2xs space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Tren Modus Minggu Ini</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                  Update
                </span>
              </div>

              <div className="space-y-2">
                {TRENDING_SCAMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.tag);
                      toast.info(`Menyaring obrolan terkait "${item.title}"`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gray-50/80 hover:bg-[#FAF9F6] border border-gray-200/80 hover:border-gray-300 transition-all flex items-start justify-between gap-2 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-[#143826] transition-colors block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                        {item.consultationCount} warga berkonsultasi
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      item.severity === 'Kritis' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {item.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Helpline Fast Access Card */}
            <div className="apple-card p-4 border border-gray-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5 text-[#E86A33]" />
                <span>Saluran Darurat Penipuan</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Salin kontak aduan resmi jika sudah terlanjur transfer dana:
              </p>
              
              <div className="space-y-2">
                {[
                  { name: 'OJK (Investasi & Pinjol)', contact: '157' },
                  { name: 'Cek Rekening Bank Penipu', contact: 'cekrekening.id' },
                  { name: 'Aduan Konten Kominfo', contact: 'aduankonten.id' },
                  { name: 'Patroli Siber Polri', contact: 'patrolisiber.id' },
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

        </div>

      </div>

      {/* THREAD DETAIL MODAL (Inspired by community_post_detail.html) */}
      {focusedThread && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999] bg-[#14161c]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setFocusedThread(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 relative my-auto max-h-[90vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setFocusedThread(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition cursor-pointer"
                  aria-label="Tutup utas"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E86A33]">
                    Utas Pembahasan Kasus
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                    Diskusi @{focusedThread.author}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFocusedThread(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Root Question Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${focusedThread.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                      {focusedThread.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-gray-900">{focusedThread.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono ml-2">{focusedThread.timestamp}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                    KASUS UTAMA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-line">
                  {focusedThread.content}
                </p>
                {focusedThread.evidenceSnippet && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-xs font-mono text-[#143826]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Bukti Terkait:</span>
                    "{focusedThread.evidenceSnippet}"
                  </div>
                )}
              </div>

              {/* Replies Chain Header */}
              <div className="pt-2">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                    Semua Balasan &amp; Rekomendasi Warga ({getThreadReplies(focusedThread).length})
                  </span>
                </div>

                {getThreadReplies(focusedThread).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">Belum ada tanggapan untuk pertanyaan ini.</p>
                    <p className="text-[11px] text-gray-400">Jadilah yang pertama memberikan saran mitigasi di bawah.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getThreadReplies(focusedThread).map((reply) => (
                      <div 
                        key={reply.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                          reply.isVerifiedSolution
                            ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                            : 'bg-gray-50/70 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${reply.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                              {reply.author.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-gray-900">{reply.author}</span>
                            <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              reply.authorBadge === 'Relawan Komunitas'
                                ? 'bg-[#EAF2ED] text-[#143826]'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {reply.authorBadge}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{reply.timestamp}</span>
                        </div>

                        {reply.isVerifiedSolution && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Solusi Mitigasi Terverifikasi</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fast Reply Box Inside Modal */}
            <form onSubmit={handleSendThreadReply} className="pt-2 border-t border-gray-100 space-y-2 shrink-0">
              <span className="text-[11px] font-bold text-gray-600 block">
                Tulis Balasan / Solusi Mitigasi:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={threadReplyInput}
                  onChange={(e) => setThreadReplyInput(e.target.value)}
                  placeholder={`Bantu @${focusedThread.author} dengan tanggapan Anda...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#143826] transition"
                />
                <button
                  type="submit"
                  className="btn-animate inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                >
                  <span>Kirim</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
