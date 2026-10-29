import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { 
  Shield, 
  Users, 
  Layers, 
  BarChart3, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sumRes, auditRes, catRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/admin/audit-logs?size=6'),
          api.get('/categories?onlyActive=false')
        ]);

        if (sumRes.data?.success) setSummary(sumRes.data.data);
        if (auditRes.data?.success) setAuditLogs(auditRes.data.data.content);
        if (catRes.data?.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
              System Administration
            </span>
            <span className="text-xs text-slate-400 font-medium">Full Governance Privilege</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Executive Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee category weighting rules, user role permissions, audit trails, and city-wide performance metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> User Management
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Manage Categories
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary?.totalComplaints || 0}</p>
          <p className="text-[11px] text-slate-400">All districts combined</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Citizens</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600">{summary?.totalCitizens || 0}</p>
          <p className="text-[11px] text-slate-400">Active public reporters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Municipal Staff</span>
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{summary?.totalStaff || 0}</p>
          <p className="text-[11px] text-slate-400">Department officers & inspectors</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Resolution</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{summary?.resolutionRate || 0}%</p>
          <p className="text-[11px] text-slate-400">{summary?.resolvedCount || 0} issues resolved</p>
        </div>
      </div>

      {/* Two columns: Category Rules & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Weight Rules Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Active Category Priority Weights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Influences automated priority scoring calculation</p>
              </div>
              <Link to="/admin/categories" className="text-xs font-bold text-blue-600 hover:underline">
                Configure &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {categories.slice(0, 6).map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 uppercase">[{c.code}]</span>
                      {!c.active && (
                        <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 line-clamp-1">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-[11px]">
                      Weight: {c.weight} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  System Audit Log Activity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Traceable chronological actions</p>
              </div>
              <Link to="/authority/complaints" className="text-xs font-bold text-blue-600 hover:underline">
                All Logs &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No audit entries recorded yet.
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-4 space-y-1 hover:bg-slate-50 transition text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium">{log.details}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>By: <strong>{log.performedByName}</strong></span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
