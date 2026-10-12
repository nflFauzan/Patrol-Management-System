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
  role: string;
  division: 'SECURITY' | 'CLEANING' | 'DRIVER';
  securityRank: string;
  siteName: string;
  siteId?: string;
  photoUrl?: string;
  gajiPokok: number;
  tunjangan: number;
  lemburPerJam: number;
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
  deleteCheckpoint: (id: string) => void;
  addUser: (user: UserItem) => void;
  deleteUser: (id: string) => void;

  // Global Modals
  bulkImportType: 'CHECKPOINT' | 'PERSONIL' | null;
  setBulkImportType: (type: 'CHECKPOINT' | 'PERSONIL' | null) => void;
  printQrTarget: any | null;
  setPrintQrTarget: (target: any | null) => void;
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
  const [printIdCardTarget, setPrintIdCardTarget] = useState<any | null>(null);

  const [activeSosAlert, setActiveSosAlert] = useState<SosAlert | null>(null);
  const [isSirenMuted, setIsSirenMuted] = useState<boolean>(false);

  // Connect Socket.io for Real-time SOS alerts
  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', {
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

  const deleteCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  };

  const addUser = (user: UserItem) => {
    setUsers((prev) => [user, ...prev]);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
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
        deleteCheckpoint,
        addUser,
        deleteUser,
        bulkImportType,
        setBulkImportType,
        printQrTarget,
        setPrintQrTarget,
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
