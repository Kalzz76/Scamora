import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../../services/adminService';
import type { AppUserItem, UserStatus, UserStats } from '../../types/admin';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AppUserItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    guestUsers: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalForm, setModalForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    status: 'active' as UserStatus,
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setUsers(res.users);
      setStats(res.stats);
    } catch {
      toast.error('Gagal memuat data pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Quick Toggle Status
  const handleToggleStatus = async (user: AppUserItem) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      toast.success(
        `Status akun @${user.username} diubah menjadi ${nextStatus === 'active' ? 'AKTIF' : 'DITANGGUHKAN'}.`
      );
      loadUsers();
    } catch {
      toast.error('Gagal memperbarui status akun pengguna.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: AppUserItem) => {
    if (!window.confirm(`Yakin ingin menghapus akun @${user.username}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      toast.success(`Akun @${user.username} berhasil dihapus.`);
      loadUsers();
    } catch {
      toast.error('Gagal menghapus pengguna.');
    }
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.fullName.trim()) {
      toast.error('Nama lengkap wajib diisi.');
      return;
    }
    if (!modalForm.username.trim() || modalForm.username.trim().length < 3) {
      toast.error('Username minimal 3 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createUser({
        fullName: modalForm.fullName.trim(),
        username: modalForm.username.trim().toLowerCase(),
        email: modalForm.email.trim() || undefined,
        password: modalForm.password || 'password123',
        tier: 'verified',
        status: modalForm.status,
      });
      toast.success(`Pengguna @${modalForm.username} (Verified) berhasil ditambahkan!`);
      setIsModalOpen(false);
      setModalForm({
        fullName: '',
        username: '',
        email: '',
        password: '',
        status: 'active',
      });
      loadUsers();
    } catch {
      toast.error('Gagal menambahkan pengguna baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !searchQuery.trim() ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, searchQuery, statusFilter]);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#334257] text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-[#548CA8]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
                Manajemen Akun Pengguna
              </h1>
              <p className="text-xs text-[#5E6D7E] dark:text-slate-400 font-mono mt-0.5">
                Pengguna Terdaftar &amp; Terverifikasi (Basis Data PostgreSQL)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadUsers}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 text-[#334257] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#548CA8]" />
            <span>Tambah Akun Pengguna</span>
          </button>
        </div>
      </div>

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-sm border border-[#D8E0E7] dark:border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5E6D7E] dark:text-slate-400 font-mono uppercase">
              Total Pengguna Terdaftar
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0F4F7] dark:bg-slate-800 text-[#334257] dark:text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white">
              {stats.totalUsers}
            </span>
            <p className="text-[11px] text-[#5E6D7E] dark:text-slate-400 mt-0.5">
              Tersimpan di basis data platform
            </p>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono uppercase">
              Akun Aktif
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.activeUsers}
            </span>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Bebas dari penangguhan
            </p>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono uppercase">
              Akun Ditangguhkan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
              {Math.max(0, stats.totalUsers - stats.activeUsers)}
            </span>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Akses login dibatasi sementara
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#D8E0E7] dark:border-slate-700 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E6D7E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, @username, atau email..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#548CA8]/40 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex p-0.5 rounded-xl bg-[#E8EEF3] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-[#334257] dark:text-white shadow-2xs'
                  : 'text-[#5E6D7E] hover:text-[#334257]'
              }`}
            >
              Semua Akun
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-[#5E6D7E] hover:text-[#334257]'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'suspended'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-2xs'
                  : 'text-[#5E6D7E] hover:text-[#334257]'
              }`}
            >
              Ditangguhkan
            </button>
          </div>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="glass-panel rounded-2xl border border-[#D8E0E7] dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F4F7] dark:bg-slate-800/80 border-b border-[#D8E0E7] dark:border-slate-700 font-mono font-bold text-[#5E6D7E] dark:text-slate-300 uppercase">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Email / Kontak</th>
                <th className="py-3 px-4">Peran &amp; Tingkat</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-center">Pemindaian</th>
                <th className="py-3 px-4">Terakhir Aktif</th>
                <th className="py-3 px-4 text-right">Kontrol &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E0E7] dark:divide-slate-700/60 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5E6D7E] dark:text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 mx-auto text-[#94A3B8]" />
                      <p className="font-bold text-sm text-[#1A202C] dark:text-white">
                        Tidak Ada Pengguna Ditemukan
                      </p>
                      <p className="text-[11px]">
                        Coba sesuaikan kata kunci pencarian atau filter status akun.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.status === 'active';
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-2xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {user.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#1A202C] dark:text-white flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            </div>
                            <div className="text-[11px] text-[#5E6D7E] dark:text-slate-400 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-[#5E6D7E] dark:text-slate-400">
                        {user.email || <span className="italic text-slate-400">Tidak ada email</span>}
                      </td>

                      {/* Tier & Role Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold shadow-2xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                          {isAdmin && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase bg-[#334257] text-white">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          <span>{isActive ? 'Aktif' : 'Ditangguhkan'}</span>
                        </span>
                      </td>

                      {/* Activity Scans */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#1A202C] dark:text-white">
                        {user.scanCount} scan
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-[11px] text-[#5E6D7E] dark:text-slate-400 font-mono">
                        {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('id-ID') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                              isActive
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Aktifkan'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Tambah Pengguna Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8E0E7] dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#548CA8]" />
                <h3 className="font-bold text-base text-[#1A202C] dark:text-white">
                  Tambah Akun Pengguna Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.fullName}
                  onChange={(e) => setModalForm({ ...modalForm, fullName: e.target.value })}
                  placeholder="Contoh: Raden Mas Danang"
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#548CA8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.username}
                    onChange={(e) => setModalForm({ ...modalForm, username: e.target.value })}
                    placeholder="danang_99"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#548CA8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    placeholder="danang@email.com"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#548CA8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                  Kata Sandi Awal
                </label>
                <input
                  type="password"
                  value={modalForm.password}
                  onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
                  placeholder="Default: password123"
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#548CA8]"
                />
              </div>

              {/* Tier Info & Status Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                    Tingkatan Pengguna
                  </label>
                  <div className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified (Terverifikasi)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#334257] dark:text-slate-300 font-mono">
                    Status Akun
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white font-bold"
                  >
                    <option value="active">Aktif (Active)</option>
                    <option value="suspended">Ditangguhkan (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D8E0E7] dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8E0E7] dark:border-slate-700 text-xs font-bold text-[#5E6D7E] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

