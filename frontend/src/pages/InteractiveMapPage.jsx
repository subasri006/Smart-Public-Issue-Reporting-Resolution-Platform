import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { MapPin, Layers, RefreshCw } from 'lucide-react';
import { ComplaintsMap } from '../components/maps/ComplaintsMap';

export const InteractiveMapPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/public-map');
      if (res.data?.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error("Error loading map complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Geographic Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Live City Infrastructure Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time geospatial distribution of verified civic complaints, hazards, and completed works.
          </p>
        </div>

        <button
          onClick={fetchMapData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Map Data
        </button>
      </div>

      {/* Map Component */}
      {loading ? (
        <div className="h-[600px] w-full rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          Loading geospatial markers...
        </div>
      ) : (
        <ComplaintsMap complaints={complaints} height="650px" />
      )}
    </div>
  );
};
