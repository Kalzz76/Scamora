import { Request, Response } from 'express';
import {
  communityService,
  resolveUserByUsername,
  validateEvidenceImage,
  DiscussionCategory,
  DiscussionStatus,
  TargetType,
  ReportReason,
  inMemoryDiscussions,
} from '../services/communityService';

/**
 * Helper untuk mengambil sesi user terautentikasi
 */
async function getSessionUser(req: Request) {
  if (!req.user?.username) {
    return null;
  }
  return await resolveUserByUsername(req.user.username);
}

// 1. DAFTAR DISKUSI (PUBLIC / OPTIONAL AUTH)
export async function handleGetDiscussions(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    const { category, status, search, sort, page, limit } = req.query;

    const result = await communityService.getDiscussions({
      category: category as string,
      status: status as string,
      search: search as string,
      sort: sort as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      currentUserId: user?.id,
    });

    res.status(200).json({
      success: true,
      data: result.discussions,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Gagal memuat diskusi komunitas.' },
    });
  }
}

// 2. DETAIL SATU DISKUSI & THREADED TREE (PUBLIC / OPTIONAL AUTH)
export async function handleGetDiscussionDetail(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await getSessionUser(req);

    const discussion = await communityService.getDiscussionById(id, user?.id);
    if (!discussion) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Topik diskusi tidak ditemukan.' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: discussion,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Gagal memuat detail diskusi.' },
    });
  }
}

// 3. BUAT DISKUSI BARU (PROTECTED)
export async function handleCreateDiscussion(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Silakan masuk untuk membuat postingan diskusi.' },
      });
      return;
    }

    const { category, title, content, evidenceSnippet, evidenceImageUrl, isAnonymous } = req.body;

    const newDiscussion = await communityService.createDiscussion(
      {
        category: category as DiscussionCategory,
        title,
        content,
        evidenceSnippet,
        evidenceImageUrl,
        isAnonymous: Boolean(isAnonymous),
      },
      user
    );

    res.status(201).json({
      success: true,
      data: newDiscussion,
      message: 'Postingan diskusi Anda berhasil dipublikasikan!',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
    });
  }
}

// 4. SUNTING DISKUSI MILIK SENDIRI (PROTECTED)
export async function handleUpdateDiscussion(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const id = req.params.id as string;
    const { title, content, category, evidenceSnippet, status } = req.body;

    const updated = await communityService.updateDiscussion(
      id,
      {
        title,
        content,
        category: category as DiscussionCategory,
        evidenceSnippet,
        status: status as DiscussionStatus,
      },
      user
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Postingan diskusi berhasil diperbarui.',
    });
  } catch (error: any) {
    const status = error.message?.includes('Akses ditolak') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message },
    });
  }
}

// 5. HAPUS DISKUSI MILIK SENDIRI (PROTECTED)
export async function handleDeleteDiscussion(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const id = req.params.id as string;
    await communityService.deleteDiscussion(id, user);

    res.status(200).json({
      success: true,
      data: { id },
      message: 'Postingan diskusi berhasil dihapus.',
    });
  } catch (error: any) {
    const status = error.message?.includes('Akses ditolak') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message },
    });
  }
}

// 6. TAMBAH KOMENTAR / THREADED REPLY (PROTECTED)
export async function handleAddComment(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Silakan masuk untuk menanggapi diskusi ini.' },
      });
      return;
    }

    const discussionId = req.params.id as string;
    const { content, parentId, evidenceImageUrl, isAnonymous } = req.body;

    const newComment = await communityService.addComment(
      discussionId,
      {
        content,
        parentId,
        evidenceImageUrl,
        isAnonymous: Boolean(isAnonymous),
      },
      user
    );

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Komentar Anda berhasil dikirim!',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
    });
  }
}

// 7. HAPUS KOMENTAR (PROTECTED)
export async function handleDeleteComment(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const id = req.params.id as string;
    await communityService.deleteComment(id, user);

    res.status(200).json({
      success: true,
      data: { id },
      message: 'Komentar berhasil dihapus.',
    });
  } catch (error: any) {
    const status = error.message?.includes('Akses ditolak') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message },
    });
  }
}

// 8. TANDAI / BATALKAN SOLUSI TERBAIK (PROTECTED)
export async function handleToggleBestSolution(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const discussionId = req.params.id as string;
    const { commentId } = req.body;

    if (!commentId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'ID Komentar wajib disertakan.' },
      });
      return;
    }

    const result = await communityService.toggleBestSolution(discussionId, commentId, user);

    res.status(200).json({
      success: true,
      data: result,
      message: result.isBestSolution
        ? 'Jawaban berhasil ditandai sebagai Solusi Terbaik! Status diskusi kini TERJAWAB.'
        : 'Tanda Solusi Terbaik dibatalkan. Status diskusi kembali TERBUKA.',
    });
  } catch (error: any) {
    const status = error.message?.includes('Hanya penanya') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message },
    });
  }
}

