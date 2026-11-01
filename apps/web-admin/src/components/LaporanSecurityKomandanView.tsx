'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '../lib/DataContext';
import { KomandanDetailModal, KomandanLogItem } from './KomandanDetailModal';

export const LaporanSecurityKomandanView: React.FC = () => {
  const { sites } = useData();
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal Detail states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<KomandanLogItem | null>(null);

  const initialDemoRecords: KomandanLogItem[] = [
    {
      id: 'kom-1',
      siteName: 'KANTOR PUSAT',
      waktu: 'SENIN, 26 OCT 2026 - 05:34:00',
      shift: 'PAGI',
      namaKomandan: 'BUDI SANTOSO',
      kehadiranPersonil: 4,
      catatan:
        'Apel pagi pergantian shift regu A lengkap 4 personil. Senpi laras pendek, 4 HT pos, dan kunci master ruang server tersimpan aman. Situasi pos dan perimeter kondusif.',
      inventaris: 'Buku mutasi, 4 unit Handy Talky (HT), 2 unit senter patroli, dan kunci gerbang utama lengkap.',
    },
    {
      id: 'kom-2',
      siteName: 'PABRIK BEKASI',
      waktu: 'MINGGU, 25 OCT 2026 - 23:00:00',
      shift: 'MALAM',
      namaKomandan: 'BAMBANG SUPRIYANTO',
      kehadiranPersonil: 6,
      catatan:
        'Serah terima tugas jaga shift siang ke malam selesai. Pintu loading dock pabrik terkunci steril, penerangan perimeter aktif.',
      inventaris: 'Buku mutasi shift malam, 6 unit HT pos, 4 senter patroli, barcode scanner cadangan.',
    },
  ];

  const [records, setRecords] = useState<KomandanLogItem[]>(initialDemoRecords);

  useEffect(() => {
    let isMounted = true;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || ''
        : '';

    fetch('http://localhost:3000/api/v1/reports/komandan-logs', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: KomandanLogItem[] = data.map((d: any) => ({
            id: d.id,
            siteName: d.siteName ? d.siteName.toUpperCase() : 'KANTOR PUSAT',
            waktu: d.handoverTime
              ? new Date(d.handoverTime).toLocaleString('id-ID')
              : 'SENIN, 26 OCT 2026 - 05:34:00',
            shift: (d.shiftName || 'PAGI').toUpperCase(),
            namaKomandan: (d.danruName || 'BUDI SANTOSO').toUpperCase(),
            kehadiranPersonil: d.personnelOnDutyCount || 4,
            catatan: d.generalNotes || 'Apel pergantian regu berjalan lancar dan tertib. Situasi aman.',
            inventaris: 'Buku mutasi, HT pos jaga, senter patroli, dan kunci master lengkap.',
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
        r.namaKomandan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.catatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              KEGIATAN KOMANDAN
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
                      placeholder="Cari komandan / shift..."
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
                          <option value="KANTOR PUSAT">KANTOR PUSAT</option>
                          <option value="PABRIK BEKASI">PABRIK BEKASI</option>
                          <option value="GUDANG CAKUNG">GUDANG CAKUNG</option>
                          <option value="POOL KENDARAAN">POOL KENDARAAN</option>
                        </select>
                      </th>
                      <th style={{ width: '160px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        WAKTU
                      </th>
                      <th style={{ width: '110px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        SHIFT
                      </th>
                      <th style={{ width: '160px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        NAMA KOMANDAN
                      </th>
                      <th style={{ width: '150px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        KEHADIRAN PERSONIL
                      </th>
                      <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        CATATAN
                      </th>
                      <th style={{ width: '90px', padding: '10px', textAlign: 'center', border: '1px solid #343a40', fontSize: '12px', fontWeight: 700 }}>
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                          Tidak ada data kegiatan komandan ditemukan.
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
                              <p style={{ color: '#28a745', margin: 0, fontWeight: 600 }}>
                                {row.waktu}
                              </p>
                            </small>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <p style={{ color: '#0d6efd', margin: 0, fontWeight: 600 }}>
                                {row.shift}
                              </p>
                            </small>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <small>
                              <p style={{ color: '#0d6efd', margin: 0, fontWeight: 600 }}>
                                {row.namaKomandan}
                              </p>
                            </small>
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
                              {row.kehadiranPersonil} PERSONIL
                            </span>
                          </td>
                          <td style={{ verticalAlign: 'middle', padding: '12px 10px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                            {row.catatan}
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px 10px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(row);
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

      {/* Komandan Detail Modal */}
      <KomandanDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
    </div>
  );
};
