import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, UserCheck, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export const AssignStatusModal = ({ 
  isOpen, 
  onClose, 
  complaint, 
  mode = 'status', // 'assign' or 'status'
  onSuccess 
}) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionEvidence, setResolutionEvidence] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (mode === 'assign') {
        loadStaffList();
        setSelectedStaffId(complaint?.assignedStaffId ? String(complaint.assignedStaffId) : '');
        setAssignNotes('');
      } else {
        setSelectedStatus(complaint?.allowedNextStatuses?.[0] || '');
        setStatusComment('');
        setResolutionNotes('');
        setResolutionEvidence(null);
        setEvidencePreview(null);
      }
    }
  }, [isOpen, mode, complaint]);

  const loadStaffList = async () => {
    try {
      const res = await api.get('/staff/list');
      if (res.data?.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
      setError("Failed to load staff members");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }
      setResolutionEvidence(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError("Please select a staff member to assign");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post(`/complaints/${complaint.id}/assign`, {
        staffId: Number(selectedStaffId),
        notes: assignNotes
      });
      if (res.data?.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError("Please select a new status");
      return;
    }

    if (selectedStatus === 'RESOLVED' && (!resolutionNotes || !resolutionNotes.trim())) {
      setError("Resolution notes are required when marking a complaint as RESOLVED");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (resolutionEvidence) {
        const formData = new FormData();
        formData.append('status', selectedStatus);
        if (statusComment) formData.append('comment', statusComment);
        if (resolutionNotes) formData.append('resolutionNotes', resolutionNotes);
        formData.append('resolutionEvidence', resolutionEvidence);

        res = await api.patch(`/complaints/${complaint.id}/status`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.patch(`/complaints/${complaint.id}/status`, {
          status: selectedStatus,
          comment: statusComment,
          resolutionNotes: resolutionNotes
        });
      }

      if (res.data?.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'assign' ? (
              <UserCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            )}
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'assign' ? 'Assign Staff Member' : 'Advance Complaint Status'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 text-xs font-mono bg-blue-50 text-blue-800 p-2.5 rounded-lg border border-blue-200">
            <strong>Target Issue:</strong> {complaint?.referenceId} — {complaint?.title}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'assign' ? (
            <form onSubmit={handleSubmitAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Staff Member *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Staff Officer --</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.username}) — Active Assigned: {st.assignedCount || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Instructions / Department Notes
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Please deploy asphalt patching truck and cordon off lane..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Permitted Status --</option>
                  {complaint?.allowedNextStatuses?.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Comment / Progress Update
                </label>
                <textarea
                  rows={2}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="e.g. Inspection team arrived on site; repairs commenced..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {selectedStatus === 'RESOLVED' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Resolution Summary * <span className="text-slate-400 font-normal">(visible to citizen)</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Detail the work carried out, materials applied, and municipal sign-off..."
                      className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/30 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Resolution Proof / After-Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {evidencePreview && (
                      <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                        <img src={evidencePreview} alt="Resolution Evidence Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
