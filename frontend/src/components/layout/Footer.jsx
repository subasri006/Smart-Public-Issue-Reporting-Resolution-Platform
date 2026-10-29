import React from 'react';
import { Building2, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Civic<span className="text-blue-400">Fix</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens and municipal departments to report, track, and resolve public infrastructure issues with total accountability and transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded-md w-fit border border-emerald-900/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Municipal System Operational
            </div>
          </div>

          {/* Citizen Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/report" className="hover:text-white transition">Report an Issue</Link></li>
              <li><Link to="/my-complaints" className="hover:text-white transition">Track Status</Link></li>
              <li><Link to="/map" className="hover:text-white transition">Interactive City Map</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Citizen Sign In</Link></li>
            </ul>
          </div>

          {/* Department Portals */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Authority Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/authority/dashboard" className="hover:text-white transition">Staff Console</Link></li>
              <li><Link to="/authority/complaints" className="hover:text-white transition">Triage & Assignment</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition">Resolution Analytics</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition">Administration</Link></li>
            </ul>
          </div>

          {/* Emergency & Helpline */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Municipal Control Room</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Helpline: 1800-425-CIVIC (Toll-free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@civicfix.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>City Municipal Corporation HQ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CivicFix Platform. Built for transparent civic governance.</p>
          <p className="flex items-center gap-1">
            Engineered with Spring Boot & React
          </p>
        </div>
      </div>
    </footer>
  );
};
