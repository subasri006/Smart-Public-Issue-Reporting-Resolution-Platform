import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  MapPin, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

export const AnalyticsReportsPage = () => {
  const { isStaff, isAdmin } = useAuth();

  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [areaStats, setAreaStats] = useState([]);
  const [trendDays, setTrendDays] = useState(14);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, catRes, statRes, trendRes, areaRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/categories'),
        api.get('/analytics/status'),
        api.get(`/analytics/trends?days=${trendDays}`),
        api.get('/analytics/areas')
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (catRes.data?.success) setCategoryStats(catRes.data.data);
      if (statRes.data?.success) setStatusStats(statRes.data.data);
      if (trendRes.data?.success) setTrends(trendRes.data.data);
      if (areaRes.data?.success) setAreaStats(areaRes.data.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [trendDays]);

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'civicfix_complaints_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export complaints CSV report");
    }
  };

  const STATUS_COLORS = {
    SUBMITTED: '#94a3b8',
    ASSIGNED: '#3b82f6',
    IN_PROGRESS: '#f59e0b',
    RESOLVED: '#10b981',
    REOPENED: '#ef4444',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Civic Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Municipal Performance & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Database-backed operational indicators, response times, and geographic distribution.
          </p>
        </div>

        {(isStaff || isAdmin) && (
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary?.totalComplaints || 0}</p>
          <p className="text-[11px] text-slate-400">Verified platform submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{summary?.resolutionRate || 0}%</p>
          <p className="text-[11px] text-slate-400">{summary?.resolvedCount || 0} resolved tickets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">
            {summary?.resolvedCount > 0 && summary?.avgResolutionHours != null
              ? `${summary.avgResolutionHours} hrs`
              : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-400">First report to final sign-off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High/Critical Issues</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600">
            {(summary?.criticalCount || 0) + (summary?.highCount || 0)}
          </p>
          <p className="text-[11px] text-slate-400">Requires expedited dispatch</p>
        </div>
      </div>

      {/* Charts Grid Row 1: Trends & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trends Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Issue Submissions vs Resolutions Trend
              </h3>
              <p className="text-xs text-slate-500">Daily platform activity milestones</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Window:</span>
              <select
                value={trendDays}
                onChange={(e) => setTrendDays(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {trends.length === 0 || !trends.some(t => t.submitted > 0 || t.resolved > 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No complaint activity recorded in this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="submitted" name="Reported Issues" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Breakdown Pie Chart (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Complaints by Status
            </h3>
            <p className="text-xs text-slate-500">Lifecycle stage distribution</p>
          </div>

          <div className="h-56 w-full">
            {statusStats.length === 0 || !statusStats.some(s => s.count > 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No complaints registered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="label"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {statusStats.map((st) => (
              <div key={st.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[st.status] || '#cbd5e1' }}
                  />
                  <span className="text-slate-600">{st.label}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {st.count} ({st.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Category Breakdown & Area Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Complaints by Category
            </h3>
            <p className="text-xs text-slate-500">Volume breakdown by infrastructure domain</p>
          </div>

          <div className="h-64 w-full pt-2">
            {categoryStats.length === 0 || !categoryStats.some(c => c.count > 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No complaints recorded across categories yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="categoryName" angle={-15} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Total Issues" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Area Distribution List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              Area-Wise Complaint Hotspots
            </h3>
            <p className="text-xs text-slate-500">Landmarks and neighborhoods with highest report volume</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {areaStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No location clusters recorded yet.</p>
            ) : (
              areaStats.map((area, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{area.area}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {area.count} {area.count === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
