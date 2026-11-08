import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AuditLogItem } from '../../types/admin';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await adminService.getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchSev = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* HEADER (FROSTED GLASS PANEL) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A202C] tracking-tight">Log Audit &amp; Jejak Rekam Sistem</h2>
          <p className="text-xs text-[#476072] mt-0.5">
            Catatan kekal (*immutable audit trail*) seluruh aktivitas operasional, perubahan konfigurasi, dan deteksi ancaman.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/70 border border-[#D8E0E7]">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${filterSeverity === 'all' ? 'bg-[#334257] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            Semua ({logs.length})
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${filterSeverity === 'info' ? 'bg-[#334257] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            Info ({logs.filter((l) => l.severity === 'info').length})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${filterSeverity === 'warning' ? 'bg-[#548CA8] text-white shadow-2xs' : 'text-[#476072] hover:text-[#1A202C]'
              }`}
          >
            Warning ({logs.filter((l) => l.severity === 'warning').length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#476072] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aksi, target, detail log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8E0E7] bg-white/80 text-xs text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="glass-panel rounded-3xl overflow-hidden p-6 sm:p-8">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#476072]">Memuat audit log...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#476072]">Tidak ada log audit yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEEEEE] text-[#476072] font-mono uppercase text-[10px] border-b border-[#D8E0E7]">
                <tr>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aksi (Action)</th>
                  <th className="py-3 px-4">Target Komponen</th>
                  <th className="py-3 px-4">Rincian Perubahan / Temuan</th>
                  <th className="py-3 px-4">Aktor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E0E7]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${log.severity === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.severity === 'warning'
                              ? 'bg-[#548CA8]/15 text-[#334257] border border-[#548CA8]/30 font-bold'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#476072] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A202C]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#334257]">
                      {log.target}
                    </td>
                    <td className="py-3.5 px-4 text-[#476072] max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {log.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


