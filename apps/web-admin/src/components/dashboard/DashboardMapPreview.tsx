'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { SurfaceCard } from '../ui/SurfaceCard';
import 'leaflet/dist/leaflet.css';

export interface DashboardMapPreviewProps {
  checkpoints?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    status?: string;
  }>;
  centerLat?: number;
  centerLng?: number;
}

export const DashboardMapPreview: React.FC<DashboardMapPreviewProps> = ({
  checkpoints = [],
  centerLat,
  centerLng,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = await import('leaflet');

        if (!isMounted || !mapContainerRef.current) return;

        // Custom styled divIcon for patrol points
        const createMarkerIcon = (isActive: boolean) =>
          L.divIcon({
            className: 'custom-patrol-pin',
            html: `
              <div style="
                width: 22px;
                height: 22px;
                background: ${isActive ? '#0284C7' : '#F59E0B'};
                border: 2px solid #FFFFFF;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(2,132,199,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

        const lat = centerLat ?? checkpoints[0]?.lat ?? -6.564061;
        const lng = centerLng ?? checkpoints[0]?.lng ?? 106.810320;

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Center hub shield marker
        const centerIcon = L.divIcon({
          className: 'patrol-hub-pin',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #0284C7, #0369A1);
              border: 2px solid #FFFFFF;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(2,132,199,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([lat, lng], { icon: centerIcon })
          .addTo(map)
          .bindPopup('<b>Pos Komando Utama</b><br/>Area Sentral Site');

        // Draw Route Polyline
        const latLngs = checkpoints.map((cp) => [cp.lat, cp.lng] as [number, number]);
        if (latLngs.length > 1) {
          L.polyline(latLngs, {
            color: '#38BDF8',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 6',
          }).addTo(map);
        }

        // Add Checkpoint Markers
        checkpoints.forEach((cp) => {
          const marker = L.marker([cp.lat, cp.lng], {
            icon: createMarkerIcon(cp.status === 'Active'),
          }).addTo(map);
          marker.bindPopup(`<b>${cp.name}</b><br/>Status: ${cp.status || 'Active'}`);
        });

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error('Failed to init dashboard map preview:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [checkpoints, centerLat, centerLng]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <SurfaceCard variant="elevated" padding="md" className="flex flex-col justify-between h-full isolate relative z-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Peta Lokasi Patroli
          </h2>
          <p className="text-[11px] text-slate-500">
            Persebaran rute dan pos checkpoint aktif
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </span>
          <Link
            href="/validasi-patroli"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Buka Peta Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative mt-4 w-full h-[210px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Empty state overlay when checkpoints empty */}
        {checkpoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs bg-slate-50/85 z-10 font-medium">
            Belum ada checkpoint terdaftar
          </div>
        )}

        {/* Floating Custom Zoom Controls */}
        <div className="absolute bottom-2.5 right-2.5 z-[400] flex flex-col space-y-1 bg-white/95 backdrop-blur-xs rounded-xl p-1 shadow-skeuo-card border border-slate-200">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
};
