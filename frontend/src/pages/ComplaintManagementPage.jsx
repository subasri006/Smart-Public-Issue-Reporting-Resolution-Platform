import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { AssignStatusModal } from '../components/complaints/AssignStatusModal';

export const ComplaintManagementPage = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [onlyAssignedToMe, setOnlyAssignedToMe] = useState(searchParams.get('onlyAssignedToMe') === 'true');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('assign');
  const [activeComplaint, setActiveComplaint] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '10');
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);
      if (search.trim()) params.append('search', search.trim());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (onlyAssignedToMe) params.append('onlyAssignedToMe', 'true');

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data?.success) {
        setComplaints(res.data.data.content);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, selectedStatus, selectedCategory, selectedSeverity, onlyAssignedToMe, sortBy, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

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
      alert("Failed to export complaints CSV");
    }
  };

  const openActionModal = (c, mode) => {
    setActiveComplaint(c);
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Operations Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Complaint Management & Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Filter, assign, advance status, and monitor resolution milestones across all municipal districts.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Download className="w-4 h-4" /> Export CSV Data
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, reference ID, citizen name, address, or landmark..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Apply Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filters:
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => { setSelectedSeverity(e.target.value); setPage(0); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {isStaff && (
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                checked={onlyAssignedToMe}
                onChange={(e) => { setOnlyAssignedToMe(e.target.checked); setPage(0); }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Only Assigned to Me</span>
            </label>
          )}

          <select
            value={`${sortBy}_${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('_');
              setSortBy(sb);
              setSortDir(sd);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium ml-auto"
          >
            <option value="priorityScore_DESC">Priority: High to Low</option>
            <option value="priorityScore_ASC">Priority: Low to High</option>
            <option value="createdAt_DESC">Newest First</option>
            <option value="createdAt_ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading complaint records...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No complaints found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Ref ID</th>
                  <th scope="col" className="px-4 py-3.5">Issue & Location</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Severity</th>
                  <th scope="col" className="px-4 py-3.5">Priority</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Assigned Officer</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.referenceId}
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate" title={c.landmark || c.address}>
                        {c.landmark || c.address || 'Location on map'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      {c.categoryName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <SeverityBadge severity={c.severity} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PriorityBadge score={c.priorityScore} level={c.priorityLevel} />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {c.assignedStaffName ? (
                        <span className="font-semibold text-slate-800">{c.assignedStaffName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/complaints/${c.id}`}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          title="Inspect Details & Timeline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => openActionModal(c, 'assign')}
                          className="px-2 py-1 text-[11px] font-bold bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                          title="Assign or reassign staff"
                        >
                          Assign
                        </button>

                        <button
                          onClick={() => openActionModal(c, 'status')}
                          className="px-2 py-1 text-[11px] font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                          title="Change operational status"
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs">
            <span className="text-slate-600">
              Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total complaints)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AssignStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={activeComplaint}
        mode={modalMode}
        onSuccess={() => {
          fetchComplaints();
        }}
      />
    </div>
  );
};
