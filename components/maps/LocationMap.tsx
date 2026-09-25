'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

interface LocationMapProps {
  userLocation: { lat: number; lng: number };
  officeLocation: { lat: number; lng: number };
  height?: string;
  rotiQLocation?: { lat: number; lng: number };
}

export default function LocationMap({
  userLocation,
  officeLocation,
  rotiQLocation,
  height = '380px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<{ user?: L.Marker; office?: L.Marker; rotiq?: L.Marker }>({});

  const iconFor = (color: string) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([userLocation.lat, userLocation.lng], 16);
    L.tileLayer(TILE_URL, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (markerRefs.current.user) markerRefs.current.user.setLatLng([userLocation.lat, userLocation.lng]);
    else markerRefs.current.user = L.marker([userLocation.lat, userLocation.lng], { icon: iconFor('red') }).addTo(map);

    if (markerRefs.current.office) markerRefs.current.office.setLatLng([officeLocation.lat, officeLocation.lng]);
    else markerRefs.current.office = L.marker([officeLocation.lat, officeLocation.lng], { icon: iconFor('blue') }).addTo(map);

    if (rotiQLocation) {
      if (markerRefs.current.rotiq) markerRefs.current.rotiq.setLatLng([rotiQLocation.lat, rotiQLocation.lng]);
      else markerRefs.current.rotiq = L.marker([rotiQLocation.lat, rotiQLocation.lng], { icon: iconFor('orange') }).addTo(map);
    }
    map.panTo([userLocation.lat, userLocation.lng]);
  }, [userLocation, officeLocation, rotiQLocation]);

  return <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ height }} ref={mapRef} />;
}