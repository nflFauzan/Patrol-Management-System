'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Car, Building, Clock, ChevronLeft, ChevronRight, Navigation, MapPin } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { DriverDetailModal, DriverDetailData } from './DriverDetailModal';
import { API_BASE_URL } from '@/lib/api';

export const LaporanDriverView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal detail states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<DriverDetailData | null>(null);

  const initialDemoRecords: DriverDetailData[] = [
    {
      id: 'drv-6',
      siteName: 'POOL KENDARAAN',
      driverName: 'RUDI HARTONO',
      vehicle: 'DAIHATSU G - B 1234 KLM',
      departureTime: 'SENIN, 26 OCT 2026 - 05:49:00',
      destination: 'PABRIK BEKASI',
      purpose: 'Pengiriman dokumen audit fasilitas pabrik',
      tripNotes: 'Dalam perjalanan via Tol Jakarta-Cikampek',
      status: 'BERANGKAT',
      departureLat: -6.215678,
      departureLng: 106.834567,
      departurePhotoUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'drv-5',
      siteName: 'POOL KENDARAAN',
      driverName: 'RUDI HARTONO',
      vehicle: 'TRUK BOX I - B 9876 XYZ',
      departureTime: 'SENIN, 26 OCT 2026 - 05:47:00',
      arrivalTime: 'SENIN, 26 OCT 2026 - 05:49:00',
      destination: 'GUDANG CAKUNG, JAKARTA TIMUR',
      purpose: 'Distribusi logistik sparepart fasilitas pabrik',
      tripNotes: 'Tiba di Gudang Cakung tepat waktu, bongkar muatan selesai dan aman.',
      status: 'SUDAH SAMPAI',
      departureLat: -6.215678,
      departureLng: 106.834567,
      departurePhotoUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
      arrivalLat: -6.174521,
      arrivalLng: 106.923456,
      arrivalPhotoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const [records, setRecords] = useState<DriverDetailData[]>(initialDemoRecords);

  useEffect(() => {
    let isMounted = true;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || ''
        : '';

    fetch(`${API_BASE_URL}/driver/trips`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: DriverDetailData[] = data.map((t: any) => ({
            id: t.id,
            siteName: t.siteName ? t.siteName.toUpperCase() : 'POOL KENDARAAN',
            driverName: t.driverName ? t.driverName.toUpperCase() : 'RUDI HARTONO',
            vehicle: `${t.vehicleType || 'KENDARAAN'} - ${t.vehiclePlateNumber || 'B 1234 ABC'}`.toUpperCase(),
            departureTime: t.startedAt ? new Date(t.startedAt).toLocaleString('id-ID') : 'SENIN, 26 OCT 2026 - 05:47:00',
            arrivalTime: t.arrivedAt ? new Date(t.arrivedAt).toLocaleString('id-ID') : undefined,
            destination: t.destinationLocation ? t.destinationLocation.toUpperCase() : 'GUDANG LOGISTIK',
            purpose: t.tripNotes || 'Distribusi logistik operasional',
            tripNotes: t.tripNotes || 'Perjalanan selesai dengan lancar.',
            status: t.tripStatus === 'COMPLETED' ? 'SUDAH SAMPAI' : 'BERANGKAT',
            departureLat: -6.215678,
            departureLng: 106.834567,
            departurePhotoUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
            arrivalLat: t.tripStatus === 'COMPLETED' ? -6.174521 : undefined,
            arrivalLng: t.tripStatus === 'COMPLETED' ? 106.923456 : undefined,
            arrivalPhotoUrl:
              t.tripStatus === 'COMPLETED'
                ? 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=400'
                : undefined,
          }));
          setRecords(mapped);
        }
      })
      .catch(() => {
        // Fallback demo data
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = records.filter((r) => {
    if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
    if (searchTerm) {
      const match =
        r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageLength));
  const displayedRows = filtered.slice((currentPage - 1) * pageLength, currentPage * pageLength);

  return (
    <div className="space-y-4">
      {/* Modern Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {/* Controls Bar: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Cari driver, armada, atau tujuan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 transition"
              />
            </div>

            {/* Site Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedSiteName}
                onChange={(e) => {
                  setSelectedSiteName(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-3 py-2 pr-7 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Semua Pool / Lokasi</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Length */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={pageLength}
              onChange={(e) => {
                setPageLength(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>data per halaman</span>
          </div>
        </div>

        {/* Clean Modern Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <th className="py-3 px-4 rounded-l-xl">Pool / Asal</th>
                <th className="py-3 px-4">Driver & Armada</th>
                <th className="py-3 px-4">Tujuan & Keperluan</th>
                <th className="py-3 px-4">Status & Waktu</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada catatan perjalanan armada yang sesuai filter.
                  </td>
                </tr>
              ) : (
                displayedRows.map((trip) => {
                  const isCompleted = trip.status === 'SUDAH SAMPAI';

                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/70 transition">
                      {/* Asal */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>{trip.siteName}</span>
                        </div>
                      </td>

                      {/* Driver & Armada */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trip.driverName}</div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-semibold mt-0.5">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{trip.vehicle}</span>
                        </div>
                      </td>

                      {/* Tujuan & Keperluan */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center space-x-1 text-slate-900 font-bold text-[11px]">
                          <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                          <span>{trip.destination}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                          {trip.purpose}
                        </p>
                      </td>

                      {/* Status & Waktu */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                          {trip.status}
                        </span>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{trip.departureTime.split('-')[1]?.trim() || trip.departureTime}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold inline-flex items-center space-x-1 border border-teal-200/60 transition shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{displayedRows.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filtered.length}</span> data
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${pg === currentPage
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-semibold transition flex items-center space-x-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tripId={selectedTrip?.id || null}
        detailData={selectedTrip}
      />
    </div>
  );
};
