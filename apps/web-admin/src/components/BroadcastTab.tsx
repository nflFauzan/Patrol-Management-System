'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Pencil, 
  Search, 
  Ban, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { BroadcastMessage } from '@patrol/types';
import { useData } from '../lib/DataContext';

interface BroadcastTabProps {
  selectedSiteId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const BroadcastTab: React.FC<BroadcastTabProps> = ({ selectedSiteId }) => {
  const { sites } = useData();

  // Data states
  const [history, setHistory] = useState<BroadcastMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Flash message (.pesan matching patroli.site)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Tambah (#exampleModalCenter)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newIsiPesan, setNewIsiPesan] = useState<string>('');
  const [newLokasiArea, setNewLokasiArea] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal Edit (#myModalx)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BroadcastMessage | null>(null);
  const [editIsiPesan, setEditIsiPesan] = useState<string>('');
  const [editLokasiArea, setEditLokasiArea] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal Hapus (hapus-pesan.php confirmation)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Site options list matching patroli.site 100%
  const siteList = useMemo(() => {
    return [
      { name: 'kantor pusat', label: 'kantor pusat', id: '11111111-1111-1111-1111-111111111111' },
      { name: 'pabrik bekasi', label: 'pabrik bekasi', id: '22222222-2222-2222-2222-222222222222' },
      { name: 'gudang cakung', label: 'gudang cakung', id: '33333333-3333-3333-3333-333333333333' },
      { name: 'pool kendaraan', label: 'pool kendaraan', id: '44444444-4444-4444-4444-444444444444' },
    ];
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedSiteId]);

  // Auto-dismiss alert after 15 seconds matching patroli.site setTimeout
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => {
        setStatusMsg(null);
      }, 15000);
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

  // Submit Tambah Pesan Siaran (100% Parity with insert-info.php)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsiPesan.trim() || !newLokasiArea) return;

    setIsSubmitting(true);
    try {
      // Find matching siteId from siteList
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
          content: newIsiPesan.trim().toLowerCase(), // patroli.site backend normalizes to lowercase
          priority: 'NORMAL',
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Data pengumuman berhasil ditambah' });
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

  // Open Edit Modal (100% Parity with pesan_edit.php)
  const openEditModal = (item: BroadcastMessage) => {
    setEditingItem(item);
    setEditIsiPesan(item.content || item.message || '');
    // Find site name
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

  // Submit Update Pesan Siaran (100% Parity with pesan_update.php)
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
          content: editIsiPesan.trim().toLowerCase(),
          priority: 'NORMAL',
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Data pengumuman berhasil diubah' });
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchHistory();
      } else {
        throw new Error('Gagal mengubah data pesan siaran');
      }
    } catch (err: any) {
      alert(`Gagal update: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Delete Pesan Siaran (100% Parity with hapus-pesan.php?kd_pesan=...)
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
        setStatusMsg({ type: 'success', text: 'Data pengumuman berhasil dihapus' });
        setDeletingId(null);
        fetchHistory();
      } else {
        throw new Error('Gagal menghapus pesan siaran');
      }
    } catch (err: any) {
      alert(`Gagal hapus: ${err.message}`);
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
    <div className="content font-sans text-uppercase">
      <div className="container-fluid max-w-full p-0">
        <div className="row">
          <div className="col-12 w-full space-y-3">

            {/* Flash Message (.pesan matching patroli.site with auto-fade) */}
            {statusMsg && (
              <div 
                className={`pesan alert alert-dismissible p-3 rounded-lg flex items-center justify-between text-white shadow-md transition-all duration-300 ${
                  statusMsg.type === 'success' ? 'bg-[#28a745] border border-green-600' : 'bg-[#dc3545] border border-red-600'
                }`}
                role="alert"
              >
                <div className="flex items-center space-x-2">
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <h5 className="m-0 text-xs md:text-sm font-bold tracking-wide">
                    {statusMsg.text}
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMsg(null)}
                  className="text-white hover:text-slate-200 p-1 text-lg leading-none"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Card Header Alert (100% Parity with patroli.site card-header alert bg-info) */}
            <div className="card-header alert bg-[#17a2b8] p-3 rounded-t-xl flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-dark bg-[#343a40] hover:bg-[#23272b] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition active:scale-95 shadow-xs"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                <Megaphone className="w-4 h-4 text-white" />
                <small className="tracking-wider">TAMBAH PESAN SIARAN</small>
              </button>

              <button
                type="button"
                onClick={fetchHistory}
                disabled={isLoading}
                className="text-white hover:text-slate-200 px-2 py-1 rounded text-xs flex items-center space-x-1"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <small className="hidden sm:inline">REFRESH</small>
              </button>
            </div>

            {/* Card Body Border (100% Parity with patroli.site card-body border border-info rounded) */}
            <div className="card-body bg-white border border-[#17a2b8] rounded-b-xl shadow-xs p-4 -mt-3">
              <div id="pesan_wrapper" className="dataTables_wrapper space-y-4">
                
                {/* DataTables Controls: Show entries & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
                  <div className="dataTables_length flex items-center space-x-2">
                    <label className="flex items-center space-x-1 m-0">
                      <span>Show</span>
                      <select
                        name="pesan_length"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#17a2b8]"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={1000}>1,000</option>
                      </select>
                      <span>entries</span>
                    </label>
                  </div>

                  <div className="dataTables_filter flex items-center space-x-2 w-full sm:w-auto">
                    <label className="flex items-center space-x-1 m-0 w-full sm:w-auto">
                      <span>Search:</span>
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder=""
                        className="border border-slate-300 rounded px-2 py-1 text-xs w-full sm:w-48 bg-white focus:outline-none focus:border-[#17a2b8]"
                      />
                    </label>
                  </div>
                </div>

                {/* Table (100% Parity with table-info bg-info dataTable) */}
                <div className="overflow-x-auto rounded-lg border border-[#17a2b8]/30">
                  <table
                    id="pesan"
                    className="w-full text-xs text-left border-collapse bg-white"
                    style={{ width: '100%' }}
                  >
                    <thead>
                      <tr className="bg-[#17a2b8] text-white text-center font-bold text-[11px] tracking-wider uppercase">
                        <th className="py-2.5 px-3 border-r border-[#17a2b8]/40 w-3/5 text-center">
                          ISI PESAN SIARAN
                        </th>
                        <th className="py-2.5 px-3 border-r border-[#17a2b8]/40 w-1/5 text-center">
                          LOKASI PESAN SIARAN
                        </th>
                        <th className="py-2.5 px-3 w-1/5 text-center">
                          AKSI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                            Tidak ada data pesan siaran tersedia
                          </td>
                        </tr>
                      ) : (
                        paginatedItems.map((b, idx) => (
                          <tr 
                            key={b.id} 
                            className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/80'}
                          >
                            {/* Column 1: ISI PESAN SIARAN (lowercase paragraph matching patroli.site) */}
                            <td className="py-2.5 px-3 align-middle">
                              <small>
                                <p className="text-center text-slate-600 m-0 leading-relaxed font-normal">
                                  {b.content || b.message}
                                </p>
                              </small>
                            </td>

                            {/* Column 2: LOKASI PESAN SIARAN (green text-success matching patroli.site) */}
                            <td className="py-2.5 px-3 align-middle text-center">
                              <small>
                                <p className="text-center text-[#28a745] font-bold m-0 uppercase">
                                  {b.siteName || (siteList.find(s => s.id === b.siteId)?.name) || 'KANTOR PUSAT'}
                                </p>
                              </small>
                            </td>

                            {/* Column 3: AKSI (btn-group btn-group-sm matching patroli.site) */}
                            <td className="py-2.5 px-3 align-middle text-center">
                              <center>
                                <div className="btn-group btn-group-sm inline-flex items-center justify-center space-x-1" role="group">
                                  {/* Hapus button (btn-danger matching hapus-pesan.php) */}
                                  <button
                                    type="button"
                                    onClick={() => setDeletingId(b.id)}
                                    className="btn btn-danger px-2.5 py-1 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-xs inline-flex items-center space-x-1 font-semibold transition active:scale-95"
                                    title="Hapus Pesan Siaran"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <small className="capitalize">Hapus</small>
                                  </button>

                                  {/* Edit button (pesan-record btn-info matching pesan_edit.php) */}
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(b)}
                                    className="pesan-record btn btn-info px-2.5 py-1 bg-[#17a2b8] hover:bg-[#138496] text-white rounded text-xs inline-flex items-center space-x-1 font-semibold transition active:scale-95"
                                    title="Edit Pesan Siaran"
                                    data-id={b.id}
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <small className="capitalize">Edit</small>
                                  </button>
                                </div>
                              </center>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* DataTables Pagination & Info footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 pt-2">
                  <div className="dataTables_info">
                    {filteredItems.length === 0 ? (
                      'Showing 0 to 0 of 0 entries'
                    ) : (
                      `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredItems.length)} of ${filteredItems.length} entries`
                    )}
                  </div>

                  <div className="dataTables_paginate inline-flex rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 border-r border-slate-200 font-medium transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 font-medium transition border-r border-slate-200 last:border-r-0 ${
                          currentPage === page
                            ? 'bg-[#17a2b8] text-white'
                            : 'bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-medium transition"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL TAMBAH PESAN SIARAN (#exampleModalCenter)
          100% PARITY DENGAN patroli.site insert-info.php
          ======================================================== */}
      {isAddModalOpen && (
        <div 
          className="modal fade show fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          id="exampleModalCenter" 
          tabIndex={-1} 
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="modal-content">
              {/* Modal Header (bg-info text-light) */}
              <div className="modal-header bg-[#17a2b8] text-white p-3.5 flex items-center justify-between font-bold text-sm tracking-wide">
                <span>Form Pesan Siaran</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="close text-white hover:text-slate-200 text-xl font-bold p-1 leading-none"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                <form onSubmit={handleAddSubmit} method="post" className="space-y-4">
                  {/* Form Group 1: isi_pesan */}
                  <div className="form-group" title="Input informasi/berita/pesan untuk personel">
                    <textarea 
                      className="form-control border border-[#17a2b8] rounded-lg p-3 text-xs w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17a2b8] leading-relaxed" 
                      id="isi_pesan" 
                      required 
                      name="isi_pesan" 
                      rows={4} 
                      placeholder="Tulis pengumuman / informasi pesan siaran"
                      value={newIsiPesan}
                      onChange={(e) => setNewIsiPesan(e.target.value)}
                    />
                  </div>

                  {/* Form Group 2: lokasi_area */}
                  <div className="form-group" title="Pilih Lokasi/site informasi/berita/pesan akan dikirim">
                    <select 
                      id="lokasi_area" 
                      name="lokasi_area" 
                      required 
                      value={newLokasiArea}
                      onChange={(e) => setNewLokasiArea(e.target.value)}
                      className="custom-select text-uppercase border border-[#17a2b8] rounded-lg p-2.5 text-xs w-full bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                    >
                      <option value="">Pilih Area / Site</option>
                      {siteList.map((s) => (
                        <option key={s.name} value={s.name}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Modal Footer (Batal & Kirim Pesan) */}
                  <div className="modal-footer pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddModalOpen(false)}
                      className="btn btn-info bg-[#17a2b8] hover:bg-[#138496] text-white px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Batal</span>
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn btn-primary bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition active:scale-95"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Kirim Pesan</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL EDIT PESAN SIARAN (#myModalx)
          100% PARITY DENGAN patroli.site pesan_edit.php / pesan_update.php
          ======================================================== */}
      {isEditModalOpen && editingItem && (
        <div 
          className="modal fade show fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          id="myModalx" 
          tabIndex={-1} 
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="modal-content">
              {/* Modal Header (bg-info text-light) */}
              <div className="modal-header bg-[#17a2b8] text-white p-3.5 flex items-center justify-between font-bold text-sm tracking-wide">
                <h4 className="modal-title m-0 text-sm font-bold tracking-wide" id="myModalLabelx">
                  Form Edit Pesan Siaran
                </h4>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="close text-white hover:text-slate-200 text-xl font-bold p-1 leading-none"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {/* Modal Body (.modal-body-pesan matching pesan_edit.php exact output) */}
              <div className="modal-body-pesan p-4">
                <form onSubmit={handleUpdateSubmit} method="post" className="space-y-4">
                  <small>
                    <div className="card-body p-0 space-y-4">
                      {/* Form Group 1: ISI PESAN INFORMASI SEKARANG */}
                      <div className="form-group space-y-1">
                        <label className="text-xs font-bold text-slate-700 tracking-wider">
                          ISI PESAN INFORMASI SEKARANG
                        </label>
                        <textarea 
                          className="form-control border border-slate-300 rounded-lg p-3 text-xs w-full text-slate-800 focus:outline-none focus:border-[#17a2b8] leading-relaxed" 
                          id="isi_pesan" 
                          required 
                          name="isi_pesan" 
                          rows={4}
                          value={editIsiPesan}
                          onChange={(e) => setEditIsiPesan(e.target.value)}
                        />
                        <input type="hidden" value={editingItem.id} name="kd_pesan" />
                      </div>

                      {/* Form Group 2: LOKASI PESAN / INFORMASI SEKARANG */}
                      <div className="form-group space-y-1">
                        <label className="text-xs font-bold text-slate-700 tracking-wider">
                          LOKASI PESAN / INFORMASI SEKARANG
                        </label>
                        <select 
                          id="lokasi_area" 
                          name="lokasi_area" 
                          value={editLokasiArea}
                          onChange={(e) => setEditLokasiArea(e.target.value)}
                          className="form-control select2 border border-slate-300 rounded-lg p-2.5 text-xs w-full bg-white text-slate-800 focus:outline-none focus:border-[#17a2b8] text-uppercase"
                        >
                          {siteList.map((s) => (
                            <option key={s.name} value={s.name}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Modal Footer (Batal & Simpan) */}
                      <div className="modal-footer pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                        <button 
                          type="button" 
                          onClick={() => setIsEditModalOpen(false)}
                          className="btn btn-secondary bg-[#6c757d] hover:bg-[#5a6268] text-white px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Batal</span>
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUpdating}
                          className="btn btn-primary bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition active:scale-95"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  </small>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL KONFIRMASI HAPUS (hapus-pesan.php?kd_pesan=...)
          ======================================================== */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 text-[#dc3545]">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-[#dc3545]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wide">Konfirmasi Hapus</h4>
                <p className="text-xs text-slate-500 font-normal">Hapus Pesan Siaran</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Apakah Anda yakin ingin menghapus data pesan siaran ini? Tindakan ini bersifat permanen seperti di <span className="font-mono text-rose-600">hapus-pesan.php</span>.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs active:scale-95"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
