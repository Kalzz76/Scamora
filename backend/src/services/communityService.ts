import crypto from 'crypto';
import { isDbConnected, query } from '../config/db';
import { usersStore } from '../controllers/admin.controller';

export type DiscussionCategory = 'tanya-jawab-warga' | 'waspada-modus-baru' | 'posko-solusi-lapor';
export type DiscussionStatus = 'TERBUKA' | 'TERJAWAB' | 'DITUTUP';
export type TargetType = 'post' | 'comment';
export type ReportReason = 'penipuan' | 'spam' | 'misinformasi' | 'bocor_pii' | 'ujaran_kebencian' | 'lainnya';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: string;
  tier: string;
}

export interface CommunityDiscussion {
  id: string;
  userId: string;
  authorName: string;
  authorBadge: string;
  avatarColor: string;
  category: DiscussionCategory;
  title: string;
  content: string;
  evidenceSnippet?: string;
  evidenceImageUrl?: string;
  isAnonymous: boolean;
  status: DiscussionStatus;
  bestSolutionCommentId?: string | null;
  helpfulCount: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  userVoted?: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: CommunityCommentTree[];
}

export interface CommunityComment {
  id: string;
  discussionId: string;
  userId: string;
  parentId?: string | null;
  authorName: string;
  authorBadge: string;
  avatarColor: string;
  content: string;
  evidenceImageUrl?: string;
  isAnonymous: boolean;
  isBestSolution: boolean;
  helpfulCount: number;
  userVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityCommentTree extends CommunityComment {
  replies?: CommunityCommentTree[];
}

export interface CommunityVote {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  createdAt: string;
}

export interface UserReputation {
  userId: string;
  reputationPoints: number;
  badge: string;
  isVerifiedVolunteer: boolean;
  helpfulSolutionsCount: number;
  updatedAt: string;
}

export interface ReputationLog {
  id: string;
  userId: string;
  action: string;
  points: number;
  sourceId?: string;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportReason;
  notes?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  moderatorNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CommunityNotification {
  id: string;
  recipientId: string;
  actorId?: string;
  actorName?: string;
  type: 'reply_post' | 'reply_comment' | 'best_solution' | 'moderation_action' | 'helpful_vote';
  discussionId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// =========================================================================
// IN-MEMORY FALLBACK STORES
// =========================================================================

export let inMemoryDiscussions: CommunityDiscussion[] = [
  {
    id: 'disc-101',
    userId: 'usr-101',
    authorName: 'Rahmat Hidayat',
    authorBadge: 'Warga Waspada',
    avatarColor: '#059669',
    category: 'tanya-jawab-warga',
    title: 'Pesan WhatsApp Berisi File "Resi_Paket_JNT.apk" Padahal Tidak Sedang Belanja',
    content: 'Pagi bapak/ibu sekalian, mau tanya. Barusan saya dapat pesan WA dari nomor kurir kirim file bernama "Resi_Paket_JNT.apk". Katanya paket saya tertahan di gudang dan wajib instal itu untuk cek resi. Padahal saya lagi tidak pesan barang apapun di toko daring. Apakah ini aman untuk dibuka ya?',
    evidenceSnippet: 'Pengirim: +62 857-****-4912 | Berkas: Resi_Paket_JNT.apk',
    isAnonymous: false,
    status: 'TERJAWAB',
    bestSolutionCommentId: 'comm-101',
    helpfulCount: 28,
    commentCount: 3,
    isPinned: true,
    isLocked: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
  },
  {
    id: 'disc-102',
    userId: 'usr-102',
    authorName: 'Anonim (Disamarkan)',
    authorBadge: 'Anonim',
    avatarColor: '#475569',
    category: 'tanya-jawab-warga',
    title: 'Grup Telegram Kerja Sampingan Freelance Like Video Diminta Deposit 2 Juta',
    content: 'Tiga hari lalu saya dimasukkan ke grup Telegram freelancer online. Tugasnya cuma like video YouTube dan follow medsos. Tugas pertama beneran ditransfer 50rb. Tapi hari ini adminnya bilang ada "Misi Pesanan Mall", saya wajib deposit Rp 2.000.000 ke rekening mereka dulu untuk cairkan komisi 1.2jt. Kalau tidak deposit, uang saya sebelumnya hangus. Apakah ini scam?',
    evidenceSnippet: 'Rekening Tujuan: Bank Permata 8921-****-3319 a.n. CV Berkah Digital Makmur',
    isAnonymous: true,
    status: 'TERBUKA',
    bestSolutionCommentId: null,
    helpfulCount: 19,
    commentCount: 2,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'disc-103',
    userId: 'usr-103',
    authorName: 'Siti Rahma',
    authorBadge: 'Kontributor Aktif',
    avatarColor: '#d97706',
    category: 'waspada-modus-baru',
    title: 'Surat Tilang Elektronik ETLE Format Berkas .APK via WhatsApp Nomor Asing',
    content: 'Hati-hati bapak ibu, ada modus baru mengaku dari kepolisian lalu lintas mengirim surat tilang elektronik berformat .APK. Pelaku mengancam STNK akan diblokir jika tidak membuka berkas tersebut dalam waktu 1x24 jam. Jangan pernah diklik!',
    evidenceSnippet: 'Nama berkas: Surat_Tilang_ETLE_Polda.apk (Ukuran 4.8 MB)',
    isAnonymous: false,
    status: 'TERBUKA',
    bestSolutionCommentId: null,
    helpfulCount: 42,
    commentCount: 1,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'disc-104',
    userId: 'usr-104',
    authorName: 'Budi Prasetyo',
    authorBadge: 'Relawan Komunitas',
    avatarColor: '#0f9b8a',
    category: 'posko-solusi-lapor',
    title: 'Panduan Darurat 1x24 Jam Bila Terlanjur Instal File .APK Penipu di HP Android',
    content: 'Bagi rekan-rekan warga yang tidak sengaja menginstal berkas .APK undangan pernikahan atau paket: 1. Segera aktifkan Mode Pesawat (Airplane Mode) untuk memutus koneksi internet trojan ke server C2 pelaku. 2. Hubungi call center bank resmi dari nomor lain untuk blokir m-banking dan kartu debit. 3. Masuk ke Safe Mode Android dan uninstall aplikasi tersebut. 4. Lakukan Factory Reset (Kembalikan ke Setelan Pabrik) bila ragu.',
    evidenceSnippet: 'Prosedur darurat tervalidasi oleh Relawan Keamanan Siber Scamora',
    isAnonymous: false,
    status: 'TERJAWAB',
    bestSolutionCommentId: 'comm-104',
    helpfulCount: 88,
    commentCount: 4,
    isPinned: true,
    isLocked: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
  },
];

export let inMemoryComments: CommunityComment[] = [
  {
    id: 'comm-101',
    discussionId: 'disc-101',
    userId: 'usr-104',
    parentId: null,
    authorName: 'Budi Prasetyo',
    authorBadge: 'Relawan Komunitas',
    avatarColor: '#0f9b8a',
    content: 'JANGAN DIINSTAL PAK RAHMAT! Itu 100% trojan perbankan pencuri SMS OTP m-banking. Kurir ekspedisi resmi (J&T, JNE, SiCepat) tidak pernah mengirim berkas aplikasi untuk cek resi. Segera hapus berkasnya dan blokir nomor pengirimnya!',
    isAnonymous: false,
    isBestSolution: true,
    helpfulCount: 52,
    createdAt: new Date(Date.now() - 3600000 * 23.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 23.5).toISOString(),
  },
  {
    id: 'comm-102',
    discussionId: 'disc-101',
    userId: 'usr-103',
    parentId: 'comm-101',
    authorName: 'Siti Rahma',
    authorBadge: 'Kontributor Aktif',
    avatarColor: '#d97706',
    content: 'Betul kata Pak Budi. Tetangga saya bulan lalu kena modus serupa sampai saldo tabungannya ludes. Cek nomor resi resmi ekspedisi hanya lewat situs atau aplikasi resmi Google Play Store.',
    isAnonymous: false,
    isBestSolution: false,
    helpfulCount: 14,
    createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
  },
  {
    id: 'comm-103',
    discussionId: 'disc-101',
    userId: 'usr-101',
    parentId: 'comm-101',
    authorName: 'Rahmat Hidayat',
    authorBadge: 'Warga Waspada',
    avatarColor: '#059669',
    content: 'Alhamdulillah terima kasih banyak Pak Budi & Bu Siti atas respon cepatnya! Untung saya tanya dulu di forum ini. Berkasnya sudah langsung saya hapus permanen dan kontaknya saya blokir.',
    isAnonymous: false,
    isBestSolution: false,
    helpfulCount: 9,
    createdAt: new Date(Date.now() - 3600000 * 22.8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 22.8).toISOString(),
  },
  {
    id: 'comm-104',
    discussionId: 'disc-104',
    userId: 'usr-104',
    parentId: null,
    authorName: 'Budi Prasetyo',
    authorBadge: 'Relawan Komunitas',
    avatarColor: '#0f9b8a',
    content: 'Langkah tambahan: Segera ganti seluruh kata sandi email dan akun media sosial dari perangkat yang berbeda (laptop atau HP keluarga yang bersih). Pastikan autentikasi 2 faktor (2FA) menggunakan aplikasi seperti Google Authenticator, bukan SMS.',
    isAnonymous: false,
    isBestSolution: true,
    helpfulCount: 45,
    createdAt: new Date(Date.now() - 3600000 * 47).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
  },
];

export let inMemoryVotes: CommunityVote[] = [
  { id: 'vote-1', userId: 'usr-101', targetType: 'comment', targetId: 'comm-101', createdAt: new Date().toISOString() },
  { id: 'vote-2', userId: 'usr-103', targetType: 'comment', targetId: 'comm-101', createdAt: new Date().toISOString() },
  { id: 'vote-3', userId: 'usr-101', targetType: 'post', targetId: 'disc-104', createdAt: new Date().toISOString() },
];

export let inMemoryReputations: Record<string, UserReputation> = {
  'usr-104': {
    userId: 'usr-104',
    reputationPoints: 340,
    badge: 'Relawan Komunitas',
    isVerifiedVolunteer: true,
    helpfulSolutionsCount: 12,
    updatedAt: new Date().toISOString(),
  },
  'usr-103': {
    userId: 'usr-103',
    reputationPoints: 95,
    badge: 'Kontributor Aktif',
    isVerifiedVolunteer: false,
    helpfulSolutionsCount: 3,
    updatedAt: new Date().toISOString(),
  },
  'usr-101': {
    userId: 'usr-101',
    reputationPoints: 25,
    badge: 'Warga Waspada',
    isVerifiedVolunteer: false,
    helpfulSolutionsCount: 0,
    updatedAt: new Date().toISOString(),
  },
};

export let inMemoryReputationLogs: ReputationLog[] = [];
export let inMemoryReports: ModerationReport[] = [];
export let inMemoryNotifications: CommunityNotification[] = [];

// =========================================================================
// HELPER FUNCTIONS & USER RESOLUTION
// =========================================================================

export async function resolveUserByUsername(username: string): Promise<UserSession | null> {
  if (isDbConnected()) {
    try {
      const res = await query(
        `SELECT id, username, full_name, role, tier FROM app_users WHERE username = $1 LIMIT 1`,
        [username]
      );
      if (res && res.rows.length > 0) {
        const u = res.rows[0];
        return {
          id: u.id,
          username: u.username,
          fullName: u.full_name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
        };
      }
    } catch (e: any) {
      console.warn('[CommunityService] DB user resolution failed:', e.message);
    }
  }

  // In-Memory store fallback
  const found = usersStore.find((u) => u.username === username);
  if (found) {
    return {
      id: found.id || `usr-${found.username}`,
      username: found.username,
      fullName: found.fullName || found.username,
      role: found.role || 'user',
      tier: found.tier || 'verified',
    };
  }

  return {
    id: `usr-${username}`,
    username,
    fullName: username,
    role: 'user',
    tier: 'verified',
  };
}

export async function getUserBadge(userId: string, role: string): Promise<string> {
  if (role === 'admin' || role === 'superadmin') return 'Administrator';
  if (role === 'moderator') return 'Moderator';

  // Check reputation store
  if (isDbConnected()) {
    try {
      const res = await query(
        `SELECT badge, is_verified_volunteer, reputation_points FROM community_reputations WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (res && res.rows.length > 0) {
        const rep = res.rows[0];
        if (rep.is_verified_volunteer) return 'Relawan Komunitas';
        if (rep.badge) return rep.badge;
        if (rep.reputation_points >= 50) return 'Kontributor Aktif';
      }
    } catch {}
  }

  const rep = inMemoryReputations[userId];
  if (rep) {
    if (rep.isVerifiedVolunteer) return 'Relawan Komunitas';
    if (rep.badge) return rep.badge;
    if (rep.reputationPoints >= 50) return 'Kontributor Aktif';
  }

  return 'Warga Waspada';
}

export async function addReputationPoints(
  userId: string,
  points: number,
  action: string,
  sourceId?: string
): Promise<void> {
  const logId = `replog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const log: ReputationLog = {
    id: logId,
    userId,
    action,
    points,
    sourceId,
    createdAt: new Date().toISOString(),
  };

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO community_reputations (user_id, reputation_points, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           reputation_points = GREATEST(0, community_reputations.reputation_points + $2),
           updated_at = NOW()`,
        [userId, points]
      );

      await query(
        `INSERT INTO community_reputation_logs (id, user_id, action, points, source_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [logId, userId, action, points, sourceId || null]
      );
      return;
    } catch (e: any) {
      console.warn('[CommunityService] DB addReputationPoints failed:', e.message);
    }
  }

  // In-Memory
  inMemoryReputationLogs.unshift(log);
  if (!inMemoryReputations[userId]) {
    inMemoryReputations[userId] = {
      userId,
      reputationPoints: Math.max(0, points),
      badge: points >= 50 ? 'Kontributor Aktif' : 'Warga Waspada',
      isVerifiedVolunteer: false,
      helpfulSolutionsCount: action === 'best_solution_accepted' ? 1 : 0,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const cur = inMemoryReputations[userId];
    cur.reputationPoints = Math.max(0, cur.reputationPoints + points);
    if (action === 'best_solution_accepted') {
      cur.helpfulSolutionsCount += 1;
    }
    if (!cur.isVerifiedVolunteer) {
      if (cur.reputationPoints >= 50 || cur.helpfulSolutionsCount >= 3) {
        cur.badge = 'Kontributor Aktif';
      }
    }
    cur.updatedAt = new Date().toISOString();
  }
}

export async function createNotification(data: {
  recipientId: string;
  actorId?: string;
  actorName?: string;
  type: CommunityNotification['type'];
  discussionId?: string;
  commentId?: string;
  message: string;
}): Promise<void> {
  // Jangan beri notifikasi ke diri sendiri
  if (data.actorId && data.actorId === data.recipientId) return;

  const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const notif: CommunityNotification = {
    id,
    recipientId: data.recipientId,
    actorId: data.actorId,
    actorName: data.actorName,
    type: data.type,
    discussionId: data.discussionId,
    commentId: data.commentId,
    message: data.message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO community_notifications (id, recipient_id, actor_id, actor_name, type, discussion_id, comment_id, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, NOW())`,
        [id, notif.recipientId, notif.actorId || null, notif.actorName || null, notif.type, notif.discussionId || null, notif.commentId || null, notif.message]
      );
      return;
    } catch (e: any) {
      console.warn('[CommunityService] DB createNotification failed:', e.message);
    }
  }

  inMemoryNotifications.unshift(notif);
}

// =========================================================================
// ATTACHMENT & EVIDENCE PROCESSING (MAGIC BYTES VALIDATION)
// =========================================================================

export function validateEvidenceImage(base64Data: string): { valid: boolean; error?: string; mimeType?: string } {
  if (!base64Data || typeof base64Data !== 'string') {
    return { valid: false, error: 'Data gambar tidak valid.' };
  }

  // Parse Data URI prefix if present: "data:image/png;base64,..."
  let cleanBase64 = base64Data;
  let declaredMime = '';
  const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    declaredMime = match[1].toLowerCase();
    cleanBase64 = match[2];
  }

  // Check file size (max 5MB = ~5 * 1024 * 1024 bytes)
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    return { valid: false, error: 'Ukuran berkas melebihi batas maksimal 5MB.' };
  }

  if (buffer.length < 12) {
    return { valid: false, error: 'Format berkas bukti tidak dikenali.' };
  }

  // Check Magic Bytes:
  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  // WEBP: 'RIFF' .... 'WEBP'
  const isWebp =
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    return {
      valid: false,
      error: 'Berkas ditolak. Hanya format screenshot JPG, PNG, atau WEBP asli yang diizinkan untuk keamanan warga.',
    };
  }

  const detectedMime = isJpeg ? 'image/jpeg' : isPng ? 'image/png' : 'image/webp';
  return { valid: true, mimeType: detectedMime };
}

// =========================================================================
// COMMUNITY SERVICE CORE METHODS
// =========================================================================

export const communityService = {
  /**
   * Mengambil daftar diskusi dengan filter kategori, status, pencarian, pengurutan, dan paginasi
   */
  async getDiscussions(params: {
    category?: string;
    status?: string;
    search?: string;
    sort?: 'terbaru' | 'paling_membantu' | 'terpopuler';
    page?: number;
    limit?: number;
    currentUserId?: string;
  }): Promise<{
    discussions: CommunityDiscussion[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 10));
    const offset = (page - 1) * limit;
    const category = params.category && params.category !== 'all' ? params.category : undefined;
    const status = params.status && params.status !== 'all' ? params.status : undefined;
    const search = params.search ? params.search.trim().toLowerCase() : undefined;
    const sort = params.sort || 'terbaru';
    const currentUserId = params.currentUserId;

    if (isDbConnected()) {
      try {
        let whereClauses: string[] = ['1=1'];
        let queryParams: any[] = [];
        let pIndex = 1;

        if (category) {
          whereClauses.push(`cd.category = $${pIndex++}`);
          queryParams.push(category);
        }
        if (status) {
          whereClauses.push(`cd.status = $${pIndex++}`);
          queryParams.push(status);
        }
        if (search) {
          whereClauses.push(`(LOWER(cd.title) LIKE $${pIndex} OR LOWER(cd.content) LIKE $${pIndex})`);
          queryParams.push(`%${search}%`);
          pIndex++;
        }

        let orderBy = 'cd.is_pinned DESC, cd.created_at DESC';
        if (sort === 'paling_membantu') {
          orderBy = 'cd.is_pinned DESC, cd.helpful_count DESC, cd.created_at DESC';
        } else if (sort === 'terpopuler') {
          orderBy = 'cd.is_pinned DESC, cd.comment_count DESC, cd.created_at DESC';
        }

        const countQuery = `SELECT COUNT(*) FROM community_discussions cd WHERE ${whereClauses.join(' AND ')}`;
        const countRes = await query(countQuery, queryParams);
        const total = parseInt(countRes?.rows[0]?.count || '0', 10);

        const selectQuery = `
          SELECT 
            cd.id, cd.user_id as "userId", cd.author_name as "authorName", cd.author_badge as "authorBadge",
            cd.avatar_color as "avatarColor", cd.category, cd.title, cd.content, cd.evidence_snippet as "evidenceSnippet",
            cd.evidence_image_url as "evidenceImageUrl", cd.is_anonymous as "isAnonymous", cd.status,
            cd.best_solution_comment_id as "bestSolutionCommentId", cd.helpful_count as "helpfulCount",
            cd.comment_count as "commentCount", cd.is_pinned as "isPinned", cd.is_locked as "isLocked",
            cd.created_at as "createdAt", cd.updated_at as "updatedAt"
          FROM community_discussions cd
          WHERE ${whereClauses.join(' AND ')}
          ORDER BY ${orderBy}
          LIMIT $${pIndex++} OFFSET $${pIndex++}
        `;
        queryParams.push(limit, offset);

        const selectRes = await query(selectQuery, queryParams);
        if (selectRes && selectRes.rows) {
          // Map user vote state if logged in
          const discussions = selectRes.rows.map((d: any) => {
            const isAnon = Boolean(d.isAnonymous);
            return {
              ...d,
              authorName: isAnon && d.userId !== currentUserId ? 'Anonim (Disamarkan)' : d.authorName,
              authorBadge: isAnon && d.userId !== currentUserId ? 'Anonim' : d.authorBadge,
              avatarColor: isAnon && d.userId !== currentUserId ? '#64748b' : d.avatarColor,
              userVoted: false,
            };
          });

          return {
            discussions,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit) || 1,
            },
          };
        }
      } catch (err: any) {
        console.warn('[CommunityService] DB getDiscussions failed:', err.message);
      }
    }

    // Fallback In-Memory
    let filtered = inMemoryDiscussions.filter((d) => {
      if (category && d.category !== category) return false;
      if (status && d.status !== status) return false;
      if (search) {
        const matchTitle = d.title.toLowerCase().includes(search);
        const matchContent = d.content.toLowerCase().includes(search);
        const matchAuthor = d.authorName.toLowerCase().includes(search);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sort === 'paling_membantu') return b.helpfulCount - a.helpfulCount;
      if (sort === 'terpopuler') return b.commentCount - a.commentCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit).map((d) => {
      const isAnon = Boolean(d.isAnonymous);
      const userVoted = currentUserId
        ? inMemoryVotes.some((v) => v.userId === currentUserId && v.targetType === 'post' && v.targetId === d.id)
        : false;
      return {
        ...d,
        authorName: isAnon && d.userId !== currentUserId ? 'Anonim (Disamarkan)' : d.authorName,
        authorBadge: isAnon && d.userId !== currentUserId ? 'Anonim' : d.authorBadge,
        avatarColor: isAnon && d.userId !== currentUserId ? '#64748b' : d.avatarColor,
        userVoted,
      };
    });

    return {
      discussions: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Mengambil detail satu diskusi beserta seluruh komentar dan balasan bersarang (Threaded tree)
   */
  async getDiscussionById(id: string, currentUserId?: string): Promise<CommunityDiscussion | null> {
    let discussion: CommunityDiscussion | null = null;
    let commentsList: CommunityComment[] = [];

    if (isDbConnected()) {
      try {
        const discRes = await query(
          `SELECT 
            cd.id, cd.user_id as "userId", cd.author_name as "authorName", cd.author_badge as "authorBadge",
            cd.avatar_color as "avatarColor", cd.category, cd.title, cd.content, cd.evidence_snippet as "evidenceSnippet",
            cd.evidence_image_url as "evidenceImageUrl", cd.is_anonymous as "isAnonymous", cd.status,
            cd.best_solution_comment_id as "bestSolutionCommentId", cd.helpful_count as "helpfulCount",
            cd.comment_count as "commentCount", cd.is_pinned as "isPinned", cd.is_locked as "isLocked",
            cd.created_at as "createdAt", cd.updated_at as "updatedAt"
          FROM community_discussions cd
          WHERE cd.id = $1 LIMIT 1`,
          [id]
        );

        if (discRes && discRes.rows.length > 0) {
          discussion = discRes.rows[0];
          const commRes = await query(
            `SELECT 
              cc.id, cc.discussion_id as "discussionId", cc.user_id as "userId", cc.parent_id as "parentId",
              cc.author_name as "authorName", cc.author_badge as "authorBadge", cc.avatar_color as "avatarColor",
              cc.content, cc.evidence_image_url as "evidenceImageUrl", cc.is_anonymous as "isAnonymous",
              cc.is_best_solution as "isBestSolution", cc.helpful_count as "helpfulCount",
              cc.created_at as "createdAt", cc.updated_at as "updatedAt"
            FROM community_comments cc
            WHERE cc.discussion_id = $1
            ORDER BY cc.is_best_solution DESC, cc.created_at ASC`,
            [id]
          );
          if (commRes && commRes.rows) {
            commentsList = commRes.rows;
          }
        }
      } catch (err: any) {
        console.warn('[CommunityService] DB getDiscussionById failed:', err.message);
      }
    }

    if (!discussion) {
      const found = inMemoryDiscussions.find((d) => d.id === id);
      if (!found) return null;
      discussion = { ...found };
      commentsList = inMemoryComments.filter((c) => c.discussionId === id);
    }

    // Build comment tree (threaded comments)
    const isDiscAnon = Boolean(discussion.isAnonymous);
    const discUserVoted = currentUserId
      ? inMemoryVotes.some((v) => v.userId === currentUserId && v.targetType === 'post' && v.targetId === id)
      : false;

    discussion.userVoted = discUserVoted;
    if (isDiscAnon && discussion.userId !== currentUserId) {
      discussion.authorName = 'Anonim (Disamarkan)';
      discussion.authorBadge = 'Anonim';
      discussion.avatarColor = '#64748b';
    }

    // Convert flat comments to hierarchical threaded tree
    const commentMap = new Map<string, CommunityCommentTree>();
    const rootComments: CommunityCommentTree[] = [];

    commentsList.forEach((c) => {
      const isCommAnon = Boolean(c.isAnonymous);
      const commUserVoted = currentUserId
        ? inMemoryVotes.some((v) => v.userId === currentUserId && v.targetType === 'comment' && v.targetId === c.id)
        : false;

      const item: CommunityCommentTree = {
        ...c,
        authorName: isCommAnon && c.userId !== currentUserId ? 'Anonim (Disamarkan)' : c.authorName,
        authorBadge: isCommAnon && c.userId !== currentUserId ? 'Anonim' : c.authorBadge,
        avatarColor: isCommAnon && c.userId !== currentUserId ? '#64748b' : c.avatarColor,
        userVoted: commUserVoted,
        replies: [],
      };
      commentMap.set(c.id, item);
    });

    commentsList.forEach((c) => {
      const item = commentMap.get(c.id);
      if (!item) return;

      if (c.parentId && commentMap.has(c.parentId)) {
        const parent = commentMap.get(c.parentId)!;
        parent.replies = parent.replies || [];
        parent.replies.push(item);
      } else {
        rootComments.push(item);
      }
    });

    // Root comments order: Best solution first, then newest
    rootComments.sort((a, b) => {
      if (a.isBestSolution !== b.isBestSolution) return a.isBestSolution ? -1 : 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    discussion.comments = rootComments;
    return discussion;
  },

  /**
   * Membuat postingan diskusi baru
   */
  async createDiscussion(
    data: {
      category: DiscussionCategory;
      title: string;
      content: string;
      evidenceSnippet?: string;
      evidenceImageUrl?: string;
      isAnonymous?: boolean;
    },
    user: UserSession
  ): Promise<CommunityDiscussion> {
    const validCategories: DiscussionCategory[] = ['tanya-jawab-warga', 'waspada-modus-baru', 'posko-solusi-lapor'];
    if (!validCategories.includes(data.category)) {
      throw new Error('Kategori diskusi tidak valid.');
    }

    const cleanTitle = data.title?.trim();
    if (!cleanTitle || cleanTitle.length < 5 || cleanTitle.length > 255) {
      throw new Error('Judul diskusi harus memiliki panjang antara 5 hingga 255 karakter.');
    }

    const cleanContent = data.content?.trim();
    if (!cleanContent || cleanContent.length < 10 || cleanContent.length > 5000) {
      throw new Error('Isi postingan harus memiliki panjang antara 10 hingga 5000 karakter.');
    }

    // Check evidence image validation if present
    if (data.evidenceImageUrl && data.evidenceImageUrl.startsWith('data:')) {
      const val = validateEvidenceImage(data.evidenceImageUrl);
      if (!val.valid) {
        throw new Error(val.error || 'Berkas bukti ditolak.');
      }
    }

    const id = `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const badge = await getUserBadge(user.id, user.role);
    const isAnonymous = Boolean(data.isAnonymous);
    const nowIso = new Date().toISOString();

    const newDiscussion: CommunityDiscussion = {
      id,
      userId: user.id,
      authorName: user.fullName || user.username,
      authorBadge: badge,
      avatarColor: isAnonymous ? '#64748b' : '#143826',
      category: data.category,
      title: cleanTitle,
      content: cleanContent,
      evidenceSnippet: data.evidenceSnippet?.trim() || undefined,
      evidenceImageUrl: data.evidenceImageUrl || undefined,
      isAnonymous,
      status: 'TERBUKA',
      bestSolutionCommentId: null,
      helpfulCount: 0,
      commentCount: 0,
      isPinned: false,
      isLocked: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO community_discussions (
            id, user_id, author_name, author_badge, avatar_color, category, title, content,
            evidence_snippet, evidence_image_url, is_anonymous, status, helpful_count, comment_count,
            is_pinned, is_locked, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'TERBUKA', 0, 0, FALSE, FALSE, NOW(), NOW())`,
          [
            id,
            user.id,
            newDiscussion.authorName,
            newDiscussion.authorBadge,
            newDiscussion.avatarColor,
            newDiscussion.category,
            newDiscussion.title,
            newDiscussion.content,
            newDiscussion.evidenceSnippet || null,
            newDiscussion.evidenceImageUrl || null,
            isAnonymous,
          ]
        );
      } catch (err: any) {
        console.warn('[CommunityService] DB createDiscussion failed:', err.message);
      }
    }

    inMemoryDiscussions.unshift(newDiscussion);

    // Beri poin reputasi untuk kontribusi diskusi bermanfaat (+5 poin)
    await addReputationPoints(user.id, 5, 'post_created', id);

    return newDiscussion;
  },

  /**
   * Mengedit postingan diskusi milik sendiri
   */
  async updateDiscussion(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: DiscussionCategory;
      evidenceSnippet?: string;
      status?: DiscussionStatus;
    },
    user: UserSession
  ): Promise<CommunityDiscussion> {
    const disc = await this.getDiscussionById(id, user.id);
    if (!disc) {
      throw new Error('Diskusi tidak ditemukan.');
    }

    const isAuthor =
      disc.userId === user.id ||
      disc.userId === user.username ||
      disc.userId === `usr-${user.username}`;
    const isStaff = user.role === 'admin' || user.role === 'moderator' || user.role === 'superadmin';

    if (!isAuthor && !isStaff) {
      throw new Error('Akses ditolak. Sesama pengguna tidak diizinkan menyunting postingan milik pengguna lain.');
    }

    const cleanTitle = data.title !== undefined ? data.title.trim() : disc.title;
    const cleanContent = data.content !== undefined ? data.content.trim() : disc.content;
    const category = data.category || disc.category;
    const status = data.status || disc.status;

    if (cleanTitle.length < 5 || cleanTitle.length > 255) {
      throw new Error('Judul diskusi harus antara 5-255 karakter.');
    }
    if (cleanContent.length < 10 || cleanContent.length > 5000) {
      throw new Error('Isi postingan harus antara 10-5000 karakter.');
    }

    const nowIso = new Date().toISOString();

    if (isDbConnected()) {
      try {
        await query(
          `UPDATE community_discussions SET
            title = $1, content = $2, category = $3, status = $4, evidence_snippet = $5, updated_at = NOW()
          WHERE id = $6`,
          [cleanTitle, cleanContent, category, status, data.evidenceSnippet !== undefined ? data.evidenceSnippet : disc.evidenceSnippet, id]
        );
      } catch (e: any) {
        console.warn('[CommunityService] DB updateDiscussion failed:', e.message);
      }
    }

    const target = inMemoryDiscussions.find((d) => d.id === id);
    if (target) {
      target.title = cleanTitle;
      target.content = cleanContent;
      target.category = category;
      target.status = status;
      if (data.evidenceSnippet !== undefined) target.evidenceSnippet = data.evidenceSnippet;
      target.updatedAt = nowIso;
    }

    return (await this.getDiscussionById(id, user.id))!;
  },

  /**
   * Menghapus postingan diskusi
   */
  async deleteDiscussion(id: string, user: UserSession): Promise<boolean> {
    const disc = inMemoryDiscussions.find((d) => d.id === id) || (await this.getDiscussionById(id, user.id));
    if (!disc) {
      throw new Error('Diskusi tidak ditemukan.');
    }

    const isAuthor =
      disc.userId === user.id ||
      disc.userId === user.username ||
      disc.userId === `usr-${user.username}`;
    const isStaff = user.role === 'admin' || user.role === 'moderator' || user.role === 'superadmin';

    if (!isAuthor && !isStaff) {
      throw new Error('Akses ditolak. Sesama pengguna tidak diizinkan menghapus postingan milik pengguna lain.');
    }

    if (isDbConnected()) {
      try {
        if (isStaff) {
          await query('DELETE FROM community_discussions WHERE id = $1', [id]);
        } else {
          await query('DELETE FROM community_discussions WHERE id = $1 AND (user_id = $2 OR user_id = $3)', [
            id,
            user.id,
            `usr-${user.username}`,
          ]);
        }
      } catch (e: any) {
        console.warn('[CommunityService] DB deleteDiscussion failed:', e.message);
      }
    }

    inMemoryDiscussions = inMemoryDiscussions.filter((d) => d.id !== id);
    inMemoryComments = inMemoryComments.filter((c) => c.discussionId !== id);
    inMemoryVotes = inMemoryVotes.filter((v) => !(v.targetType === 'post' && v.targetId === id));
    return true;
  },

  /**
   * Menambahkan komentar atau balasan berjenjang (threaded reply)
   */
  async addComment(
    discussionId: string,
    data: {
      content: string;
      parentId?: string | null;
      evidenceImageUrl?: string;
      isAnonymous?: boolean;
    },
    user: UserSession
  ): Promise<CommunityComment> {
    const disc = inMemoryDiscussions.find((d) => d.id === discussionId) || (await this.getDiscussionById(discussionId));
    if (!disc) {
      throw new Error('Diskusi tidak ditemukan.');
    }

    if (disc.isLocked || disc.status === 'DITUTUP') {
      throw new Error('Diskusi ini telah ditutup atau dikunci oleh moderator.');
    }

    const cleanContent = data.content?.trim();
    if (!cleanContent || cleanContent.length < 3 || cleanContent.length > 2000) {
      throw new Error('Komentar harus memiliki panjang antara 3 hingga 2000 karakter.');
    }

    // Verify parent comment if replying
    let parentComment: CommunityComment | undefined;
    if (data.parentId) {
      parentComment = inMemoryComments.find((c) => c.id === data.parentId);
      if (!parentComment && isDbConnected()) {
        const pRes = await query('SELECT * FROM community_comments WHERE id = $1 LIMIT 1', [data.parentId]);
        if (pRes && pRes.rows.length > 0) parentComment = pRes.rows[0];
      }
      if (!parentComment || parentComment.discussionId !== discussionId) {
        throw new Error('Komentar induk yang dibalas tidak ditemukan pada diskusi ini.');
      }
    }

    // Check evidence image if present
    if (data.evidenceImageUrl && data.evidenceImageUrl.startsWith('data:')) {
      const val = validateEvidenceImage(data.evidenceImageUrl);
      if (!val.valid) {
        throw new Error(val.error || 'Berkas bukti komentar ditolak.');
      }
    }

    const id = `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const badge = await getUserBadge(user.id, user.role);
    const isAnonymous = Boolean(data.isAnonymous);
    const nowIso = new Date().toISOString();

    const newComment: CommunityComment = {
      id,
      discussionId,
      userId: user.id,
      parentId: data.parentId || null,
      authorName: user.fullName || user.username,
      authorBadge: badge,
      avatarColor: isAnonymous ? '#64748b' : '#0f9b8a',
      content: cleanContent,
      evidenceImageUrl: data.evidenceImageUrl || undefined,
      isAnonymous,
      isBestSolution: false,
      helpfulCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO community_comments (
            id, discussion_id, user_id, parent_id, author_name, author_badge, avatar_color,
            content, evidence_image_url, is_anonymous, is_best_solution, helpful_count, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE, 0, NOW(), NOW())`,
          [
            id,
            discussionId,
            user.id,
            newComment.parentId || null,
            newComment.authorName,
            newComment.authorBadge,
            newComment.avatarColor,
            newComment.content,
            newComment.evidenceImageUrl || null,
            isAnonymous,
          ]
        );
        await query(`UPDATE community_discussions SET comment_count = comment_count + 1 WHERE id = $1`, [discussionId]);
      } catch (e: any) {
        console.warn('[CommunityService] DB addComment failed:', e.message);
      }
    }

    inMemoryComments.push(newComment);
    const targetDisc = inMemoryDiscussions.find((d) => d.id === discussionId);
    if (targetDisc) targetDisc.commentCount += 1;

    // Tambah reputasi (+2 poin) untuk memberikan komentar membantu
    await addReputationPoints(user.id, 2, 'comment_created', id);

    // Kirim notifikasi ke pembuat postingan
    if (disc.userId !== user.id) {
      await createNotification({
        recipientId: disc.userId,
        actorId: user.id,
        actorName: isAnonymous ? 'Anonim (Disamarkan)' : user.fullName || user.username,
        type: 'reply_post',
        discussionId,
        commentId: id,
        message: `${isAnonymous ? 'Seorang warga anonim' : user.fullName || user.username} membalas pertanyaan Anda di "${disc.title.slice(0, 40)}..."`,
      });
    }

    // Jika ini adalah balasan ke komentar lain, beri notifikasi juga ke pemilik komentar induk
    if (parentComment && parentComment.userId !== user.id && parentComment.userId !== disc.userId) {
      await createNotification({
        recipientId: parentComment.userId,
        actorId: user.id,
        actorName: isAnonymous ? 'Anonim (Disamarkan)' : user.fullName || user.username,
        type: 'reply_comment',
        discussionId,
        commentId: id,
        message: `${isAnonymous ? 'Seorang warga' : user.fullName || user.username} menanggapi komentar Anda di forum.`,
      });
    }

    return newComment;
  },

  /**
   * Menghapus komentar
   */
  async deleteComment(commentId: string, user: UserSession): Promise<boolean> {
    const comm = inMemoryComments.find((c) => c.id === commentId);
    if (!comm) throw new Error('Komentar tidak ditemukan.');

    const isAuthor =
      comm.userId === user.id ||
      comm.userId === user.username ||
      comm.userId === `usr-${user.username}`;
    const isStaff = user.role === 'admin' || user.role === 'moderator' || user.role === 'superadmin';

    if (!isAuthor && !isStaff) {
      throw new Error('Akses ditolak. Sesama pengguna tidak diizinkan menghapus komentar milik pengguna lain.');
    }

    if (isDbConnected()) {
      try {
        if (isStaff) {
          await query('DELETE FROM community_comments WHERE id = $1', [commentId]);
        } else {
          await query('DELETE FROM community_comments WHERE id = $1 AND (user_id = $2 OR user_id = $3)', [
            commentId,
            user.id,
            `usr-${user.username}`,
          ]);
        }
        await query('UPDATE community_discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1', [comm.discussionId]);
      } catch (e: any) {
        console.warn('[CommunityService] DB deleteComment failed:', e.message);
      }
    }

    inMemoryComments = inMemoryComments.filter((c) => c.id !== commentId && c.parentId !== commentId);
    const disc = inMemoryDiscussions.find((d) => d.id === comm.discussionId);
    if (disc) disc.commentCount = Math.max(0, disc.commentCount - 1);

    return true;
  },

  /**
   * Menandai atau membatalkan jawaban sebagai SOLUSI TERBAIK
   * Ketentuan:
   * - Hanya pemilik pertanyaan (atau staf moderator) yang berhak memilih solusi terbaik.
   * - Otomatis mengubah status diskusi menjadi TERJAWAB.
   * - Jika solusi terbaik dibatalkan, status kembali menjadi TERBUKA.
   */
  async toggleBestSolution(discussionId: string, commentId: string, user: UserSession): Promise<{
    isBestSolution: boolean;
    status: DiscussionStatus;
    commentAuthorId: string;
  }> {
    const disc = inMemoryDiscussions.find((d) => d.id === discussionId) || (await this.getDiscussionById(discussionId));
    if (!disc) throw new Error('Diskusi tidak ditemukan.');

    const isOwner =
      disc.userId === user.id ||
      disc.userId === user.username ||
      disc.userId === `usr-${user.username}`;
    const isStaff = user.role === 'admin' || user.role === 'moderator' || user.role === 'superadmin';

    if (!isOwner && !isStaff) {
      throw new Error('Hanya penanya yang berhak menandai atau membatalkan Solusi Terbaik.');
    }

    const comment = inMemoryComments.find((c) => c.id === commentId);
    if (!comment || comment.discussionId !== discussionId) {
      throw new Error('Komentar tidak ditemukan dalam diskusi ini.');
    }

    const isAlreadyBest = comment.isBestSolution;
    let newStatus: DiscussionStatus = 'TERJAWAB';

    if (isAlreadyBest) {
      // BATALKAN SOLUSI TERBAIK
      comment.isBestSolution = false;
      disc.bestSolutionCommentId = null;
      disc.status = 'TERBUKA';
      newStatus = 'TERBUKA';

      if (isDbConnected()) {
        try {
          await query(`UPDATE community_comments SET is_best_solution = FALSE WHERE id = $1`, [commentId]);
          await query(`UPDATE community_discussions SET best_solution_comment_id = NULL, status = 'TERBUKA' WHERE id = $1`, [discussionId]);
        } catch (e: any) {
          console.warn('[CommunityService] DB toggleBestSolution (cancel) failed:', e.message);
        }
      }

      // Potong kembali bonus poin solusi terbaik (-25)
      await addReputationPoints(comment.userId, -25, 'best_solution_revoked', commentId);
    } else {
      // SET SEBAGAI SOLUSI TERBAIK
      // Pastikan komentar lain di diskusi ini dicopot flag best solution-nya
      inMemoryComments.forEach((c) => {
        if (c.discussionId === discussionId) c.isBestSolution = false;
      });

      comment.isBestSolution = true;
      disc.bestSolutionCommentId = commentId;
      disc.status = 'TERJAWAB';
      newStatus = 'TERJAWAB';

      if (isDbConnected()) {
        try {
          await query(`UPDATE community_comments SET is_best_solution = FALSE WHERE discussion_id = $1`, [discussionId]);
          await query(`UPDATE community_comments SET is_best_solution = TRUE WHERE id = $1`, [commentId]);
          await query(`UPDATE community_discussions SET best_solution_comment_id = $1, status = 'TERJAWAB' WHERE id = $2`, [commentId, discussionId]);
        } catch (e: any) {
          console.warn('[CommunityService] DB toggleBestSolution (set) failed:', e.message);
        }
      }

      // Beri bonus reputasi besar (+25 poin) untuk pembuat solusi terverifikasi
      await addReputationPoints(comment.userId, 25, 'best_solution_accepted', commentId);

      // Kirim notifikasi apresiasi kepada penjawab
      await createNotification({
        recipientId: comment.userId,
        actorId: user.id,
        actorName: user.fullName || user.username,
        type: 'best_solution',
        discussionId,
        commentId,
        message: `Selamat! Jawaban Anda telah dipilih sebagai Solusi Terbaik pada diskusi "${disc.title.slice(0, 45)}..."! (+25 Reputasi)`,
      });
    }

    return {
      isBestSolution: !isAlreadyBest,
      status: newStatus,
      commentAuthorId: comment.userId,
    };
  },

  /**
   * Memberikan vote "Membantu" (Helpful)
   * Ketentuan:
   * - 1 vote per user per konten (diskusi atau komentar).
   * - Tidak bisa vote pada konten milik sendiri.
   * - Vote bersifat toggle (dapat dibatalkan).
   */
  async toggleHelpfulVote(
    targetType: TargetType,
    targetId: string,
    user: UserSession
  ): Promise<{ voted: boolean; helpfulCount: number }> {
    let authorId = '';
    let targetObj: { helpfulCount: number } | undefined;

    if (targetType === 'post') {
      const disc = inMemoryDiscussions.find((d) => d.id === targetId) || (await this.getDiscussionById(targetId));
      if (!disc) throw new Error('Postingan diskusi tidak ditemukan.');
      authorId = disc.userId;
      targetObj = inMemoryDiscussions.find((d) => d.id === targetId);
    } else {
      const comm = inMemoryComments.find((c) => c.id === targetId);
      if (!comm) throw new Error('Komentar tidak ditemukan.');
      authorId = comm.userId;
      targetObj = comm;
    }

    // Cegah vote konten milik sendiri
    if (
      authorId === user.id ||
      authorId === user.username ||
      authorId === `usr-${user.username}`
    ) {
      throw new Error('Anda tidak dapat memberikan vote Membantu pada postingan atau komentar Anda sendiri.');
    }

    // Cek apakah user sudah pernah vote
    const existingIndex = inMemoryVotes.findIndex(
      (v) => v.userId === user.id && v.targetType === targetType && v.targetId === targetId
    );

    let voted = false;
    let helpfulCount = targetObj ? targetObj.helpfulCount : 0;

    if (existingIndex >= 0) {
      // BATALKAN VOTE
      inMemoryVotes.splice(existingIndex, 1);
      if (targetObj) {
        targetObj.helpfulCount = Math.max(0, targetObj.helpfulCount - 1);
        helpfulCount = targetObj.helpfulCount;
      }
      voted = false;

      if (isDbConnected()) {
        try {
          await query('DELETE FROM community_votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3', [
            user.id,
            targetType,
            targetId,
          ]);
          const table = targetType === 'post' ? 'community_discussions' : 'community_comments';
          await query(`UPDATE ${table} SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = $1`, [targetId]);
        } catch (e: any) {
          console.warn('[CommunityService] DB vote delete failed:', e.message);
        }
      }

      await addReputationPoints(authorId, -5, 'helpful_vote_canceled', targetId);
    } else {
      // BERIKAN VOTE
      const voteId = `vote-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      inMemoryVotes.push({
        id: voteId,
        userId: user.id,
        targetType,
        targetId,
        createdAt: new Date().toISOString(),
      });

      if (targetObj) {
        targetObj.helpfulCount += 1;
        helpfulCount = targetObj.helpfulCount;
      }
      voted = true;

      if (isDbConnected()) {
        try {
          await query(
            `INSERT INTO community_votes (id, user_id, target_type, target_id, created_at)
             VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING`,
            [voteId, user.id, targetType, targetId]
          );
          const table = targetType === 'post' ? 'community_discussions' : 'community_comments';
          await query(`UPDATE ${table} SET helpful_count = helpful_count + 1 WHERE id = $1`, [targetId]);
        } catch (e: any) {
          console.warn('[CommunityService] DB vote insert failed:', e.message);
        }
      }

      await addReputationPoints(authorId, 5, 'helpful_vote_received', targetId);
    }

    return { voted, helpfulCount };
  },

  /**
   * Melaporkan konten (Post, Komentar, atau User)
   */
  async reportContent(
    data: {
      targetType: 'post' | 'comment' | 'user';
      targetId: string;
      reason: ReportReason;
      notes?: string;
    },
    user: UserSession
  ): Promise<ModerationReport> {
    const validReasons: ReportReason[] = ['penipuan', 'spam', 'misinformasi', 'bocor_pii', 'ujaran_kebencian', 'lainnya'];
    if (!validReasons.includes(data.reason)) {
      throw new Error('Alasan pelaporan tidak valid.');
    }

    if (data.reason === 'lainnya' && (!data.notes || data.notes.trim().length < 5)) {
      throw new Error('Keterangan laporan wajib diisi minimal 5 karakter untuk alasan "Lainnya".');
    }

    const id = `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const report: ModerationReport = {
      id,
      reporterId: user.id,
      reporterName: user.fullName || user.username,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      notes: data.notes?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO community_moderation_reports (
            id, reporter_id, reporter_name, target_type, target_id, reason, notes, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
          [id, user.id, report.reporterName, report.targetType, report.targetId, report.reason, report.notes || null]
        );
      } catch (e: any) {
        console.warn('[CommunityService] DB report insert failed:', e.message);
      }
    }

    inMemoryReports.unshift(report);
    return report;
  },

  /**
   * Mengambil daftar laporan moderasi untuk admin/moderator
   */
  async getModerationReports(status?: string): Promise<ModerationReport[]> {
    if (isDbConnected()) {
      try {
        let q = `SELECT 
          id, reporter_id as "reporterId", reporter_name as "reporterName", target_type as "targetType",
          target_id as "targetId", reason, notes, status, moderator_notes as "moderatorNotes",
          reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", created_at as "createdAt"
        FROM community_moderation_reports`;
        const params: any[] = [];
        if (status && status !== 'all') {
          q += ` WHERE status = $1`;
          params.push(status);
        }
        q += ` ORDER BY created_at DESC`;
        const res = await query(q, params);
        if (res && res.rows) return res.rows;
      } catch (e: any) {
        console.warn('[CommunityService] DB getModerationReports failed:', e.message);
      }
    }

    if (status && status !== 'all') {
      return inMemoryReports.filter((r) => r.status === status);
    }
    return inMemoryReports;
  },

  /**
   * Mengambil reputasi dan badge pengguna
   */
  async getUserReputation(userId: string): Promise<UserReputation> {
    const badge = await getUserBadge(userId, 'user');
    const existing = inMemoryReputations[userId];
    if (existing) {
      return existing;
    }
    return {
      userId,
      reputationPoints: 0,
      badge,
      isVerifiedVolunteer: false,
      helpfulSolutionsCount: 0,
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Mengambil notifikasi pengguna
   */
  async getUserNotifications(userId: string): Promise<CommunityNotification[]> {
    if (isDbConnected()) {
      try {
        const res = await query(
          `SELECT 
            id, recipient_id as "recipientId", actor_id as "actorId", actor_name as "actorName",
            type, discussion_id as "discussionId", comment_id as "commentId", message, is_read as "isRead",
            created_at as "createdAt"
          FROM community_notifications
          WHERE recipient_id = $1
          ORDER BY created_at DESC
          LIMIT 30`,
          [userId]
        );
        if (res && res.rows) return res.rows;
      } catch (e: any) {
        console.warn('[CommunityService] DB getUserNotifications failed:', e.message);
      }
    }

    return inMemoryNotifications.filter((n) => n.recipientId === userId).slice(0, 30);
  },

  /**
   * Menandai notifikasi sebagai terbaca
   */
  async markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await query(`UPDATE community_notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2`, [
          notificationId,
          userId,
        ]);
      } catch (e: any) {
        console.warn('[CommunityService] DB markNotificationRead failed:', e.message);
      }
    }

    const n = inMemoryNotifications.find((x) => x.id === notificationId && x.recipientId === userId);
    if (n) n.isRead = true;
    return true;
  },

  /**
   * Menandai seluruh notifikasi terbaca
   */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await query(`UPDATE community_notifications SET is_read = TRUE WHERE recipient_id = $1`, [userId]);
      } catch (e: any) {
        console.warn('[CommunityService] DB markAllNotificationsRead failed:', e.message);
      }
    }

    inMemoryNotifications.forEach((n) => {
      if (n.recipientId === userId) n.isRead = true;
    });
    return true;
  },
};

