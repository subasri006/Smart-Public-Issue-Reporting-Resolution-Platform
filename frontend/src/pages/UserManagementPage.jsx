import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  X, 
  AlertCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'ROLE_STAFF'
  });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', '10');
      if (selectedRole) params.append('role', selectedRole);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data.content);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, {
        active: !user.active
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError(null);

    try {
      const res = await api.post('/admin/users', formData);
      if (res.data?.success) {
        setModalOpen(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          phone: '',
          role: 'ROLE_STAFF'
        });
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            Admin Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            User & Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee user roles, create authority accounts, and toggle operational access.
          </p>
        </div>

        <button
          onClick={() => { setModalError(null); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Account
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setPage(0); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="">All Roles</option>
            <option value="ROLE_CITIZEN">Citizens</option>
            <option value="ROLE_STAFF">Staff Officers</option>
            <option value="ROLE_ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">User</th>
                  <th scope="col" className="px-4 py-3.5">Contact Details</th>
                  <th scope="col" className="px-4 py-3.5">Role</th>
                  <th scope="col" className="px-4 py-3.5">Staff Workload</th>
                  <th scope="col" className="px-4 py-3.5">Account Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'ROLE_STAFF'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {u.role === 'ROLE_STAFF' ? (
                        <span className="text-[11px] font-mono">
                          Assigned: <strong>{u.assignedCount || 0}</strong> | Resolved: <strong className="text-emerald-600">{u.resolvedCount || 0}</strong>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {u.role === 'ROLE_ADMIN' ? (
                        <span className="text-[11px] font-semibold text-slate-400 italic px-2 py-1">
                          Primary Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                            u.active 
                              ? 'text-rose-700 border-rose-200 hover:bg-rose-50' 
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
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
              Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} users)
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

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Create New Staff Account
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Officer Rajesh Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="staff_pwd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="ROLE_STAFF">Staff Officer</option>
                    <option value="ROLE_CITIZEN">Citizen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="officer@civicfix.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
