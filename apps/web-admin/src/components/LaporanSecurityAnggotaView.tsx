'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PatrolRecordItem, PatrolRecordsResponse } from '@patrol/types';
import { useData } from '../lib/DataContext';
import { PatroliDetailModal } from './PatroliDetailModal';
import { PatroliTindakLanjutModal } from './PatroliTindakLanjutModal';

export const LaporanSecurityAnggotaView: React.FC = () => {
  const { sites } = useData();

  // Filters state (matching patroli.site id: #category)
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data & loading state
  const [records, setRecords] = useState<PatrolRecordItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Detail & TL Modal state
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedTlId, setSelectedTlId] = useState<string | null>(null);
  const [isTlOpen, setIsTlOpen] = useState<boolean>(false);

  // Fetch Patrol Records
  useEffect(() => {
    fetchRecords();
  }, [selectedSiteName, searchTerm, pageLength, currentPage]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageLength),
    });
    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`http://localhost:3000/api/v1/patrol/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API offline');
      const data: PatrolRecordsResponse = await res.json();
      setRecords(data.data);
      setRecordsTotal(data.recordsTotal);
    } catch {
      // 100% Parity Demo Records from patroli.site live dump (ID 7545)
      const demoRecords: PatrolRecordItem[] = [
        {
          id: '7545',
          siteName: 'site proyek demo',
          officerName: 'budi satpam test',
          position: 'anggota',
          assetName: 'pos gerbang utama',
          assetType: 'keamanan',
          assetLocation: 'gerbang utama depan - site proyek demo',
          taskDescription: 'pemeriksaan akses masuk tamu',
          statusResult: 'Situasi Aman Terkendali',
          notes: 'Pemeriksaan akses masuk tamu di pos gerbang utama gerbang utama depan',
          scannedAt: '2026-10-12T11:01:00.000Z',
          dateFormatted: 'Senin, 12 Oct 2026',
          timeFormatted: '18:01:00',
          dateTimeFull: 'Senin, 12 Oct 2026 | 18:01:00',
          latitude: -6.562732,
          longitude: 106.856083,
          photoUrl: 'foto-patroli/6accbe1ba279e',
          tindakLanjutStatus: null,
        },
      ];

      const filtered = demoRecords.filter((r) => {
        if (selectedSiteName && !r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase())) return false;
        if (searchTerm) {
          const match =
            r.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.statusResult.toLowerCase().includes(searchTerm.toLowerCase());
          if (!match) return false;
        }
        return true;
      });

      setRecords(filtered);
      setRecordsTotal(filtered.length);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(recordsTotal / pageLength));

  return (
    <div className="w-full">
      {/* External CSS matching patroli.site bootstrap & DataTables styles */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style jsx global>{`
        .laporan-security-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .laporan-security-container .card-header.bg-primary {
          background-color: #0d6efd !important;
          color: #ffffff !important;
          padding: 0.75rem 1.25rem;
          margin-bottom: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.125);
          border-radius: calc(0.375rem - 1px) calc(0.375rem - 1px) 0 0;
        }
        .laporan-security-container .card-body.border-primary {
          border: 1px solid #0d6efd !important;
          border-radius: 0 0 0.375rem 0.375rem;
          padding: 1.25rem;
          background-color: #ffffff;
        }
        .laporan-security-container table.dataTable {
          width: 100% !important;
          margin-top: 15px !important;
          margin-bottom: 15px !important;
          border-collapse: collapse !important;
          border-spacing: 0;
        }
        .laporan-security-container table.dataTable thead th {
          background-color: #0d6efd;
          color: #ffffff;
          padding: 10px 12px;
          border: 1px solid #0d6efd;
          font-size: 13px;
          font-weight: 700;
          vertical-align: middle;
        }
        .laporan-security-container table.dataTable tbody td {
          padding: 12px 10px;
          vertical-align: middle;
          border: 1px solid #dee2e6;
          font-size: 12px;
        }
        .laporan-security-container .detail-record.btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: #ffffff;
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 4px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.15s ease-in-out;
        }
        .laporan-security-container .detail-record.btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
        .laporan-security-container .tl-record.btn-warning {
          background-color: #ffc107;
          border-color: #ffc107;
          color: #000;
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 4px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .laporan-security-container .tl-record.btn-warning:hover {
          background-color: #ffca2c;
          border-color: #ffc720;
        }
      `}</style>

      <div className="laporan-security-container">
        <div className="row">
          <div className="col-12" style={{ marginTop: '10px' }}>
            {/* Header: <div class="card-header alert bg-primary text-light"> */}
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
              <i className="fa fa-qrcode" style={{ fontSize: '16px' }}></i>
              <small style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>KEGIATAN SECURITY</small>
            </div>

            {/* Body: <div class="card-body border border-primary rounded"> */}
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
              {/* DataTables Controls Header */}
              <div
                id="patroli_wrapper"
                className="dataTables_wrapper no-footer"
                style={{ width: '100%', position: 'relative' }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ marginBottom: '14px' }}
                >
                  {/* Length selector */}
                  <div id="patroli_length" className="dataTables_length">
                    <label style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                      SHOW{' '}
                      <select
                        name="patroli_length"
                        aria-controls="patroli"
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

                  {/* Search Filter */}
                  <div id="patroli_filter" className="dataTables_filter">
                    <label style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      SEARCH:
                      <input
                        type="search"
                        className="form-control"
                        placeholder=""
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

                {/* Table: id="patroli" */}
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table
                    id="patroli"
                    className="table-primary display responsive wrap bg-primary rounded dataTable no-footer dtr-inline"
                    style={{ width: '100%', borderCollapse: 'collapse' }}
                    role="grid"
                  >
                    <thead>
                      <tr className="text text-center text-light" style={{ backgroundColor: '#0d6efd', color: '#fff' }}>
                        {/* Column 1: SORT LOKASI / SITE with category dropdown */}
                        <th
                          className="sorting_disabled"
                          style={{
                            width: '220px',
                            padding: '10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            border: '1px solid #0d6efd',
                          }}
                        >
                          <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>
                            SORT LOKASI / SITE
                          </div>
                          <select
                            name="category"
                            id="category"
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
                                {s.name}
                              </option>
                            ))}
                            {!sites.some((s) => s.name === 'site proyek demo') && (
                              <option value="site proyek demo">site proyek demo</option>
                            )}
                          </select>
                        </th>

                        {/* Column 2: NAMA PERSONIL */}
                        <th
                          className="sorting"
                          style={{
                            width: '180px',
                            padding: '10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            border: '1px solid #0d6efd',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          NAMA PERSONIL
                        </th>

                        {/* Column 3: KEGIATAN / TEMUAN */}
                        <th
                          className="sorting"
                          style={{
                            width: '380px',
                            padding: '10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            border: '1px solid #0d6efd',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          KEGIATAN / TEMUAN
                        </th>

                        {/* Column 4: WAKTU */}
                        <th
                          className="sorting"
                          style={{
                            width: '180px',
                            padding: '10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            border: '1px solid #0d6efd',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          WAKTU
                        </th>

                        {/* Column 5: AKSI */}
                        <th
                          className="sorting_disabled"
                          style={{
                            width: '100px',
                            padding: '10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            border: '1px solid #0d6efd',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          AKSI
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                            <p style={{ marginTop: '8px', fontSize: '12px' }}>Memuat data kegiatan security...</p>
                          </td>
                        </tr>
                      ) : records.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '13px' }}>
                            Tidak ada data kegiatan yang sesuai kriteria filter.
                          </td>
                        </tr>
                      ) : (
                        records.map((row, idx) => (
                          <tr
                            key={row.id || idx}
                            role="row"
                            className={idx % 2 === 0 ? 'odd' : 'even'}
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                            }}
                          >
                            {/* Col 1: Lokasi / Site */}
                            <td className="dtr-control" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                              <small>
                                <p
                                  className="text text-center text-success"
                                  style={{ color: '#28a745', margin: 0, fontWeight: 600 }}
                                >
                                  {row.siteName}
                                </p>
                              </small>
                            </td>

                            {/* Col 2: Nama Personil */}
                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                              <small>
                                <p
                                  className="text text-center text-mute"
                                  style={{ color: '#6c757d', margin: 0, fontWeight: 500 }}
                                >
                                  {row.officerName}
                                </p>
                              </small>
                            </td>

                            {/* Col 3: Kegiatan / Temuan */}
                            <td style={{ verticalAlign: 'middle', padding: '12px 10px' }}>
                              <small>
                                <div className="text-center">
                                  <p className="mb-1" style={{ color: '#343a40', marginBottom: '4px' }}>
                                    {row.statusResult.toLowerCase().includes('tindak') ||
                                    row.statusResult.toLowerCase().includes('perlu') ? (
                                      <strong style={{ color: '#dc3545' }}>🔴 {row.statusResult.toUpperCase()}</strong>
                                    ) : (
                                      <strong style={{ color: '#28a745' }}>🟢 {row.statusResult.toUpperCase()}</strong>
                                    )}
                                  </p>
                                  <p className="mb-1" style={{ color: '#343a40', margin: 0, fontSize: '12px' }}>
                                    {row.notes || row.taskDescription || 'Pemeriksaan situasi dan objek tugas'}
                                  </p>
                                  {row.tindakLanjutStatus && (
                                    <span
                                      className="badge badge-success"
                                      style={{
                                        backgroundColor: '#198754',
                                        color: '#fff',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        display: 'inline-block',
                                        marginTop: '4px',
                                      }}
                                    >
                                      {row.tindakLanjutStatus}
                                    </span>
                                  )}
                                </div>
                              </small>
                            </td>

                            {/* Col 4: Waktu */}
                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                              <small>
                                <p
                                  className="text text-center text-primary"
                                  style={{ color: '#0d6efd', margin: 0, fontWeight: 600 }}
                                >
                                  {row.dateTimeFull || `${row.dateFormatted} | ${row.timeFormatted}`}
                                </p>
                              </small>
                            </td>

                            {/* Col 5: Aksi */}
                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                              <center>
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                  aria-label="Basic example"
                                  style={{ display: 'inline-flex', gap: '4px' }}
                                >
                                  <a
                                    href="#"
                                    className="detail-record btn btn-primary"
                                    data-id={row.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedDetailId(row.id);
                                      setIsDetailOpen(true);
                                    }}
                                    style={{
                                      backgroundColor: '#0d6efd',
                                      borderColor: '#0d6efd',
                                      color: '#fff',
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <i className="fa fa-search-plus" aria-hidden="true"></i>
                                    <small>Detail</small>
                                  </a>

                                  {/* If anomaly / needs follow-up, show TL button */}
                                  {(row.statusResult.toLowerCase().includes('tindak') ||
                                    row.statusResult.toLowerCase().includes('perlu')) && (
                                    <a
                                      href="#"
                                      className="tl-record btn btn-warning"
                                      data-id={row.id}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedTlId(row.id);
                                        setIsTlOpen(true);
                                      }}
                                      style={{
                                        backgroundColor: '#ffc107',
                                        borderColor: '#ffc107',
                                        color: '#000',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <i className="fa fa-pencil" aria-hidden="true"></i>
                                      <small>TL</small>
                                    </a>
                                  )}
                                </div>
                              </center>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer: DataTables Info & Simple Numbers Pagination */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}
                >
                  <div id="patroli_info" role="status" aria-live="polite" style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 500 }}>
                    SHOWING {records.length === 0 ? 0 : (currentPage - 1) * pageLength + 1} TO{' '}
                    {Math.min(currentPage * pageLength, recordsTotal)} OF {recordsTotal} ENTRIES
                  </div>

                  <div
                    id="patroli_paginate"
                    className="dataTables_paginate paging_simple_numbers flex items-center gap-1"
                  >
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: currentPage <= 1 ? '#f8fafc' : '#fff',
                        color: currentPage <= 1 ? '#94a3b8' : '#334155',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
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
                          border: pg === currentPage ? '1px solid #0d6efd' : '1px solid #cbd5e1',
                          backgroundColor: pg === currentPage ? '#0d6efd' : '#fff',
                          color: pg === currentPage ? '#fff' : '#334155',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: pg === currentPage ? 700 : 400,
                        }}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#fff',
                        color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
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

      {/* Modal Detail Patroli (#myModalpat) */}
      <PatroliDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        patrolId={selectedDetailId}
      />

      {/* Modal Tindak Lanjut (#myModaltl) */}
      <PatroliTindakLanjutModal
        isOpen={isTlOpen}
        onClose={() => setIsTlOpen(false)}
        patrolId={selectedTlId}
        onSuccess={() => fetchRecords()}
      />
    </div>
  );
};
