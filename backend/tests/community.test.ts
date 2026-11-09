import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { createAdminToken } from '../src/services/adminAuthService';

describe('Community Forum & Citizen Interaction Tests (/api/v1/community)', { timeout: 30000 }, () => {
  let server: Server;
  let baseUrl: string;
  let user1Token: string;
  let user2Token: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
        resolve();
      });
    });

    user1Token = createAdminToken('budi_santoso', 'user', 'verified');
    user2Token = createAdminToken('siti_rahma', 'user', 'verified');
  }, 15000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }, 15000);

  describe('1. Akses Publik & Filter Diskusi (GET /community/discussions)', () => {
    it('mengizinkan pengunjung publik (Guest) membaca daftar diskusi komunitas tanpa token', async () => {
      const res = await fetch(`${baseUrl}/community/discussions`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it('memfilter diskusi berdasarkan kategori (tanya-jawab-warga)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions?category=tanya-jawab-warga`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      data.data.forEach((d: any) => {
        expect(d.category).toBe('tanya-jawab-warga');
      });
    });

    it('memfilter diskusi berdasarkan status (TERJAWAB)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions?status=TERJAWAB`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      data.data.forEach((d: any) => {
        expect(d.status).toBe('TERJAWAB');
      });
    });

    it('mengambil detail satu diskusi beserta hierarki balasan bersarang (threaded tree)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions/disc-101`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('disc-101');
      expect(Array.isArray(data.data.comments)).toBe(true);

      const rootComm = data.data.comments.find((c: any) => c.id === 'comm-101');
      expect(rootComm).toBeDefined();
      expect(rootComm.isBestSolution).toBe(true);
      expect(Array.isArray(rootComm.replies)).toBe(true);
      expect(rootComm.replies.length).toBeGreaterThan(0);
    });
  });

  describe('2. Pembuatan & Validasi Postingan (POST /community/discussions)', () => {
    it('menolak pembuatan postingan tanpa autentikasi (401 UNAUTHORIZED)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'tanya-jawab-warga',
          title: 'Apakah link ini penipuan?',
          content: 'Mohon bantuannya bapak ibu sekalian.',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('menolak postingan dengan judul kurang dari 5 karakter (400 VALIDATION_ERROR)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          category: 'tanya-jawab-warga',
          title: 'Link',
          content: 'Konten diskusi yang cukup panjang untuk dites.',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('berhasil membuat postingan baru oleh pengguna terautentikasi (201 CREATED)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          category: 'waspada-modus-baru',
          title: 'Waspada Penipuan Undangan Buka Puasa Bersama Menggunakan File .APK',
          content: 'Ditemukan modus baru menjelang ramadhan mengirim file APK dengan nama Bukber_Alumni.apk. Jangan dibuka karena mencuri OTP SMS!',
          evidenceSnippet: 'Berkas: Bukber_Alumni.apk (3.2MB)',
          isAnonymous: false,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.title).toContain('Waspada Penipuan Undangan');
      expect(data.data.status).toBe('TERBUKA');
    });
  });

  describe('3. Komentar & Threaded Replies (POST /community/discussions/:id/comments)', () => {
    let createdDiscId: string;

    beforeAll(async () => {
      const discRes = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          category: 'tanya-jawab-warga',
          title: 'Diskusi Khusus Uji Coba Komentar dan Solusi Terbaik',
          content: 'Ini adalah thread pertanyaan uji coba untuk mengetes komentar berjenjang dan penandaan solusi.',
        }),
      });
      const d = await discRes.json();
      createdDiscId = d.data.id;
    });

    it('berhasil mengirim komentar tingkat pertama (root comment)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions/${createdDiscId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({
          content: 'Solusi resmi: Jangan pernah memberikan kode OTP kepada siapapun dan segera lapor ke call center bank!',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.content).toContain('Solusi resmi');
    });

    it('berhasil membalas komentar sebelumnya (threaded reply dengan parentId)', async () => {
      const discDetailRes = await fetch(`${baseUrl}/community/discussions/${createdDiscId}`);
      const discDetail = await discDetailRes.json();
      const rootCommId = discDetail.data.comments[0].id;

      const replyRes = await fetch(`${baseUrl}/community/discussions/${createdDiscId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          parentId: rootCommId,
          content: 'Terima kasih atas sarannya, sangat membantu!',
        }),
      });

      expect(replyRes.status).toBe(201);
      const replyData = await replyRes.json();
      expect(replyData.success).toBe(true);
      expect(replyData.data.parentId).toBe(rootCommId);

      const updatedRes = await fetch(`${baseUrl}/community/discussions/${createdDiscId}`);
      const updatedDetail = await updatedRes.json();
      const parent = updatedDetail.data.comments.find((c: any) => c.id === rootCommId);
      expect(parent.replies.length).toBeGreaterThan(0);
      expect(parent.replies[0].id).toBe(replyData.data.id);
    });
  });

  describe('4. Sistem Solusi Terbaik (Best Solution)', () => {
    let discId: string;
    let commId: string;

    beforeAll(async () => {
      const dRes = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          category: 'tanya-jawab-warga',
          title: 'Bagaimana cara blokir nomor penipu di WhatsApp secara permanen?',
          content: 'Sering ditelepon nomor luar negeri +234 yang menawarkan kerja freelance. Mohon solusinya.',
        }),
      });
      const d = await dRes.json();
      discId = d.data.id;

      const cRes = await fetch(`${baseUrl}/community/discussions/${discId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({
          content: 'Buka setelan WhatsApp > Privasi > Panggilan > Aktifkan "Bisukan nomor tidak dikenal".',
        }),
      });
      const c = await cRes.json();
      commId = c.data.id;
    });

    it('menolak jika user yang bukan pembuat thread mencoba menandai solusi terbaik (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/community/discussions/${discId}/best-solution`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({ commentId: commId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('mengizinkan pemilik thread menandai jawaban sebagai Solusi Terbaik dan otomatis mengubah status menjadi TERJAWAB', async () => {
      const res = await fetch(`${baseUrl}/community/discussions/${discId}/best-solution`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ commentId: commId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.isBestSolution).toBe(true);
      expect(data.data.status).toBe('TERJAWAB');

      const detailRes = await fetch(`${baseUrl}/community/discussions/${discId}`);
      const detail = await detailRes.json();
      expect(detail.data.status).toBe('TERJAWAB');
      expect(detail.data.bestSolutionCommentId).toBe(commId);
    });

    it('membatalkan Solusi Terbaik saat di-toggle ulang dan mengembalikan status menjadi TERBUKA', async () => {
      const res = await fetch(`${baseUrl}/community/discussions/${discId}/best-solution`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ commentId: commId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.isBestSolution).toBe(false);
      expect(data.data.status).toBe('TERBUKA');
    });
  });

  describe('5. Sistem Vote Membantu & Anti-Manipulasi (POST /community/vote)', () => {
    it('menolak pengguna yang memberikan vote Membantu pada kontennya sendiri (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/community/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: 'disc-101',
        }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('sendiri');
    });

    it('berhasil memberikan vote Membantu pada postingan orang lain dan men-toggle pembatalan', async () => {
      const voteRes = await fetch(`${baseUrl}/community/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: 'disc-101',
        }),
      });

      expect(voteRes.status).toBe(200);
      const voteData = await voteRes.json();
      expect(voteData.success).toBe(true);
      expect(voteData.data.voted).toBe(true);

      const unvoteRes = await fetch(`${baseUrl}/community/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: 'disc-101',
        }),
      });

      expect(unvoteRes.status).toBe(200);
      const unvoteData = await unvoteRes.json();
      expect(unvoteData.data.voted).toBe(false);
    });
  });

  describe('6. Pelaporan Konten Pelanggaran (POST /community/reports)', () => {
    it('menolak pelaporan dengan alasan "lainnya" tanpa keterangan catatan yang memadai', async () => {
      const res = await fetch(`${baseUrl}/community/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: 'disc-102',
          reason: 'lainnya',
          notes: 'tes',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('berhasil mengirimkan laporan konten pelanggaran terstruktur', async () => {
      const res = await fetch(`${baseUrl}/community/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: 'disc-102',
          reason: 'bocor_pii',
          notes: 'Terdapat nomor rekening tanpa sensor lengkap.',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.status).toBe('pending');
    });
  });

  describe('7. Validasi Berkas Bukti & Magic Bytes (POST /community/validate-evidence)', () => {
    it('menerima screenshot valid berformat PNG asli (magic bytes 89 50 4E 47)', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52]);
      const base64Png = `data:image/png;base64,${pngBuffer.toString('base64')}`;

      const res = await fetch(`${baseUrl}/community/validate-evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ imageBase64: base64Png }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.mimeType).toBe('image/png');
    });

    it('menolak berkas berbahaya yang menyamar dengan teks acak (bukan magic byte gambar)', async () => {
      const fakeBuffer = Buffer.from('echo "malicious payload"');
      const fakeBase64 = `data:image/png;base64,${fakeBuffer.toString('base64')}`;

      const res = await fetch(`${baseUrl}/community/validate-evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ imageBase64: fakeBase64 }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_FILE');
    });
  });

  describe('8. Notifikasi Komunitas (GET /community/notifications)', () => {
    it('mengambil notifikasi pengguna terautentikasi', async () => {
      const res = await fetch(`${baseUrl}/community/notifications`, {
        headers: { Authorization: `Bearer ${user1Token}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.notifications)).toBe(true);
      expect(typeof data.data.unreadCount).toBe('number');
    });

    it('berhasil menandai seluruh notifikasi telah dibaca', async () => {
      const res = await fetch(`${baseUrl}/community/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user1Token}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('9. Proteksi Otorisasi Hapus Postingan & Komentar Antar Pengguna', () => {
    let postUser1Id: string;
    let commentUser1Id: string;

    beforeAll(async () => {
      // User 1 membuat postingan
      const postRes = await fetch(`${baseUrl}/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          category: 'tanya-jawab-warga',
          title: 'Postingan Eksklusif Milik User 1 untuk Uji Hak Akses Hapus',
          content: 'Hanya pemilik asli atau admin yang berhak menghapus postingan ini.',
        }),
      });
      const p = await postRes.json();
      postUser1Id = p.data.id;

      // User 1 menambahkan komentar
      const commRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          content: 'Komentar eksklusif milik User 1.',
        }),
      });
      const c = await commRes.json();
      commentUser1Id = c.data.id;
    });

    it('menolak keras saat sesama user (User 2) mencoba menghapus postingan milik User 1 (403 FORBIDDEN)', async () => {
      const deleteRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user2Token}`, // User 2 bukan pembuat postingan
        },
      });

      expect(deleteRes.status).toBe(403);
      const data = await deleteRes.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('pengguna lain');

      // Verifikasi postingan masih utuh dan tidak terhapus
      const checkRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}`);
      expect(checkRes.status).toBe(200);
    });

    it('menolak keras saat sesama user (User 2) mencoba menyunting postingan milik User 1 (403 FORBIDDEN)', async () => {
      const editRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({
          title: 'Mencoba membajak judul postingan orang lain',
          content: 'Konten bajakan yang seharusnya ditolak server.',
        }),
      });

      expect(editRes.status).toBe(403);
      const data = await editRes.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('menolak keras saat sesama user (User 2) mencoba menghapus komentar milik User 1 (403 FORBIDDEN)', async () => {
      const delCommRes = await fetch(`${baseUrl}/community/comments/${commentUser1Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user2Token}`, // User 2 mencoba hapus komentar User 1
        },
      });

      expect(delCommRes.status).toBe(403);
      const data = await delCommRes.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('pengguna lain');
    });

    it('mengizinkan pemilik sah (User 1) menghapus postingannya sendiri (200 OK)', async () => {
      const deleteRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user1Token}`, // User 1 menghapus miliknya sendiri
        },
      });

      expect(deleteRes.status).toBe(200);
      const data = await deleteRes.json();
      expect(data.success).toBe(true);

      // Verifikasi sudah tidak ada di server
      const checkRes = await fetch(`${baseUrl}/community/discussions/${postUser1Id}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
