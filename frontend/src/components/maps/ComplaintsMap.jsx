import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { Filter, Layers, ExternalLink, MapPin } from 'lucide-react';

// Marker color generator based on severity/status
const createMarkerIcon = (severity, status) => {
  let color = '#3b82f6'; // default blue
  if (status === 'RESOLVED') color = '#10b981'; // green
  else if (severity === 'CRITICAL') color = '#ef4444'; // red
  else if (severity === 'HIGH') color = '#f59e0b'; // amber
  else if (severity === 'MEDIUM') color = '#2563eb'; // blue

  return new L.DivIcon({
    className: 'custom-pin-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.35); font-weight: bold; font-size: 11px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

function FitBounds({ complaints }) {
  const map = useMap();
  useEffect(() => {
    const validCoords = complaints.filter(c => c.latitude && c.longitude);
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map(c => [c.latitude, c.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [complaints, map]);
  return null;
}

export const ComplaintsMap = ({ complaints = [], height = '500px' }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const categories = Array.from(new Set(complaints.map(c => c.categoryName).filter(Boolean)));
  const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'];

  const filteredComplaints = complaints.filter(c => {
    if (!c.latitude || !c.longitude) return false;
    const catMatch = selectedCategory === 'ALL' || c.categoryName === selectedCategory;
    const statusMatch = selectedStatus === 'ALL' || c.status === selectedStatus;
    return catMatch && statusMatch;
  });

  const defaultCenter = complaints.length > 0 && complaints[0].latitude
    ? [complaints[0].latitude, complaints[0].longitude]
    : [12.9716, 77.5946];

  return (
    <div className="space-y-4">
      {/* Map Filter Controls */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filter Map:
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map(st => (
              <option key={st} value={st}>{st.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-600">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">Standard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Resolved</span>
          </div>
          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Showing {filteredComplaints.length} markers
          </span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div 
        style={{ height }}
        className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative z-10"
      >
        {filteredComplaints.length === 0 && complaints.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-base font-semibold text-slate-700">No Geographic Issues Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              There are currently no public complaints with location coordinates matching your filters.
            </p>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <FitBounds complaints={filteredComplaints} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredComplaints.map(complaint => (
              <Marker
                key={complaint.id}
                position={[complaint.latitude, complaint.longitude]}
                icon={createMarkerIcon(complaint.severity, complaint.status)}
              >
                <Popup className="civic-popup">
                  <div className="p-1 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between gap-2 border-b pb-1.5">
                      <span className="text-[11px] font-mono font-bold text-blue-700">
                        {complaint.referenceId}
                      </span>
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {complaint.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{complaint.categoryName}</span>
                      <SeverityBadge severity={complaint.severity} size="sm" />
                    </div>

                    {complaint.landmark && (
                      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {complaint.landmark}
                      </p>
                    )}

                    <div className="pt-2 border-t flex justify-end">
                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Inspect Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
