'use client';

import React, { useState } from 'react';
import { useData } from '../lib/DataContext';

export const LaporanSecurityChiefView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const demoRecords = [
    {
      id: 'chf-1',
      siteName: 'SITE PROYEK DEMO',
      namaKomandan: 'DANDAN KOMANDAN',
      kedisiplinan: 'BAIK',
      koordinasi: 'BAIK',
      kehadiran: 'LENGKAP',
      insiden: 'TIDAK ADA',
    },
  ];

  const filtered = demoRecords.filter((r) => {
    if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
    if (searchTerm) {
      const match =
        r.namaKomandan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.siteName.toLowerCase().includes(searchTerm.toLowerCase());
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
                          <option value="">SEMUA LOKASI</option>
                          {sites.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name.toUpperCase()}
                            </option>
                          ))}
                          {!sites.some((s) => s.name.toLowerCase().includes('demo')) && (
                            <option value="SITE PROYEK DEMO">SITE PROYEK DEMO</option>
                          )}
                        </select>
                      </th>
                      <th style={{ width: '200px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        NAMA KOMANDAN
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        KEDISIPLINAN
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        KOORDINASI
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        KEHADIRAN
                      </th>
                      <th style={{ width: '140px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        INSIDEN
                      </th>
                      <th style={{ width: '100px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, idx) => (
                      <tr
                        key={row.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#0dcaf0',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.siteName}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#6c757d',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.namaKomandan}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.kedisiplinan}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.koordinasi}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#0d6efd',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.kehadiran}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <span
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {row.insiden}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
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
                            }}
                          >
                            <i className="fa fa-search-plus" aria-hidden="true"></i>
                            <small>DETAIL</small>
                          </a>
                        </td>
                      </tr>
                    ))}
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
    </div>
  );
};
