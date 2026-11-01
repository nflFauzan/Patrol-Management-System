'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../lib/DataContext';
import 'leaflet/dist/leaflet.css';

interface TimelineItem {
  id: string;
  timeFormatted: string;
  officerName: string;
  role: string;
  checkpointName: string;
  taskDescription: string;
  locationDetail: string;
  status: 'Normal' | 'Perlu Tindak Lanjut';
  notes: string;
  siteName: string;
  lat: number;
  lng: number;
}

export const LaporanTrackingPatroliView: React.FC = () => {
  const { sites, checkpoints: allCheckpoints, users } = useData();

  // Filters
  const [selectedSite, setSelectedSite] = useState<string>('KANTOR PUSAT');
  const [selectedPersonil, setSelectedPersonil] = useState<string>('');
  const [selectedAset, setSelectedAset] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2026-10-26');
  const [toDate, setToDate] = useState<string>('2026-10-26');
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'MAP'>('TIMELINE');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Initial timeline data matching patroli.site live capture 100%
  const initialTimelineData: TimelineItem[] = [
    {
      id: 'pat-1',
      timeFormatted: 'Senin, 26 Oct 2026 | 05:34:00',
      officerName: 'SITI RAHAYU',
      role: 'ANGGOTA CLEANING SERVICE',
      checkpointName: 'TOILET LT 1',
      taskDescription: 'SANITASI DAN PENGECEKAN SABUN TISSUE KERING LANTAI',
      locationDetail: 'LANTAI 1 SAYAP TIMUR',
      status: 'Normal',
      notes: 'Sanitasi wastafel & kloset bersih, refill sabun dan tisu selesai.',
      siteName: 'KANTOR PUSAT',
      lat: -6.208763,
      lng: 106.845599,
    },
    {
      id: 'pat-2',
      timeFormatted: 'Senin, 26 Oct 2026 | 05:34:00',
      officerName: 'BUDI SANTOSO',
      role: 'KOMANDAN SECURITY',
      checkpointName: 'RUANG SERVER',
      taskDescription: 'PENGECEKAN AKSES PINTU SMART LOCK DAN SUHU AC SERVER',
      locationDetail: 'LANTAI 3 RUANG 305',
      status: 'Normal',
      notes: 'Smart lock aktif, suhu AC server 19C normal dan terkendali.',
      siteName: 'KANTOR PUSAT',
      lat: -6.2089,
      lng: 106.8457,
    },
    {
      id: 'pat-3',
      timeFormatted: 'Senin, 26 Oct 2026 | 05:33:00',
      officerName: 'ANDI RAHMAN',
      role: 'ANGGOTA SECURITY',
      checkpointName: 'PARKIR BASEMENT',
      taskDescription: 'PEMERIKSAAN AREA PARKIR MOBIL B1 DAN LAMPU DARURAT',
      locationDetail: 'BASEMENT LANTAI 1',
      status: 'Perlu Tindak Lanjut',
      notes: 'Lampu penerangan zona B1 padam, perlu penggantian bohlam oleh tim maintenance gedung.',
      siteName: 'KANTOR PUSAT',
      lat: -6.2086,
      lng: 106.8454,
    },
    {
      id: 'pat-4',
      timeFormatted: 'Senin, 26 Oct 2026 | 05:33:00',
      officerName: 'ANDI RAHMAN',
      role: 'ANGGOTA SECURITY',
      checkpointName: 'POS BELAKANG',
      taskDescription: 'PEMERIKSAAN PINTU KELUAR BELAKANG DAN KENDARAAN',
      locationDetail: 'PINTU BELAKANG GEDUNG',
      status: 'Normal',
      notes: 'Pintu belakang terkunci rapat, perimeter steril tanpa anomali.',
      siteName: 'KANTOR PUSAT',
      lat: -6.2091,
      lng: 106.8459,
    },
    {
      id: 'pat-5',
      timeFormatted: 'Senin, 26 Oct 2026 | 05:32:00',
      officerName: 'ANDI RAHMAN',
      role: 'ANGGOTA SECURITY',
      checkpointName: 'POS UTAMA LOBBY',
      taskDescription: 'PATROLI DAN PEMERIKSAAN TAMU DI PINTU MASUK UTAMA',
      locationDetail: 'LOBBY UTAMA LT. 1',
      status: 'Normal',
      notes: 'Pintu masuk utama terkunci aman, situasi kondusif.',
      siteName: 'KANTOR PUSAT',
      lat: -6.208763,
      lng: 106.845599,
    },
  ];

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(initialTimelineData);

  // Filter items
  const filteredItems = timelineItems.filter((item) => {
    if (selectedSite && !item.siteName.toLowerCase().includes(selectedSite.toLowerCase())) return false;
    if (selectedPersonil && !item.officerName.toLowerCase().includes(selectedPersonil.toLowerCase())) return false;
    if (selectedAset && !item.checkpointName.toLowerCase().includes(selectedAset.toLowerCase())) return false;
    return true;
  });

  // Available personil and aset based on site
  const filteredPersonilOptions = users.filter((u) => {
    if (!selectedSite) return true;
    return true;
  });

  const filteredAsetOptions = allCheckpoints.filter((cp) => {
    if (!selectedSite) return true;
    return true;
  });

  // Map initialization for MAP view mode
  useEffect(() => {
    if (viewMode !== 'MAP' || filteredItems.length === 0) return;

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

      const center = [filteredItems[0].lat, filteredItems[0].lng] as [number, number];
      const map = L.map(mapContainerRef.current).setView(center, 17);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const latlngs = filteredItems.map((item) => [item.lat, item.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);

      filteredItems.forEach((item, idx) => {
        const marker = L.marker([item.lat, item.lng]).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 4px;">
            <strong style="color: #1e3a8a;">#${idx + 1} ${item.checkpointName}</strong><br/>
            <span>Petugas: <b>${item.officerName}</b></span><br/>
            <span>Waktu: <b>${item.timeFormatted}</b></span><br/>
            <span>Status: <b style="color: ${item.status === 'Normal' ? '#16a34a' : '#dc2626'};">${item.status}</b></span><br/>
            <span>Catatan: ${item.notes}</span>
          </div>
        `);
      });

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
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
  }, [viewMode, filteredItems]);

  const handleReset = () => {
    setSelectedSite('');
    setSelectedPersonil('');
    setSelectedAset('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        /* ===================================================
           ENTERPRISE UI - TRACKING PATROLI (100% PARITY)
        =================================================== */
        .tracking-header-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
          color: #fff;
          border-radius: 20px;
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 14px 40px rgba(37,99,235,.20);
        }
        .filter-box-card {
          background: #fff;
          border: 1px solid rgba(37,99,235,.10);
          border-radius: 20px;
          padding: 22px;
          margin-bottom: 30px;
          box-shadow: 0 10px 35px rgba(15,23,42,.08);
        }
        .filter-label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: .5px;
          display: block;
        }
        .filter-input {
          height: 44px;
          border-radius: 12px;
          border: 1px solid #dbe4f0;
          background: #fff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          padding: 0 12px;
          width: 100%;
          outline: none;
          transition: border-color .2s;
        }
        .filter-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .btn-track {
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          transition: transform .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .btn-track:hover {
          transform: translateY(-2px);
        }
        .btn-track-success {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff;
        }
        .btn-track-danger {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #fff;
        }
        .btn-track-secondary {
          background: linear-gradient(135deg, #475569, #334155);
          color: #fff;
        }

        /* ================= TIMELINE 100% PARITY ================= */
        .timeline-patroli-wrap {
          position: relative;
          padding: 20px 0 40px;
        }
        .timeline-patroli-wrap::before {
          content: '';
          position: absolute;
          width: 4px;
          background: linear-gradient(to bottom, #2563eb, #16a34a);
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50px;
        }
        .timeline-item-entry {
          position: relative;
          margin-bottom: 35px;
          display: flex;
          width: 100%;
        }
        .timeline-item-entry.left {
          justify-content: flex-start;
        }
        .timeline-item-entry.right {
          justify-content: flex-end;
        }
        .timeline-bubble-content {
          width: 44%;
          position: relative;
          background: #fff;
          padding: 18px 20px;
          border-radius: 20px;
          box-shadow: 0 10px 35px rgba(15,23,42,.08);
          transition: transform .25s ease, box-shadow .25s ease;
          border: 1px solid rgba(37,99,235,.08);
          font-size: 13px;
          line-height: 1.8;
          color: #334155;
        }
        .timeline-bubble-content:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(37,99,235,.15);
        }
        .timeline-dot-pin {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 50%;
          position: absolute;
          left: 50%;
          top: 22px;
          transform: translateX(-50%);
          border: 4px solid #fff;
          box-shadow: 0 8px 18px rgba(37,99,235,.25);
          z-index: 2;
        }
        .timeline-bubble-content::before {
          content: '';
          position: absolute;
          top: 26px;
          width: 22px;
          height: 3px;
          background: #2563eb;
          border-radius: 50px;
        }
        .timeline-item-entry.left .timeline-bubble-content {
          margin-left: 3%;
        }
        .timeline-item-entry.left .timeline-bubble-content::before {
          right: -22px;
        }
        .timeline-item-entry.right .timeline-bubble-content {
          margin-right: 3%;
        }
        .timeline-item-entry.right .timeline-bubble-content::before {
          left: -22px;
        }

        @media(max-width: 768px) {
          .timeline-patroli-wrap::before {
            left: 18px;
          }
          .timeline-dot-pin {
            left: 18px;
            width: 32px;
            height: 32px;
          }
          .timeline-item-entry {
            justify-content: flex-start !important;
          }
          .timeline-bubble-content {
            width: calc(100% - 50px);
            margin-left: 50px !important;
            margin-right: 0 !important;
          }
          .timeline-bubble-content::before {
            display: none;
          }
        }

        @media print {
          .filter-box-card, .btn-track, .view-toggle-wrap {
            display: none !important;
          }
          .timeline-bubble-content {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .timeline-patroli-wrap::before {
            background: #000 !important;
          }
          .timeline-dot-pin {
            background: #000 !important;
          }
        }
      `}} />

      {/* Header Banner */}
      <div className="tracking-header-banner">
        <div>
          <h4 className="text-xl font-bold flex items-center gap-2 m-0 text-white">
            <span>📍 Tracking Patroli Personil</span>
          </h4>
          <p className="text-xs text-blue-100 m-0 mt-1">
            Visualisasi Kronologis Pemindaian Checkpoint & Monitoring Rute Petugas di Lapangan
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="view-toggle-wrap flex items-center gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setViewMode('TIMELINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'TIMELINE' ? 'bg-white text-blue-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            <i className="fa fa-list-ul mr-1"></i> Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('MAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'MAP' ? 'bg-white text-blue-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            <i className="fa fa-map mr-1"></i> Peta Spasial
          </button>
        </div>
      </div>

      {/* Filter Box (Form Identik Patroli Site) */}
      <div className="filter-box-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Lokasi Area */}
          <div className="md:col-span-3">
            <label className="filter-label">Lokasi Area</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Pilih Lokasi --</option>
              <option value="KANTOR PUSAT">Kantor Pusat</option>
              <option value="PABRIK BEKASI">Pabrik Bekasi</option>
              <option value="GUDANG CAKUNG">Gudang Cakung</option>
              <option value="POOL KENDARAAN">Pool Kendaraan</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name.toUpperCase()}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Personil */}
          <div className="md:col-span-3">
            <label className="filter-label">Nama Personil</label>
            <select
              value={selectedPersonil}
              onChange={(e) => setSelectedPersonil(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Semua Personil --</option>
              <option value="ANDI RAHMAN">Andi Rahman (Security)</option>
              <option value="BUDI SANTOSO">Budi Santoso (Komandan)</option>
              <option value="SITI RAHAYU">Siti Rahayu (Cleaning)</option>
              <option value="RUDI HARTONO">Rudi Hartono (Driver)</option>
              <option value="HENDRA GUNAWAN">Hendra Gunawan (Staff)</option>
              {filteredPersonilOptions.map((u) => (
                <option key={u.id} value={u.fullName.toUpperCase()}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Checkpoint Aset */}
          <div className="md:col-span-2">
            <label className="filter-label">Check Point Aset</label>
            <select
              value={selectedAset}
              onChange={(e) => setSelectedAset(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Semua Aset --</option>
              <option value="POS UTAMA LOBBY">Pos Utama Lobby</option>
              <option value="POS BELAKANG">Pos Belakang</option>
              <option value="PARKIR BASEMENT">Parkir Basement</option>
              <option value="TOILET LT 1">Toilet Lt 1</option>
              <option value="TOILET LT 2">Toilet Lt 2</option>
              <option value="RUANG SERVER">Ruang Server</option>
              {filteredAsetOptions.map((cp) => (
                <option key={cp.id} value={cp.name.toUpperCase()}>
                  {cp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dari Tanggal */}
          <div className="md:col-span-2">
            <label className="filter-label">Dari Tanggal</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="md:col-span-2">
            <label className="filter-label">Sampai Tanggal</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Buttons Row */}
          <div className="md:col-span-12 flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="btn-track btn-track-success"
              onClick={() => {
                // Filter is reactive via state
              }}
            >
              <i className="fa fa-filter"></i> Filter
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-track btn-track-danger"
            >
              🖨️ Cetak / Download PDF
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-track btn-track-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Timeline vs Map */}
      {viewMode === 'TIMELINE' ? (
        <div className="timeline-patroli-wrap">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <i className="fa fa-map-marker text-4xl text-slate-300 mb-2"></i>
              <p className="text-slate-600 font-semibold text-sm">
                Tidak ada data patroli untuk filter yang dipilih.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isLeft = idx % 2 === 1;
              const isAlert = item.status === 'Perlu Tindak Lanjut';

              return (
                <div
                  key={item.id}
                  className={`timeline-item-entry ${isLeft ? 'left' : 'right'}`}
                >
                  <div className="timeline-dot-pin"></div>
                  <div
                    className="timeline-bubble-content"
                    style={{
                      borderLeft: `5px solid ${isAlert ? '#dc3545' : '#6c757d'}`,
                    }}
                  >
                    <b className="text-slate-900 font-bold block mb-1">
                      🕒 {item.timeFormatted}
                    </b>

                    <div className="text-xs text-slate-700 leading-relaxed">
                      <div>👤 {item.officerName} - {item.role}</div>
                      <div>🏢 {item.checkpointName}</div>
                      <div>📄 {item.taskDescription}</div>
                      <div>📍 {item.locationDetail}</div>
                      <div className="mt-1">
                        <span
                          className="px-2 py-0.5 rounded text-white text-[11px] font-bold"
                          style={{
                            backgroundColor: isAlert ? '#dc3545' : '#6c757d',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        📝 {item.notes}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Map View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <i className="fa fa-map text-blue-600"></i>
              <span>Rute Perjalanan & Titik Patroli Terpilih</span>
            </h6>
            <span className="text-xs font-semibold text-slate-500">
              Total {filteredItems.length} Titik Pemindaian
            </span>
          </div>
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '520px', borderRadius: '14px', overflow: 'hidden' }}
          ></div>
        </div>
      )}
    </div>
  );
};
