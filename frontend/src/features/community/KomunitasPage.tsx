import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
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
  CheckCircle2
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

const CHANNELS: Channel[] = [
  {
    id: 'tanya-jawab',
    name: 'tanya-jawab-warga',
    title: 'Tanya Jawab Warga',
    description: 'Tanyakan kecurigaan pesan, SMS, atau telepon yang Anda terima',
    icon: '💬',
    activeCount: 94,
  },
  {
    id: 'lapor-modus',
    name: 'waspada-modus-baru',
    title: 'Waspada Modus Baru',
    description: 'Berbagi bukti link mencurigakan & file .apk berbahaya',
    icon: '⚠️',
    activeCount: 41,
  },
  {
    id: 'solusi-korban',
    name: 'posko-solusi-lapor',
    title: 'Posko Solusi & Bantuan',
    description: 'Panduan blokir rekening bank penipu & lapor kepolisian',
    icon: '🛡️',
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF2ED] text-[#143826] border border-[#143826]/15 text-xs font-bold font-mono tracking-wider uppercase shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#E86A33]" />
                <span>FORUM GOTONG ROYONG SESAMA WARGA</span>
              </div>

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: TOPICS & HELPLINE (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Topic Switcher Card */}
            <div className="apple-card p-4 sm:p-5 border border-gray-200 bg-white shadow-2xs space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider px-1">
                Pilih Ruang Diskusi
              </div>

              <div className="space-y-1.5">
                {CHANNELS.map(channel => {
                  const isActive = activeChannelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannelId(channel.id);
                        setReplyTarget(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 border ${
                        isActive
                          ? 'bg-[#143826] text-white border-[#143826] shadow-sm'
                          : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-100'
                      }`}
                    >
                      <span className="text-xl leading-none">{channel.icon}</span>
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

            {/* Helpline Fast Access Card */}
            <div className="apple-card p-4 sm:p-5 border border-gray-200 bg-white shadow-2xs space-y-3">
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

          {/* RIGHT PANEL: MAIN CHAT FORUM WINDOW (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-[720px] bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
            
            {/* Chat Header Bar */}
            <div className="p-4 px-6 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{currentChannel.icon}</span>
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
                  { id: 'question', label: '❓ Tanya' },
                  { id: 'answer', label: '💡 Jawab' },
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

            {/* Quick Search Strip */}
            <div className="px-6 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari obrolan (misal: APK, Shopee, Telegram, transfer)..."
                  className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* CHAT MESSAGES BODY */}
            <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F6]">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                  <p className="text-xs font-semibold text-gray-600">Belum ada obrolan yang sesuai pencarian</p>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isQuestion = msg.type === 'question';
                  const isAnswer = msg.type === 'answer';

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
                            ❓ PERTANYAAN
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
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
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
                          className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
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
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-semibold text-[11px]">Kirim sebagai:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'question', label: '❓ Pertanyaan' },
                      { id: 'answer', label: '💡 Jawaban' }
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

        </div>

      </div>

    </div>
  );
};
