'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { AreaSiteData } from '../components/AreaManagementView';

export interface CheckpointItem {
  id: string;
  qrCodeToken: string;
  name: string;
  locationDetail: string;
  category: 'Security' | 'Cleaning Service' | 'Driver';
  assetType?: string;
  taskDescription: string;
  siteName: string;
  siteId?: string;
}

export interface UserItem {
  id: string;
  nik: string;
  fullName: string;
  username: string;
  password?: string;
  role: string;
  division: 'SECURITY' | 'CLEANING' | 'DRIVER' | 'STAFF' | string;
  securityRank: string;
  siteName: string;
  siteId?: string;
  multiSiteIds?: string[];
  photoUrl?: string;
  phone?: string;
  workingHoursPerDay?: number;
  gajiPokok: number;
  tunjangan: number;
  lemburPerJam: number;
  potonganBpjs?: number;
  potonganTidakMasuk?: number;
  potonganAlpa?: number;
  potonganLupaAbsensi?: number;
  potonganLupaAbsen?: number;
}

export interface SosAlert {
  id: string;
  officerName: string;
  officerPhone?: string;
  division: string;
  siteName: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  triggeredAt: string;
  alertStatus: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  isWhatsappDispatched: boolean;
  message?: string;
}

interface DataContextType {
  sites: AreaSiteData[];
  checkpoints: CheckpointItem[];
  users: UserItem[];
  addSite: (site: AreaSiteData) => void;
  updateSite: (site: AreaSiteData) => void;
  deleteSite: (id: string) => void;
  addCheckpoint: (cp: CheckpointItem) => void;
  updateCheckpoint: (cp: CheckpointItem) => void;
  deleteCheckpoint: (id: string) => void;
  addUser: (user: UserItem) => void;
  updateUser: (user: UserItem) => void;
  deleteUser: (id: string) => void;
  verifyAndDeleteUser: (targetId: string, adminPassword: string, adminId?: string) => Promise<{ success: boolean; message: string }>;
  getPersonnelForIdCard: (siteName: string, position: string) => UserItem[];

  // Global Modals
  bulkImportType: 'CHECKPOINT' | 'PERSONIL' | null;
  setBulkImportType: (type: 'CHECKPOINT' | 'PERSONIL' | null) => void;
  printQrTarget: any | null;
  setPrintQrTarget: (target: any | null) => void;
  batchPrintConfig: { siteName: string; category: string; items: CheckpointItem[] } | null;
  setBatchPrintConfig: (config: { siteName: string; category: string; items: CheckpointItem[] } | null) => void;
  printIdCardTarget: any | null;
  setPrintIdCardTarget: (target: any | null) => void;

  // Real-time Emergency SOS
  activeSosAlert: SosAlert | null;
  setActiveSosAlert: (alert: SosAlert | null) => void;
  isSirenMuted: boolean;
  setIsSirenMuted: (muted: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<AreaSiteData[]>([
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Site Proyek Demo',
      code: 'HQ-DEMO',
      address: 'Kav. 52-53 SCBD, Jakarta Selatan',
      latitude: -6.566873,
      longitude: 106.857802,
      geofenceRadiusMeters: 50,
      shiftPagiIn: '07:00:00',
      shiftPagiOut: '15:00:00',
      shiftSiangIn: '15:00:00',
      shiftSiangOut: '23:00:00',
      shiftMalamIn: '23:00:00',
      shiftMalamOut: '07:00:00',
      shiftStaffIn: '08:00:00',
      shiftStaffOut: '17:00:00',
      shiftChiefIn: '08:00:00',
      shiftChiefOut: '17:00:00',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Warehouse & Factory Cikarang',
      code: 'WH-CKR',
      address: 'Kawasan Industri GIIC Delta Silicon, Cikarang',
      latitude: -6.3712,
      longitude: 107.1654,
      geofenceRadiusMeters: 250,
      shiftPagiIn: '06:00:00',
      shiftPagiOut: '14:00:00',
      shiftSiangIn: '14:00:00',
      shiftSiangOut: '22:00:00',
      shiftMalamIn: '22:00:00',
      shiftMalamOut: '06:00:00',
      shiftStaffIn: '08:00:00',
      shiftStaffOut: '17:00:00',
      shiftChiefIn: '08:00:00',
      shiftChiefOut: '17:00:00',
    },
  ]);

  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([
    {
      id: 'c1',
      qrCodeToken: 'QR-HQ-TOILET-01',
      name: 'Toilet',
      locationDetail: 'Lobby',
      category: 'Cleaning Service',
      assetType: 'Fasilitas Sanitasi',
      taskDescription: 'Bersihkan Kloset, wastafel, dan pel lantai',
      siteName: 'Site Proyek Demo',
      siteId: '11111111-1111-1111-1111-111111111111',
    },
    {
      id: 'c2',
      qrCodeToken: 'QR-HQ-GATE-02',
      name: 'Pos Gerbang Utama',
      locationDetail: 'Gerbang Utama Depan',
      category: 'Security',
      assetType: 'Pos Keamanan & Gerbang',
      taskDescription: 'Pemeriksaan Akses Masuk Tamu & Kendaraan',
      siteName: 'Site Proyek Demo',
      siteId: '11111111-1111-1111-1111-111111111111',
    },
    {
      id: 'c3',
      qrCodeToken: 'QR-HQ-SERVER-03',
      name: 'Ruang Server IT Lt 3',
      locationDetail: 'Lt 3 Ruang 304',
      category: 'Security',
      assetType: 'Server & Rack IT',
      taskDescription: 'Cek suhu AC ruangan dan lampu indikator UPS',
      siteName: 'Site Proyek Demo',
      siteId: '11111111-1111-1111-1111-111111111111',
    },
  ]);

