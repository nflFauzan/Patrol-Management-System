'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface AreaLeafletMapProps {
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
  mode: 'create' | 'edit';
  areaName?: string;
  geofenceRadius?: number;
}

export default function AreaLeafletMap({
  latitude,
  longitude,
  onChangeLocation,
  mode,
  areaName = 'Area / Site',
  geofenceRadius = 50,
}: AreaLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = await import('leaflet');

      // Fix standard leaflet icon path in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = latitude ?? -6.200000;
      const initialLng = longitude ?? 106.816666;
      const initialZoom = latitude && longitude ? (mode === 'edit' ? 17 : 14) : 12;

      const map = L.map(mapContainerRef.current, {
        zoom: initialZoom,
        center: [initialLat, initialLng],
      });

      // Hot tile layer matching patroli.site
      const tilesURL = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      L.tileLayer(tilesURL, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle marker & circle if coordinates exist or when clicked
      if (latitude !== null && longitude !== null) {
        const marker = L.marker([latitude, longitude], {
          draggable: true,
          riseOnHover: true,
        }).addTo(map);

        if (mode === 'edit') {
          marker.bindPopup(`Lokasi Sekarang ${areaName}`).openPopup();

          const circle = L.circle([latitude, longitude], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: geofenceRadius,
          }).addTo(map);

          circle.bindPopup(`Lokasi Sekarang ${areaName}`);
          circleRef.current = circle;
        }

        marker.on('drag', (e: any) => {
          const latLng = e.target.getLatLng();
          onChangeLocation(parseFloat(latLng.lat.toFixed(6)), parseFloat(latLng.lng.toFixed(6)));
          if (circleRef.current) {
            circleRef.current.setLatLng(latLng);
          }
        });

        markerRef.current = marker;
      }

      // Map click handler
      map.on('click', (ev: any) => {
        const lat = parseFloat(ev.latlng.lat.toFixed(6));
        const lng = parseFloat(ev.latlng.lng.toFixed(6));
        onChangeLocation(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng(ev.latlng);
          if (mode === 'edit') {
            markerRef.current.bindPopup(`Lokasi Sekarang ${areaName}`).openPopup();
          }
        } else {
          const marker = L.marker(ev.latlng, {
            draggable: true,
            riseOnHover: true,
          }).addTo(map);

          if (mode === 'edit') {
            marker.bindPopup(`Lokasi Sekarang ${areaName}`).openPopup();
          }

          marker.on('drag', (event: any) => {
            const dragLatLng = event.target.getLatLng();
            onChangeLocation(parseFloat(dragLatLng.lat.toFixed(6)), parseFloat(dragLatLng.lng.toFixed(6)));
            if (circleRef.current) {
              circleRef.current.setLatLng(dragLatLng);
            }
          });

          markerRef.current = marker;
        }

        if (mode === 'edit') {
          if (circleRef.current) {
            circleRef.current.setLatLng(ev.latlng);
          } else {
            const circle = L.circle(ev.latlng, {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: geofenceRadius,
            }).addTo(map);
            circle.bindPopup(`Lokasi Sekarang ${areaName}`);
            circleRef.current = circle;
          }
        }
      });

      // Invalidate size on mount to prevent gray tiles
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  // Sync external changes to marker if lat/lng changes from external source (e.g. search)
  useEffect(() => {
    if (!mapInstanceRef.current || latitude === null || longitude === null) return;
    const currentLatLng = markerRef.current?.getLatLng();
    if (currentLatLng && currentLatLng.lat === latitude && currentLatLng.lng === longitude) {
      return;
    }

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;
      const newLatLng = [latitude, longitude] as [number, number];

      if (markerRef.current) {
        markerRef.current.setLatLng(newLatLng);
      } else {
        const marker = L.marker(newLatLng, {
          draggable: true,
          riseOnHover: true,
        }).addTo(mapInstanceRef.current);

        marker.on('drag', (e: any) => {
          const latLng = e.target.getLatLng();
          onChangeLocation(parseFloat(latLng.lat.toFixed(6)), parseFloat(latLng.lng.toFixed(6)));
          if (circleRef.current) {
            circleRef.current.setLatLng(latLng);
          }
        });
        markerRef.current = marker;
      }

      if (mode === 'edit') {
        if (circleRef.current) {
          circleRef.current.setLatLng(newLatLng);
        } else {
          const circle = L.circle(newLatLng, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: geofenceRadius,
          }).addTo(mapInstanceRef.current);
          circle.bindPopup(`Lokasi Sekarang ${areaName}`);
          circleRef.current = circle;
        }
      }

      mapInstanceRef.current.panTo(newLatLng);
    });
  }, [latitude, longitude, mode, areaName, geofenceRadius]);

  // Nominatim Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await resp.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Nominatim search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = parseFloat(parseFloat(item.lat).toFixed(6));
    const lon = parseFloat(parseFloat(item.lon).toFixed(6));
    onChangeLocation(lat, lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 17);
    }
    setShowSearchResults(false);
    setSearchQuery(item.display_name);
  };

  return (
    <div className="relative w-full">
      {/* Search Bar matching Nominatim control */}
      <div className="mb-2 relative z-20">
        <form onSubmit={handleSearch} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi berdasarkan nama kota, gedung, atau jalan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769aa] focus:border-transparent bg-white shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 bg-[#1769aa] hover:bg-[#104b7a] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Cari</span>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 text-xs divide-y divide-slate-100">
            {searchResults.map((res: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition flex flex-col"
              >
                <span className="font-semibold text-slate-800 line-clamp-1">{res.display_name}</span>
                <span className="text-[10px] text-slate-500">
                  Lat: {res.lat}, Lon: {res.lon}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        id="map"
        className="w-full h-[40vh] min-h-[280px] rounded-md overflow-hidden border border-slate-200 z-10"
      />
    </div>
  );
}
