import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { CommunityPostItem, ModerationReportItem } from '../../types/admin';
import { toast } from 'sonner';

export const ModerationQueuePage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [reports, setReports] = useState<ModerationReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');
  const [loading, setLoading] = useState(true);

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

  const handleUpdateStatus = async (id: string, status: 'published' | 'hidden') => {
    await adminService.updatePostStatus(id, status);
    toast.success(`Postingan berhasil diubah statusnya menjadi ${status.toUpperCase()}`);
    await loadData();
  };

  const handleResolveReport = async (id: string, action: 'resolve' | 'dismiss') => {
    await adminService.resolveReport(id, action);
    toast.success(`Laporan pengaduan telah ${action === 'resolve' ? 'diselesaikan' : 'ditolak'}`);
    await loadData();
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A202C] tracking-tight">
            Moderasi Komunitas &amp; Laporan Konten (P2)
          </h2>
          <p className="text-xs text-[#476072] mt-0.5">
            Kurasi cerita pengalaman penipuan korban, verifikasi sensor data pribadi (PII), dan tindak lanjuti laporan.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#D8E0E7] shadow-2xs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'posts' ? 'bg-[#334257] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            Cerita Komunitas ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'reports' ? 'bg-[#548CA8] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            <span>Pengaduan Laporan</span>
            {pendingReportsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#548CA8] font-mono text-[10px] font-bold flex items-center justify-center">
                {pendingReportsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[#476072]">Memuat antrean moderasi...</div>
      ) : activeTab === 'posts' ? (
        /* POSTS LIST */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="admin-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold">
                      {post.categoryCode.toUpperCase()}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : post.status === 'under_review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                    >
                      {post.status.replace('_', ' ').toUpperCase()}
                    </span>

                    <span className="text-xs font-mono text-[#476072]">
                      Penulis: <strong>@{post.authorPseudonym}</strong>
                    </span>

                    {post.piiScrubbed && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-600 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>PII Dimasker</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {post.status !== 'published' && (
                      <button
                        onClick={() => handleUpdateStatus(post.id, 'published')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Setujui &amp; Tayangkan</span>
                      </button>
                    )}

                    {post.status !== 'hidden' && (
                      <button
                        onClick={() => handleUpdateStatus(post.id, 'hidden')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-[#1A202C]">{post.title}</h4>
                  <p className="text-xs text-[#476072] leading-relaxed whitespace-pre-wrap">{post.story}</p>
                </div>

                {post.financialLossEstimate && (
                  <div className="p-3 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between text-xs">
                    <span className="text-[#476072]">Estimasi Kerugian Finansial Korban:</span>
                    <span className="font-mono font-black text-rose-600">{post.financialLossEstimate}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* REPORTS QUEUE */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {reports.map((rep) => (
              <div key={rep.id} className="admin-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#548CA8]"></span>
                    <span className="font-mono text-xs font-bold text-[#1A202C]">Laporan #{rep.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${rep.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {rep.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Alasan: {rep.reason.replace('_', ' ')}
                    </span>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolve')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Selesaikan (Tindak)</span>
                      </button>

                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Abaikan Laporan</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#5E6D7E] block">Target Postingan:</span>
                  <h4 className="text-sm font-bold text-[#1A202C]">{rep.postTitle}</h4>
                  {rep.notes && <p className="text-xs text-[#5E6D7E] italic pt-1">Catatan pelapor: "{rep.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


