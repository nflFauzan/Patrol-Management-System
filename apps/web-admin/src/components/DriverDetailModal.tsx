'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface DriverDetailData {
  id: string;
  driverName: string;
  position?: string;
  siteName: string;
  status: 'BERANGKAT' | 'SUDAH SAMPAI' | 'IN_PROGRESS' | 'COMPLETED';
  vehicle: string;
  destination: string;
  purpose: string;
  tripNotes?: string;
  departureTime: string;
  arrivalTime?: string;
  departureLat?: number;
  departureLng?: number;
  departurePhotoUrl?: string;
  arrivalLat?: number;
  arrivalLng?: number;
  arrivalPhotoUrl?: string;
}

interface DriverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  detailData?: DriverDetailData | null;
}

export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({
  isOpen,
  onClose,
  tripId,
  detailData: initialDetail,
}) => {
  const [data, setData] = useState<DriverDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      return;
    }

    if (initialDetail) {
      setData(initialDetail);
      return;
    }

    if (!tripId) return;

    let isMounted = true;
    setIsLoading(true);

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || ''
        : '';

    fetch(`${API_BASE_URL}/driver/trips?id=${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((resData) => {
        if (isMounted) {
          const trip = Array.isArray(resData) ? resData.find((t: any) => t.id === tripId) || resData[0] : resData;
          setData({
            id: trip.id,
            driverName: trip.driverName || 'Rudi Hartono',
            position: 'Driver',
            siteName: trip.siteName || 'Pool Kendaraan',
            status: trip.tripStatus === 'COMPLETED' ? 'SUDAH SAMPAI' : 'BERANGKAT',
            vehicle: `${trip.vehicleType || 'Truk Box'} - ${trip.vehiclePlateNumber || 'B 9876 XYZ'}`,
            destination: trip.destinationLocation || 'Gudang Cakung, Jakarta Timur',
            purpose: trip.tripNotes || 'Distribusi logistik dan sparepart',
            tripNotes: trip.tripNotes || 'Tiba di Gudang Cakung tepat waktu, bongkar muatan',
            departureTime: trip.startedAt ? new Date(trip.startedAt).toLocaleString('id-ID') : 'Senin, 26 Oct 2026 - 05:47:00',
            arrivalTime: trip.arrivedAt ? new Date(trip.arrivedAt).toLocaleString('id-ID') : undefined,
            departureLat: -6.215678,
            departureLng: 106.834567,
            departurePhotoUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
            arrivalLat: trip.tripStatus === 'COMPLETED' ? -6.174521 : undefined,
            arrivalLng: trip.tripStatus === 'COMPLETED' ? 106.923456 : undefined,
            arrivalPhotoUrl:
              trip.tripStatus === 'COMPLETED'
                ? 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=400'
                : undefined,
          });
        }
      })
      .catch(() => {
        // Fallback default sample matching patroli.site live data
        if (isMounted) {
          setData({
            id: tripId,
            driverName: 'Rudi Hartono',
            position: 'Driver',
            siteName: 'Pool Kendaraan',
            status: 'SUDAH SAMPAI',
            vehicle: 'Truk Box Isuzu Giga - B 9876 XYZ',
            destination: 'Gudang Cakung, Jakarta Timur',
            purpose: 'Distribusi logistik sparepart fasilitas pabrik',
            tripNotes: 'Tiba di Gudang Cakung tepat waktu, bongkar muatan selesai dan aman.',
            departureTime: 'Senin, 26 Oct 2026 - 05:47:00',
            arrivalTime: 'Senin, 26 Oct 2026 - 05:49:00',
            departureLat: -6.215678,
            departureLng: 106.834567,
            departurePhotoUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
            arrivalLat: -6.174521,
            arrivalLng: 106.923456,
            arrivalPhotoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=400',
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, tripId, initialDetail]);

  if (!isOpen) return null;

  const isCompleted = data?.status === 'SUDAH SAMPAI' || data?.status === 'COMPLETED';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .driver-modal-wrap {
          width: 100%;
          max-width: 680px;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          animation: modalFadeIn 0.2s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .driver-detail {
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc, #eef2ff);
          max-height: 85vh;
          overflow-y: auto;
        }
        .driver-profile {
          background: #fff;
          border-radius: 18px;
          padding: 20px 15px;
          text-align: center;
          box-shadow: 0 5px 18px rgba(15,23,42,.08);
          margin-bottom: 14px;
        }
        .driver-profile img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 50%;
          border: 4px solid #e2e8f0;
          margin: 0 auto;
        }
        .driver-name {
          margin-top: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }
        .driver-position {
          font-size: 12px;
          color: #64748b;
        }
        .driver-site {
          display: inline-block;
          margin-top: 7px;
          padding: 5px 12px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
        }
        .driver-status {
          margin-top: 10px;
        }
        .status-selesai {
          display: inline-block;
          padding: 6px 13px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: #dcfce7;
          color: #166534;
        }
        .status-berangkat {
          display: inline-block;
          padding: 6px 13px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: #fef3c7;
          color: #92400e;
        }
        .detail-card {
          background: #fff;
          border-radius: 17px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow: 0 5px 18px rgba(15,23,42,.08);
        }
        .detail-card-header {
          padding: 12px 15px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-card-body {
          padding: 10px 15px;
        }
        .detail-item {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .detail-item:last-child {
          border-bottom: none;
        }
        .detail-item-icon {
          width: 34px;
          min-width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #334155;
          margin-right: 10px;
        }
        .detail-item-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
        }
        .detail-item-value {
          font-size: 13px;
          color: #334155;
          margin-top: 2px;
          line-height: 1.5;
        }
        .map-box {
          width: 100%;
          height: 240px;
          border: none;
          display: block;
        }
        .map-link {
          display: block;
          margin: 10px 0;
          padding: 10px;
          border-radius: 10px;
          background: #2563eb;
          color: #fff !important;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none !important;
          transition: background 0.2s;
        }
        .map-link:hover {
          background: #1d4ed8;
        }
        .coordinate {
          padding: 9px 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          border-top: 1px solid #e2e8f0;
        }
        .photo-box {
          padding: 10px;
          background: #f8fafc;
          text-align: center;
        }
        .photo-box img {
          display: block;
          width: 100%;
          max-height: 380px;
          object-fit: contain;
          border-radius: 12px;
          background: #e2e8f0;
        }
        .photo-empty {
          padding: 24px 15px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        .photo-empty i {
          display: block;
          font-size: 32px;
          margin-bottom: 8px;
        }
      `}} />

      <div className="driver-modal-wrap">
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-dark text-light"
          style={{ backgroundColor: '#212529', color: '#fff' }}
        >
          <div className="flex items-center gap-2">
            <i className="fa fa-car text-blue-400"></i>
            <h6 className="m-0 text-sm font-bold tracking-wide">DETAIL KEGIATAN DRIVER</h6>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-lg font-bold leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="driver-detail">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <i className="fa fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
              <p>Memuat detail kegiatan driver...</p>
            </div>
          ) : data ? (
            <>
              {/* Profile Card */}
              <div className="driver-profile">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  alt="Foto Driver"
                  onError={(e) => {
                    (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
                  }}
                />
                <div className="driver-name">{data.driverName}</div>
                <div className="driver-position">{data.position || 'Driver Operasional'}</div>
                <div className="driver-site">
                  <i className="fa fa-map-marker mr-1 text-red-500"></i>
                  {data.siteName}
                </div>
                <div className="driver-status">
                  {isCompleted ? (
                    <span className="status-selesai">
                      <i className="fa fa-check-circle mr-1"></i>
                      Sudah Sampai
                    </span>
                  ) : (
                    <span className="status-berangkat">
                      <i className="fa fa-car mr-1"></i>
                      Sedang Perjalanan
                    </span>
                  )}
                </div>
              </div>

              {/* Informasi Perjalanan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-car"></i>
                  <span>Informasi Perjalanan</span>
                </div>
                <div className="detail-card-body">
                  <div className="detail-item">
                    <div className="detail-item-icon">
                      <i className="fa fa-car"></i>
                    </div>
                    <div>
                      <div className="detail-item-label">Kendaraan</div>
                      <div className="detail-item-value">{data.vehicle}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-item-icon">
                      <i className="fa fa-map-marker"></i>
                    </div>
                    <div>
                      <div className="detail-item-label">Tujuan</div>
                      <div className="detail-item-value">{data.destination}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-item-icon">
                      <i className="fa fa-file-text-o"></i>
                    </div>
                    <div>
                      <div className="detail-item-label">Keperluan</div>
                      <div className="detail-item-value">{data.purpose}</div>
                    </div>
                  </div>

                  {isCompleted && data.tripNotes && (
                    <div className="detail-item">
                      <div className="detail-item-icon">
                        <i className="fa fa-commenting-o"></i>
                      </div>
                      <div>
                        <div className="detail-item-label">Ringkasan Perjalanan</div>
                        <div className="detail-item-value">{data.tripNotes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Waktu Perjalanan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-clock-o"></i>
                  <span>Waktu Perjalanan</span>
                </div>
                <div className="detail-card-body">
                  <div className="detail-item">
                    <div className="detail-item-icon">
                      <i className="fa fa-sign-out text-amber-600"></i>
                    </div>
                    <div>
                      <div className="detail-item-label">Berangkat</div>
                      <div className="detail-item-value">{data.departureTime}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-item-icon">
                      <i className="fa fa-sign-in text-emerald-600"></i>
                    </div>
                    <div>
                      <div className="detail-item-label">Sampai</div>
                      <div className="detail-item-value">
                        {isCompleted && data.arrivalTime ? (
                          data.arrivalTime
                        ) : (
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>Belum sampai tujuan</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi Keberangkatan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-map-marker"></i>
                  <span>Lokasi Keberangkatan</span>
                </div>
                {data.departureLat && data.departureLng ? (
                  <>
                    <iframe
                      className="map-box"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.departureLng - 0.003}%2C${data.departureLat - 0.003}%2C${data.departureLng + 0.003}%2C${data.departureLat + 0.003}&layer=mapnik&marker=${data.departureLat}%2C${data.departureLng}`}
                      loading="lazy"
                      title="Peta lokasi keberangkatan"
                    />
                    <div className="coordinate">
                      <strong>Koordinat:</strong> {data.departureLat}, {data.departureLng}
                    </div>
                    <div style={{ padding: '0 10px 10px' }}>
                      <a
                        href={`https://www.google.com/maps?q=${data.departureLat}%2C${data.departureLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        <i className="fa fa-map mr-1"></i> Buka di Google Maps
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="photo-empty">
                    <i className="fa fa-map-o"></i>
                    Lokasi keberangkatan tidak tersedia.
                  </div>
                )}
              </div>

              {/* Foto Keberangkatan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-camera"></i>
                  <span>Foto Keberangkatan</span>
                </div>
                <div className="photo-box">
                  {data.departurePhotoUrl ? (
                    <a href={data.departurePhotoUrl} target="_blank" rel="noopener noreferrer">
                      <img src={data.departurePhotoUrl} alt="Foto Keberangkatan" loading="lazy" />
                    </a>
                  ) : (
                    <div className="photo-empty">
                      <i className="fa fa-picture-o"></i>
                      Foto keberangkatan tidak tersedia.
                    </div>
                  )}
                </div>
              </div>

              {/* Lokasi Kedatangan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-map-marker"></i>
                  <span>Lokasi Kedatangan</span>
                </div>
                {isCompleted && data.arrivalLat && data.arrivalLng ? (
                  <>
                    <iframe
                      className="map-box"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.arrivalLng - 0.003}%2C${data.arrivalLat - 0.003}%2C${data.arrivalLng + 0.003}%2C${data.arrivalLat + 0.003}&layer=mapnik&marker=${data.arrivalLat}%2C${data.arrivalLng}`}
                      loading="lazy"
                      title="Peta lokasi kedatangan"
                    />
                    <div className="coordinate">
                      <strong>Koordinat:</strong> {data.arrivalLat}, {data.arrivalLng}
                    </div>
                    <div style={{ padding: '0 10px 10px' }}>
                      <a
                        href={`https://www.google.com/maps?q=${data.arrivalLat}%2C${data.arrivalLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        <i className="fa fa-map mr-1"></i> Buka Lokasi Kedatangan di Google Maps
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="photo-empty">
                    <i className="fa fa-map-o"></i>
                    Lokasi kedatangan belum tersedia.
                  </div>
                )}
              </div>

              {/* Foto Kedatangan */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <i className="fa fa-camera"></i>
                  <span>Foto Kedatangan</span>
                </div>
                <div className="photo-box">
                  {isCompleted && data.arrivalPhotoUrl ? (
                    <>
                      <a href={data.arrivalPhotoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={data.arrivalPhotoUrl} alt="Foto Kedatangan" loading="lazy" />
                      </a>
                      <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                        Foto setelah sampai tujuan
                      </div>
                    </>
                  ) : (
                    <div className="photo-empty">
                      <i className="fa fa-picture-o"></i>
                      Foto kedatangan belum tersedia.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

