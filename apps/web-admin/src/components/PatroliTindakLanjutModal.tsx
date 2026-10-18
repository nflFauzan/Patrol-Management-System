'use client';

import React, { useState } from 'react';

interface PatroliTindakLanjutModalProps {
  isOpen: boolean;
  onClose: () => void;
  patrolId: string | null;
  onSuccess?: () => void;
}

export const PatroliTindakLanjutModal: React.FC<PatroliTindakLanjutModalProps> = ({
  isOpen,
  onClose,
  patrolId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !patrolId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('patrol_auth_token') || '' : '';

    try {
      await fetch(`http://localhost:3000/api/v1/patrol/${patrolId}/tl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Ya sudah di TL' }),
      });
    } catch {
      // offline demo graceful handling
    } finally {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div
      className="modal show"
      id="myModaltl"
      role="dialog"
      aria-modal="true"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1060,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ margin: '3.75rem auto', maxWidth: '600px' }}>
        <div className="modal-content" style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div
            className="modal-header alert alert-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 0,
              backgroundColor: '#0d6efd',
              color: '#fff',
              borderBottom: '1px solid #0b5ed7',
              borderRadius: '12px 12px 0 0',
              padding: '12px 20px',
            }}
          >
            <h4 className="modal-title" id="myModalLabel" style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              KONFIRMASI TINDAK LANJUT
            </h4>
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                lineHeight: 1,
                cursor: 'pointer',
                opacity: 0.85,
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body-tl" style={{ padding: '20px', backgroundColor: '#fff' }}>
            <form onSubmit={handleSubmit}>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>
                    Apakah laporan ini sudah di tindak lanjuti ..?
                  </label>
                  <input type="hidden" value={patrolId} name="kode_patroli" />
                  <input type="hidden" value="" name="tl" />
                </div>

                <div
                  className="modal-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    paddingTop: '15px',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#6c757d',
                      borderColor: '#6c757d',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Belum di TL
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#0d6efd',
                      borderColor: '#0d6efd',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Ya sudah di TL'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
