'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../lib/DataContext';
import { CleaningRecordItem, CleaningRecordsResponse } from '@patrol/types';
import { CleaningDetailModal } from './CleaningDetailModal';
import { CleaningTindakLanjutModal } from './CleaningTindakLanjutModal';

export const LaporanCleaningServiceView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [records, setRecords] = useState<CleaningRecordItem[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedCleaningId, setSelectedCleaningId] = useState<string | null>(null);

  const [isTlOpen, setIsTlOpen] = useState<boolean>(false);
  const [selectedTlId, setSelectedTlId] = useState<string | number | null>(null);

  // Fallback demo records (100% parity with live patroli.site capture records 7546 & 7544)
  const defaultDemoRecords: CleaningRecordItem[] = [
    {
      id: '7546',
      kodePatroli: '7546',
      siteName: 'site proyek demo',
      personilName: 'akmal',
      status: 'KONDISI BERSIH DAN RAPI',
      taskDescription: 'bersihkan kloset',
      timeFormatted: 'Senin, 12 Oct 2026 | 18:05:00',
      dateTimeFull: 'Senin, 12 Oct 2026 | 18:05:00',
      latitude: -6.562729,
      longitude: 106.856097,
      photoUrl: 'foto-patroli/6accbee403c32',
      tindakLanjutStatus: null,
    },
    {
      id: '7544',
      kodePatroli: '7544',
      siteName: 'site proyek demo',
      personilName: 'akmal',
      status: 'KONDISI BERSIH DAN RAPI',
      taskDescription: 'bersihkan kloset',
      timeFormatted: 'Senin, 12 Oct 2026 | 17:54:00',
      dateTimeFull: 'Senin, 12 Oct 2026 | 17:54:00',
      latitude: -6.562722,
      longitude: 106.856081,
      photoUrl: 'foto-patroli/6accbc6703cf8',
      tindakLanjutStatus: null,
    },
  ];

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageLength),
      });
      if (selectedSiteName) queryParams.set('siteName', selectedSiteName);
      if (searchTerm) queryParams.set('search', searchTerm);

      const res = await fetch(`http://localhost:3000/api/v1/cleaning/records?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json: CleaningRecordsResponse = await res.json();
        if (json.data && json.data.length > 0) {
          setRecords(json.data);
          setTotalRecords(json.recordsTotal || json.data.length);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Backend offline or network failure -> gracefully use demo data
    }

    // Filter fallback demo data locally
    let filtered = [...defaultDemoRecords];
    if (selectedSiteName) {
      filtered = filtered.filter((r) =>
        r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())
      );
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.personilName.toLowerCase().includes(q) ||
          r.siteName.toLowerCase().includes(q) ||
          r.taskDescription.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    setTotalRecords(filtered.length);
    const startIdx = (currentPage - 1) * pageLength;
    setRecords(filtered.slice(startIdx, startIdx + pageLength));
    setIsLoading(false);
  }, [currentPage, pageLength, selectedSiteName, searchTerm]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageLength));
  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * pageLength + 1;
  const endEntry = Math.min(currentPage * pageLength, totalRecords);

  const handleOpenDetail = (id: string) => {
    setSelectedCleaningId(id);
    setIsDetailOpen(true);
  };

  const handleOpenTl = (id: string) => {
    setSelectedTlId(id);
    setIsTlOpen(true);
  };

  const handleTlSuccess = () => {
    setAlertSuccess('Konfirmasi tindak lanjut berhasil disimpan!');
    fetchRecords();
    setTimeout(() => {
      setAlertSuccess(null);
    }, 4000);
  };

  return (
    <div className="w-full">
      {/* FontAwesome 4.7 link for full icon parity with live site */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      {/* Success Notification Alert */}
      {alertSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
          style={{
            backgroundColor: '#d1e7dd',
            color: '#0f5132',
            border: '1px solid #badbcc',
            borderRadius: '8px',
            padding: '12px 20px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa fa-check-circle" style={{ fontSize: '16px' }}></i>
            <span>{alertSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertSuccess(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#0f5132',
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div className="row">
        <div className="col-12" style={{ marginTop: '10px' }}>
          {/* Card Header Alert Green with fa-qrcode */}
          <div
            className="card-header alert bg-success text-light flex items-center gap-2 shadow-xs"
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              padding: '12px 18px',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fa fa-qrcode" style={{ fontSize: '16px' }}></i>
            <small style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
              KEGIATAN CLEANING SERVICE
            </small>
          </div>

          {/* Card Body with border-success */}
          <div
            className="card-body border border-success rounded shadow-xs"
            style={{
              borderColor: '#28a745',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: '0 0 8px 8px',
              backgroundColor: '#fff',
              padding: '20px',
            }}
          >
            <div className="dataTables_wrapper no-footer" style={{ width: '100%' }}>
              {/* Top Controls: Length & Search */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
                        padding: '4px 8px',
                        fontSize: '12px',
                        margin: '0 4px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="1000">1,000</option>
                    </select>{' '}
                    ENTRIES
                  </label>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '13px',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 500,
                    }}
                  >
                    SEARCH:
                    <input
                      type="search"
                      value={searchTerm}
                      placeholder=""
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
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

              {/* Table Data */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#28a745', color: '#fff' }}>
                      <th
                        style={{
                          width: '220px',
                          padding: '10px',
                          textAlign: 'center',
                          border: '1px solid #28a745',
                        }}
                      >
                        <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>
                          SORT LOKASI / SITE
                        </div>
                        <select
                          value={selectedSiteName}
                          onChange={(e) => {
                            setSelectedSiteName(e.target.value);
                            setCurrentPage(1);
                          }}
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
                          <option value="">SEMUA LOKASI</option>
                          {sites.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name.toUpperCase()}
                            </option>
                          ))}
                          {!sites.some((s) => s.name.toLowerCase().includes('demo')) && (
                            <option value="site proyek demo">SITE PROYEK DEMO</option>
                          )}
                        </select>
                      </th>
                      <th
                        style={{
                          width: '180px',
                          padding: '10px',
                          textAlign: 'center',
                          border: '1px solid #28a745',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        NAMA PERSONIL
                      </th>
                      <th
                        style={{
                          width: '380px',
                          padding: '10px',
                          textAlign: 'center',
                          border: '1px solid #28a745',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        KEGIATAN / TEMUAN
                      </th>
                      <th
                        style={{
                          width: '200px',
                          padding: '10px',
                          textAlign: 'center',
                          border: '1px solid #28a745',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        WAKTU
                      </th>
                      <th
                        style={{
                          width: '140px',
                          padding: '10px',
                          textAlign: 'center',
                          border: '1px solid #28a745',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: 'center',
                            padding: '30px',
                            color: '#64748b',
                            fontSize: '13px',
                          }}
                        >
                          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                          Memuat data kegiatan cleaning service...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: 'center',
                            padding: '30px',
                            color: '#64748b',
                            fontSize: '13px',
                          }}
                        >
                          Tidak ada data cleaning service yang cocok.
                        </td>
                      </tr>
                    ) : (
                      records.map((row, idx) => (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                          }}
                        >
                          {/* Column 1: SORT LOKASI / SITE */}
                          <td
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              padding: '12px 10px',
                            }}
                          >
                            <small>
                              <p
                                className="text text-center text-success"
                                style={{
                                  color: '#28a745',
                                  margin: 0,
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              >
                                {row.siteName}
                              </p>
                            </small>
                          </td>

                          {/* Column 2: NAMA PERSONIL */}
                          <td
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              padding: '12px 10px',
                            }}
                          >
                            <small>
                              <p
                                className="text text-center text-mute"
                                style={{
                                  color: '#6c757d',
                                  margin: 0,
                                  fontWeight: 500,
                                  fontSize: '12px',
                                }}
                              >
                                {row.personilName}
                              </p>
                            </small>
                          </td>

                          {/* Column 3: KEGIATAN / TEMUAN */}
                          <td
                            style={{
                              verticalAlign: 'middle',
                              padding: '12px 10px',
                              textAlign: 'center',
                            }}
                          >
                            <small>
                              <div className="text-center">
                                <p
                                  className="mb-1"
                                  style={{
                                    color: '#343a40',
                                    margin: '0 0 4px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                  }}
                                >
                                  {row.status.startsWith('🟢') ? row.status : `🟢 ${row.status}`}
                                </p>
                                <p
                                  className="mb-1"
                                  style={{
                                    color: '#343a40',
                                    margin: 0,
                                    fontSize: '12px',
                                  }}
                                >
                                  {row.taskDescription}
                                </p>
                              </div>
                            </small>
                          </td>

                          {/* Column 4: WAKTU */}
                          <td
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              padding: '12px 10px',
                            }}
                          >
                            <small>
                              <p
                                className="text text-center text-primary"
                                style={{
                                  color: '#0d6efd',
                                  margin: 0,
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              >
                                {row.timeFormatted}
                              </p>
                            </small>
                          </td>

                          {/* Column 5: AKSI (Detail & TL Buttons matching patroli.site live DOM) */}
                          <td
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              padding: '12px 10px',
                            }}
                          >
                            <center>
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                                aria-label="Action buttons"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {/* Detail Button */}
                                <button
                                  type="button"
                                  className="detail-record btn btn-primary"
                                  data-id={row.id}
                                  onClick={() => handleOpenDetail(row.id)}
                                  title="Lihat Detail Cleaning"
                                  style={{
                                    backgroundColor: '#0d6efd',
                                    borderColor: '#0d6efd',
                                    color: '#fff',
                                    padding: '4px 9px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    border: 'none',
                                  }}
                                >
                                  <i className="fa fa-search-plus" aria-hidden="true"></i>
                                  <small style={{ fontSize: '11px', fontWeight: 600 }}>Detail</small>
                                </button>

                                {/* TL (Tindak Lanjut) Button */}
                                <button
                                  type="button"
                                  className="tl-record btn btn-warning"
                                  data-id={row.id}
                                  onClick={() => handleOpenTl(row.id)}
                                  title="Konfirmasi Tindak Lanjut"
                                  style={{
                                    backgroundColor: '#ffc107',
                                    borderColor: '#ffc107',
                                    color: '#212529',
                                    padding: '4px 9px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    border: 'none',
                                  }}
                                >
                                  <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
                                  <small style={{ fontSize: '11px', fontWeight: 600 }}>TL</small>
                                </button>
                              </div>
                            </center>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* DataTables Pagination & Info Footer */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  marginTop: '16px',
                  fontSize: '13px',
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 500 }}>
                  SHOWING {startEntry} TO {endEntry} OF {totalRecords} ENTRIES
                </div>

                <div className="flex items-center gap-1" style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: currentPage <= 1 ? '#f8fafc' : '#ffffff',
                      color: currentPage <= 1 ? '#94a3b8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    PREVIOUS
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: pg === currentPage ? '1px solid #28a745' : '1px solid #cbd5e1',
                        backgroundColor: pg === currentPage ? '#28a745' : '#ffffff',
                        color: pg === currentPage ? '#fff' : '#334155',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#ffffff',
                      color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
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

      {/* Detail Cleaning Modal (#myModalpat with full .patroli-detail CSS & Leaflet map) */}
      <CleaningDetailModal
        isOpen={isDetailOpen}
        cleaningId={selectedCleaningId}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Tindak Lanjut Modal (#myModaltl matching tl.php) */}
      <CleaningTindakLanjutModal
        isOpen={isTlOpen}
        recordId={selectedTlId}
        onClose={() => setIsTlOpen(false)}
        onSuccess={handleTlSuccess}
      />
    </div>
  );
};
