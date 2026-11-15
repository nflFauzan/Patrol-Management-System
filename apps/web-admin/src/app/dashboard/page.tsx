'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Building2,
  CheckCircle2,
  Radio,
  MapPin,
  ChevronDown,
  Download,
  Activity,
  Car,
  Sparkles,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../../lib/DataContext';
import { DashboardHeroBanner } from '../../components/dashboard/DashboardHeroBanner';
import { DashboardStatCard } from '../../components/dashboard/DashboardStatCard';
import { DashboardActivityChart } from '../../components/dashboard/DashboardActivityChart';
import { DashboardMapPreview } from '../../components/dashboard/DashboardMapPreview';
import { NotificationPanel } from '../../components/dashboard/NotificationPanel';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { SkeuomorphicButton } from '../../components/ui/SkeuomorphicButton';

export default function DashboardPage() {
  const { sites, checkpoints, users, activeSosAlert } = useData();

  // Active filter state
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [activeShiftFilter, setActiveShiftFilter] = useState<'PAGI' | 'SIANG' | 'MALAM'>('PAGI');

  // Quick activity preview modal
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  // Filtered data based on site selection
  const filteredCheckpoints = useMemo(() => {
    if (selectedSiteId === 'ALL') return checkpoints;
    return checkpoints.filter(
      (cp) => cp.siteId === selectedSiteId || cp.siteName.toLowerCase().includes(selectedSiteId.toLowerCase())
    );
  }, [checkpoints, selectedSiteId]);

  const filteredUsers = useMemo(() => {
    if (selectedSiteId === 'ALL') return users;
    return users.filter(
      (u) => u.siteId === selectedSiteId || u.siteName.toLowerCase().includes(selectedSiteId.toLowerCase())
    );
  }, [users, selectedSiteId]);

  // Aggregate Metrics
  const totalPersonil = filteredUsers.length || 124;
  const securityPersonil = filteredUsers.filter((u) => u.division === 'SECURITY').length || 62;
  const cleaningPersonil = filteredUsers.filter((u) => u.division === 'CLEANING').length || 42;
  const driverPersonil = filteredUsers.filter((u) => u.division === 'DRIVER').length || 20;

  const totalSitesCount = sites.length || 48;
  const totalCheckpoints = filteredCheckpoints.length || 86;
  const securityCheckpoints = filteredCheckpoints.filter((c) => c.category === 'Security').length || 54;
  const cleaningCheckpoints = filteredCheckpoints.filter((c) => c.category === 'Cleaning Service').length || 32;

  // Dynamic Shift Compliance Calculations
  const shiftComplianceData = useMemo(() => {
    switch (activeShiftFilter) {
      case 'PAGI':
        return {
          shiftName: 'Shift Pagi (07:00 - 15:00)',
          completed: 24,
          total: 28,
          percent: 86,
          pendingPos: [
            { name: 'Pos Genset & Pompa Hydrant', lastScan: '3 jam lalu', pic: 'Budi (Satpam)' },
            { name: 'Pintu Darurat Timur Lt 2', lastScan: '2 jam lalu', pic: 'Ahmad Fauzi' },
          ],
        };
      case 'SIANG':
        return {
          shiftName: 'Shift Siang (15:00 - 23:00)',
          completed: 9,
          total: 28,
          percent: 32,
          pendingPos: [
            { name: 'Loading Dock Bawah', lastScan: 'Standby Shift', pic: 'Regu Siang' },
            { name: 'Perimeter Pagar Belakang', lastScan: 'Standby Shift', pic: 'Regu Siang' },
          ],
        };
      case 'MALAM':
        return {
          shiftName: 'Shift Malam (23:00 - 07:00)',
          completed: 0,
          total: 28,
          percent: 0,
          pendingPos: [
            { name: 'Seluruh Pos Perimeter (28 Titik)', lastScan: 'Jadwal 23:00', pic: 'Regu Malam' },
          ],
        };
    }
  }, [activeShiftFilter]);

  // Map preview coordinates from checkpoints
  const mapCheckpoints = useMemo(() => {
    return filteredCheckpoints.slice(0, 6).map((cp, idx) => ({
      id: cp.id,
      name: cp.name,
      lat: -6.2088 + (idx * 0.001 - 0.002),
      lng: 106.8456 + (idx * 0.0012 - 0.002),
      status: idx % 3 === 0 ? 'Pending' : 'Active',
    }));
  }, [filteredCheckpoints]);

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      {/* 1. HERO WELCOME BANNER (Matching Reference Image) */}
      <DashboardHeroBanner userName="Muhamad Naufal" />

      {/* 2. 5 STAT CARDS ROW (Matching Reference Image) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Personel */}
        <DashboardStatCard
          title="Total Personel"
          value={totalPersonil}
          trend="↑ 2% dari kemarin"
          trendDirection="up"
          icon={Users}
          iconVariant="sky"
        />

        {/* Total Area */}
        <DashboardStatCard
          title="Total Area"
          value="12"
          trend="↑ 0%"
          trendDirection="neutral"
          icon={MapPin}
          iconVariant="sky"
        />

        {/* Total Site */}
        <DashboardStatCard
          title="Total Site"
          value={totalSitesCount}
          trend="↑ 1%"
          trendDirection="up"
          icon={Building2}
          iconVariant="sky"
        />

        {/* Absensi Hari Ini */}
        <DashboardStatCard
          title="Absensi Hari Ini"
          value="96%"
          trend="↑ 3%"
          trendDirection="up"
          icon={CheckCircle2}
          iconVariant="emerald"
        />

        {/* Patroli Aktif */}
        <DashboardStatCard
          title="Patroli Aktif"
          value="7"
          trend="● Dalam Bertugas"
          trendDirection="up"
          icon={Activity}
          iconVariant="sky"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* 3. THREE-COLUMN BENTO GRID (Aktivitas Patroli, Peta Lokasi Patroli, Notifikasi Terbaru) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Column 1: Aktivitas Patroli Line Chart */}
        <div className="h-full">
          <DashboardActivityChart />
        </div>

        {/* Column 2: Peta Lokasi Patroli Live Map Preview */}
        <div className="h-full">
          <DashboardMapPreview checkpoints={mapCheckpoints} />
        </div>

        {/* Column 3: Notifikasi Terbaru Feed */}
        <div className="h-full">
          <NotificationPanel />
        </div>
      </div>

      {/* 4. OPERATIONAL SCOPE CONTROLS & COMPLIANCE SECTION */}
      <SurfaceCard variant="elevated" padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Kepatuhan Jadwal & Kontrol Operasional
            </h2>
            <p className="text-[11px] text-slate-500">
              Filter cakupan fasilitas dan pengawasan putaran patroli per shift
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Site Switcher */}
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-white text-slate-800 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              >
                <option value="ALL">🏢 Semua Fasilitas ({sites.length} Site)</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    📍 {site.name} ({site.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Shift Filter Pills */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-semibold">
              {(['PAGI', 'SIANG', 'MALAM'] as const).map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => setActiveShiftFilter(shift)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeShiftFilter === shift
                      ? 'bg-white text-slate-900 shadow-skeuo-button-secondary font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {shift}
                </button>
              ))}
            </div>

            <Link href="/export-laporan">
              <SkeuomorphicButton variant="secondary" size="sm" icon={Download}>
                Unduh
              </SkeuomorphicButton>
            </Link>

            <Link href="/emergency">
              <SkeuomorphicButton variant="danger" size="sm" icon={Radio}>
                Pusat SOS
              </SkeuomorphicButton>
            </Link>
          </div>
        </div>

        {/* Shift Progress & Pos Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start pt-1">
          {/* Progress bar and time slots */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Progres Putaran {shiftComplianceData.shiftName}</span>
                <span className="tabular-nums font-bold text-sky-700">{shiftComplianceData.percent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-sky-500 to-sky-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${shiftComplianceData.percent}%` }}
                />
              </div>
            </div>

            {/* Grid Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400">07:00 - 09:00</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Putaran 1</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">✓ 28/28 Pos</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400">09:30 - 11:30</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Putaran 2</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">✓ 28/28 Pos</div>
              </div>

              <div className="bg-sky-600 text-white p-2.5 rounded-xl shadow-skeuo-button-primary text-center">
                <div className="text-[10px] font-bold text-sky-100">12:30 - 14:30</div>
                <div className="text-xs font-bold mt-0.5">Putaran 3</div>
                <div className="text-[10px] font-bold text-sky-100 mt-0.5">Sedang Jalan (16/28)</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center opacity-60">
                <div className="text-[10px] font-bold text-slate-400">14:30 - 15:00</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">Putaran 4</div>
                <div className="text-[10px] font-medium text-slate-400 mt-0.5">Serah Terima</div>
              </div>
            </div>

            {/* Pending Pos */}
            {shiftComplianceData.pendingPos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  Pos Memerlukan Tindak Lanjut Pemindaian:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {shiftComplianceData.pendingPos.map((pos, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 truncate">{pos.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Petugas: {pos.pic}</div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        {pos.lastScan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 Divisi Operational Cards */}
          <div className="space-y-2.5">
            {/* Satpam */}
            <Link
              href="/laporan?tab=security"
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-skeuo-card transition group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Satpam Security</div>
                  <div className="text-[10px] text-slate-500">{securityCheckpoints} Pos Terjadwal</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>

            {/* Cleaning Service */}
            <Link
              href="/laporan?tab=cleaning"
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-skeuo-card transition group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Cleaning Service</div>
                  <div className="text-[10px] text-slate-500">{cleaningCheckpoints} Zona Sanitasi</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>

            {/* Driver Logistik */}
            <Link
              href="/laporan?tab=driver"
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-skeuo-card transition group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Driver Logistik</div>
                  <div className="text-[10px] text-slate-500">5 Armada Operasional</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </SurfaceCard>

      {/* Quick Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900">Detail Aktivitas Pemindaian</div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Petugas</span>
                <span className="font-semibold text-slate-900">{selectedActivity.name} ({selectedActivity.division})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pos Checkpoint</span>
                <span className="font-semibold text-slate-900">{selectedActivity.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Koordinat GPS</span>
                <span className="font-mono text-slate-800">{selectedActivity.coords}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Catatan Laporan</span>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">{selectedActivity.notes}</p>
              </div>
            </div>
            <div className="mt-5 text-right">
              <SkeuomorphicButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedActivity(null)}
              >
                Tutup
              </SkeuomorphicButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
