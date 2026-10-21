'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import { ChiefEvaluationItem } from '@patrol/types';
import { ChiefDetailModal } from './ChiefDetailModal';

export const LaporanSecurityChiefView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ChiefEvaluationItem | null>(null);

  // Records state from backend with fallback
  const [records, setRecords] = useState<ChiefEvaluationItem[]>([
    {
      id: '6',
      siteId: '11111111-1111-1111-1111-111111111111',
      siteName: 'site proyek demo',
      namaKomandan: 'DANDAN KOMANDAN',
      komandanPosition: 'Komandan Regu',
      komandanRole: 'Laporan Komandan',
      kedisiplinan: 'Baik',
      koordinasi: 'Baik',
      kehadiran: 'Lengkap',
      reguHadir: 'Lengkap',
      reguIzin: 'Lengkap',
      insiden: 'Tidak Ada',
      detailInsiden: 'Tidak ada kejadian menonjol atau insiden keamanan.',
      catatan: 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.',
      statusLaporan: 'Selesai',
      tanggalLapor: '2026-10-18 21:11:40',
    },
  ]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || '' : '';
    fetch('http://localhost:3000/api/v1/reports/chief-evaluations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data: ChiefEvaluationItem[]) => {
        if (data && data.length > 0) {
          setRecords(data);
        }
      })
      .catch(() => {
        // Keeps fallback demo data matching patroli.site
      });
  }, []);

  const filtered = records.filter((r) => {
    if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
    if (searchTerm) {
      const match =
        r.namaKomandan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.kedisiplinan && r.kedisiplinan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.insiden && r.insiden.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageLength));
  const displayedRows = filtered.slice((currentPage - 1) * pageLength, currentPage * pageLength);

  return (
    <div className="w-full">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <div className="row">
        <div className="col-12" style={{ marginTop: '10px' }}>
          {/* Card Header Alert */}
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
            <i className="fa fa-user" style={{ fontSize: '16px' }}></i>
            <small style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
              KEGIATAN CHIEF
            </small>
          </div>

          {/* Card Body Border */}
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

              {/* Data Table */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#343a40', color: '#fff' }}>
                      <th style={{ width: '220px', padding: '10px', textAlign: 'center', border: '1px solid #343a40' }}>
                        <select
                          id="filterAreaChief"
                          value={selectedSiteName}
                          onChange={(e) => {
                            setSelectedSiteName(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="custom-select border border-danger text-uppercase"
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
                      <th style={{ width: '220px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        Nama Komandan
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        Kedisiplinan
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        Koordinasi
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        Kehadiran
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        Insiden
                      </th>
                      <th style={{ width: '100px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                          Tidak ada data kegiatan chief yang sesuai
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                          }}
                        >
                          {/* Lokasi */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-info"
                                style={{
                                  backgroundColor: '#0dcaf0',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.siteName}
                              </span>
                            </small>
                          </td>

                          {/* Nama Komandan */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-secondary"
                                style={{
                                  backgroundColor: '#6c757d',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.namaKomandan}
                              </span>
                            </small>
                          </td>

                          {/* Kedisiplinan */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-success"
                                style={{
                                  backgroundColor: '#28a745',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.kedisiplinan}
                              </span>
                            </small>
                          </td>

                          {/* Koordinasi */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-success"
                                style={{
                                  backgroundColor: '#28a745',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.koordinasi}
                              </span>
                            </small>
                          </td>

                          {/* Kehadiran */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-primary"
                                style={{
                                  backgroundColor: '#0d6efd',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.kehadiran}
                              </span>
                            </small>
                          </td>

                          {/* Insiden */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <span
                                className="badge badge-success"
                                style={{
                                  backgroundColor: '#28a745',
                                  color: '#fff',
                                  padding: '4px 9px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {row.insiden}
                              </span>
                            </small>
                          </td>

                          {/* AKSI Button */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <center>
                              <a
                                href="#"
                                className="btn btn-info btn-sm detail-record"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedRecord(row);
                                  setIsModalOpen(true);
                                }}
                                style={{
                                  backgroundColor: '#0dcaf0',
                                  borderColor: '#0dcaf0',
                                  color: '#fff',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <i className="fa fa-search" aria-hidden="true"></i>
                                <small>Detail</small>
                              </a>
                            </center>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* DataTables Info & Pagination Footer */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}
              >
                <div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 500 }}>
                  SHOWING {filtered.length === 0 ? 0 : (currentPage - 1) * pageLength + 1} TO{' '}
                  {Math.min(currentPage * pageLength, filtered.length)} OF {filtered.length} ENTRIES
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: currentPage <= 1 ? '#f8fafc' : '#fff',
                      color: currentPage <= 1 ? '#94a3b8' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
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
                    {currentPage}
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#fff',
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

      {/* Chief Detail Modal */}
      <ChiefDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chiefId={selectedRecord ? selectedRecord.id : null}
        detailData={selectedRecord}
      />
    </div>
  );
};
