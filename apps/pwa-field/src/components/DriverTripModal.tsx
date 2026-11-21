import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  MapPin,
  Navigation,
  Gauge,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { driverApi } from '../services/api';

interface DriverTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  driverName: string;
  onSuccess: (message: string) => void;
}

export const DriverTripModal: React.FC<DriverTripModalProps> = ({
  isOpen,
  onClose,
  siteId,
  driverName,
  onSuccess,
}) => {
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Start Form State
  const [plateNumber, setPlateNumber] = useState<string>('B 9876 XCD');
  const [vehicleType, setVehicleType] = useState<string>('Truk Box Logistik C4');
  const [origin, setOrigin] = useState<string>('Kantor Pusat Sholeh Iskandar Bogor');
  const [destination, setDestination] = useState<string>('Pos Logistik & Distribusi Mitra (Sentul / Cikarang)');
  const [odometerStart, setOdometerStart] = useState<number>(45210);
  const [startNotes, setStartNotes] = useState<string>('Pengiriman berkas & inventaris logistik');

  // Complete Form State
  const [odometerEnd, setOdometerEnd] = useState<number>(45285);
  const [completeNotes, setCompleteNotes] = useState<string>('Tiba tepat waktu, muatan diterima PIC Gudang.');

  // Fetch active trip on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      const checkActive = async () => {
        try {
          const trip = await driverApi.getActiveTrip();
          setActiveTrip(trip);
          if (trip) {
            setOdometerEnd(trip.odometerStart + 75);
          }
        } catch (err) {
          // offline simulation check
        }
      };
      checkActive();
    }
  }, [isOpen]);

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await driverApi.startTrip({
        siteId,
        vehiclePlateNumber: plateNumber,
        vehicleType,
        originLocation: origin,
        destinationLocation: destination,
        odometerStart,
        tripNotes: startNotes,
      });
      setActiveTrip(res);
      setOdometerEnd(odometerStart + 75);
      onSuccess(`Perjalanan armada ${plateNumber} menuju ${destination} dimulai!`);
    } catch (err: any) {
      // Simulate local state for offline flow
      const mockTrip = {
        id: `trip-local-${Date.now()}`,
        vehiclePlateNumber: plateNumber,
        vehicleType,
        originLocation: origin,
        destinationLocation: destination,
        odometerStart,
        startedAt: new Date().toISOString(),
        tripStatus: 'IN_PROGRESS',
      };
      setActiveTrip(mockTrip);
      setOdometerEnd(odometerStart + 75);
      onSuccess(`Perjalanan armada ${plateNumber} dimulai (Mode Offline).`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    if (odometerEnd < activeTrip.odometerStart) {
      setErrorMsg(`Odometer akhir (${odometerEnd}) tidak boleh lebih kecil dari awal (${activeTrip.odometerStart})`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const distanceKm = odometerEnd - activeTrip.odometerStart;

    try {
      await driverApi.completeTrip(activeTrip.id, {
        odometerEnd,
        tripNotes: completeNotes,
      });
      onSuccess(`Perjalanan armada selesai! Total jarak tempuh: ${distanceKm} km.`);
      setActiveTrip(null);
      onClose();
    } catch (err: any) {
      onSuccess(`Perjalanan armada selesai (Offline)! Total jarak tempuh: ${distanceKm} km.`);
      setActiveTrip(null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {activeTrip ? 'Selesaikan Perjalanan Armada' : 'Log Perjalanan Driver Logistik'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activeTrip ? `Armada ${activeTrip.vehiclePlateNumber}` : 'Pencatatan rute & odometer kendaraan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTrip ? (
            /* ACTIVE TRIP COMPLETION FORM */
            <form onSubmit={handleCompleteTrip} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">{activeTrip.vehiclePlateNumber}</span>
                  <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded font-bold">
                    IN PROGRESS
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeTrip.originLocation} ➔ {activeTrip.destinationLocation}</span>
                  </p>
                  <p className="flex items-center space-x-1 text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>Odometer Awal: <strong>{activeTrip.odometerStart} km</strong></span>
                  </p>
                </div>
              </div>

              {/* Odometer End Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Odometer Akhir (km):</span>
                  <span className="text-purple-400 text-[11px] font-bold">
                    Jarak: {Math.max(0, odometerEnd - activeTrip.odometerStart)} km
                  </span>
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={odometerEnd}
                    onChange={(e) => setOdometerEnd(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Catatan Perjalanan & Kondisi Armada:</label>
                <textarea
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 transition active:scale-95"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesaikan Perjalanan ({Math.max(0, odometerEnd - activeTrip.odometerStart)} km)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* START TRIP FORM */
            <form onSubmit={handleStartTrip} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Plat Nomor Kendaraan:</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipe Armada:</label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Lokasi Asal:</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Lokasi Tujuan:</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Odometer Awal (km):</label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={odometerStart}
                    onChange={(e) => setOdometerStart(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Catatan Muatan / Keperluan:</label>
                <textarea
                  value={startNotes}
                  onChange={(e) => setStartNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 transition active:scale-95 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Mulai Perjalanan Armada</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
