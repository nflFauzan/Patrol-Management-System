'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Pencil, 
  Search, 
  RefreshCw, 
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Radio,
  Building2,
  Send
} from 'lucide-react';
import { BroadcastMessage } from '@patrol/types';
import { useData } from '../lib/DataContext';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

interface BroadcastTabProps {
  selectedSiteId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const BroadcastTab: React.FC<BroadcastTabProps> = ({ selectedSiteId }) => {
  const { sites } = useData();

  // Data states
  const [history, setHistory] = useState<BroadcastMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Flash message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newIsiPesan, setNewIsiPesan] = useState<string>('');
  const [newLokasiArea, setNewLokasiArea] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BroadcastMessage | null>(null);
  const [editIsiPesan, setEditIsiPesan] = useState<string>('');
  const [editLokasiArea, setEditLokasiArea] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal Hapus
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Site options list
  const siteList = useMemo(() => {
    if (sites && sites.length > 0) {
      return sites.map((s) => ({
        name: s.name.toLowerCase(),
        label: s.name,
        id: s.id,
      }));
    }
    return [
      { name: 'kantor pusat', label: 'Kantor Pusat', id: '11111111-1111-1111-1111-111111111111' },
      { name: 'pabrik bekasi', label: 'Pabrik Bekasi', id: '22222222-2222-2222-2222-222222222222' },
      { name: 'gudang cakung', label: 'Gudang Cakung', id: '33333333-3333-3333-3333-333333333333' },
      { name: 'pool kendaraan', label: 'Pool Kendaraan', id: '44444444-4444-4444-4444-444444444444' },
    ];
  }, [sites]);