  const [users, setUsers] = useState<UserItem[]>([
    {
      id: 'u1',
      nik: 'NIK-CLN-001',
      fullName: 'Akmal',
      username: 'akmal',
      role: 'CLEANING_STAFF',
      division: 'CLEANING',
      securityRank: 'Anggota',
      siteName: 'Site Proyek Demo',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      gajiPokok: 4800000,
      tunjangan: 500000,
      lemburPerJam: 25000,
    },
    {
      id: 'u2',
      nik: 'NIK-SEC-001',
      fullName: 'Budi Satpam Test',
      username: 'buditest',
      role: 'SECURITY_OFFICER',
      division: 'SECURITY',
      securityRank: 'Anggota',
      siteName: 'Site Proyek Demo',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      gajiPokok: 5200000,
      tunjangan: 800000,
      lemburPerJam: 30000,
    },
    {
      id: 'u3',
      nik: 'NIK-SEC-002',
      fullName: 'Ahmad Fauzi',
      username: 'satpamtest',
      role: 'SECURITY_OFFICER',
      division: 'SECURITY',
      securityRank: 'Komandan Regu',
      siteName: 'Site Proyek Demo',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      gajiPokok: 6500000,
      tunjangan: 1200000,
      lemburPerJam: 40000,
    },
  ]);

  const [bulkImportType, setBulkImportType] = useState<'CHECKPOINT' | 'PERSONIL' | null>(null);
  const [printQrTarget, setPrintQrTarget] = useState<any | null>(null);
  const [batchPrintConfig, setBatchPrintConfig] = useState<{ siteName: string; category: string; items: CheckpointItem[] } | null>(null);
  const [printIdCardTarget, setPrintIdCardTarget] = useState<any | null>(null);

  const [activeSosAlert, setActiveSosAlert] = useState<SosAlert | null>(null);
  const [isSirenMuted, setIsSirenMuted] = useState<boolean>(false);

  // Connect Socket.io for Real-time SOS alerts
  useEffect(() => {
    const socketUrl =
      typeof window !== 'undefined' && window.location.port === '8080'
        ? window.location.origin
        : 'http://localhost:3000';

    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
    });

