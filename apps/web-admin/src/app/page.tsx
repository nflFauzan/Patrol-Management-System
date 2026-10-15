'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  ListChecks,
  Check,
  AlertTriangle,
  MapPin,
  Shield,
  Leaf,
  Car,
  Briefcase,
  FileText,
  LogOut,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useData } from '../lib/DataContext';

export default function DashboardPage() {
  const { sites, checkpoints, users } = useData();

  // Dynamic counts based on actual registered data
  const totalPersonil = users.length;
  const totalCheckpoint = checkpoints.length;

  const securityPersonil = users.filter((u) => u.division === 'SECURITY').length;
  const cleaningPersonil = users.filter((u) => u.division === 'CLEANING').length;
  const driverPersonil = users.filter((u) => u.division === 'DRIVER').length;

  const securityCheckpoints = checkpoints.filter((c) => c.category === 'Security').length;
  const cleaningCheckpoints = checkpoints.filter((c) => c.category === 'Cleaning Service').length;

  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================
          1. KPI UTAMA (6 CARDS DENGAN WATERMARK ICON)
          ======================================================== */}
      <div className="kpi-row">
        {/* TOTAL PERSONIL */}
        <div className="kpi-card kpi-primary">
          <div className="kpi-label">TOTAL PERSONIL</div>
          <div className="kpi-value">{totalPersonil}</div>
          <Users className="kpi-card-watermark w-14 h-14" />
        </div>

        {/* HADIR HARI INI */}
        <div className="kpi-card kpi-info">
          <div className="kpi-label">HADIR HARI INI</div>
          <div className="kpi-value">0</div>
          <CheckCircle className="kpi-card-watermark w-14 h-14" />
        </div>

        {/* KEGIATAN HARI INI */}
        <div className="kpi-card kpi-warning">
          <div className="kpi-label">KEGIATAN HARI INI</div>
          <div className="kpi-value">0</div>
          <ListChecks className="kpi-card-watermark w-14 h-14" />
        </div>

        {/* PERJALANAN SELESAI */}
        <div className="kpi-card kpi-success">
          <div className="kpi-label">PERJALANAN SELESAI</div>
          <div className="kpi-value">0</div>
          <Check className="kpi-card-watermark w-14 h-14" />
        </div>

        {/* TEMUAN AKTIF */}
        <div className="kpi-card kpi-danger">
          <div className="kpi-label">TEMUAN AKTIF</div>
          <div className="kpi-value">0</div>
          <AlertTriangle className="kpi-card-watermark w-14 h-14" />
        </div>

        {/* TOTAL CHECKPOINT */}
        <div className="kpi-card kpi-dark">
          <div className="kpi-label">TOTAL CHECKPOINT</div>
          <div className="kpi-value">{totalCheckpoint}</div>
          <MapPin className="kpi-card-watermark w-14 h-14" />
        </div>
      </div>

      {/* ========================================================
          2. PANEL UNIT 4 DIVISI (SECURITY, CLEANING, DRIVER, STAF)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SECURITY */}
        <div className="unit-card unit-security">
          <div className="unit-head">
            <div className="unit-icon bg-blue">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="unit-name">Security</div>
              <div className="unit-sub">Monitoring keamanan & patroli</div>
            </div>
          </div>

          <div className="unit-grid">
            <div className="unit-stat">
              <div className="unit-stat-label">Personil</div>
              <div className="unit-stat-value">{securityPersonil}</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Hadir</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Patroli</div>
              <div className="unit-stat-value">0</div>
              <small>hari ini</small>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Checkpoint</div>
              <div className="unit-stat-value">{securityCheckpoints}</div>
              <small>Security</small>
            </div>

            <div className="unit-stat col-span-2">
              <div className="unit-stat-label">Temuan</div>
              <div className="unit-stat-value">0</div>
              <small>aktif</small>
            </div>
          </div>
        </div>

        {/* CLEANING SERVICE */}
        <div className="unit-card unit-cleaning">
          <div className="unit-head">
            <div className="unit-icon bg-green">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="unit-name">Cleaning Service</div>
              <div className="unit-sub">Monitoring kegiatan kebersihan</div>
            </div>
          </div>

          <div className="unit-grid">
            <div className="unit-stat">
              <div className="unit-stat-label">Personil</div>
              <div className="unit-stat-value">{cleaningPersonil}</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Hadir</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Kegiatan</div>
              <div className="unit-stat-value">0</div>
              <small>hari ini</small>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Checkpoint</div>
              <div className="unit-stat-value">{cleaningCheckpoints}</div>
              <small>Cleaning</small>
            </div>

            <div className="unit-stat col-span-2">
              <div className="unit-stat-label">Temuan</div>
              <div className="unit-stat-value">0</div>
              <small>aktif</small>
            </div>
          </div>
        </div>

        {/* DRIVER */}
        <div className="unit-card unit-driver">
          <div className="unit-head">
            <div className="unit-icon bg-orange">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="unit-name">Driver</div>
              <div className="unit-sub">Monitoring perjalanan kendaraan</div>
            </div>
          </div>

          <div className="unit-grid">
            <div className="unit-stat">
              <div className="unit-stat-label">Driver</div>
              <div className="unit-stat-value">{driverPersonil}</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Hadir</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Perjalanan</div>
              <div className="unit-stat-value">0</div>
              <small>hari ini</small>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Berjalan</div>
              <div className="unit-stat-value">0</div>
              <small>belum selesai</small>
            </div>
          </div>
        </div>

        {/* STAF */}
        <div className="unit-card unit-staf">
          <div className="unit-head">
            <div className="unit-icon bg-dark">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="unit-name">Staf</div>
              <div className="unit-sub">Administrasi dan laporan</div>
            </div>
          </div>

          <div className="unit-grid">
            <div className="unit-stat">
              <div className="unit-stat-label">Personil</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Hadir</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Selesai Bertugas</div>
              <div className="unit-stat-value">0</div>
            </div>

            <div className="unit-stat">
              <div className="unit-stat-label">Izin</div>
              <div className="unit-stat-value">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. RINGKASAN OPERASIONAL & STATUS PERSONIL HARI INI
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RINGKASAN OPERASIONAL */}
        <div className="summary-card">
          <div className="summary-title">📊 Ringkasan Operasional</div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-blue">
                <Users className="w-4 h-4" />
              </div>
              <span>Total Personil</span>
            </div>
            <div className="summary-value">{totalPersonil}</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-green">
                <Check className="w-4 h-4" />
              </div>
              <span>Hadir Hari Ini</span>
            </div>
            <div className="summary-badge badge-success">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-cyan">
                <ListChecks className="w-4 h-4" />
              </div>
              <span>Kegiatan Hari Ini</span>
            </div>
            <div className="summary-value">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-dark">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Total Checkpoint</span>
            </div>
            <div className="summary-value">{totalCheckpoint}</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-orange">
                <Car className="w-4 h-4" />
              </div>
              <span>Driver Sedang Berjalan</span>
            </div>
            <div className="summary-badge badge-warning">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-red">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>Temuan Hari Ini</span>
            </div>
            <div className="summary-badge badge-success">Tidak Ada Temuan</div>
          </div>
        </div>

        {/* STATUS PERSONIL HARI INI */}
        <div className="summary-card">
          <div className="summary-title">👥 Status Personil Hari Ini</div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-green">
                <Shield className="w-4 h-4" />
              </div>
              <span>Security Hadir</span>
            </div>
            <div className="summary-badge badge-success">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-green">
                <Leaf className="w-4 h-4" />
              </div>
              <span>Cleaning Hadir</span>
            </div>
            <div className="summary-badge badge-success">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-green">
                <Car className="w-4 h-4" />
              </div>
              <span>Driver Hadir</span>
            </div>
            <div className="summary-badge badge-success">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-dark">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>Staf Hadir</span>
            </div>
            <div className="summary-badge badge-success">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-orange">
                <FileText className="w-4 h-4" />
              </div>
              <span>Izin Tidak Masuk</span>
            </div>
            <div className="summary-badge badge-warning">0</div>
          </div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-blue">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Selesai Bertugas</span>
            </div>
            <div className="summary-value">0</div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. PERHATIAN OPERASIONAL (3 CARDS)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SECURITY PERLU PERHATIAN */}
        <div className="summary-card">
          <div className="summary-title">⚠️ Security Perlu Perhatian</div>

          <div className="attention-item">
            <div className="attention-icon bg-red">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Personil Belum Patroli</div>
              <div className="attention-desc">Personil hadir tetapi belum melakukan patroli.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              0
            </div>
          </div>

          <div className="attention-item">
            <div className="attention-icon bg-orange">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Checkpoint Belum Dipatroli</div>
              <div className="attention-desc">Checkpoint Security tanpa patroli hari ini.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              {securityCheckpoints}
            </div>
          </div>

          <div className="attention-item">
            <div className="attention-icon bg-red">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Temuan Aktif</div>
              <div className="attention-desc">Temuan Security yang masih aktif.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              0
            </div>
          </div>
        </div>

        {/* CLEANING SERVICE */}
        <div className="summary-card">
          <div className="summary-title">🧹 Cleaning Service</div>

          <div className="attention-item">
            <div className="attention-icon bg-green">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Kegiatan Hari Ini</div>
              <div className="attention-desc">Aktivitas Cleaning Service.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              0
            </div>
          </div>

          <div className="attention-item">
            <div className="attention-icon bg-blue">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Checkpoint</div>
              <div className="attention-desc">Total checkpoint Cleaning Service.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              {cleaningCheckpoints}
            </div>
          </div>

          <div className="attention-item">
            <div className="attention-icon bg-orange">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Belum Dicek</div>
              <div className="attention-desc">Checkpoint Cleaning Service yang belum diperiksa hari ini.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              {cleaningCheckpoints}
            </div>
          </div>

          <div className="attention-item">
            <div className="attention-icon bg-red">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="attention-title">Temuan Aktif</div>
              <div className="attention-desc">Temuan Cleaning Service.</div>
            </div>
            <div className="ml-auto font-extrabold text-sm text-slate-800">
              0
            </div>
          </div>
        </div>

        {/* DRIVER PERLU PERHATIAN */}
        <div className="summary-card flex flex-col items-center justify-center text-center">
          <div className="summary-title w-full text-left">🚗 Driver Perlu Perhatian</div>

          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <strong className="text-sm font-bold text-slate-800">
              Tidak ada perjalanan yang masih berjalan
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. RANKING DAN TEMUAN (3 CARDS)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOP 5 SECURITY */}
        <div className="summary-card">
          <div className="summary-title">🏆 Top 5 Security Hari Ini</div>
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada data patroli untuk peringkat hari ini.
          </div>
        </div>

        {/* SECURITY BELUM PATROLI */}
        <div className="summary-card flex flex-col items-center justify-center text-center">
          <div className="summary-title w-full text-left">👤 Security Belum Patroli</div>

          <div className="py-4 flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
            <strong className="text-sm font-bold text-slate-800">
              Semua Security sudah patroli
            </strong>
          </div>

          <div className="mt-2">
            <span className="summary-badge badge-warning">
              0 Personil
            </span>
          </div>
        </div>

        {/* TEMUAN AKTIF */}
        <div className="summary-card flex flex-col items-center justify-center text-center">
          <div className="summary-title w-full text-left">🚨 Temuan Aktif</div>

          <div className="py-6 flex flex-col items-center justify-center space-y-2 text-emerald-600">
            <CheckCircle className="w-8 h-8" />
            <span className="text-sm font-bold">Tidak Ada Temuan Aktif</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. AREA SECURITY PERLU PERHATIAN (3 CARDS)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COVERAGE SECURITY */}
        <div className="summary-card flex flex-col items-center justify-center text-center">
          <div className="summary-title w-full text-left">
            <span>⚠️ Area Security Perlu Perhatian</span>
            <div className="text-xs font-bold uppercase tracking-wide text-rose-600 mt-1">
              Coverage Monitoring Terendah {monthName}
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
            <strong className="text-sm font-bold text-slate-800">
              Coverage Security baik
            </strong>
          </div>
        </div>

        {/* CHECKPOINT SECURITY BELUM DIPATROLI */}
        <div className="summary-card">
          <div className="summary-title">🚨 Checkpoint Security Belum Dipatroli</div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-red">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  POS GERBANG UTAMA - GERBANG UTAMA DEPAN
                </div>
                <small className="text-slate-500">site proyek demo</small>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="summary-badge badge-danger">
              1 Checkpoint
            </span>
          </div>
        </div>

        {/* CHECKPOINT SECURITY PERLU PERHATIAN */}
        <div className="summary-card">
          <div className="summary-title">🚨 Checkpoint Security Perlu Perhatian</div>

          <div className="summary-item">
            <div className="summary-left">
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  POS GERBANG UTAMA - GERBANG UTAMA DEPAN
                </div>
                <small className="text-slate-500">site proyek demo</small>
                <br />
                <small className="text-rose-600 font-semibold">28 hari terakhir</small>
              </div>
            </div>
            <div className="summary-value text-right">
              1
              <br />
              <small className="text-[11px] text-slate-500 font-normal">patroli</small>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          7. AREA CLEANING SERVICE (3 CARDS)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COVERAGE CLEANING */}
        <div className="summary-card flex flex-col items-center justify-center text-center">
          <div className="summary-title w-full text-left">
            <span>🧹 Area Cleaning Perlu Perhatian</span>
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 mt-1">
              Coverage Monitoring Terendah {monthName}
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
            <strong className="text-sm font-bold text-slate-800">
              Coverage Cleaning baik
            </strong>
          </div>
        </div>

        {/* CHECKPOINT CLEANING BELUM DICEK */}
        <div className="summary-card">
          <div className="summary-title">🧹 Checkpoint Cleaning Belum Dicek</div>

          <div className="summary-item">
            <div className="summary-left">
              <div className="summary-icon bg-green">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  TOILET - LOBBY
                </div>
                <small className="text-slate-500">site proyek demo</small>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="summary-badge badge-success">
              1 Checkpoint
            </span>
          </div>
        </div>

        {/* CHECKPOINT CLEANING PERLU PERHATIAN */}
        <div className="summary-card">
          <div className="summary-title">🧹 Checkpoint Cleaning Perlu Perhatian</div>

          <div className="summary-item">
            <div className="summary-left">
              <div>
                <div className="font-semibold text-xs text-slate-900">
                  TOILET - LOBBY
                </div>
                <small className="text-slate-500">site proyek demo</small>
                <br />
                <small className="text-emerald-600 font-semibold">28 hari terakhir</small>
              </div>
            </div>
            <div className="summary-value text-right">
              2
              <br />
              <small className="text-[11px] text-slate-500 font-normal">kegiatan</small>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          8. IZIN TIDAK MASUK (FULL WIDTH CARD)
          ======================================================== */}
      <div className="summary-card">
        <div className="summary-title">📋 Izin Tidak Masuk Hari Ini</div>

        <div className="text-center py-6 flex flex-col items-center justify-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
          <strong className="text-sm font-bold text-slate-800">
            Tidak ada personil yang izin hari ini
          </strong>
        </div>
      </div>
    </div>
  );
}
