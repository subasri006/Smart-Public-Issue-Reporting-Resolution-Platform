import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, submitted: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        const [complaintsRes, summaryRes] = await Promise.all([
          api.get('/complaints?size=5&sortDir=DESC'),
          api.get('/complaints/my-summary')
        ]);

        if (complaintsRes.data?.success) {
          setComplaints(complaintsRes.data.data.content);
        }

        if (summaryRes.data?.success) {
          const s = summaryRes.data.data;
          setStats({
            total: s.total || 0,
            submitted: s.submitted || 0,
            inProgress: s.activeUnderRepair != null ? s.activeUnderRepair : ((s.assigned || 0) + (s.inProgress || 0)),
            resolved: s.resolved || 0
          });
        }
      } catch (err) {
        console.error("Error loading citizen complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitizenData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Citizen Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and monitor the operational status of your public civic reports.
          </p>
        </div>

        <Link
          to="/report"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Total Reports</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-400">Lifetime submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-black text-slate-700">{stats.submitted}</p>
          <p className="text-[11px] text-slate-400">Awaiting department triage</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{stats.inProgress}</p>
          <p className="text-[11px] text-slate-400">Assigned / crew on site</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats.resolved}</p>
          <p className="text-[11px] text-slate-400">Completed & verified</p>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Reported Issues</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest filed civic reports</p>
          </div>
          <Link
            to="/my-complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View All ({stats.total}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading your reports...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No issues reported yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Have you noticed broken roads, water leaks, or garbage in your neighborhood? Submit your first report now!
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Report an Issue
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.referenceId}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <SeverityBadge severity={item.severity} size="sm" />
                    <PriorityBadge score={item.priorityScore} level={item.priorityLevel} />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {item.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {item.categoryName}
                    </span>
                    {item.landmark && (
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.landmark}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={`/complaints/${item.id}`}
                    className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    View Timeline &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