    socket.on('sos:new', (alertData: any) => {
      setActiveSosAlert({
        id: alertData.id || `sos-${Date.now()}`,
        officerName: alertData.officerName || 'Budi Satpam Test',
        officerPhone: alertData.officerPhone || '0812-3456-7890',
        division: alertData.division || 'Security',
        siteName: alertData.siteName || 'Site Proyek Demo',
        latitude: alertData.latitude || -6.566873,
        longitude: alertData.longitude || 106.857802,
        mapsUrl: alertData.mapsUrl || `https://www.google.com/maps?q=${alertData.latitude || -6.566873},${alertData.longitude || 106.857802}`,
        triggeredAt: alertData.triggeredAt || new Date().toISOString(),
        alertStatus: 'ACTIVE',
        isWhatsappDispatched: alertData.isWhatsappDispatched ?? true,
        message: alertData.message || 'Petugas membutuhkan bantuan darurat segera!',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addSite = (site: AreaSiteData) => {
    setSites((prev) => [site, ...prev]);
  };

  const updateSite = (site: AreaSiteData) => {
    setSites((prev) => prev.map((s) => (s.id === site.id ? site : s)));
  };

  const deleteSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  const addCheckpoint = (cp: CheckpointItem) => {
    setCheckpoints((prev) => [cp, ...prev]);
  };

  const updateCheckpoint = (cp: CheckpointItem) => {
    setCheckpoints((prev) => prev.map((c) => (c.id === cp.id ? cp : c)));
  };

  const deleteCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  };

  const addUser = async (user: UserItem) => {
    setUsers((prev) => [user, ...prev]);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password || 'password123',
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          division: user.division,
          securityRank: user.securityRank,
          workingHoursPerDay: user.workingHoursPerDay || 8,
          gajiPokok: user.gajiPokok,
          tunjangan: user.tunjangan,
          lemburPerJam: user.lemburPerJam,
          potonganBpjs: user.potonganBpjs || 0,
          potonganAlpa: user.potonganTidakMasuk ?? user.potonganAlpa ?? 0,
          potonganLupaAbsen: user.potonganLupaAbsensi ?? user.potonganLupaAbsen ?? 0,
          siteId: user.siteId,
          multiSiteIds: user.multiSiteIds,
          avatarUrl: user.photoUrl,
        }),
      });
    } catch (e) {
      // Local fallback
    }
  };

  const updateUser = async (user: UserItem) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch(`http://localhost:3000/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          division: user.division,
          securityRank: user.securityRank,
          workingHoursPerDay: user.workingHoursPerDay,
          gajiPokok: user.gajiPokok,
          tunjangan: user.tunjangan,
          lemburPerJam: user.lemburPerJam,
          potonganBpjs: user.potonganBpjs,
          potonganAlpa: user.potonganTidakMasuk ?? user.potonganAlpa,
          potonganLupaAbsen: user.potonganLupaAbsensi ?? user.potonganLupaAbsen,
          siteId: user.siteId,
          multiSiteIds: user.multiSiteIds,
          avatarUrl: user.photoUrl,
          password: user.password,
        }),
      });
    } catch (e) {
      // Local fallback
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const verifyAndDeleteUser = async (
    targetId: string,
    adminPassword: string,
    adminId?: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('http://localhost:3000/api/v1/users/verify-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetUserId: targetId,
          passwordConfirm: adminPassword,
          adminId: adminId || 'admin-001',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menghapus personil: Password verifikasi salah');
      }

      const data = await res.json();
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      return { success: true, message: data.message || 'Personil berhasil dihapus' };
    } catch (err: any) {
      if (err.message && err.message.includes('Password verifikasi salah')) {
        throw err;
      }
      // Demo / offline fallback validation
      if (
        adminPassword === 'admin123' ||
        adminPassword === 'testing123' ||
        adminPassword === 'adminSecret123' ||
        adminPassword === 'superadmin'
      ) {
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
        return { success: true, message: 'Personil berhasil dihapus (Mode Lokal)' };
      }
      throw new Error('Password verifikasi admin salah');
    }
  };

  const getPersonnelForIdCard = (siteName: string, position: string): UserItem[] => {
    return users.filter((u) => {
      const matchSite = !siteName || siteName === '__SEMUA__' || u.siteName.toLowerCase() === siteName.toLowerCase();
      const matchPosisi =
        !position ||
        position === '__SEMUA__' ||
        position === 'semua' ||
        (position === 'Security' && u.division === 'SECURITY') ||
        (position === 'Cleaning Service' && u.division === 'CLEANING') ||
        (position === 'Driver' && u.division === 'DRIVER') ||
        u.division.toLowerCase() === position.toLowerCase();
      return matchSite && matchPosisi;
    });
  };

  return (
    <DataContext.Provider
      value={{
        sites,
        checkpoints,
        users,
        addSite,
        updateSite,
        deleteSite,
        addCheckpoint,
        updateCheckpoint,
        deleteCheckpoint,
        addUser,
        updateUser,
        deleteUser,
        verifyAndDeleteUser,
        getPersonnelForIdCard,
        bulkImportType,
        setBulkImportType,
        printQrTarget,
        setPrintQrTarget,
        batchPrintConfig,
        setBatchPrintConfig,
        printIdCardTarget,
        setPrintIdCardTarget,
        activeSosAlert,
        setActiveSosAlert,
        isSirenMuted,
        setIsSirenMuted,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
