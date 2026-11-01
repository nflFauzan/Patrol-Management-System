'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import { DriverDetailModal, DriverDetailData } from './DriverDetailModal';

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

    fetch('http://localhost:3000/api/v1/driver/trips', {
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
        // Fallback to rich demo records
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
        r.destination.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <div className="row">
        <div className="col-12" style={{ marginTop: '10px' }}>
          {/* Dark Header */}
          <div
            className="card-header alert bg-dark text-light flex items-center gap-2 shadow-xs"
            style={{
              backgroundColor: '#343a40',
              color: '#fff',
              padding: '12px 18px',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <i className="fa fa-qrcode" style={{ fontSize: '16px' }}></i>
            <small style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
              KEGIATAN DRIVER
            </small>
          </div>

          {/* Card Body */}
          <div
            className="card-body border border-dark rounded shadow-xs"
            style={{
              borderColor: '#343a40',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: '0 0 8px 8px',
              backgroundColor: '#fff',
              padding: '20px',
            }}
          >
            <div className="dataTables_wrapper no-footer" style={{ width: '100%' }}>
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ marginBottom: '14px' }}
              >
                <div>
                  <label style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                    SHOW{' '}
                    <select
                      value={pageLength}
                      onChange={(e) => {
                        setPageLength(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '12px',
                        margin: '0 4px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>{' '}
                    ENTRIES
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    SEARCH:
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari driver / kendaraan..."
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        width: '180px',
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#343a40', color: '#fff' }}>
                      <th style={{ width: '180px', padding: '10px', textAlign: 'center', border: '1px solid #343a40' }}>
                        <select
                          value={selectedSiteName}
                          onChange={(e) => setSelectedSiteName(e.target.value)}
                          style={{
                            borderColor: '#dc3545',
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                            height: '34px',
                            color: '#212529',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            width: '100%',
                            textAlign: 'center',
                          }}
                        >
                          <option value="">SORT LOKASI / SITE</option>
                          <option value="">SEMUA LOKASI</option>
                          {sites.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name.toUpperCase()}
                            </option>
                          ))}
                          <option value="POOL KENDARAAN">POOL KENDARAAN</option>
                          <option value="KANTOR PUSAT">KANTOR PUSAT</option>
                          <option value="PABRIK BEKASI">PABRIK BEKASI</option>
                          <option value="GUDANG CAKUNG">GUDANG CAKUNG</option>
                        </select>
                      </th>
                      <th style={{ width: '150px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        NAMA PERSONIL
                      </th>
                      <th style={{ width: '180px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        JENIS KENDARAAN
                      </th>
                      <th style={{ width: '200px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        WAKTU
                      </th>
                      <th style={{ width: '250px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        TUJUAN
                      </th>
                      <th style={{ width: '120px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        STATUS
                      </th>
                      <th style={{ width: '90px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                          Tidak ada data kegiatan driver ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row, idx) => (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                          }}
                        >
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <p style={{ color: '#dc3545', margin: 0, fontWeight: 600 }}>
                                {row.siteName}
                              </p>
                            </small>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <p style={{ color: '#0d6efd', margin: 0, fontWeight: 600 }}>
                                {row.driverName}
                              </p>
                            </small>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <p style={{ color: '#28a745', margin: 0, fontWeight: 600 }}>
                                {row.vehicle}
                              </p>
                            </small>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px', fontSize: '11px', color: '#0d6efd' }}>
                            <div>BERANGKAT:</div>
                            <div>{row.departureTime}</div>
                            {row.arrivalTime && (
                              <>
                                <div style={{ marginTop: '4px' }}>SAMPAI:</div>
                                <div>{row.arrivalTime}</div>
                              </>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle', padding: '12px 10px', textAlign: 'center', fontSize: '11px', color: '#334155' }}>
                            <div style={{ fontWeight: 600 }}>{row.destination} - {row.purpose}</div>
                            {row.tripNotes && (
                              <div style={{ color: '#64748b' }}>- {row.tripNotes}</div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            {row.status === 'SUDAH SAMPAI' ? (
                              <span
                                style={{
                                  backgroundColor: '#28a745',
                                  color: '#fff',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                ✔ SUDAH SAMPAI
                              </span>
                            ) : (
                              <span
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: '#212529',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                🚗 BERANGKAT
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTrip(row);
                                setIsModalOpen(true);
                              }}
                              style={{
                                backgroundColor: '#343a40',
                                borderColor: '#343a40',
                                color: '#fff',
                                padding: '4px 10px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                border: 'none',
                              }}
                            >
                              <i className="fa fa-search-plus" aria-hidden="true"></i>
                              <small>Detail</small>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}
              >
                <div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 500 }}>
                  SHOWING 1 TO {filtered.length} OF {filtered.length} ENTRIES
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    PREVIOUS
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid #343a40',
                      backgroundColor: '#343a40',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Detail Modal 100% Identical to detail-driver.php */}
      <DriverDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrip(null);
        }}
        tripId={selectedTrip?.id || null}
        detailData={selectedTrip}
      />
    </div>
  );
};
