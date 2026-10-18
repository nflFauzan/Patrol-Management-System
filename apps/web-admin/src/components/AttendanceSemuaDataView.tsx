'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AttendanceRecordItem, 
  AttendanceRecordsResponse, 
  AttendancePersonilOption,
  Division
} from '@patrol/types';
import { useData } from '../lib/DataContext';
import { AttendancePatroliDetailModal } from './AttendancePatroliDetailModal';

export const AttendanceSemuaDataView: React.FC = () => {
  const { sites } = useData();

  // Filters state (matching patroli.site ids: #category, #posisi, #personil)
  const [selectedSiteName, setSelectedSiteName] = useState<string>('');
  const [selectedPosisi, setSelectedPosisi] = useState<string>('');
  const [selectedPersonil, setSelectedPersonil] = useState<string>('');
  const [personilOptions, setPersonilOptions] = useState<AttendancePersonilOption[]>([]);

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageLength, setPageLength] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data & loading state
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Detail Modal state
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load Personil dropdown dynamically when site or posisi changes
  useEffect(() => {
    let isMounted = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams();
    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (selectedPosisi) params.append('division', selectedPosisi);

    fetch(`http://localhost:3000/api/v1/attendance/personil-options?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch personil');
        return res.json();
      })
      .then((data: AttendancePersonilOption[]) => {
        if (isMounted) setPersonilOptions(data);
      })
      .catch(() => {
        // Mock fallback options
        if (isMounted) {
          const fallback: AttendancePersonilOption[] = [
            { id: '1', name: 'budi satpam test', division: 'Security', siteName: 'site proyek demo' },
            { id: '2', name: 'akmal', division: 'Cleaning Service', siteName: 'site proyek demo' },
            { id: '3', name: 'Joko Driver', division: 'Driver', siteName: 'site proyek demo' },
          ];
          setPersonilOptions(
            fallback.filter((p) => {
              if (selectedPosisi && p.division.toLowerCase() !== selectedPosisi.toLowerCase()) return false;
              if (selectedSiteName && p.siteName.toLowerCase() !== selectedSiteName.toLowerCase()) return false;
              return true;
            })
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSiteName, selectedPosisi]);

  // Fetch Attendance Records
  useEffect(() => {
    fetchRecords();
  }, [selectedSiteName, selectedPosisi, selectedPersonil, searchTerm, pageLength, currentPage]);

  const fetchRecords = async () => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageLength),
    });
    if (selectedSiteName) params.append('siteName', selectedSiteName);
    if (selectedPosisi) params.append('division', selectedPosisi);
    if (selectedPersonil) params.append('userName', selectedPersonil);
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`http://localhost:3000/api/v1/attendance/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API offline');
      const data: AttendanceRecordsResponse = await res.json();
      setRecords(data.data);
      setRecordsTotal(data.recordsTotal);
    } catch {
      // 100% Parity Demo Records from patroli.site live dump
      const demoRecords: AttendanceRecordItem[] = [
        {
          id: '2034',
          siteName: 'site proyek demo',
          division: 'Security',
          personilName: 'budi satpam test',
          clockInDateStr: 'Sabtu, 17 Oct 2026',
          clockInTimeStr: '00:46:13',
          isLate: false,
          lateText: null,
          clockInWithinGeofence: true,
          clockInLatitude: -6.562719,
          clockInLongitude: 106.856125,
          clockInPhotoUrl: 'foto/6acbcdd59a172.jpg',
          clockInDistanceMeters: 45,
          isClockedOut: false,
          isLupaAbsenPulang: false,
          clockOutDateStr: null,
          clockOutTimeStr: null,
          clockOutWithinGeofence: null,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
        {
          id: '2032',
          siteName: 'site proyek demo',
          division: 'Security',
          personilName: 'budi satpam test',
          clockInDateStr: 'Senin, 12 Oct 2026',
          clockInTimeStr: '18:01:17',
          isLate: true,
          lateText: '3 jam 1 menit 17 detik',
          clockInWithinGeofence: false,
          clockInLatitude: -6.562710,
          clockInLongitude: 106.856054,
          clockInPhotoUrl: 'foto-patroli/6accbdfd88ebf',
          clockInDistanceMeters: 250,
          isClockedOut: false,
          isLupaAbsenPulang: true,
          clockOutDateStr: null,
          clockOutTimeStr: null,
          clockOutWithinGeofence: null,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
        {
          id: '2031',
          siteName: 'site proyek demo',
          division: 'Cleaning Service',
          personilName: 'akmal',
          clockInDateStr: 'Senin, 12 Oct 2026',
          clockInTimeStr: '17:52:50',
          isLate: true,
          lateText: '9 jam 52 menit 50 detik',
          clockInWithinGeofence: false,
          clockInLatitude: -6.562690,
          clockInLongitude: 106.856161,
          clockInPhotoUrl: 'foto/6accb7f71da6d.jpg',
          clockInDistanceMeters: 380,
          isClockedOut: false,
          isLupaAbsenPulang: false,
          clockOutDateStr: null,
          clockOutTimeStr: null,
          clockOutWithinGeofence: null,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
        {
          id: '2030',
          siteName: 'site proyek demo',
          division: 'Cleaning Service',
          personilName: 'akmal',
          clockInDateStr: 'Senin, 12 Oct 2026',
          clockInTimeStr: '17:36:20',
          isLate: true,
          lateText: '9 jam 36 menit 20 detik',
          clockInWithinGeofence: false,
          clockInLatitude: -6.562690,
          clockInLongitude: 106.856161,
          clockInPhotoUrl: 'foto-patroli/6accb8240bdd2',
          clockInDistanceMeters: 480,
          isClockedOut: true,
          isLupaAbsenPulang: false,
          clockOutDateStr: 'Senin, 12 Oct 2026',
          clockOutTimeStr: '17:38:02',
          clockOutWithinGeofence: false,
          clockOutLatitude: -6.562690,
          clockOutLongitude: 106.856161,
          clockOutPhotoUrl: 'foto-patroli/6accb88a48052',
          clockOutDistanceMeters: 480,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
        {
          id: '2028',
          siteName: 'site proyek demo',
          division: 'Security',
          personilName: 'budi satpam test',
          clockInDateStr: 'Senin, 12 Oct 2026',
          clockInTimeStr: '01:00:36',
          isLate: false,
          lateText: null,
          clockInWithinGeofence: true,
          clockInLatitude: -6.566870,
          clockInLongitude: 106.857800,
          clockInPhotoUrl: 'foto/6acbcdd59a172.jpg',
          clockInDistanceMeters: 10,
          isClockedOut: false,
          isLupaAbsenPulang: true,
          clockOutDateStr: null,
          clockOutTimeStr: null,
          clockOutWithinGeofence: null,
          siteLatitude: -6.566873,
          siteLongitude: 106.857802,
        },
      ];

      // Filter locally
      let filtered = [...demoRecords];
      if (selectedSiteName) {
        filtered = filtered.filter((r) => r.siteName.toLowerCase().includes(selectedSiteName.toLowerCase()));
      }
      if (selectedPosisi) {
        filtered = filtered.filter((r) => r.division.toLowerCase() === selectedPosisi.toLowerCase());
      }
      if (selectedPersonil) {
        filtered = filtered.filter((r) => r.personilName.toLowerCase() === selectedPersonil.toLowerCase());
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.personilName.toLowerCase().includes(q) ||
            r.siteName.toLowerCase().includes(q) ||
            r.division.toLowerCase().includes(q)
        );
      }

      setRecordsTotal(filtered.length);
      const start = (currentPage - 1) * pageLength;
      setRecords(filtered.slice(start, start + pageLength));
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(recordsTotal / pageLength));

  const handleOpenDetail = (id: string) => {
    setSelectedDetailId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="content w-full">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12" style={{ marginTop: '10px' }}>
            {/* Header Card: 100% Parity .card-header.alert.bg-primary.text-light */}
            <div
              className="card-header alert bg-primary text-light flex items-center shadow-xs"
              style={{
                backgroundColor: '#0d6efd',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '8px 8px 0 0',
                margin: 0,
              }}
            >
              <i className="fa fa-clock-o mr-2 text-lg"></i>
              <small className="text-sm font-bold tracking-wide">Data Absensi</small>
            </div>

            {/* Card Body: 100% Parity .card-body.border.border-primary.rounded */}
            <div
              className="card-body border border-primary rounded-b-lg bg-white p-4 shadow-sm"
              style={{ borderColor: '#0d6efd' }}
            >
              {/* Controls: Show Entries & Search Bar (DataTables DOM style) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageLength}
                    onChange={(e) => {
                      setPageLength(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ minWidth: '60px' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={1000}>1,000</option>
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span>Search:</span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder=""
                    className="border border-gray-300 rounded px-3 py-1 text-sm bg-white w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* DataTables 2-Tier Table: #presensi */}
              <div className="overflow-x-auto rounded border border-blue-600">
                <table
                  id="presensi"
                  className="table-primary display responsive wrap bg-primary rounded w-full border-collapse"
                  style={{ width: '100%', backgroundColor: '#0d6efd' }}
                >
                  <thead>
                    {/* Header Row 1: Dropdown Filters & Group Header */}
                    <tr className="text text-center text-light" style={{ color: '#fff' }}>
                      {/* Filter 1: SEMUA LOKASI (#category) */}
                      <th
                        rowSpan={2}
                        className="p-1 align-middle text-center border border-blue-500"
                        style={{ width: '16.66%' }}
                      >
                        <select
                          name="category"
                          id="category"
                          value={selectedSiteName}
                          onChange={(e) => {
                            setSelectedSiteName(e.target.value);
                            setSelectedPersonil('');
                            setCurrentPage(1);
                          }}
                          className="custom-select border border-danger text-uppercase w-full rounded px-2 py-1 text-xs font-semibold uppercase text-center"
                          style={{
                            borderColor: '#dc3545',
                            borderWidth: '1.5px',
                            height: '38px',
                            color: '#212529',
                            backgroundColor: '#fff',
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

                      {/* Filter 2: SEMUA POSISI (#posisi) */}
                      <th
                        rowSpan={2}
                        className="p-1 align-middle text-center border border-blue-500"
                        style={{ width: '16.66%' }}
                      >
                        <select
                          name="posisi"
                          id="posisi"
                          value={selectedPosisi}
                          onChange={(e) => {
                            setSelectedPosisi(e.target.value);
                            setSelectedPersonil('');
                            setCurrentPage(1);
                          }}
                          className="custom-select border border-danger text-uppercase w-full rounded px-2 py-1 text-xs font-semibold uppercase text-center"
                          style={{
                            borderColor: '#dc3545',
                            borderWidth: '1.5px',
                            height: '38px',
                            color: '#212529',
                            backgroundColor: '#fff',
                          }}
                        >
                          <option value="">SEMUA POSISI</option>
                          <option value="Security">SECURITY</option>
                          <option value="Cleaning Service">CLEANING SERVICE</option>
                          <option value="Driver">DRIVER</option>
                          <option value="Staff">STAF</option>
                        </select>
                      </th>

                      {/* Filter 3: SEMUA PERSONIL (#personil) */}
                      <th
                        rowSpan={2}
                        className="p-1 align-middle text-center border border-blue-500"
                        style={{ width: '16.66%' }}
                      >
                        <select
                          name="personil"
                          id="personil"
                          value={selectedPersonil}
                          onChange={(e) => {
                            setSelectedPersonil(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="custom-select border border-danger text-uppercase w-full rounded px-2 py-1 text-xs font-semibold uppercase text-center"
                          style={{
                            borderColor: '#dc3545',
                            borderWidth: '1.5px',
                            height: '38px',
                            color: '#212529',
                            backgroundColor: '#fff',
                          }}
                        >
                          <option value="">SEMUA PERSONIL</option>
                          {personilOptions.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </th>

                      {/* Header 4: ABSENSI (Colspan 2) */}
                      <th
                        colSpan={2}
                        className="p-1 text-center align-middle font-bold text-xs uppercase tracking-wider border border-blue-500"
                        style={{ height: '30px' }}
                      >
                        ABSENSI
                      </th>

                      {/* Header 5: AKSI (Rowspan 2) */}
                      <th
                        rowSpan={2}
                        className="p-1 text-center align-middle font-bold text-xs uppercase tracking-wider border border-blue-500"
                        style={{ width: '16.66%' }}
                      >
                        AKSI
                      </th>
                    </tr>

                    {/* Header Row 2: Sub-columns MASUK & PULANG */}
                    <tr className="text text-center text-light" style={{ color: '#fff' }}>
                      <th
                        className="p-1 text-center font-bold text-xs uppercase tracking-wider border border-blue-500"
                        style={{ width: '16.66%', height: '30px' }}
                      >
                        MASUK
                      </th>
                      <th
                        className="p-1 text-center font-bold text-xs uppercase tracking-wider border border-blue-500"
                        style={{ width: '16.66%', height: '30px' }}
                      >
                        PULANG
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="bg-white">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          <i className="fa fa-spinner fa-spin fa-2x"></i>
                          <p className="mt-2 text-xs">Memuat data presensi...</p>
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                          Tidak ada data presensi yang sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      records.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/50 transition border-b border-gray-200`}
                        >
                          {/* Col 1: Site */}
                          <td className="p-3 text-center align-middle">
                            <small>
                              <p className="text text-center text-success font-semibold uppercase" style={{ color: '#28a745', margin: 0 }}>
                                {row.siteName}
                              </p>
                            </small>
                          </td>

                          {/* Col 2: Posisi / Divisi */}
                          <td className="p-3 text-center align-middle">
                            <small>
                              <p className="text text-center text-success font-semibold uppercase" style={{ color: '#28a745', margin: 0 }}>
                                {row.division}
                              </p>
                            </small>
                          </td>

                          {/* Col 3: Personil */}
                          <td className="p-3 text-center align-middle">
                            <small>
                              <p className="text text-center text-muted font-medium uppercase" style={{ color: '#6c757d', margin: 0 }}>
                                {row.personilName}
                              </p>
                            </small>
                          </td>

                          {/* Col 4: Absen Masuk */}
                          <td className="p-3 text-center align-middle">
                            <small>
                              <p className="text text-center text-primary" style={{ color: '#0d6efd', margin: 0 }}>
                                <span>{row.clockInDateStr}</span>
                                <br />
                                <strong className="text-gray-900">{row.clockInTimeStr}</strong>
                                <br />
                                <span
                                  className={`badge ${row.isLate ? 'badge-danger' : 'badge-primary'}`}
                                  style={{
                                    backgroundColor: row.isLate ? '#dc3545' : '#0d6efd',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    display: 'inline-block',
                                    margin: '2px 0',
                                  }}
                                >
                                  {row.isLate ? 'Terlambat' : 'Tepat Waktu'}
                                </span>
                                {row.isLate && row.lateText && (
                                  <>
                                    <br />
                                    <small className="text-danger font-weight-bold" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                      <i className="fa fa-clock-o mr-1"></i>
                                      {row.lateText}
                                    </small>
                                  </>
                                )}
                                <br />
                                <span
                                  className={`badge ${row.clockInWithinGeofence ? 'badge-success' : 'badge-danger'}`}
                                  style={{
                                    backgroundColor: row.clockInWithinGeofence ? '#28a745' : '#dc3545',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    display: 'inline-block',
                                    margin: '2px 0',
                                  }}
                                >
                                  {row.clockInWithinGeofence ? 'Dalam Radius Area' : 'Luar Radius Area'}
                                </span>
                              </p>
                            </small>
                          </td>

                          {/* Col 5: Absen Pulang */}
                          <td className="p-3 text-center align-middle">
                            <small>
                              {!row.isClockedOut && !row.isLupaAbsenPulang && (
                                <p className="text text-center text-danger" style={{ margin: 0 }}>
                                  <span
                                    className="badge badge-secondary"
                                    style={{
                                      backgroundColor: '#6c757d',
                                      color: '#fff',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <i className="fa fa-clock-o"></i>
                                    Belum Absen Pulang
                                  </span>
                                </p>
                              )}

                              {row.isLupaAbsenPulang && (
                                <p className="text text-center text-success" style={{ margin: 0 }}>
                                  <span
                                    className="badge badge-info"
                                    style={{
                                      backgroundColor: '#17a2b8',
                                      color: '#fff',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                    }}
                                  >
                                    Lupa absen pulang
                                  </span>
                                </p>
                              )}

                              {row.isClockedOut && (
                                <p className="text text-center text-primary" style={{ color: '#0d6efd', margin: 0 }}>
                                  <span>{row.clockOutDateStr}</span>
                                  <br />
                                  <strong className="text-gray-900">{row.clockOutTimeStr}</strong>
                                  <br />
                                  <span
                                    className="badge badge-primary"
                                    style={{
                                      backgroundColor: '#0d6efd',
                                      color: '#fff',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      display: 'inline-block',
                                      margin: '2px 0',
                                    }}
                                  >
                                    Tepat Waktu
                                  </span>
                                  <br />
                                  <span
                                    className={`badge ${row.clockOutWithinGeofence ? 'badge-success' : 'badge-danger'}`}
                                    style={{
                                      backgroundColor: row.clockOutWithinGeofence ? '#28a745' : '#dc3545',
                                      color: '#fff',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      display: 'inline-block',
                                      margin: '2px 0',
                                    }}
                                  >
                                    {row.clockOutWithinGeofence ? 'Dalam Radius Area' : 'Luar Radius Area'}
                                  </span>
                                </p>
                              )}
                            </small>
                          </td>

                          {/* Col 6: Aksi */}
                          <td className="p-3 text-center align-middle">
                            <center>
                              <div className="btn-group btn-group-sm" role="group" aria-label="Aksi absensi">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(row.id)}
                                  className="detail-absen btn btn-info flex items-center justify-center gap-1 font-semibold transition hover:brightness-105"
                                  style={{
                                    backgroundColor: '#17a2b8',
                                    borderColor: '#17a2b8',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                  }}
                                >
                                  <i className="fa fa-search-plus text-xs" aria-hidden="true"></i>
                                  <small className="font-semibold text-xs">Detail</small>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700">
                <div className="dataTables_info text-xs text-gray-600 font-medium">
                  Showing {recordsTotal === 0 ? 0 : (currentPage - 1) * pageLength + 1} to{' '}
                  {Math.min(currentPage * pageLength, recordsTotal)} of {recordsTotal} entries
                </div>

                <div className="dataTables_paginate flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-xs rounded border ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer bg-white'
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-xs font-semibold rounded border ${
                          currentPage === pageNum
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 text-xs rounded border ${
                      currentPage >= totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer bg-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Parity Detail Modal */}
      <AttendancePatroliDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        attendanceId={selectedDetailId}
      />
    </div>
  );
};