  useEffect(() => {
    fetchHistory();
  }, [selectedSiteId]);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => {
        setStatusMsg(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE}/broadcast/history`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (e) {
      console.warn('Gagal memuat pesan siaran dari backend, menggunakan data lokal:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Tambah Pesan Siaran
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsiPesan.trim() || !newLokasiArea) return;

    setIsSubmitting(true);
    try {
      const matchedSite = siteList.find(s => s.name.toLowerCase() === newLokasiArea.toLowerCase());
      const siteId = matchedSite ? matchedSite.id : null;

      const res = await fetch(`${API_BASE}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
        body: JSON.stringify({
          siteId,
          title: `Pengumuman ${newLokasiArea.toUpperCase()}`,
          content: newIsiPesan.trim(),
          priority: 'NORMAL',
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Data pesan siaran berhasil ditambahkan' });
        setNewIsiPesan('');
        setNewLokasiArea('');
        setIsAddModalOpen(false);
        fetchHistory();
      } else {
        throw new Error('Gagal mengirim pesan siaran');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal mengirim pesan siaran' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: BroadcastMessage) => {
    setEditingItem(item);
    setEditIsiPesan(item.content || item.message || '');
    let foundName = 'kantor pusat';
    if (item.siteName) {
      foundName = item.siteName.toLowerCase();
    } else if (item.siteId) {
      const match = siteList.find(s => s.id === item.siteId);
      if (match) foundName = match.name;
    }
    setEditLokasiArea(foundName);
    setIsEditModalOpen(true);
  };

  // Submit Update Pesan Siaran
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editIsiPesan.trim()) return;

    setIsUpdating(true);
    try {
      const matchedSite = siteList.find(s => s.name.toLowerCase() === editLokasiArea.toLowerCase());
      const siteId = matchedSite ? matchedSite.id : null;

      const res = await fetch(`${API_BASE}/broadcast/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
        body: JSON.stringify({
          siteId,
          content: editIsiPesan.trim(),
          priority: 'NORMAL',
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Pesan siaran berhasil diperbarui' });
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchHistory();
      } else {
        throw new Error('Gagal mengubah data pesan siaran');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal update pesan siaran' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Delete Pesan Siaran
  const handleDeleteSubmit = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/broadcast/${deletingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('patrol_auth_token') || ''}`,
        },
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Pesan siaran berhasil dihapus' });
        setDeletingId(null);
        fetchHistory();
      } else {
        throw new Error('Gagal menghapus pesan siaran');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal hapus pesan siaran' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and Paginated Items
  const filteredItems = useMemo(() => {
    return history.filter((b) => {
      const search = searchTerm.toLowerCase();
      const content = (b.content || b.message || '').toLowerCase();
      const siteName = (b.siteName || '').toLowerCase();
      return content.includes(search) || siteName.includes(search);
    });
  }, [history, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Toast / Status Alert */}
      {statusMsg && (
        <div 
          className={`p-4 rounded-xl flex items-center justify-between shadow-soft-sm transition-all animate-in fade-in duration-200 border ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50/90 border-rose-200 text-rose-800'
          }`}
          role="alert"
        >
          <div className="flex items-center space-x-3">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-semibold">
              {statusMsg.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Surface Card */}
      <SurfaceCard className="p-6">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
                <Megaphone className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Pesan Siaran & Pengumuman
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kirimkan pengumuman serentak kepada seluruh personel di lapangan per lokasi / site
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <SkeuomorphicButton
              variant="secondary"
              onClick={fetchHistory}
              disabled={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </SkeuomorphicButton>

            <SkeuomorphicButton
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Megaphone className="w-3.5 h-3.5" />}
            >
              + Tambah Pesan Siaran
            </SkeuomorphicButton>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-4">
          <div className="w-full sm:w-80">
            <InsetInput
              icon={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Cari isi pesan siaran atau lokasi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500"
            >
              <option value={5}>5 baris</option>
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={50}>50 baris</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-4 text-left w-3/5">
                  Isi Pesan Siaran
                </th>
                <th className="py-3 px-4 text-center w-1/5">
                  Lokasi / Site Target
                </th>
                <th className="py-3 px-4 text-center w-1/5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                    Memuat data pesan siaran...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    Tidak ada data pesan siaran yang ditemukan
                  </td>
                </tr>
              ) : (
                paginatedItems.map((b) => (
                  <tr 
                    key={b.id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Content Column */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="text-slate-800 text-xs leading-relaxed font-normal whitespace-pre-line">
                        {b.content || b.message}
                      </p>
                      {b.createdAt && (
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">
                          Dibuat: {new Date(b.createdAt).toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>

                    {/* Site Target Column */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <Building2 className="w-3 h-3 text-sky-500" />
                        <span className="capitalize">
                          {b.siteName || (siteList.find(s => s.id === b.siteId)?.label) || 'Semua Site'}
                        </span>
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <div className="inline-flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50 transition border border-transparent hover:border-sky-200 active:scale-95"
                          title="Edit Pesan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(b.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 active:scale-95"
                          title="Hapus Pesan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-4">
          <div>
            {filteredItems.length === 0 ? (
              'Menampilkan 0 data'
            ) : (
              `Menampilkan ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredItems.length)} dari ${filteredItems.length} pesan siaran`
            )}
          </div>

          <div className="inline-flex items-center space-x-1 rounded-lg border border-slate-200/80 bg-white p-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 text-xs rounded font-medium transition ${
                  currentPage === page
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1 text-xs rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </SurfaceCard>

      {/* ========================================================
          MODAL TAMBAH PESAN SIARAN
          ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-soft-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  Buat Pesan Siaran Baru
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Isi Pesan Siaran <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 leading-relaxed transition"
                  required 
                  rows={4} 
                  placeholder="Tuliskan pengumuman atau instruksi operasional untuk personel lapangan..."
                  value={newIsiPesan}
                  onChange={(e) => setNewIsiPesan(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Lokasi / Site Sasaran <span className="text-rose-500">*</span>
                </label>
                <select 
                  required 
                  value={newLokasiArea}
                  onChange={(e) => setNewLokasiArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                >
                  <option value="">-- Pilih Lokasi / Site --</option>
                  {siteList.map((s) => (
                    <option key={s.name} value={s.name}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <SkeuomorphicButton 
                  type="button" 
                  variant="secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton 
                  type="submit" 
                  variant="primary"
                  disabled={isSubmitting}
                  icon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Siaran'}
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL EDIT PESAN SIARAN
          ======================================================== */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-soft-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  Edit Pesan Siaran
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Isi Pesan Siaran <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 leading-relaxed transition"
                  required 
                  rows={4}
                  value={editIsiPesan}
                  onChange={(e) => setEditIsiPesan(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Lokasi / Site Sasaran <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={editLokasiArea}
                  onChange={(e) => setEditLokasiArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                >
                  {siteList.map((s) => (
                    <option key={s.name} value={s.name}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <SkeuomorphicButton 
                  type="button" 
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton 
                  type="submit" 
                  variant="primary"
                  disabled={isUpdating}
                  icon={isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL KONFIRMASI HAPUS
          ======================================================== */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200/80 shadow-soft-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Hapus Pesan Siaran</h4>
                <p className="text-xs text-slate-500">Konfirmasi Penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pesan siaran ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <SkeuomorphicButton
                variant="secondary"
                onClick={() => setDeletingId(null)}
              >
                Batal
              </SkeuomorphicButton>
              <SkeuomorphicButton
                variant="danger"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                icon={isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </SkeuomorphicButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
