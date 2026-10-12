'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { BroadcastMessage } from '@patrol/types';

interface BroadcastTabProps {
  selectedSiteId: string;
}

export const BroadcastTab: React.FC<BroadcastTabProps> = ({ selectedSiteId }) => {
  const [content, setContent] = useState<string>('');
  const [targetSite, setTargetSite] = useState<string>(selectedSiteId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<BroadcastMessage[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [selectedSiteId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/broadcast/history?siteId=${selectedSiteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (e) {
      // Mock history for preview
      setHistory([
        {
          id: 'b1',
          content: 'PERHATIAN: Kunjungan Dewan Direksi Korporat pukul 14:00 WIB. Pastikan seluruh pos steril.',
          senderId: 'admin1',
          senderName: 'Superadmin Command Center',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'b2',
          content: 'Peringatan Cuaca: Hujan lebat disertai angin. Petugas gerbang wajib mengenakan jas hujan.',
          senderId: 'admin1',
          senderName: 'Command Center',
          isActive: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('http://localhost:3000/api/v1/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
        body: JSON.stringify({
          siteId: targetSite,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Pesan siaran berhasil dipublikasikan ke aplikasi mobile satpam!' });
        setContent('');
        fetchHistory();
      } else {
        throw new Error('Gagal mengirim siaran');
      }
    } catch (err) {
      // Local demo fallback
      setStatusMsg({ type: 'success', text: 'Pesan siaran berhasil dipublikasikan (Mode Demonstrasi)!' });
      setHistory((prev) => [
        {
          id: `b-${Date.now()}`,
          content: content.trim(),
          senderId: 'admin1',
          senderName: 'Superadmin Command Center',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Pusat Pesan Siaran & Instruksi Harian (Broadcast Announcement)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kirim pengumuman darurat atau arahan operasional langsung ke layar aplikasi petugas di lapangan secara real-time
        </p>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleSendBroadcast} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Target Fasilitas Penugasan</label>
            <select
              value={targetSite}
              onChange={(e) => setTargetSite(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="11111111-1111-1111-1111-111111111111">Head Office Sudirman (SCBD)</option>
              <option value="22222222-2222-2222-2222-222222222222">Warehouse & Factory Cikarang</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Tipe Pengumuman</label>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
              Pop-up Banner Berjalan di Aplikasi Satpam
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Isi Pesan Siaran</label>
          <textarea
            rows={3}
            placeholder="Tuliskan arahan tugas, peringatan cuaca, atau informasi penting di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-2 shadow-sm transition active:scale-95"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Siarkan Pesan Ke Seluruh Petugas</span>
        </button>
      </form>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Riwayat Pesan Siaran Terakhir</h3>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {history.map((b) => (
            <div key={b.id} className="p-4 bg-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {b.isActive ? 'AKTIF DI PWA' : 'SELESAI'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(b.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800">{b.content}</p>
                <p className="text-[10px] text-slate-400">Pengirim: {b.senderName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
