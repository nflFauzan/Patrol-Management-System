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
  ChevronDown,
} from 'lucide-react';
import { approvalApi, rbacApi, sitesApi } from '../lib/api';
import { Division, SecurityRank, RoleDefinition, PermissionDefinition } from '@patrol/types';
import { useAuth } from '../lib/AuthContext';
import { SurfaceCard } from './ui/SurfaceCard';
import { SkeuomorphicButton } from './ui/SkeuomorphicButton';
import { InsetInput } from './ui/InsetInput';
import { StatusBadge } from './ui/StatusBadge';

export interface PendingCandidate {
  id: string;
  nik: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  division: Division;
  requestedRole?: string | null;
  requestedDivision?: string | null;
  createdAt: string;
  isApproved: boolean;
  isActive: boolean;
}

export const ApprovalQueueView: React.FC<{ defaultTab?: 'queue' | 'rbac' }> = ({ defaultTab = 'queue' }) => {
  const { hasPermission } = useAuth();

  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'rbac'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');

  // Modal States
  const [approveTarget, setApproveTarget] = useState<PendingCandidate | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingCandidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approve Form State
  const [assignedRoleId, setAssignedRoleId] = useState<string>('');
  const [assignedDivision, setAssignedDivision] = useState<Division>(Division.SECURITY);
  const [assignedSiteId, setAssignedSiteId] = useState<string>('');
  const [assignedRank, setAssignedRank] = useState<SecurityRank>(SecurityRank.ANGGOTA);
  const [gajiPokok, setGajiPokok] = useState<string>('4500000');
  const [tunjangan, setTunjangan] = useState<string>('500000');

  // Reject Form State
  const [rejectReason, setRejectReason] = useState<string>('');

  // New / Edit Role Modal State
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
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
      setError(err.message || 'Gagal memuat data persetujuan & RBAC.');
    } finally {
      setIsLoading(false);
    }
  }, [assignedSiteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open approve modal & prefill defaults
  const handleOpenApprove = (candidate: PendingCandidate) => {
    setApproveTarget(candidate);

    // Check if candidate selected a requested division during registration
    const targetDivision = (candidate.requestedDivision as Division) || candidate.division;
    setAssignedDivision(targetDivision);

    // Prefer candidate's requested role if valid, else find role matching division
    let matchedRole: RoleDefinition | undefined;
    if (candidate.requestedRole) {
      matchedRole = roles.find(
        (r) => r.code === candidate.requestedRole || r.name.toLowerCase() === candidate.requestedRole?.toLowerCase()
      );
    }
    if (!matchedRole) {
      matchedRole = roles.find(
        (r) => r.code.toLowerCase().includes(targetDivision.toLowerCase())
      ) || roles[0];
    }

    if (matchedRole) {
      setAssignedRoleId(matchedRole.id);
    }

    if (targetDivision === Division.CLEANING) {
      setGajiPokok('4200000');
      setTunjangan('400000');
    } else if (targetDivision === Division.DRIVER) {
      setGajiPokok('4500000');
      setTunjangan('500000');
    } else if (targetDivision === Division.STAFF) {
      setGajiPokok('4800000');
      setTunjangan('600000');
    } else {
      setAssignedRank(SecurityRank.ANGGOTA);
      setGajiPokok('4500000');
      setTunjangan('500000');
    }

    if (sites.length > 0 && !assignedSiteId) {
      setAssignedSiteId(sites[0].id);
    }
  };

  // Submit approval
  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    setIsSubmitting(true);
    try {
      await approvalApi.approve(approveTarget.id, {
        roleId: assignedRoleId || roles[0]?.id || '11111111-1111-1111-1111-111111111111',
        division: assignedDivision,
        siteId: assignedSiteId || (sites[0]?.id ?? '11111111-1111-1111-1111-111111111111'),
        securityRank: assignedDivision === Division.SECURITY ? assignedRank : undefined,
        gajiPokok: Number(gajiPokok) || 4500000,
        tunjangan: Number(tunjangan) || 500000,
      });

      setSuccessToast(`Personil ${approveTarget.fullName} berhasil disetujui & diaktifkan.`);
      setApproveTarget(null);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menyetujui akun: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit rejection
  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await approvalApi.reject(rejectTarget.id, { reason: rejectReason.trim() });
      setSuccessToast(`Permohonan ${rejectTarget.fullName} ditolak.`);
      setRejectTarget(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      alert(`Gagal menolak akun: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal to create a new role
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setNewRoleCode('');
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPermissionIds([]);
    setIsNewRoleModalOpen(true);
  };

  // Open modal to edit an existing role
  const handleOpenEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setNewRoleCode(role.code);
    setNewRoleName(role.name);
    setNewRoleDesc(role.description || '');
    setSelectedPermissionIds(role.permissions || []);
    setIsNewRoleModalOpen(true);
  };

  // Create or Update role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      alert('Nama role wajib diisi!');
      return;
    }
    if (!editingRole && !newRoleCode.trim()) {
      alert('Kode role wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        await rbacApi.updateRole(editingRole.id, {
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
          permissions: selectedPermissionIds,
        });
        setSuccessToast(`Role ${editingRole.code} berhasil diperbarui.`);
      } else {
        await rbacApi.createRole({
          code: newRoleCode.trim().toUpperCase(),
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
          permissions: selectedPermissionIds,
        });
        setSuccessToast(`Role kustom ${newRoleCode.trim().toUpperCase()} berhasil dibuat.`);
      }

      setIsNewRoleModalOpen(false);
      setEditingRole(null);
      setNewRoleCode('');
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissionIds([]);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan role: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deactivate custom role
  const handleDeactivateRole = async (role: RoleDefinition) => {
    if (role.isSystem) {
      alert('Role sistem permanen tidak dapat dinonaktifkan.');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan role "${role.name}" (${role.code})?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await rbacApi.deactivateRole(role.id);
      setSuccessToast(`Role ${role.code} berhasil dinonaktifkan.`);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menonaktifkan role: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle permission in role modal
  const handleTogglePermission = (permCode: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permCode) ? prev.filter((p) => p !== permCode) : [...prev, permCode]
    );
  };

  // Select all or clear all permissions
  const handleToggleAllPermissions = () => {
    if (selectedPermissionIds.length === permissions.length) {
      setSelectedPermissionIds([]);
    } else {
      setSelectedPermissionIds(permissions.map((p) => p.code));
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
    <div className="space-y-6 font-sans select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1 font-bold text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Tabs & Quick Actions */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Persetujuan Akun & Manajemen RBAC
            </h1>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Verifikasi pendaftaran mandiri dan konfigurasi perizinan akses sistem
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'queue'
                ? 'bg-sky-600 text-white shadow-skeuo-button-primary'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Antrean Pendaftaran ({candidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'rbac'
                ? 'bg-sky-600 text-white shadow-skeuo-button-primary'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Hak Akses & Role ({roles.length})</span>
            </button>

            <SkeuomorphicButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadData}
              disabled={isLoading}
            >
              Segarkan
            </SkeuomorphicButton>

            {activeTab === 'rbac' && hasPermission('RBAC:MANAGE') && (
              <SkeuomorphicButton
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenCreateRole}
              >
                Role Baru
              </SkeuomorphicButton>
            )}
          </div>
        </div>

        {/* Search & Filter Strip */}
        {activeTab === 'queue' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="w-full sm:w-72">
              <InsetInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari NIK, Nama, atau Username..."
                icon={Search}
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-slate-500 font-medium">Filter Divisi:</span>
              <div className="relative">
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none"
                >
                  <option value="ALL">Semua Divisi</option>
                  <option value={Division.SECURITY}>Satpam / Security</option>
                  <option value={Division.CLEANING}>Cleaning Service</option>
                  <option value={Division.DRIVER}>Driver Logistik</option>
                  <option value={Division.STAFF}>Operasional / Staff</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </SurfaceCard>

      {activeTab === 'queue' ? (
        /* CANDIDATES TABLE */
        <SurfaceCard variant="elevated" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Calon Personil</th>
                  <th className="px-4 py-3.5">NIK (KTP)</th>
                  <th className="px-4 py-3.5">Kontak</th>
                  <th className="px-4 py-3.5">Peminatan Divisi</th>
                  <th className="px-4 py-3.5">Tanggal Daftar</th>
                  <th className="px-4 py-3.5 text-center">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                          <span>Memuat antrean verifikasi...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-600">Tidak ada pendaftaran pending</p>
                          <p className="text-[11px]">Semua permohonan calon personil telah diproses.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{candidate.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{candidate.username}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">
                        {candidate.nik}
                      </td>

                      <td className="px-4 py-3.5 space-y-0.5">
                        <div className="text-slate-700 font-medium">{candidate.phone}</div>
                        <div className="text-[10px] text-slate-400">{candidate.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${candidate.division === Division.SECURITY
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : candidate.division === Division.CLEANING
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : candidate.division === Division.DRIVER
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                          >
                            {candidate.division}
                          </span>
                          {candidate.requestedRole && (
                            <span className="text-[10px] text-sky-800 bg-sky-100/90 border border-sky-200 px-2 py-0.5 rounded font-mono font-bold">
                              Req: {candidate.requestedRole}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(candidate.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <SkeuomorphicButton
                            variant="primary"
                            size="sm"
                            icon={Check}
                            onClick={() => handleOpenApprove(candidate)}
                          >
                            Setujui
                          </SkeuomorphicButton>
                          <SkeuomorphicButton
                            variant="danger"
                            size="sm"
                            icon={X}
                            onClick={() => {
                              setRejectTarget(candidate);
                              setRejectReason('');
                            }}
                          >
                            Tolak
                          </SkeuomorphicButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      ) : (
        /* RBAC ROLES CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <SurfaceCard key={role.id} variant="elevated" padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-sky-700 font-bold border border-slate-200">
                    {role.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {role.isSystem ? 'Sistem' : 'Kustom'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{role.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{role.description || 'Tidak ada deskripsi'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs">
                <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
                  <span>Hak Akses Terpetakan:</span>
                  <span className="text-sky-600 font-bold">
                    {role.permissions ? role.permissions.length : 0} izin
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-mono"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[10px] italic">Tidak ada izin spesifik</span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRole(role)}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                  >
                    Edit Izin ({role.permissions?.length || 0})
                  </button>

                  {!role.isSystem ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivateRole(role)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                    >
                      Nonaktifkan
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Sistem Baku</span>
                  )}
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}

      {/* APPROVE MODAL DIALOG */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Approval Personil Baru</h3>
              </div>
              <button
                onClick={() => setApproveTarget(null)}
                className="text-white hover:opacity-80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Nama Calon:</span>
                  <span className="text-slate-900">{approveTarget.fullName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">NIK:</span>
                  <span className="text-sky-700">{approveTarget.nik}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pilih Role Akses Sistem</label>
                <select
                  value={assignedRoleId}
                  onChange={(e) => setAssignedRoleId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Divisi Penempatan</label>
                  <select
                    value={assignedDivision}
                    onChange={(e) => setAssignedDivision(e.target.value as Division)}
                    className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={Division.SECURITY}>Satpam / Security</option>
                    <option value={Division.CLEANING}>Cleaning Service</option>
                    <option value={Division.DRIVER}>Driver Logistik</option>
                    <option value={Division.STAFF}>Operasional / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fasilitas Site Utama</label>
                  <select
                    value={assignedSiteId}
                    onChange={(e) => setAssignedSiteId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gaji Pokok (Rp)</label>
                  <InsetInput
                    type="text"
                    value={gajiPokok}
                    onChange={(e) => setGajiPokok(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tunjangan (Rp)</label>
                  <InsetInput
                    type="text"
                    value={tunjangan}
                    onChange={(e) => setTunjangan(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setApproveTarget(null)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  variant="primary"
                  size="md"
                  onClick={handleConfirmApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyetujui...' : 'Setujui & Aktifkan'}
                </SkeuomorphicButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL DIALOG */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Tolak Permohonan</span>
              </h3>
              <button
                onClick={() => setRejectTarget(null)}
                className="text-white hover:opacity-80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <p className="text-slate-700">
                Anda akan menolak pendaftaran atas nama <strong className="text-slate-900 font-bold">{rejectTarget.fullName}</strong>.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Penolakan *</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: NIK KTP tidak valid / Tidak lulus verifikasi fisik..."
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setRejectTarget(null)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  variant="danger"
                  size="md"
                  onClick={handleConfirmReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                >
                  {isSubmitting ? 'Menolak...' : 'Konfirmasi Penolakan'}
                </SkeuomorphicButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL DIALOG */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <h3 className="font-extrabold text-base">
                  {editingRole ? `Konfigurasi Role: ${editingRole.name}` : 'Buat Role Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewRoleModalOpen(false)}
                className="text-white hover:opacity-80 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Kode Role {editingRole && <span className="text-slate-400 font-normal">(Tidak dapat diubah)</span>}
                  </label>
                  <input
                    type="text"
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value.toUpperCase())}
                    disabled={!!editingRole}
                    placeholder="Contoh: CHIEF_SECURITY"
                    className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Tampilan Role *</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Contoh: Chief Security Officer"
                    className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi Tanggung Jawab</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Deskripsi singkat wewenang peran ini..."
                  className="w-full bg-[#F8FAFC] border border-slate-300/80 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Categorized Permissions Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs">
                    Matriks Hak Akses & Perizinan ({selectedPermissionIds.length} dipilih)
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAllPermissions}
                    className="text-sky-600 hover:text-sky-800 font-bold text-[11px]"
                  >
                    {selectedPermissionIds.length === permissions.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      category: 'Akses Portal & Dashboard Utama',
                      perms: ['ADMIN:DASHBOARD_ACCESS', 'FIELD:DASHBOARD_ACCESS'],
                    },
                    {
                      category: 'Operasional Patroli',
                      perms: ['PATROL:SCAN', 'PATROL:VIEW', 'PATROL:VALIDATE'],
                    },
                    {
                      category: 'Absensi & Presensi',
                      perms: ['ATTENDANCE:SUBMIT', 'ATTENDANCE:VIEW', 'ATTENDANCE:APPROVE'],
                    },
                    {
                      category: 'Insiden & Tombol Darurat SOS',
                      perms: ['INCIDENT:CREATE', 'INCIDENT:VIEW', 'INCIDENT:RESOLVE', 'SOS:TRIGGER', 'SOS:VIEW'],
                    },
                    {
                      category: 'Master Data & RBAC',
                      perms: ['DATA_INDUK:VIEW', 'DATA_INDUK:MANAGE', 'USER:APPROVE', 'RBAC:MANAGE'],
                    },
                    {
                      category: 'Payroll & Pelaporan',
                      perms: ['PAYROLL:VIEW', 'PAYROLL:GENERATE', 'BROADCAST:SEND', 'EXPORT:REPORTS'],
                    },
                  ].map((group) => (
                    <div key={group.category} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                      <div className="font-bold text-slate-700 text-[11px] mb-2">{group.category}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.perms.map((pCode) => {
                          const isSelected = selectedPermissionIds.includes(pCode);
                          return (
                            <button
                              key={pCode}
                              type="button"
                              onClick={() => handleTogglePermission(pCode)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 ${isSelected
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{pCode}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <SkeuomorphicButton
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                >
                  Batal
                </SkeuomorphicButton>
                <SkeuomorphicButton
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : editingRole ? 'Simpan Perubahan' : 'Buat Role'}
                </SkeuomorphicButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
