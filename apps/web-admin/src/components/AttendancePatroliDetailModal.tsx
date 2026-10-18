'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AttendanceDetailResponse } from '@patrol/types';
import 'leaflet/dist/leaflet.css';

interface AttendancePatroliDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceId: string | null;
  detailData?: AttendanceDetailResponse | null;
}

export const AttendancePatroliDetailModal: React.FC<AttendancePatroliDetailModalProps> = ({
  isOpen,
  onClose,
  attendanceId,
  detailData: initialDetail,
}) => {
  const [data, setData] = useState<AttendanceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mapInContainerRef = useRef<HTMLDivElement>(null);
  const mapOutContainerRef = useRef<HTMLDivElement>(null);
  const mapInInstanceRef = useRef<any>(null);
  const mapOutInstanceRef = useRef<any>(null);

  // Load detail data from backend or fallback to demo
  useEffect(() => {
    if (!isOpen) {
      setData(null);
      return;
    }

    if (initialDetail) {
      setData(initialDetail);
      return;
    }

    if (!attendanceId) return;

    let isMounted = true;
    setIsLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    fetch(`http://localhost:3000/api/v1/attendance/${attendanceId}/detail`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((resData: AttendanceDetailResponse) => {
        if (isMounted) setData(resData);
      })
      .catch(() => {
        // Mock fallback for offline or demo testing
        if (isMounted) {
          setData({
            id: attendanceId,
            userId: 'u-demo',
            personilName: 'budi satpam test',
            siteName: 'site proyek demo',
            division: 'Security',
            userAvatar: null,
            clockInDateFull: 'Sabtu, 17 Oct 2026 | 00:46:13',
            clockOutDateFull: 'Hari tidak valid, 30 Nov -0001 | 00:00:00',
            clockInPhotoUrl: null,
            clockOutPhotoUrl: null,
            locationsIn: [
              { lat: -6.562719, lon: 106.856125, label: 'Lokasi absen masuk budi satpam test', personilName: 'budi satpam test' },
              { lat: -6.566873, lon: 106.857802, label: 'Lokasi Area / Site' },
            ],
            locationsOut: [
              { lat: -6.562719, lon: 106.856125, label: 'Lokasi absen pulang budi satpam test', personilName: 'budi satpam test' },
              { lat: -6.566873, lon: 106.857802, label: 'Lokasi Area / Site' },
            ],
            distanceInMeters: 497.67,
            distanceOutMeters: 0,
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, attendanceId, initialDetail]);

  // Leaflet map initialization
  useEffect(() => {
    if (!isOpen || !data) return;
    const currentData = data;

    let isMounted = true;

    async function initLeafletMaps() {
      const L = await import('leaflet');

      // Fix standard marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const setupMap = (
        container: HTMLDivElement | null,
        existingMapRef: React.MutableRefObject<any>,
        locations: Array<{ lat: number; lon: number; label: string; personilName?: string }>
      ) => {
        if (!container || !locations || locations.length === 0) return;

        if (existingMapRef.current) {
          existingMapRef.current.remove();
          existingMapRef.current = null;
        }

        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap | Patroli Site',
        });

        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery | Patroli Site',
        });

        const map = L.map(container, {
          center: [locations[0].lat, locations[0].lon],
          zoom: 16,
          layers: [osm],
        });

        existingMapRef.current = map;

        const latlngs: [number, number][] = [];

        locations.forEach((loc) => {
          if (loc.lat === 0 && loc.lon === 0) return;

          let markerLabel = loc.label;
          if (loc.label === 'Lokasi Masuk') {
            markerLabel = `Lokasi absen masuk ${loc.personilName || currentData.personilName || ''}`;
          } else if (loc.label === 'Tujuan') {
            markerLabel = 'Lokasi Area / Site';
          }

          const marker = L.marker([loc.lat, loc.lon]).addTo(map);

          marker.bindTooltip(markerLabel, {
            permanent: true,
            direction: 'top',
            className: 'patroli-marker-tooltip',
          }).openTooltip();

          latlngs.push([loc.lat, loc.lon]);
        });

        if (latlngs.length > 1) {
          const polyline = L.polyline(latlngs, { color: '#007bff', weight: 4 }).addTo(map);

          const p1 = L.latLng(latlngs[0][0], latlngs[0][1]);
          const p2 = L.latLng(latlngs[1][0], latlngs[1][1]);
          const dist = p1.distanceTo(p2).toFixed(2);

          polyline.bindTooltip(`Jarak: ${dist} meter`, {
            permanent: true,
            direction: 'center',
            className: 'patroli-distance-tooltip',
          }).openTooltip();

          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        } else if (latlngs.length === 1) {
          map.setView(latlngs[0], 16);
        }

        L.control.layers({ 'OpenStreetMap': osm, 'Satellite': satellite }).addTo(map);

        setTimeout(() => {
          if (isMounted && map) {
            map.invalidateSize();
          }
        }, 200);
      };

      // Create Map In & Map Out
      if (mapInContainerRef.current) {
        setupMap(mapInContainerRef.current, mapInInstanceRef, currentData.locationsIn || []);
      }

      if (mapOutContainerRef.current) {
        setupMap(mapOutContainerRef.current, mapOutInstanceRef, currentData.locationsOut || []);
      }
    }

    const timer = setTimeout(() => {
      initLeafletMaps();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInInstanceRef.current) {
        mapInInstanceRef.current.remove();
        mapInInstanceRef.current = null;
      }
      if (mapOutInstanceRef.current) {
        mapOutInstanceRef.current.remove();
        mapOutInstanceRef.current = null;
      }
    };
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog modal-lg w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header: 100% Parity alert bg-primary text-light */}
        <div
          className="modal-header alert bg-primary text-light flex items-center justify-between"
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            padding: '12px 20px',
            margin: 0,
            borderRadius: '8px 8px 0 0',
          }}
        >
          <h4 className="modal-title font-bold text-lg" id="myModalLabel" style={{ margin: 0, letterSpacing: '0.5px' }}>
            DETAIL ABSENSI
          </h4>
          <button
            type="button"
            className="close text-white hover:text-gray-200 transition"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              lineHeight: 1,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {/* Modal Body: 100% Parity .modal-body-absen */}
        <div className="modal-body-absen p-4 overflow-y-auto space-y-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 font-medium">
              <i className="fa fa-spinner fa-spin fa-2x mr-2" style={{ display: 'inline-block' }}></i>
              <p className="mt-2 text-sm">Memuat detail absensi...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-red-500 font-semibold">
              Data absensi tidak ditemukan.
            </div>
          ) : (
            <div className="container p-0">
              <div className="main-body space-y-4">
                {/* 1. Profil Personil Card */}
                <div className="card bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                  <div className="d-flex flex-column align-items-center text-center flex flex-col items-center">
                    <img
                      src={data.userAvatar || data.clockInPhotoUrl || '/img/noimage.png'}
                      alt="Foto Profil"
                      className="rounded-circle object-cover shadow-sm border border-gray-300"
                      style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                      onError={(e: any) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.personilName) + '&background=0D8ABC&color=fff&size=150';
                      }}
                    />
                    <div className="mt-3">
                      <h4 className="text-xl font-bold text-gray-800 uppercase" style={{ margin: 0 }}>
                        {data.personilName}
                      </h4>
                      <p className="text-muted font-size-sm text-sm text-gray-500 mt-1 uppercase" style={{ margin: 0 }}>
                        {data.siteName} • {data.division}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Detail Timestamps Card */}
                <div className="card bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="space-y-3">
                    <div className="row flex flex-col sm:flex-row sm:items-center justify-between text-sm py-1">
                      <div className="col-sm-3 font-semibold text-gray-700">Detail Absen Masuk</div>
                      <div className="col-sm-9 text-secondary text-gray-600 font-medium">{data.clockInDateFull}</div>
                    </div>
                    <hr className="border-gray-200 my-2" />
                    <div className="row flex flex-col sm:flex-row sm:items-center justify-between text-sm py-1">
                      <div className="col-sm-3 font-semibold text-gray-700">Detail Absen Pulang</div>
                      <div className="col-sm-9 text-secondary text-gray-600 font-medium">{data.clockOutDateFull}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Peta Absen Masuk */}
                <div>
                  <div
                    className="alert bg-danger text-light rounded-t-lg p-3 text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    <strong>
                      <i className="fa fa-map-marker text-base mr-1" aria-hidden="true"></i>
                    </strong>
                    <span>Lokasi absen masuk di {data.siteName}</span>
                  </div>
                  <div className="card bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm p-2">
                    <div
                      ref={mapInContainerRef}
                      id="map_in"
                      style={{ height: '55vh', width: '100%', borderRadius: '4px', zIndex: 1 }}
                    />
                  </div>
                </div>

                {/* 4. Foto Absen Masuk */}
                <div>
                  <div
                    className="alert bg-danger text-light rounded-t-lg p-3 text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    <strong>
                      <i className="fa fa-map-marker text-base mr-1" aria-hidden="true"></i>
                    </strong>
                    <span>FOTO ABSEN MASUK</span>
                  </div>
                  <div className="card bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm p-3 text-center">
                    <img
                      src={data.clockInPhotoUrl || '/img/noimage.png'}
                      alt="Foto Absen Masuk"
                      className="brand-image img elevation-3 rounded max-h-96 mx-auto object-contain w-full"
                      onError={(e: any) => {
                        e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Foto+Absen+Masuk';
                      }}
                    />
                  </div>
                </div>

                {/* 5. Peta Absen Pulang */}
                <div>
                  <div
                    className="alert bg-warning text-dark rounded-t-lg p-3 text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: '#ffc107', color: '#212529' }}
                  >
                    <strong>
                      <i className="fa fa-map-marker text-base mr-1" aria-hidden="true"></i>
                    </strong>
                    <span>Lokasi absen pulang di {data.siteName}</span>
                  </div>
                  <div className="card bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm p-2">
                    <div
                      ref={mapOutContainerRef}
                      id="map_out"
                      style={{ height: '55vh', width: '100%', borderRadius: '4px', zIndex: 1 }}
                    />
                  </div>
                </div>

                {/* 6. Foto Absen Pulang */}
                <div>
                  <div
                    className="alert bg-warning text-dark rounded-t-lg p-3 text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: '#ffc107', color: '#212529' }}
                  >
                    <strong>
                      <i className="fa fa-map-marker text-base mr-1" aria-hidden="true"></i>
                    </strong>
                    <span>FOTO ABSEN PULANG</span>
                  </div>
                  <div className="card bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm p-3 text-center">
                    <img
                      src={data.clockOutPhotoUrl || '/img/noimage.png'}
                      alt="Foto Absen Pulang"
                      className="brand-image img elevation-3 rounded max-h-96 mx-auto object-contain w-full"
                      onError={(e: any) => {
                        e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Belum+Absen+Pulang';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer border-t border-gray-200 p-3 bg-gray-50 flex justify-end"
          style={{ borderRadius: '0 0 8px 8px' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary px-5 py-2 text-sm font-medium rounded text-white bg-gray-600 hover:bg-gray-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>

      <style jsx global>{`
        .patroli-marker-tooltip {
          background-color: #ff6600 !important;
          color: white !important;
          border: 1px solid #ff6600 !important;
          font-weight: bold !important;
          font-size: 11px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
          border-radius: 4px !important;
          padding: 3px 6px !important;
        }
        .patroli-distance-tooltip {
          background-color: #007bff !important;
          color: white !important;
          border: 1px solid #007bff !important;
          font-weight: bold !important;
          font-size: 11px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
          border-radius: 4px !important;
          padding: 3px 6px !important;
        }
      `}</style>
    </div>
  );
};
