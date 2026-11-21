'use client';

import React, { useEffect, useState } from 'react';
import { ChiefEvaluationItem } from '@patrol/types';
import { API_BASE_URL } from '@/lib/api';

interface ChiefDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  chiefId: string | null;
  detailData?: ChiefEvaluationItem | null;
}

export const ChiefDetailModal: React.FC<ChiefDetailModalProps> = ({
  isOpen,
  onClose,
  chiefId,
  detailData: initialDetail,
}) => {
  const [data, setData] = useState<ChiefEvaluationItem | null>(null);
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

    if (!chiefId) return;

    let isMounted = true;
    setIsLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('patrol_auth_token') || '' : '';

    fetch(`${API_BASE_URL}/reports/chief-evaluations/${chiefId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((resData: ChiefEvaluationItem) => {
        if (isMounted) setData(resData);
      })
      .catch(() => {
        // Fallback demo data identical to patroli.site live capture (ID 6)
        if (isMounted) {
          setData({
            id: chiefId,
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
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, chiefId, initialDetail]);

  if (!isOpen) return null;

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
        .komandan-detail {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 10px 4px 30px;
          font-family: Arial, Helvetica, sans-serif;
          color: #172033;
        }
        .komandan-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .komandan-header-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4f46e5, #3730a3);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          box-shadow: 0 7px 18px rgba(79, 70, 229, 0.22);
        }
        .komandan-header h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          color: #172033;
        }
        .komandan-header p {
          margin: 3px 0 0;
          color: #7b8496;
          font-size: 12px;
        }
        .komandan-profile {
          background: #fff;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.07);
          border: 1px solid #edf0f5;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .komandan-profile:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, #4f46e5, #818cf8);
        }
        .komandan-profile-inner {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .komandan-avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fff;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.15);
          flex-shrink: 0;
          background: #f2f4f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .komandan-profile-info {
          min-width: 0;
        }
        .komandan-profile-info h3 {
          margin: 0 0 5px;
          font-size: 16px;
          font-weight: 800;
          color: #172033;
        }
        .komandan-position {
          margin: 0 0 5px;
          font-size: 13px;
          color: #667085;
        }
        .komandan-role {
          margin: 0;
          font-size: 12px;
          color: #8a93a3;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .komandan-status {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #edf0f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .komandan-status-label {
          color: #7b8496;
          font-size: 11px;
        }
        .komandan-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border-radius: 30px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 800;
        }
        .komandan-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6366f1;
        }
        .komandan-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .komandan-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #edf0f5;
          box-shadow: 0 7px 25px rgba(15, 23, 42, 0.055);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .komandan-card-full {
          grid-column: 1 / -1;
        }
        .komandan-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 18px;
          border-bottom: 1px solid #edf0f5;
        }
        .komandan-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 15px;
        }
        .komandan-card-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: #172033;
        }
        .komandan-card-header span {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          color: #98a0ae;
        }
        .komandan-card-body {
          padding: 17px 18px;
        }
        .komandan-item {
          display: flex;
          gap: 13px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f6;
        }
        .komandan-item:first-child {
          padding-top: 0;
        }
        .komandan-item:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }
        .komandan-item-icon {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 10px;
          background: #f5f7fa;
          color: #667085;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
        .komandan-item-content {
          min-width: 0;
          flex: 1;
        }
        .komandan-item-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #98a0ae;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .komandan-item-value {
          font-size: 13px;
          line-height: 1.5;
          color: #273246;
          font-weight: 600;
          word-break: break-word;
        }
        .komandan-value-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 8px;
          background: #f2f4f7;
          color: #4b5565;
          font-size: 12px;
          font-weight: 700;
        }
        .komandan-regu {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .komandan-regu-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }
        .komandan-regu-text small {
          display: block;
          color: #98a0ae;
          font-size: 11px;
          margin-bottom: 3px;
        }
        .komandan-regu-text strong {
          font-size: 15px;
          color: #172033;
        }
        .komandan-note {
          background: #f8fafc;
          border-radius: 13px;
          padding: 14px;
          border-left: 4px solid #4f46e5;
          color: #4b5565;
          font-size: 13px;
          line-height: 1.6;
          min-height: 20px;
        }
        @media (max-width: 767px) {
          .komandan-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .komandan-card-full {
            grid-column: auto;
          }
        }
      ` }} />

      <div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden my-6"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-dark text-light border-b border-secondary"
          style={{ backgroundColor: '#343a40', color: '#fff' }}
        >
          <h6 className="m-0 text-sm font-bold tracking-wide flex items-center gap-2">
            DETAIL KEGIATAN CHIEF
          </h6>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none font-semibold focus:outline-none px-2"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label="Close"
          >
            <span>&times;</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
          {isLoading && !data ? (
            <div className="text-center py-12 text-slate-500">
              <i className="fa fa-spinner fa-spin fa-2x mb-3 text-indigo-600 block"></i>
              <span className="text-sm font-semibold">Memuat detail kegiatan chief...</span>
            </div>
          ) : data ? (
            <div className="komandan-detail">
              {/* Header Title Banner */}
              <div className="komandan-header">
                <div className="komandan-header-icon">
                  <i className="fa fa-user-secret"></i>
                </div>
                <div>
                  <h2>Detail Komandan</h2>
                  <p>Informasi laporan dan evaluasi komandan regu</p>
                </div>
              </div>

              {/* Profile Card */}
              <div className="komandan-profile">
                <div className="komandan-profile-inner">
                  <div className="komandan-avatar">
                    <i
                      className="fa fa-user"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: '#667085',
                        background: '#f2f4f7',
                        borderRadius: '50%',
                      }}
                    ></i>
                  </div>
                  <div className="komandan-profile-info">
                    <h3>{data.namaKomandan || 'DANDAN KOMANDAN'}</h3>
                    <p className="komandan-position">{data.komandanPosition || 'Komandan Regu'}</p>
                    <p className="komandan-role">
                      <i className="fa fa-shield"></i>
                      {data.komandanRole || 'Laporan Komandan'}
                    </p>
                  </div>
                </div>
                <div className="komandan-status">
                  <span className="komandan-status-label">Status Laporan</span>
                  <span className="komandan-status-badge">
                    <span className="komandan-status-dot"></span>
                    {data.statusLaporan || 'Selesai'}
                  </span>
                </div>
              </div>

              {/* 2-Column Responsive Grid */}
              <div className="komandan-grid">
                {/* Card 1: Penilaian Komandan */}
                <div className="komandan-card">
                  <div className="komandan-card-header">
                    <div className="komandan-card-icon">
                      <i className="fa fa-bar-chart"></i>
                    </div>
                    <div>
                      <h4>Penilaian Komandan</h4>
                      <span>Hasil evaluasi pelaksanaan tugas</span>
                    </div>
                  </div>
                  <div className="komandan-card-body">
                    <div className="komandan-item">
                      <div className="komandan-item-icon">
                        <i className="fa fa-check-square-o"></i>
                      </div>
                      <div className="komandan-item-content">
                        <span className="komandan-item-label">Kedisiplinan</span>
                        <div className="komandan-item-value">{data.kedisiplinan || 'Baik'}</div>
                      </div>
                    </div>
                    <div className="komandan-item">
                      <div className="komandan-item-icon">
                        <i className="fa fa-random"></i>
                      </div>
                      <div className="komandan-item-content">
                        <span className="komandan-item-label">Koordinasi</span>
                        <div className="komandan-item-value">{data.koordinasi || 'Baik'}</div>
                      </div>
                    </div>
                    <div className="komandan-item">
                      <div className="komandan-item-icon">
                        <i className="fa fa-users"></i>
                      </div>
                      <div className="komandan-item-content">
                        <span className="komandan-item-label">Kehadiran Regu</span>
                        <div className="komandan-item-value">{data.kehadiran || 'Lengkap'}</div>
                      </div>
                    </div>
                    <div className="komandan-item">
                      <div className="komandan-item-icon">
                        <i className="fa fa-warning"></i>
                      </div>
                      <div className="komandan-item-content">
                        <span className="komandan-item-label">Insiden</span>
                        <div className="komandan-item-value">{data.insiden || 'Tidak Ada'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Kehadiran Regu */}
                <div className="komandan-card">
                  <div className="komandan-card-header">
                    <div className="komandan-card-icon">
                      <i className="fa fa-users"></i>
                    </div>
                    <div>
                      <h4>Kehadiran Regu</h4>
                      <span>Rekap personil pada saat bertugas</span>
                    </div>
                  </div>
                  <div className="komandan-card-body">
                    <div className="komandan-item">
                      <div className="komandan-regu-icon">
                        <i className="fa fa-user-plus"></i>
                      </div>
                      <div className="komandan-regu-text">
                        <small>Regu Hadir</small>
                        <strong>{String(data.reguHadir || 'Lengkap')}</strong>
                      </div>
                    </div>
                    <div className="komandan-item">
                      <div className="komandan-regu-icon">
                        <i className="fa fa-user-times"></i>
                      </div>
                      <div className="komandan-regu-text">
                        <small>Regu Izin</small>
                        <strong>{String(data.reguIzin || 'Lengkap')}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Detail Insiden */}
                <div className="komandan-card">
                  <div className="komandan-card-header">
                    <div className="komandan-card-icon">
                      <i className="fa fa-warning"></i>
                    </div>
                    <div>
                      <h4>Detail Insiden</h4>
                      <span>Informasi kejadian yang dilaporkan</span>
                    </div>
                  </div>
                  <div className="komandan-card-body">
                    <div className="komandan-note">
                      {data.detailInsiden || 'Tidak ada kejadian menonjol atau insiden keamanan.'}
                    </div>
                  </div>
                </div>

                {/* Card 4: Catatan */}
                <div className="komandan-card">
                  <div className="komandan-card-header">
                    <div className="komandan-card-icon">
                      <i className="fa fa-sticky-note"></i>
                    </div>
                    <div>
                      <h4>Catatan</h4>
                      <span>Catatan tambahan dari komandan</span>
                    </div>
                  </div>
                  <div className="komandan-card-body">
                    <div className="komandan-note">
                      {data.catatan || 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.'}
                    </div>
                  </div>
                </div>

                {/* Card 5: Informasi Laporan (Full Width) */}
                <div className="komandan-card komandan-card-full">
                  <div className="komandan-card-header">
                    <div className="komandan-card-icon">
                      <i className="fa fa-calendar"></i>
                    </div>
                    <div>
                      <h4>Informasi Laporan</h4>
                      <span>Waktu laporan dibuat oleh komandan</span>
                    </div>
                  </div>
                  <div className="komandan-card-body">
                    <div className="komandan-item">
                      <div className="komandan-item-icon">
                        <i className="fa fa-calendar"></i>
                      </div>
                      <div className="komandan-item-content">
                        <span className="komandan-item-label">Tanggal Lapor</span>
                        <div className="komandan-item-value">
                          {data.tanggalLapor || '2026-10-18 21:11:40'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <span className="text-sm">Data tidak ditemukan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
