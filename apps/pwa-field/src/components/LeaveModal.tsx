import React, { useState } from 'react';
import { X, FileText, Send, AlertCircle } from 'lucide-react';
import { AttendanceStatus } from '@patrol/types';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: string; date: string; leaveReason: string }) => Promise<void>;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [status, setStatus] = useState<string>(AttendanceStatus.PERMISSION);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Mohon tuliskan alasan izin atau sakit secara jelas.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSubmit({ status, date, leaveReason: reason });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal mengajukan izin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Form Pengajuan Izin / Sakit</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Jenis Pengajuan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus(AttendanceStatus.PERMISSION)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  status === AttendanceStatus.PERMISSION
                    ? 'bg-blue-600 text-white border-blue-500 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Izin Keperluan
              </button>
              <button
                type="button"
                onClick={() => setStatus(AttendanceStatus.SICK)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  status === AttendanceStatus.SICK
                    ? 'bg-amber-600 text-white border-amber-500 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Surat Sakit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Keterangan / Alasan</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan izin Anda secara ringkas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
