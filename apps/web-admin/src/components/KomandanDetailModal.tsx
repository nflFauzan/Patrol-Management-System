'use client';

import React from 'react';

export interface KomandanLogItem {
  id: string;
  siteName: string;
  waktu: string;
  shift: string;
  namaKomandan: string;
  kehadiranPersonil: number;
  catatan: string;
  inventaris?: string;
  reguPengganti?: string;
}

interface KomandanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: KomandanLogItem | null;
}

export const KomandanDetailModal: React.FC<KomandanDetailModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

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

      <style dangerouslySetInnerHTML={{ __html: `
        .komandan-modal-wrap {
          width: 100%;
          max-width: 650px;
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
        .komandan-detail-body {
          padding: 18px;
          background: linear-gradient(135deg, #f8fafc, #eef2ff);
          max-height: 85vh;
          overflow-y: auto;
        }
        .komandan-profile {
          background: #fff;
          border-radius: 18px;
          padding: 20px 15px;
          text-align: center;
          box-shadow: 0 5px 18px rgba(15,23,42,.08);
          margin-bottom: 14px;
        }
        .komandan-profile img {
          width: 84px;
          height: 84px;
          object-fit: cover;
          border-radius: 50%;
          border: 4px solid #e2e8f0;
          margin: 0 auto;
        }
        .komandan-name {
          margin-top: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }
        .komandan-position {
          font-size: 12px;
          color: #64748b;
        }
        .komandan-site {
          display: inline-block;
          margin-top: 7px;
          padding: 5px 12px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
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
          padding: 12px 16px;
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
          font-size: 10px;
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
      `}} />

      <div className="komandan-modal-wrap">
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-dark text-light"
          style={{ backgroundColor: '#212529', color: '#fff' }}
        >
          <div className="flex items-center gap-2">
            <i className="fa fa-shield text-blue-400"></i>
            <h6 className="m-0 text-sm font-bold tracking-wide">DETAIL KEGIATAN KOMANDAN</h6>
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
        <div className="komandan-detail-body">
          {/* Profile Card */}
          <div className="komandan-profile">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
              alt="Foto Komandan"
              onError={(e) => {
                (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
              }}
            />
            <div className="komandan-name">{data.namaKomandan}</div>
            <div className="komandan-position">Komandan Regu (Danru Security)</div>
            <div className="komandan-site">
              <i className="fa fa-map-marker mr-1 text-red-500"></i>
              {data.siteName}
            </div>
            <div style={{ marginTop: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                }}
              >
                <i className="fa fa-check-circle mr-1"></i>
                Shift Handover Selesai
              </span>
            </div>
          </div>

          {/* Shift & Handover Info */}
          <div className="detail-card">
            <div className="detail-card-header">
              <i className="fa fa-clock-o"></i>
              <span>Informasi Shift & Serah Terima</span>
            </div>
            <div className="detail-card-body">
              <div className="detail-item">
                <div className="detail-item-icon">
                  <i className="fa fa-calendar"></i>
                </div>
                <div>
                  <div className="detail-item-label">Waktu Handover</div>
                  <div className="detail-item-value">{data.waktu}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-icon">
                  <i className="fa fa-sun-o"></i>
                </div>
                <div>
                  <div className="detail-item-label">Shift Kerja</div>
                  <div className="detail-item-value font-semibold text-blue-700">{data.shift}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-icon">
                  <i className="fa fa-users"></i>
                </div>
                <div>
                  <div className="detail-item-label">Personel Bertugas / Apel</div>
                  <div className="detail-item-value font-bold text-slate-800">
                    {data.kehadiranPersonil} Personil (Lengkap & Siap Tugas)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventaris & Perlengkapan */}
          <div className="detail-card">
            <div className="detail-card-header">
              <i className="fa fa-briefcase"></i>
              <span>Inventaris & Perlengkapan Jaga</span>
            </div>
            <div className="detail-card-body">
              <div className="detail-item">
                <div className="detail-item-icon">
                  <i className="fa fa-check-square-o text-emerald-600"></i>
                </div>
                <div>
                  <div className="detail-item-label">Status Inventaris Pos Jaga</div>
                  <div className="detail-item-value">
                    {data.inventaris || 'Buku mutasi, 4 unit Handy Talky (HT), 2 unit senter patroli, dan kunci gerbang utama lengkap.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Komandan */}
          <div className="detail-card">
            <div className="detail-card-header">
              <i className="fa fa-file-text-o"></i>
              <span>Catatan Komandan & Kejadian Menonjol</span>
            </div>
            <div className="detail-card-body">
              <p className="text-xs text-slate-700 leading-relaxed m-0 p-2 bg-slate-50 rounded-lg border border-slate-100">
                {data.catatan || 'Apel pergantian regu berjalan lancar dan tertib. Situasi pos penjagaan aman terkendali.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

