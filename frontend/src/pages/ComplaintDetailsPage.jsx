import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Paperclip, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  UserCheck, 
  ArrowLeft, 
  Send, 
  ShieldAlert,
  Zap,
  Check,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Timeline } from '../components/complaints/Timeline';
import { AssignStatusModal } from '../components/complaints/AssignStatusModal';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCitizen, isStaff, isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('status'); // 'assign' or 'status'

  // Comments
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Citizen Reopen Dialog
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Withdraw Dialog
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/complaints/${id}`);
      if (res.data?.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching complaint:", err);
      setError(err.response?.data?.message || "Could not load complaint details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        comment: newComment.trim(),
        isInternal: isInternalComment
      });
      if (res.data?.success) {
        setNewComment('');
        setIsInternalComment(false);
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleConfirmReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setSubmittingReopen(true);
    try {
      const res = await api.post(`/complaints/${id}/reopen?reason=${encodeURIComponent(reopenReason.trim())}`);
      if (res.data?.success) {
        setReopenDialogOpen(false);
        setReopenReason('');
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reopen complaint");
    } finally {
      setSubmittingReopen(false);
    }
  };

  const handleConfirmWithdraw = async (e) => {
    e.preventDefault();
    setSubmittingWithdraw(true);
    try {
      const res = await api.delete(`/complaints/${id}?reason=${encodeURIComponent(withdrawReason.trim() || 'Cancelled by citizen')}`);
      if (res.data?.success) {
        navigate('/my-complaints');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to withdraw complaint");
      setSubmittingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading issue details and milestone timeline...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Accessible</h2>
        <p className="text-xs text-slate-500">{error || "The requested issue does not exist or you lack permission."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff/Admin Assign Button */}
          {(isStaff || isAdmin) && (
            <button
              onClick={() => { setModalMode('assign'); setModalOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg shadow-xs transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              {complaint.assignedStaffName ? 'Reassign Staff' : 'Assign to Staff'}
            </button>
          )}

          {/* Staff/Admin Status Advance Button */}
          {(isStaff || isAdmin) && complaint.allowedNextStatuses?.length > 0 && (
            <button
              onClick={() => { setModalMode('status'); setModalOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Update Status ({complaint.allowedNextStatuses.join(', ')})
            </button>
          )}

          {/* Citizen Withdraw (if unassigned SUBMITTED) */}
          {complaint.canEditOrWithdraw && (
            <button
              onClick={() => setWithdrawDialogOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Withdraw Report
            </button>
          )}

          {/* Citizen or Staff Reopen (if RESOLVED) */}
          {complaint.status === 'RESOLVED' && (
            <button
              onClick={() => setReopenDialogOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reopen Issue
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details Left, Timeline & Comments Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Complaint Details & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            
            {/* Header / Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {complaint.referenceId}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={complaint.severity} />
                <PriorityBadge score={complaint.priorityScore} level={complaint.priorityLevel} />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {complaint.title}
              </h1>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Priority Scoring Explanation Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Rule-Based Priority Score: <span className="text-blue-700 font-mono">{complaint.priorityScore} pts</span> ({complaint.priorityLevel})
              </div>
              <p className="text-slate-500 font-mono text-[11px]">
                {complaint.priorityExplanation}
              </p>
            </div>

            {/* Resolution Notes Box if Resolved */}
            {complaint.resolutionNotes && (
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Municipal Resolution Notes
                  </div>
                  {complaint.resolvedAt && (
                    <span className="text-[11px] font-mono text-emerald-700">
                      Resolved: {new Date(complaint.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed whitespace-pre-line">
                  {complaint.resolutionNotes}
                </p>
              </div>
            )}

            {/* Key Metadata Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 font-medium block">Category</span>
                  <span className="font-bold text-slate-800 text-sm">{complaint.categoryName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Reported Location</span>
                  <span className="font-semibold text-slate-700">{complaint.address || 'Address not specified'}</span>
                  {complaint.landmark && (
                    <span className="text-slate-500 block italic">Landmark: {complaint.landmark}</span>
                  )}
                </div>
                {complaint.latitude && complaint.longitude && (
                  <div>
                    <span className="text-slate-400 font-medium block">GPS Coordinates</span>
                    <span className="font-mono text-slate-600 text-[11px]">
                      {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 font-medium block">Reported By</span>
                  <span className="font-semibold text-slate-800">{complaint.citizenName}</span>
                  {(isStaff || isAdmin) && complaint.citizenEmail && (
                    <span className="text-slate-500 block text-[11px]">Email: {complaint.citizenEmail} | Phone: {complaint.citizenPhone || 'N/A'}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Municipal Staff</span>
                  <span className="font-semibold text-slate-800">
                    {complaint.assignedStaffName || 'Unassigned (In Triage Queue)'}
                  </span>
                  {complaint.assignedStaffEmail && (
                    <span className="text-slate-500 block text-[11px]">{complaint.assignedStaffEmail}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Submission Date</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Attachments & Proofs */}
            {complaint.attachments?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  Photo Evidence & Documents ({complaint.attachments.length})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video block bg-slate-100 hover:shadow-md transition"
                    >
                      <img
                        src={att.downloadUrl}
                        alt={att.fileOriginalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-2 text-[10px] text-white flex justify-between items-end">
                        <span className="truncate max-w-[120px]">{att.fileOriginalName}</span>
                        {att.isResolutionEvidence && (
                          <span className="bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px]">
                            Proof
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Thread Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Discussion & Department Notes ({complaint.comments?.length || 0})
              </h3>
              {(isStaff || isAdmin) && (
                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                  Internal Notes Enabled
                </span>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {complaint.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No comments posted yet.</p>
              ) : (
                complaint.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      comm.isInternal
                        ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{comm.authorName}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {comm.authorRole}
                        </span>
                        {comm.isInternal && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            Staff Only Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(comm.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">{comm.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-3">
              <textarea
                rows={2}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a public comment or progress query..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                {(isStaff || isAdmin) ? (
                  <label className="flex items-center gap-2 text-xs text-purple-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold">Make this an Internal Department Note</span>
                  </label>
                ) : <div />}

                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm ml-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Visual Lifecycle Timeline */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Status Milestone Timeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">Audited chronological lifecycle events</p>
            </div>

            <Timeline events={complaint.statusHistory} />
          </div>
        </div>
      </div>

      {/* Assign / Status Modal */}
      <AssignStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={complaint}
        mode={modalMode}
        onSuccess={(updated) => {
          setComplaint(updated);
        }}
      />

      {/* Citizen Reopen Modal */}
      {reopenDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
              <RotateCcw className="w-5 h-5" />
              Reopen Resolved Issue
            </div>
            <p className="text-xs text-slate-600">
              If the reported issue has recurred or the repair was incomplete, explain what further work is required.
            </p>
            <form onSubmit={handleConfirmReopen} className="space-y-3">
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="State why this issue needs to be reopened..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenDialogOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReopen}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                >
                  {submittingReopen ? 'Submitting...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Withdraw Confirmation Modal */}
      {withdrawDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              Withdraw Unassigned Complaint
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to withdraw this report? This will cancel the ticket from municipal triage queues.
            </p>
            <form onSubmit={handleConfirmWithdraw} className="space-y-3">
              <input
                type="text"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Reason for withdrawal (e.g. Issue resolved on its own)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawDialogOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Keep Report
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                >
                  {submittingWithdraw ? 'Withdrawing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
