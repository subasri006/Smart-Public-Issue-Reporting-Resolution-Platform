import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ArrowRight, 
  ShieldAlert, 
  Users, 
  Layers, 
  MapPin, 
  Calendar,
  BarChart2,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { AssignStatusModal } from '../components/complaints/AssignStatusModal';

export const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [myAssigned, setMyAssigned] = useState([]);
  const [unassignedQueue, setUnassignedQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalMode, setModalMode] = useState('status');
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, myRes, unassignedRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints?onlyAssignedToMe=true&size=5'),
        api.get('/complaints?status=SUBMITTED&size=5&sortBy=priorityScore&sortDir=DESC')
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (myRes.data?.success) setMyAssigned(myRes.data.data.content);
      if (unassignedRes.data?.success) setUnassignedQueue(unassignedRes.data.data.content);
    } catch (err) {
      console.error("Failed to load authority dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (complaint, mode) => {
    setSelectedComplaint(complaint);
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Authority Operations Center
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {user?.role?.replace('ROLE_', '')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Officer Dashboard: {user?.fullName || user?.username}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time workload, dispatch queues, and triage operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/authority/complaints"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            Full Complaint Table
          </Link>
          <Link
            to="/analytics"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Municipal Workload KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Queue</span>
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{summary?.submittedCount || 0}</p>
          <p className="text-[11px] text-slate-400">Pending initial assignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Active In-Progress</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">
            {summary?.activeUnderRepairCount != null ? summary.activeUnderRepairCount : ((summary?.assignedCount || 0) + (summary?.inProgressCount || 0))}
          </p>
          <p className="text-[11px] text-slate-400">Under municipal repair</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical Urgency</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600">{summary?.criticalCount || 0}</p>
          <p className="text-[11px] text-slate-400">Highest priority hazards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{summary?.resolutionRate || 0}%</p>
          <p className="text-[11px] text-slate-400">
            {summary?.resolvedCount > 0 && summary?.avgResolutionHours != null
              ? `Avg ${summary.avgResolutionHours}h to resolve`
              : 'No resolved issues yet'}
          </p>
        </div>
      </div>

      {/* Two Columns: High Priority Unassigned vs My Assigned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Unassigned Triage Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Unassigned Triage Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ranked by rule-based priority score</p>
              </div>
              <Link to="/authority/complaints?status=SUBMITTED" className="text-xs font-bold text-blue-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {unassignedQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No unassigned complaints in triage queue. Great job!
                </div>
              ) : (
                unassignedQueue.map(c => (
                  <div key={c.id} className="p-4 hover:bg-slate-50 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {c.referenceId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={c.severity} size="sm" />
                        <PriorityBadge score={c.priorityScore} level={c.priorityLevel} />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{c.landmark || c.address || c.categoryName}</span>
                      <button
                        onClick={() => openActionModal(c, 'assign')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                      >
                        Assign Staff
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* My Assigned Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Assigned to Me
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Issues currently in your direct queue</p>
              </div>
              <Link to="/authority/complaints?onlyAssignedToMe=true" className="text-xs font-bold text-blue-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {myAssigned.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  You currently have no direct complaints assigned.
                </div>
              ) : (
                myAssigned.map(c => (
                  <div key={c.id} className="p-4 hover:bg-slate-50 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {c.referenceId}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{c.categoryName} — {c.landmark || 'City Center'}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => openActionModal(c, 'status')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AssignStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={selectedComplaint}
        mode={modalMode}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
