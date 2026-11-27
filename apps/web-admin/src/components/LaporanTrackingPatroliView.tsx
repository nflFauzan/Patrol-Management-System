'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../lib/DataContext';
import { API_BASE_URL } from '../lib/api';
import { HourlyPatrolMatrixTab } from './HourlyPatrolMatrixTab';
import { PatroliDetailModal } from './PatroliDetailModal';
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
  ticketStatus?: string | null;
  notes: string;
  siteName: string;
  lat: number;
  lng: number;
}

const getWibToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

const escapeHtml = (str: string) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatWibTimestamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '-');
  const datePart = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(d);
  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(d);
  return `${datePart} | ${timePart} WIB`;
};

export const LaporanTrackingPatroliView: React.FC = () => {
  const { sites, checkpoints: allCheckpoints, users, dashboardSummary, patrolRefreshTick, joinSiteRoom } = useData();

  // Filters (live UUID / WIB date)
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(getWibToday);
  const [toDate, setToDate] = useState<string>(getWibToday);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'MAP' | 'MATRIX'>('TIMELINE');

  // Live API state
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const fetchPatrolLogs = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patrol_auth_token') || localStorage.getItem('token')
        : null;
    if (!token) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const qs = new URLSearchParams({ limit: '100' });
      if (selectedSiteId) qs.set('siteId', selectedSiteId);
      if (selectedUserId) qs.set('userId', selectedUserId);
      if (selectedCheckpointId) qs.set('checkpointId', selectedCheckpointId);
      if (fromDate) qs.set('dateFrom', fromDate);
      if (toDate) qs.set('dateTo', toDate);

      const res = await fetch(`${API_BASE_URL}/patrol/logs?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Gagal memuat data patroli (HTTP ${res.status})`);
      }
      const rows: any[] = await res.json();
      const mapped: TimelineItem[] = (Array.isArray(rows) ? rows : []).map((r) => {
        const isAlert =
          (r.statusResult || '').toLowerCase().includes('tindak') ||
          (r.statusResult || '').toLowerCase().includes('perlu');
        return {
          id: String(r.id),
          timeFormatted: formatWibTimestamp(r.scannedAt),
          officerName: (r.officerName || 'Petugas').toUpperCase(),
          role: [r.officerDivision, r.officerRole].filter(Boolean).join(' • ') || 'PERSONIL',
          checkpointName: (r.checkpointName || '-').toUpperCase(),
          taskDescription: r.taskDescription || 'Pemeriksaan area & checkpoint',
          locationDetail: (r.locationDetail || r.siteName || '-').toUpperCase(),
          status: isAlert ? 'Perlu Tindak Lanjut' : 'Normal',
          ticketStatus: r.ticketStatus || null,
          notes: r.notes || '-',
          siteName: r.siteName || '-',
          lat: Number(r.latitude) || 0,
          lng: Number(r.longitude) || 0,
        };
      });
      setTimelineItems(mapped);
    } catch (err: any) {
      setTimelineItems([]);
      setErrorMsg(err?.message || 'Gagal memuat riwayat patroli dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSiteId, selectedUserId, selectedCheckpointId, fromDate, toDate]);

  useEffect(() => {
    fetchPatrolLogs();
  }, [fetchPatrolLogs, patrolRefreshTick]);

  useEffect(() => {
    if (selectedSiteId) {
      joinSiteRoom(selectedSiteId);
    }
  }, [selectedSiteId, joinSiteRoom]);

  // Cascading options based on selectedSiteId
  const filteredPersonilOptions = users.filter((u) => {
    if (!selectedSiteId) return true;
    return u.siteId === selectedSiteId || (u.multiSiteIds || []).includes(selectedSiteId);
  });

  const filteredAsetOptions = allCheckpoints.filter((cp) => {
    if (!selectedSiteId) return true;
    return cp.siteId === selectedSiteId;
  });

  // Map initialization for MAP view mode
  useEffect(() => {
    const mappableItems = timelineItems.filter((item) => item.lat !== 0 && item.lng !== 0);
    if (viewMode !== 'MAP' || mappableItems.length === 0) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center = [mappableItems[0].lat, mappableItems[0].lng] as [number, number];
      const map = L.map(mapContainerRef.current).setView(center, 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const latlngs = mappableItems.map((item) => [item.lat, item.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);

      mappableItems.forEach((item, idx) => {
        const marker = L.marker([item.lat, item.lng]).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 4px;">
            <strong style="color: #1e3a8a;">#${idx + 1} ${escapeHtml(item.checkpointName)}</strong><br/>
            <span>Petugas: <b>${escapeHtml(item.officerName)}</b></span><br/>
            <span>Waktu: <b>${escapeHtml(item.timeFormatted)}</b></span><br/>
            <span>Status: <b style="color: ${item.status === 'Normal' ? '#16a34a' : '#dc2626'};">${escapeHtml(item.status)}</b></span><br/>
            <span>Catatan: ${escapeHtml(item.notes)}</span>
          </div>
        `);
      });

      if (latlngs.length > 1) {
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
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
  }, [viewMode, timelineItems]);

  const handleReset = () => {
    const today = getWibToday();
    setSelectedSiteId('');
    setSelectedUserId('');
    setSelectedCheckpointId('');
    setFromDate(today);
    setToDate(today);
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
          <button
            type="button"
            onClick={() => setViewMode('MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'MATRIX' ? 'bg-white text-blue-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            <i className="fa fa-th mr-1"></i> Matriks 24 Jam
          </button>
        </div>
      </div>

      {/* Live Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Total Pemindaian (Filter)</div>
            <div className="text-xl font-extrabold text-slate-800">{timelineItems.length}</div>
          </div>
          <i className="fa fa-qrcode text-2xl text-blue-600/80"></i>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Perlu Tindak Lanjut</div>
            <div className="text-xl font-extrabold text-red-600">
              {timelineItems.filter((i) => i.status === 'Perlu Tindak Lanjut').length}
            </div>
          </div>
          <i className="fa fa-exclamation-triangle text-2xl text-red-500/80"></i>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Personil Bertugas (Hari Ini)</div>
            <div className="text-xl font-extrabold text-emerald-700">
              {dashboardSummary?.activePatrol?.count ?? 0}
            </div>
          </div>
          <i className="fa fa-shield text-2xl text-emerald-600/80"></i>
        </div>
      </div>

      {/* Filter Box */}
      <div className="filter-box-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Lokasi Area */}
          <div className="md:col-span-3">
            <label className="filter-label">Lokasi Area</label>
            <select
              value={selectedSiteId}
              onChange={(e) => {
                setSelectedSiteId(e.target.value);
                setSelectedUserId('');
                setSelectedCheckpointId('');
              }}
              className="filter-input"
            >
              <option value="">-- Semua Lokasi --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Personil */}
          <div className="md:col-span-3">
            <label className="filter-label">Nama Personil</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Semua Personil --</option>
              {filteredPersonilOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.division || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Checkpoint Aset */}
          <div className="md:col-span-2">
            <label className="filter-label">Check Point Aset</label>
            <select
              value={selectedCheckpointId}
              onChange={(e) => setSelectedCheckpointId(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Semua Aset --</option>
              {filteredAsetOptions.map((cp) => (
                <option key={cp.id} value={cp.id}>
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
              onClick={fetchPatrolLogs}
              disabled={isLoading}
            >
              <i className={`fa ${isLoading ? 'fa-spinner fa-spin' : 'fa-filter'}`}></i>{' '}
              {isLoading ? 'Memuat...' : 'Filter / Refresh'}
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

      {errorMsg && viewMode !== 'MATRIX' && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={fetchPatrolLogs}
            className="font-bold underline hover:text-red-900"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Content: Timeline vs Map vs Matrix */}
      {viewMode === 'MATRIX' ? (
        <HourlyPatrolMatrixTab selectedSiteId={selectedSiteId} />
      ) : viewMode === 'TIMELINE' ? (
        <div className="timeline-patroli-wrap">
          {isLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <i className="fa fa-spinner fa-spin text-3xl text-blue-600 mb-2"></i>
              <p className="text-slate-600 font-semibold text-sm">Memuat data pemindaian patroli...</p>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <i className="fa fa-map-marker text-4xl text-slate-300 mb-2"></i>
              <p className="text-slate-600 font-semibold text-sm">
                Belum ada data transaksi patroli untuk filter dan rentang tanggal yang dipilih.
              </p>
            </div>
          ) : (
            timelineItems.map((item, idx) => {
              const isLeft = idx % 2 === 1;
              const isAlert = item.status === 'Perlu Tindak Lanjut';

              return (
                <div
                  key={item.id}
                  className={`timeline-item-entry ${isLeft ? 'left' : 'right'}`}
                >
                  <div className="timeline-dot-pin"></div>
                  <div
                    onClick={() => setSelectedDetailId(item.id)}
                    className="timeline-bubble-content cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                    style={{
                      borderLeft: `5px solid ${isAlert ? '#dc3545' : '#6c757d'}`,
                    }}
                  >
                    <b className="text-slate-900 font-bold block mb-1">
                      🕒 {item.timeFormatted}
                    </b>

                    <div className="text-xs text-slate-700 leading-relaxed">
                      <div>👤 {item.officerName} - {item.role}</div>
                      <div>🏢 {item.checkpointName} ({item.siteName})</div>
                      <div>📄 {item.taskDescription}</div>
                      <div>📍 {item.locationDetail}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-white text-[11px] font-bold"
                          style={{
                            backgroundColor: isAlert ? '#dc3545' : '#6c757d',
                          }}
                        >
                          {item.status}
                        </span>
                        {item.ticketStatus && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                            Tiket: {item.ticketStatus}
                          </span>
                        )}
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
              Total {timelineItems.length} Titik Pemindaian
            </span>
          </div>
          {timelineItems.filter((i) => i.lat !== 0 && i.lng !== 0).length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <i className="fa fa-map-o text-4xl text-slate-300 mb-2"></i>
              <p className="text-slate-500 font-semibold text-sm">
                Belum ada koordinat GPS patroli untuk ditampilkan pada peta.
              </p>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              style={{ width: '100%', height: '520px', borderRadius: '14px', overflow: 'hidden' }}
            ></div>
          )}
        </div>
      )}

      <PatroliDetailModal
        isOpen={Boolean(selectedDetailId)}
        onClose={() => setSelectedDetailId(null)}
        patrolId={selectedDetailId}
      />
    </div>
  );
};
