'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Truck, 
  Download,
  Building2
} from 'lucide-react';

export default function DashboardPage() {
  const [selectedDivision, setSelectedDivision] = useState<'ALL' | 'SECURITY' | 'CLEANING' | 'DRIVER'>('ALL');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            PMS
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Facility & Patrol Command Center</h1>
            <p className="text-xs text-slate-400">Single-Tenant Corporate In-House Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time System Online</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-300 border-l border-slate-700 pl-4">
            <span className="font-semibold text-white">Superadmin</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">HQ Central</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Personil On-Duty</p>
              <h3 className="text-2xl font-bold text-slate-900">42 / 45</h3>
              <p className="text-xs text-emerald-600 font-medium">93% Kehadiran Shift</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patroli Selesai</p>
              <h3 className="text-2xl font-bold text-slate-900">18 / 24</h3>
              <p className="text-xs text-slate-500">75% Target Shift Tercapai</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Titik Checkpoint</p>
              <h3 className="text-2xl font-bold text-slate-900">128 Titik</h3>
              <p className="text-xs text-slate-500">Tersebar di 2 Fasilitas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Panic SOS Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900">0 Kasus</h3>
              <p className="text-xs text-emerald-600 font-medium">Kondisi Aman Terkendali</p>
            </div>
          </div>
        </div>

        {/* Division Filter & HRIS Export Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Divisi:</span>
            <button 
              onClick={() => setSelectedDivision('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedDivision === 'ALL' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Semua Divisi
            </button>
            <button 
              onClick={() => setSelectedDivision('SECURITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'SECURITY' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Satpam (Security)</span>
            </button>
            <button 
              onClick={() => setSelectedDivision('CLEANING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'CLEANING' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cleaning Service</span>
            </button>
            <button 
              onClick={() => setSelectedDivision('DRIVER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${selectedDivision === 'DRIVER' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver Armada</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg shadow transition">
              <Download className="w-3.5 h-3.5" />
              <span>Export Rekap HRIS (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Monitoring Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Status Fasilitas & Lokasi</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">PostGIS Geofence</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Head Office Sudirman</h4>
                    <p className="text-xs text-slate-500">Kav. 52-53, Jakarta Selatan</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Radius 100m</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Petugas Aktif: 18 Orang</span>
                  <span className="text-blue-600 font-medium">6 Checkpoint Security</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Warehouse & Factory Cikarang</h4>
                    <p className="text-xs text-slate-500">Kawasan Industri GIIC, Bekasi</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Radius 250m</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Petugas Aktif: 24 Orang</span>
                  <span className="text-blue-600 font-medium">14 Checkpoint Area</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Live Feed Aktivitas Lapangan (Real-time Socket.io)</span>
              </h2>
              <span className="text-xs text-slate-400">Pembaruan otomatis</span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  SEC
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Ahmad Fauzi (Satpam Regu A)</p>
                    <span className="text-xs text-slate-400">10:04 WIB</span>
                  </div>
                  <p className="text-xs text-slate-600">Scan Checkpoint #3: Ruang Server IT — Kondisi Aman Terkendali</p>
                  <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Jarak: 3 meter dari pin GPS</span>
                </div>
              </div>

              <div className="py-3 flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  CLN
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Siti Rahma (Cleaning Floor 2)</p>
                    <span className="text-xs text-slate-400">09:58 WIB</span>
                  </div>
                  <p className="text-xs text-slate-600">Checklist Sanitasi Lantai 2 Selesai — Lantai disinfektan, stok hand sanitizer diisi ulang</p>
                </div>
              </div>

              <div className="py-3 flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  DRV
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Budi Santoso (Driver Operasional)</p>
                    <span className="text-xs text-slate-400">09:45 WIB</span>
                  </div>
                  <p className="text-xs text-slate-600">Perjalanan Logistik: HQ Sudirman ➔ Cikarang (B 1234 CD) Odo: 45.210 km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
