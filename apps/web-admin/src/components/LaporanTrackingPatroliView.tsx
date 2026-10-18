'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../lib/DataContext';
import 'leaflet/dist/leaflet.css';

interface CheckpointPin {
  id: string;
  name: string;
  sequence: number;
  lat: number;
  lng: number;
  scannedAt: string;
  status: 'AMAN' | 'TEMUAN';
  officer: string;
}

export const LaporanTrackingPatroliView: React.FC = () => {
  const { sites, users } = useData();

  const [selectedSite, setSelectedSite] = useState<string>('Site Proyek Demo');
  const [selectedPetugas, setSelectedPetugas] = useState<string>('Budi Satpam Test');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-18');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Demo checkpoints along route
  const checkpoints: CheckpointPin[] = [
    {
      id: 'cp-1',
      name: 'Pos Gerbang Utama',
      sequence: 1,
      lat: -6.562732,
      lng: 106.856083,
      scannedAt: '18:01:00',
      status: 'AMAN',
      officer: 'Budi Satpam Test',
    },
    {
      id: 'cp-2',
      name: 'Lobby & Resepsionis Lt 1',
      sequence: 2,
      lat: -6.562300,
      lng: 106.856400,
      scannedAt: '18:15:30',
      status: 'AMAN',
      officer: 'Budi Satpam Test',
    },
    {
      id: 'cp-3',
      name: 'Area Parkir Basemen B1',
      sequence: 3,
      lat: -6.562100,
      lng: 106.855900,
      scannedAt: '18:28:10',
      status: 'AMAN',
      officer: 'Budi Satpam Test',
    },
    {
      id: 'cp-4',
      name: 'Ruang Genset & Panel Listrik',
      sequence: 4,
      lat: -6.562900,
      lng: 106.855500,
      scannedAt: '18:40:00',
      status: 'AMAN',
      officer: 'Budi Satpam Test',
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = await import('leaflet');

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const centerLat = checkpoints[0].lat;
      const centerLng = checkpoints[0].lng;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add polyline path
      const latlngs = checkpoints.map((cp) => [cp.lat, cp.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: '#0d6efd',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8,
      }).addTo(map);

      // Add markers
      checkpoints.forEach((cp) => {
        const marker = L.marker([cp.lat, cp.lng]).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0d6efd;">#${cp.sequence} ${cp.name}</strong><br/>
            <span>Petugas: <b>${cp.officer}</b></span><br/>
            <span>Waktu: <b>${cp.scannedAt} WIB</b></span><br/>
            <span>Status: <span style="color: #10b981; font-weight: bold;">● ${cp.status}</span></span>
          </div>
        `);
      });

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedSite, selectedPetugas, selectedDate]);

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style jsx global>{`
        .tracking-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>

      <div className="tracking-container">
        <div className="row">
          <div className="col-12" style={{ marginTop: '10px' }}>
            {/* Header: TRACKING PATROLI PERSONIL */}
            <div
              className="card-header alert bg-primary text-light flex items-center gap-2 shadow-xs"
              style={{
                backgroundColor: '#0d6efd',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              <i className="fa fa-map-marker" style={{ fontSize: '18px' }}></i>
              <small style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
                TRACKING PATROLI PERSONIL
              </small>
            </div>

            {/* Body */}
            <div
              className="card-body border border-primary rounded shadow-xs"
              style={{
                borderColor: '#0d6efd',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '0 0 8px 8px',
                backgroundColor: '#fff',
                padding: '20px',
              }}
            >
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PILIH LOKASI :
                  </label>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-blue-600"
                  >
                    <option value="Site Proyek Demo">Site Proyek Demo</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PETUGAS :
                  </label>
                  <select
                    value={selectedPetugas}
                    onChange={(e) => setSelectedPetugas(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-blue-600"
                  >
                    <option value="Budi Satpam Test">Budi Satpam Test (Security)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.fullName}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    TANGGAL :
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-blue-600 font-bold block uppercase">Checkpoint</span>
                  <span className="text-lg font-black text-blue-900">{checkpoints.length} Pos</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-emerald-600 font-bold block uppercase">Status Rute</span>
                  <span className="text-lg font-black text-emerald-900">100% Selesai</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-amber-600 font-bold block uppercase">Durasi Total</span>
                  <span className="text-lg font-black text-amber-900">39 Menit</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-slate-600 font-bold block uppercase">Situasi</span>
                  <span className="text-lg font-black text-slate-900">Aman Terkendali</span>
                </div>
              </div>

              {/* Map */}
              <div
                ref={mapContainerRef}
                style={{
                  height: '460px',
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  zIndex: 1,
                }}
              />

              {/* Checkpoint Sequence List */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                  Urutan Pemindaian Checkpoint:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {cp.sequence}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{cp.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{cp.scannedAt} WIB</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {cp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
