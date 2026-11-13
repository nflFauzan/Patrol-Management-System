'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCheck,
  X,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Search,
  RefreshCw,
  Filter,
  Building,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Plus,
  Users,
  ExternalLink,
} from 'lucide-react';
import { approvalApi, rbacApi, sitesApi } from '../field/services/api';
import { Division, SecurityRank, RoleDefinition, PermissionDefinition } from '@patrol/types';
import { useAuth } from '../lib/AuthContext';

export interface PendingCandidate {
  id: string;
  nik: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  division: Division;
  createdAt: string;
  isApproved: boolean;
  isActive: boolean;
}

export const ApprovalQueueView: React.FC = () => {
  const { hasPermission } = useAuth();

  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'rbac'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');

  // Modal States
  const [approveTarget, setApproveTarget] = useState<PendingCandidate | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingCandidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approve Form State
  const [assignedRoleCode, setAssignedRoleCode] = useState<string>('SECURITY_OFFICER');
  const [assignedDivision, setAssignedDivision] = useState<Division>(Division.SECURITY);
  const [assignedSiteId, setAssignedSiteId] = useState<string>('');
  const [assignedRank, setAssignedRank] = useState<SecurityRank>(SecurityRank.ANGGOTA);
  const [gajiPokok, setGajiPokok] = useState<string>('4500000');
  const [tunjangan, setTunjangan] = useState<string>('500000');

  // Reject Form State
  const [rejectReason, setRejectReason] = useState<string>('');

  // New Custom Role Modal State
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [queueData, rolesData, sitesData, permsData] = await Promise.all([
        approvalApi.getQueue().catch(() => []),
        rbacApi.getRoles().catch(() => []),
        sitesApi.getAll().catch(() => []),
        rbacApi.getPermissions().catch(() => []),
      ]);

      setCandidates(Array.isArray(queueData) ? queueData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setSites(Array.isArray(sitesData) ? sitesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);

      if (sitesData && sitesData.length > 0 && !assignedSiteId) {
        setAssignedSiteId(sitesData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data antrean');
    } finally {
      setIsLoading(false);
    }
  }, [assignedSiteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open approve modal prefilling fields
  const handleOpenApprove = (candidate: PendingCandidate) => {
    setApproveTarget(candidate);
    const div = candidate.division || Division.SECURITY;
    setAssignedDivision(div);

    // Map default role to division
    if (div === Division.SECURITY) {
      setAssignedRoleCode('SECURITY_OFFICER');
      setAssignedRank(SecurityRank.ANGGOTA);
    } else if (div === Division.CLEANING) {
      setAssignedRoleCode('CLEANER');
    } else if (div === Division.DRIVER) {
      setAssignedRoleCode('DRIVER');
    } else {
      setAssignedRoleCode('OPS_MANAGER');
    }

    if (sites.length > 0) {
      setAssignedSiteId(sites[0].id);
    }
  };

  // Submit Approval
  const handleConfirmApprove = async () => {
    if (!approveTarget) return;

    // Find role ID from code
    const matchedRole = roles.find(
      (r) => r.code === assignedRoleCode || r.id === assignedRoleCode
    );
    const roleIdToSend = matchedRole ? matchedRole.id : assignedRoleCode;

    setIsSubmitting(true);
    try {
      await approvalApi.approve(approveTarget.id, {
        roleId: roleIdToSend,
        division: assignedDivision,
        siteId: assignedSiteId || (sites[0]?.id ?? '11111111-1111-1111-1111-111111111111'),
        securityRank: assignedDivision === Division.SECURITY ? assignedRank : undefined,
        gajiPokok: Number(gajiPokok.replace(/\D/g, '')) || 0,
        tunjangan: Number(tunjangan.replace(/\D/g, '')) || 0,
      });

      setSuccessToast(`Personil ${approveTarget.fullName} (${approveTarget.username}) berhasil disetujui & diaktifkan.`);
      setApproveTarget(null);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menyetujui personil: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      alert('Alasan penolakan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await approvalApi.reject(rejectTarget.id, {
        reason: rejectReason.trim(),
      });

      setSuccessToast(`Calon personil ${rejectTarget.fullName} telah ditolak.`);
      setRejectTarget(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      alert(`Gagal menolak personil: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      alert('Kode role dan nama role wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rbacApi.createRole({
        code: newRoleCode.trim().toUpperCase(),
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissionIds: selectedPermissionIds,
      });

      setSuccessToast(`Role kustom ${newRoleCode} berhasil dibuat.`);
      setIsNewRoleModalOpen(false);
      setNewRoleCode('');
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissionIds([]);
      await loadData();
    } catch (err: any) {
      alert(`Gagal membuat role: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchDivision = selectedDivision === 'ALL' || c.division === selectedDivision;
      const matchSearch =
        searchTerm === '' ||
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nik.includes(searchTerm);
      return matchDivision && matchSearch;
    });
  }, [candidates, selectedDivision, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-emerald-200 text-xs shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white font-bold px-2 py-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Tabs & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Antrean Pendaftaran</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-400/20 text-blue-200">
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'rbac'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Kelola Hak Akses & Role ({roles.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          {activeTab === 'rbac' && hasPermission('RBAC:MANAGE') && (
            <button
              onClick={() => setIsNewRoleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Role Kustom</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Menunggu Verifikasi</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{candidates.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Calon personil belum diproses</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Fasilitas Site Terhubung</span>
                <Building className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{sites.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Lokasi penempatan aktif</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Definisi Role Sistem</span>
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{roles.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Role otorisasi dinamis</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari NIK, Nama, atau Username..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="ALL">Semua Divisi</option>
                <option value={Division.SECURITY}>Satpam / Security</option>
                <option value={Division.CLEANING}>Cleaning Service</option>
                <option value={Division.DRIVER}>Driver Logistik</option>
                <option value={Division.STAFF}>Operasional / Staff</option>
              </select>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Calon Personil</th>
                    <th className="px-4 py-3.5">NIK (KTP)</th>
                    <th className="px-4 py-3.5">Kontak</th>
                    <th className="px-4 py-3.5">Peminatan Divisi</th>
                    <th className="px-4 py-3.5">Tanggal Daftar</th>
                    <th className="px-4 py-3.5 text-right">Aksi Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                            <span>Memuat antrean verifikasi...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="font-semibold text-slate-400">Tidak ada pendaftaran pending</p>
                            <p className="text-[11px]">Semua permohonan calon personil telah diproses.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-slate-800/40 transition">
                        {/* Personil Info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                              {candidate.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{candidate.fullName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">@{candidate.username}</div>
                            </div>
                          </div>
                        </td>

                        {/* NIK */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                            {candidate.nik}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <a
                              href={`https://wa.me/${candidate.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-emerald-300 underline underline-offset-2"
                            >
                              {candidate.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{candidate.email}</span>
                          </div>
                        </td>

                        {/* Divisi */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              candidate.division === Division.SECURITY
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : candidate.division === Division.CLEANING
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : candidate.division === Division.DRIVER
                                ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {candidate.division}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {new Date(candidate.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenApprove(candidate)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-sm transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectTarget(candidate);
                              setRejectReason('');
                            }}
                            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* RBAC Roles & Permissions Management Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      {role.code}
                    </span>
                    {role.isSystem ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        Sistem
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                        Kustom
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{role.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{role.description || 'Tidak ada deskripsi'}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                    <span>Hak Akses Terpetakan:</span>
                    <span className="text-cyan-400 font-bold">
                      {role.permissions ? role.permissions.length : 0} izin
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">Tidak ada izin spesifik</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPROVE MODAL DIALOG */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Konfirmasi Approval Personil</h3>
                  <p className="text-[11px] text-slate-400">Tetapkan role, fasilitas, dan ketentuan kerja</p>
                </div>
              </div>
              <button
                onClick={() => setApproveTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            {/* Candidate Summary Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nama Calon:</span>
                <span className="font-bold text-white">{approveTarget.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">NIK (KTP):</span>
                <span className="font-mono text-cyan-300">{approveTarget.nik}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="font-mono text-slate-200">@{approveTarget.username}</span>
              </div>
            </div>

            {/* Assignment Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Pilih Role / Hak Akses Sistem
                </label>
                <select
                  value={assignedRoleCode}
                  onChange={(e) => setAssignedRoleCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Divisi Penempatan</label>
                  <select
                    value={assignedDivision}
                    onChange={(e) => setAssignedDivision(e.target.value as Division)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={Division.SECURITY}>Satpam / Security</option>
                    <option value={Division.CLEANING}>Cleaning Service</option>
                    <option value={Division.DRIVER}>Driver Logistik</option>
                    <option value={Division.STAFF}>Operasional / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fasilitas Site Utama</label>
                  <select
                    value={assignedSiteId}
                    onChange={(e) => setAssignedSiteId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {assignedDivision === Division.SECURITY && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tingkat Jabatan Satpam</label>
                  <select
                    value={assignedRank}
                    onChange={(e) => setAssignedRank(e.target.value as SecurityRank)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={SecurityRank.ANGGOTA}>Anggota Petugas</option>
                    <option value={SecurityRank.KOMANDAN}>Komandan Regu (Danru)</option>
                    <option value={SecurityRank.CHIEF}>Chief Security</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="text"
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tunjangan (Rp)</label>
                  <input
                    type="text"
                    value={tunjangan}
                    onChange={(e) => setTunjangan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui & Aktifkan Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL DIALOG */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Tolak Pendaftaran Personil</h3>
                  <p className="text-[11px] text-slate-400">Berikan catatan alasan penolakan</p>
                </div>
              </div>
              <button
                onClick={() => setRejectTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan menolak pendaftaran atas nama <strong className="text-white">{rejectTarget.fullName}</strong>. Akun ini tidak akan dapat login ke dalam sistem.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Alasan Penolakan (Wajib Diisi)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Contoh: NIK KTP tidak valid / Tidak lulus verifikasi berkas fisik..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  'NIK KTP tidak valid',
                  'Tidak lolos seleksi fisik',
                  'Kredensial duplikat',
                  'Dokumen tidak lengkap',
                ].map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setRejectReason(template)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    + {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50 transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menolak...</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Konfirmasi Penolakan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOM ROLE MODAL */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Buat Role Kustom Baru</h3>
                  <p className="text-[11px] text-slate-400">Petakan izin akses secara fleksibel</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewRoleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Kode Role (Huruf Besar & Garis Bawah)
                </label>
                <input
                  type="text"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value.toUpperCase().replace(/[^A-Z_]/g, ''))}
                  required
                  placeholder="Contoh: AUDITOR_INTERNAL"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nama Tampilan Role</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                  placeholder="Contoh: Auditor Mutu & Kepatuhan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deskripsi Ringkas</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Tanggung jawab dan batasan akses..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Pilih Hak Akses (Permissions)
                </label>
                <div className="max-h-40 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                  {permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center space-x-2 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissionIds([...selectedPermissionIds, perm.id]);
                          } else {
                            setSelectedPermissionIds(
                              selectedPermissionIds.filter((id) => id !== perm.id)
                            );
                          }
                        }}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-mono text-[10px] text-cyan-300">{perm.code}</span>
                      <span className="text-[11px] text-slate-400">— {perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Role Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