// 9. VOTE TOMBOL MEMBANTU (HELPFUL) (PROTECTED)
export async function handleToggleHelpfulVote(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Silakan masuk untuk memberikan dukungan Membantu.' },
      });
      return;
    }

    const { targetType, targetId } = req.body;
    if (!targetType || !['post', 'comment'].includes(targetType) || !targetId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'targetType (post/comment) dan targetId wajib disertakan.' },
      });
      return;
    }

    const result = await communityService.toggleHelpfulVote(targetType as TargetType, targetId, user);

    res.status(200).json({
      success: true,
      data: result,
      message: result.voted ? 'Terima kasih atas apresiasi Anda!' : 'Dukungan Membantu dibatalkan.',
    });
  } catch (error: any) {
    const status = error.message?.includes('tidak dapat memberikan vote') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? 'FORBIDDEN' : 'BAD_REQUEST', message: error.message },
    });
  }
}

// 10. LAPOR KONTEN (PROTECTED)
export async function handleReportContent(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Silakan masuk untuk melaporkan konten pelanggaran.' },
      });
      return;
    }

    const { targetType, targetId, reason, notes } = req.body;
    const report = await communityService.reportContent(
      {
        targetType,
        targetId,
        reason: reason as ReportReason,
        notes,
      },
      user
    );

    res.status(201).json({
      success: true,
      data: report,
      message: 'Laporan Anda berhasil dikirim ke tim moderasi. Terima kasih telah menjaga keamanan komunitas!',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
    });
  }
}

// 11. NOTIFIKASI PENGGUNA (PROTECTED)
export async function handleGetUserNotifications(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const notifications = await communityService.getUserNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

export async function handleMarkNotificationRead(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    const id = req.params.id as string;
    await communityService.markNotificationRead(id, user.id);

    res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

export async function handleMarkAllNotificationsRead(req: Request, res: Response): Promise<void> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sesi masuk diperlukan.' },
      });
      return;
    }

    await communityService.markAllNotificationsRead(user.id);

    res.status(200).json({
      success: true,
      message: 'Seluruh notifikasi telah ditandai sebagai terbaca.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

// 12. REPUTASI PENGGUNA
export async function handleGetUserReputation(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const rep = await communityService.getUserReputation(userId);

    res.status(200).json({
      success: true,
      data: rep,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

// 13. STATISTIK KANAL & TREN MODUS AKTUAL (PUBLIC)
export async function handleGetCommunityStats(_req: Request, res: Response): Promise<void> {
  try {
    // Hitung statistik aktual dari basis data diskusi
    const discussions = inMemoryDiscussions;
    const catCounts = {
      'tanya-jawab-warga': discussions.filter((d) => d.category === 'tanya-jawab-warga').length,
      'waspada-modus-baru': discussions.filter((d) => d.category === 'waspada-modus-baru').length,
      'posko-solusi-lapor': discussions.filter((d) => d.category === 'posko-solusi-lapor').length,
    };

    const trending = [
      { id: 'tr-1', title: 'Berkas .APK Berkedok Resi Kurir', tag: 'APK', consultationCount: 38, severity: 'Kritis' },
      { id: 'tr-2', title: 'Lowongan Freelance Like Video (Deposit)', tag: 'Telegram', consultationCount: 29, severity: 'Tinggi' },
      { id: 'tr-3', title: 'Surat Tilang ETLE Palsu via WhatsApp', tag: 'ETLE', consultationCount: 24, severity: 'Kritis' },
      { id: 'tr-4', title: 'Pemberitahuan Kenaikan Tarif Bank Rp 150rb', tag: 'BCA', consultationCount: 19, severity: 'Kritis' },
    ];

    res.status(200).json({
      success: true,
      data: {
        categoryCounts: catCounts,
        trendingScams: trending,
        totalDiscussions: discussions.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

// 14. VALIDASI BUKTI GAMBAR (MAGIC BYTES)
export async function handleValidateEvidenceImage(req: Request, res: Response): Promise<void> {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Data gambar bukti wajib disertakan.' },
      });
      return;
    }

    const val = validateEvidenceImage(imageBase64);
    if (!val.valid) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: val.error },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        mimeType: val.mimeType,
      },
      message: 'Format gambar bukti valid dan terverifikasi aman.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}
