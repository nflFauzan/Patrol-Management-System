'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface EmergencyLeafletMapProps {
  latitude: number;
  longitude: number;
  officerName?: string;
  division?: string;
  siteName?: string;
  radius?: number;
}

export default function EmergencyLeafletMap({
  latitude,
  longitude,
  officerName = 'Petugas',
  division = 'Security',
  siteName = 'Area Fasilitas',
  radius = 100,
}: EmergencyLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = await import('leaflet');

      // Fix Leaflet marker icon asset paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
      });

      // Standard OSM Tile Layer matching patroli.site
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '<a href="https://patroli.site">Patroli Site</a>',
      });
      osm.addTo(map);

      // Marker on exact GPS coordinates
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>${officerName}</b><br/>${division} - ${siteName}`).openPopup();

      // Red circle with 100m radius matching patroli.site
      L.circle([latitude, longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to ensure clean tile rendering inside modal
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, officerName, division, siteName, radius]);

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-lg overflow-hidden border border-slate-300">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />
    </div>
  );
}

