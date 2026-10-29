import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

// Custom marker icon
const customMarkerIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, onSelectLocation }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customMarkerIcon} />
  );
}

// Component to pan map programmatically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export const MapPicker = ({ initialLat, initialLng, onSelectLocation }) => {
  const defaultCenter = [12.9716, 77.5946]; // Default to urban city center
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
  );
  const [mapCenter, setMapCenter] = useState(position);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setMapCenter(coords);
        setLocating(false);
        if (onSelectLocation) {
          onSelectLocation(pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. You can manually click on the map to set location.");
        } else {
          setGeoError("Could not retrieve your location. Please select on the map.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-600 flex items-center gap-1 font-medium">
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          Click anywhere on the map to place the issue pin:
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 font-medium transition"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          {locating ? 'Acquiring GPS...' : 'Use My Current Location'}
        </button>
      </div>

      {geoError && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          {geoError}
        </div>
      )}

      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onSelectLocation={onSelectLocation}
          />
        </MapContainer>
      </div>

      {position && (
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Lat: <strong>{position[0]?.toFixed(6)}</strong></span>
          <span>Lng: <strong>{position[1]?.toFixed(6)}</strong></span>
        </div>
      )}
    </div>
  );
};
