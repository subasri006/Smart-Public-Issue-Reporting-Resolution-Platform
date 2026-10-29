import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  FileQuestion
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '8');
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);
      if (search.trim()) params.append('search', search.trim());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedSeverity) params.append('severity', selectedSeverity);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data?.success) {
        setComplaints(res.data.data.content);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, selectedStatus, selectedCategory, selectedSeverity, sortBy, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedSeverity('');
    setSortBy('createdAt');
    setSortDir('DESC');
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            My Incident History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Submitted Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, track milestones, and manage all issues submitted by your account.
          </p>
        </div>

        <Link
          to="/report"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
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
              placeholder="Search by title, reference ID, landmark, or street..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Search
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

          <select
            value={`${sortBy}_${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('_');
              setSortBy(sb);
              setSortDir(sd);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium ml-auto"
          >
            <option value="createdAt_DESC">Newest First</option>
            <option value="createdAt_ASC">Oldest First</option>
            <option value="priorityScore_DESC">Highest Priority</option>
            <option value="priorityScore_ASC">Lowest Priority</option>
          </select>

          {(search || selectedStatus || selectedCategory || selectedSeverity) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          Loading complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching complaints found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or filter tags.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {item.referenceId}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                  <SeverityBadge severity={item.severity} size="sm" />
                  <PriorityBadge score={item.priorityScore} level={item.priorityLevel} />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
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

                  {item.assignedStaffName && (
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Assigned to: {item.assignedStaffName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  to={`/complaints/${item.id}`}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  View Details <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs">
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
  );
};
