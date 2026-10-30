const {
  Complaint,
  ComplaintCategory,
  User,
  ComplaintStatusHistory,
  ComplaintAssignment,
  ComplaintComment,
  ComplaintAttachment,
} = require('../models');
const priorityScoringService = require('./priorityScoringService');
const referenceIdGeneratorService = require('./referenceIdGeneratorService');
const auditService = require('./auditService');
const { PagedResponse } = require('../utils/apiResponse');

// Allowed status transitions state machine
const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
};

const canTransition = (current, next) => {
  if (current === next) return false;
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(next);
};

const getAllowedNextStatuses = (status) => {
  return ALLOWED_TRANSITIONS[status] || [];
};

class ComplaintService {
  async createComplaint(request, photoFile, currentUser) {
    const category = await ComplaintCategory.findById(request.categoryId);
    if (!category) {
      const error = new Error(`Category not found with id: ${request.categoryId}`);
      error.statusCode = 404;
      throw error;
    }

    const referenceId = await referenceIdGeneratorService.generateNextReferenceId();

    const priority = priorityScoringService.calculatePriority(
      request.severity,
      category,
      new Date()
    );

    const complaint = new Complaint({
      referenceId,
      title: request.title.trim(),
      description: request.description.trim(),
      category: category._id,
      severity: request.severity,
      status: 'SUBMITTED',
      priorityScore: priority.score,
      latitude: request.latitude !== undefined && request.latitude !== null ? Number(request.latitude) : null,
      longitude: request.longitude !== undefined && request.longitude !== null ? Number(request.longitude) : null,
      address: request.address ? request.address.trim() : null,
      landmark: request.landmark ? request.landmark.trim() : null,
      citizen: currentUser._id,
    });

    const saved = await complaint.save();

    // Initial Status History
    await ComplaintStatusHistory.create({
      complaint: saved._id,
      previousStatus: null,
      newStatus: 'SUBMITTED',
      changedBy: currentUser._id,
      comment: 'Issue reported by citizen',
    });

    // Save attachment if photo was provided
    if (photoFile) {
      await ComplaintAttachment.create({
        complaint: saved._id,
        fileName: photoFile.filename,
        fileOriginalName: photoFile.originalname,
        fileType: photoFile.mimetype,
        fileSize: photoFile.size,
        filePath: photoFile.path,
        isResolutionEvidence: false,
        uploadedBy: currentUser._id,
      });
    }

    await auditService.log(
      'COMPLAINT_SUBMITTED',
      'Complaint',
      saved._id.toString(),
      currentUser,
      `Reported issue: ${saved.referenceId} - ${saved.title}`
    );

    return this.getComplaintDetails(saved._id, currentUser);
  }

  async updateComplaint(id, request, currentUser) {
    const complaint = await Complaint.findById(id).populate('category');
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ROLE_ADMIN';
    const isOwner = complaint.citizen.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      const error = new Error('You do not have permission to update this complaint');
      error.statusCode = 403;
      throw error;
    }

    if (isOwner && !isAdmin) {
      if (complaint.status !== 'SUBMITTED' || complaint.assignedStaff != null) {
        const error = new Error('Complaints can only be edited before they are assigned or processed');
        error.statusCode = 400;
        throw error;
      }
    }

    if (request.title && request.title.trim()) {
      complaint.title = request.title.trim();
    }
    if (request.description && request.description.trim()) {
      complaint.description = request.description.trim();
    }
    if (request.categoryId) {
      const category = await ComplaintCategory.findById(request.categoryId);
      if (!category) {
        const error = new Error(`Category not found with id: ${request.categoryId}`);
        error.statusCode = 404;
        throw error;
      }
      complaint.category = category._id;
    }
    if (request.severity) {
      complaint.severity = request.severity;
    }
    if (request.latitude !== undefined) {
      complaint.latitude = request.latitude !== null ? Number(request.latitude) : null;
    }
    if (request.longitude !== undefined) {
      complaint.longitude = request.longitude !== null ? Number(request.longitude) : null;
    }
    if (request.address !== undefined) {
      complaint.address = request.address ? request.address.trim() : null;
    }
    if (request.landmark !== undefined) {
      complaint.landmark = request.landmark ? request.landmark.trim() : null;
    }

    // Recalculate priority
    const cat = await ComplaintCategory.findById(complaint.category);
    const priority = priorityScoringService.calculatePriority(
      complaint.severity,
      cat,
      complaint.createdAt
    );
    complaint.priorityScore = priority.score;

    await complaint.save();

    await auditService.log(
      'COMPLAINT_UPDATED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Updated complaint ${complaint.referenceId}`
    );

    return this.getComplaintDetails(id, currentUser);
  }

  async withdrawComplaint(id, reason, currentUser) {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = currentUser.role === 'ROLE_ADMIN';
    const isOwner = complaint.citizen.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      const error = new Error('You do not have permission to withdraw this complaint');
      error.statusCode = 403;
      throw error;
    }

    if (isOwner && !isAdmin) {
      if (complaint.status !== 'SUBMITTED' || complaint.assignedStaff != null) {
        const error = new Error(
          'Complaints can only be withdrawn while in SUBMITTED status before assignment'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    await auditService.log(
      'COMPLAINT_WITHDRAWN',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Withdrawn complaint ${complaint.referenceId}. Reason: ${reason}`
    );

    // Delete associated documents
    await ComplaintStatusHistory.deleteMany({ complaint: complaint._id });
    await ComplaintAssignment.deleteMany({ complaint: complaint._id });
    await ComplaintComment.deleteMany({ complaint: complaint._id });
    await ComplaintAttachment.deleteMany({ complaint: complaint._id });
    await Complaint.findByIdAndDelete(complaint._id);
  }

  async assignComplaint(id, request, currentUser) {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    if (currentUser.role === 'ROLE_CITIZEN') {
      const error = new Error('Citizens cannot assign complaints');
      error.statusCode = 403;
      throw error;
    }

    const staff = await User.findById(request.staffId);
    if (!staff) {
      const error = new Error(`Staff member not found with id: ${request.staffId}`);
      error.statusCode = 404;
      throw error;
    }

    if (staff.role === 'ROLE_CITIZEN') {
      const error = new Error('Cannot assign complaint to a citizen account');
      error.statusCode = 400;
      throw error;
    }

    complaint.assignedStaff = staff._id;
    const previousStatus = complaint.status;
    if (complaint.status === 'SUBMITTED') {
      complaint.status = 'ASSIGNED';
    }

    await complaint.save();

    await ComplaintAssignment.create({
      complaint: complaint._id,
      assignedTo: staff._id,
      assignedBy: currentUser._id,
      notes: request.notes || null,
    });

    const historyComment = `Assigned to ${staff.fullName}${request.notes ? ' (' + request.notes + ')' : ''}`;
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: complaint.status,
      changedBy: currentUser._id,
      comment: historyComment,
    });

    await auditService.log(
      'COMPLAINT_ASSIGNED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Assigned ${complaint.referenceId} to ${staff.username}`
    );

    return this.getComplaintDetails(complaint._id, currentUser);
  }

  async updateStatus(id, request, resolutionEvidenceFile, currentUser) {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    if (currentUser.role === 'ROLE_CITIZEN') {
      const error = new Error('Citizens cannot modify operational status directly');
      error.statusCode = 403;
      throw error;
    }

    const currentStatus = complaint.status;
    const newStatus = request.status;

    if (!canTransition(currentStatus, newStatus)) {
      const allowed = getAllowedNextStatuses(currentStatus);
      const error = new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed: [${allowed.join(', ')}]`
      );
      error.statusCode = 400;
      throw error;
    }

    complaint.status = newStatus;

    if (newStatus === 'RESOLVED') {
      if (!request.resolutionNotes || !request.resolutionNotes.trim()) {
        const error = new Error('Resolution notes are required when resolving a complaint');
        error.statusCode = 400;
        throw error;
      }
      complaint.resolutionNotes = request.resolutionNotes.trim();
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    if (resolutionEvidenceFile) {
      await ComplaintAttachment.create({
        complaint: complaint._id,
        fileName: resolutionEvidenceFile.filename,
        fileOriginalName: resolutionEvidenceFile.originalname,
        fileType: resolutionEvidenceFile.mimetype,
        fileSize: resolutionEvidenceFile.size,
        filePath: resolutionEvidenceFile.path,
        isResolutionEvidence: true,
        uploadedBy: currentUser._id,
      });
    }

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus: currentStatus,
      newStatus,
      changedBy: currentUser._id,
      comment: request.comment || null,
    });

    await auditService.log(
      'STATUS_UPDATED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Status changed to ${newStatus} for ${complaint.referenceId}`
    );

    return this.getComplaintDetails(complaint._id, currentUser);
  }

  async reopenComplaint(id, reason, currentUser) {
    const complaint = await Complaint.findById(id).populate('category');
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const isOwner = complaint.citizen.toString() === currentUser._id.toString();
    const isStaffOrAdmin =
      currentUser.role === 'ROLE_STAFF' || currentUser.role === 'ROLE_ADMIN';

    if (!isOwner && !isStaffOrAdmin) {
      const error = new Error('You do not have permission to reopen this complaint');
      error.statusCode = 403;
      throw error;
    }

    if (complaint.status !== 'RESOLVED') {
      const error = new Error('Only RESOLVED complaints can be reopened');
      error.statusCode = 400;
      throw error;
    }

    if (!reason || !reason.trim()) {
      const error = new Error('Reason is required to reopen a complaint');
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = complaint.status;
    complaint.status = 'REOPENED';
    complaint.resolvedAt = null;

    // Recalculate priority
    const priority = priorityScoringService.calculatePriority(
      complaint.severity,
      complaint.category,
      complaint.createdAt
    );
    complaint.priorityScore = priority.score;

    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: 'REOPENED',
      changedBy: currentUser._id,
      comment: `Reopened: ${reason.trim()}`,
    });

    await auditService.log(
      'COMPLAINT_REOPENED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Reopened complaint ${complaint.referenceId}. Reason: ${reason}`
    );

    return this.getComplaintDetails(complaint._id, currentUser);
  }

  async addComment(id, request, currentUser) {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    let isInternal = Boolean(request.isInternal);
    if (currentUser.role === 'ROLE_CITIZEN') {
      isInternal = false;
    }

    const comment = await ComplaintComment.create({
      complaint: complaint._id,
      author: currentUser._id,
      comment: request.comment.trim(),
      isInternal,
    });

    await auditService.log(
      'COMMENT_ADDED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Added ${isInternal ? 'internal' : 'public'} comment on ${complaint.referenceId}`
    );

    return {
      id: comment._id.toString(),
      authorName: currentUser.fullName,
      authorRole: currentUser.role.replace('ROLE_', ''),
      comment: comment.comment,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt,
    };
  }

  async uploadAttachment(id, file, isResolutionEvidence, currentUser) {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const attachment = await ComplaintAttachment.create({
      complaint: complaint._id,
      fileName: file.filename,
      fileOriginalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      isResolutionEvidence: Boolean(isResolutionEvidence),
      uploadedBy: currentUser._id,
    });

    await auditService.log(
      'ATTACHMENT_UPLOADED',
      'Complaint',
      complaint._id.toString(),
      currentUser,
      `Uploaded attachment for ${complaint.referenceId}`
    );

    return {
      id: attachment._id.toString(),
      fileName: attachment.fileName,
      fileOriginalName: attachment.fileOriginalName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      fileUrl: `/api/uploads/${attachment.fileName}`,
      isResolutionEvidence: attachment.isResolutionEvidence,
      uploadedByName: currentUser.fullName,
      createdAt: attachment.createdAt,
    };
  }

  async getComplaintDetails(id, currentUser) {
    const complaint = await Complaint.findById(id)
      .populate('category')
      .populate('citizen', 'fullName email phone')
      .populate('assignedStaff', 'fullName email')
      .lean();

    if (!complaint) {
      const error = new Error(`Complaint not found with id: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const isCitizen = currentUser.role === 'ROLE_CITIZEN';
    const isOwner = complaint.citizen._id.toString() === currentUser._id.toString();

    if (isCitizen && !isOwner) {
      const error = new Error('You do not have access to view this complaint\'s private details');
      error.statusCode = 403;
      throw error;
    }

    // Dynamic priority calculation
    const priority = priorityScoringService.calculatePriority(
      complaint.severity,
      complaint.category,
      complaint.createdAt
    );

    // Attachments
    const rawAttachments = await ComplaintAttachment.find({ complaint: complaint._id })
      .populate('uploadedBy', 'fullName')
      .sort({ createdAt: 1 })
      .lean();

    const attachments = rawAttachments.map((a) => ({
      id: a._id.toString(),
      fileName: a.fileName,
      fileOriginalName: a.fileOriginalName,
      fileType: a.fileType,
      fileSize: a.fileSize,
      fileUrl: `/api/uploads/${a.fileName}`,
      isResolutionEvidence: a.isResolutionEvidence,
      uploadedByName: a.uploadedBy ? a.uploadedBy.fullName : 'Anonymous',
      createdAt: a.createdAt,
    }));

    // Status History
    const rawHistory = await ComplaintStatusHistory.find({ complaint: complaint._id })
      .populate('changedBy', 'fullName role')
      .sort({ createdAt: 1 })
      .lean();

    const statusHistory = rawHistory.map((h) => ({
      id: h._id.toString(),
      previousStatus: h.previousStatus,
      newStatus: h.newStatus,
      changedByName: h.changedBy ? h.changedBy.fullName : 'System',
      changedByRole:
        h.changedBy && h.changedBy.role
          ? h.changedBy.role.replace('ROLE_', '')
          : 'SYSTEM',
      comment: h.comment,
      createdAt: h.createdAt,
    }));

    // Comments
    const commentFilter = { complaint: complaint._id };
    if (isCitizen) {
      commentFilter.isInternal = false;
    }
    const rawComments = await ComplaintComment.find(commentFilter)
      .populate('author', 'fullName role')
      .sort({ createdAt: 1 })
      .lean();

    const comments = rawComments.map((c) => ({
      id: c._id.toString(),
      authorName: c.author ? c.author.fullName : 'Anonymous',
      authorRole:
        c.author && c.author.role
          ? c.author.role.replace('ROLE_', '')
          : 'CITIZEN',
      comment: c.comment,
      isInternal: c.isInternal,
      createdAt: c.createdAt,
    }));

    const canEditOrWithdraw =
      isOwner && complaint.status === 'SUBMITTED' && complaint.assignedStaff == null;

    return {
      id: complaint._id.toString(),
      referenceId: complaint.referenceId,
      title: complaint.title,
      description: complaint.description,
      categoryId: complaint.category ? complaint.category._id.toString() : null,
      categoryName: complaint.category ? complaint.category.name : 'Unknown',
      categoryIcon: complaint.category ? complaint.category.icon : null,
      categoryWeight: complaint.category ? complaint.category.weight : 15,
      severity: complaint.severity,
      status: complaint.status,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      address: complaint.address,
      landmark: complaint.landmark,
      citizenId: complaint.citizen ? complaint.citizen._id.toString() : null,
      citizenName: complaint.citizen ? complaint.citizen.fullName : null,
      citizenEmail: complaint.citizen ? complaint.citizen.email : null,
      citizenPhone: complaint.citizen ? complaint.citizen.phone : null,
      assignedStaffId: complaint.assignedStaff ? complaint.assignedStaff._id.toString() : null,
      assignedStaffName: complaint.assignedStaff ? complaint.assignedStaff.fullName : null,
      assignedStaffEmail: complaint.assignedStaff ? complaint.assignedStaff.email : null,
      resolutionNotes: complaint.resolutionNotes,
      resolvedAt: complaint.resolvedAt,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      priorityExplanation: priority.explanation,
      canEditOrWithdraw,
      allowedNextStatuses: getAllowedNextStatuses(complaint.status),
      attachments,
      statusHistory,
      comments,
    };
  }

  async getComplaints(filterParams, currentUser) {
    const {
      categoryId,
      status,
      severity,
      search,
      onlyAssignedToMe,
      page = 0,
      size = 10,
      sortBy = 'createdAt',
      sortDir = 'DESC',
    } = filterParams;

    const pageNum = Math.max(0, parseInt(page, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10) || 10));

    const filter = {};

    if (currentUser.role === 'ROLE_CITIZEN') {
      filter.citizen = currentUser._id;
    } else if (String(onlyAssignedToMe) === 'true') {
      filter.assignedStaff = currentUser._id;
    }

    if (categoryId) {
      filter.category = categoryId;
    }
    if (status) {
      filter.status = status;
    }
    if (severity) {
      filter.severity = severity;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { referenceId: regex },
        { address: regex },
      ];
    }

    const sortOrder = sortDir.toUpperCase() === 'ASC' ? 1 : -1;
    const sortField = sortBy || 'createdAt';
    const sortObj = { [sortField]: sortOrder };

    const totalElements = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('category')
      .populate('citizen', 'fullName')
      .populate('assignedStaff', 'fullName')
      .sort(sortObj)
      .skip(pageNum * pageSize)
      .limit(pageSize)
      .lean();

    const content = await Promise.all(
      complaints.map(async (c) => this.mapToComplaintResponse(c))
    );

    return PagedResponse.create(content, pageNum, pageSize, totalElements);
  }

  async getPublicMapComplaints() {
    const complaints = await Complaint.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    })
      .populate('category')
      .populate('citizen', 'fullName')
      .populate('assignedStaff', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return Promise.all(complaints.map((c) => this.mapToComplaintResponse(c)));
  }

  async getPublicRecentComplaints(limit = 4) {
    const count = Math.min(20, Math.max(1, parseInt(limit, 10) || 4));
    const complaints = await Complaint.find()
      .populate('category')
      .populate('citizen', 'fullName')
      .populate('assignedStaff', 'fullName')
      .sort({ createdAt: -1 })
      .limit(count)
      .lean();

    return Promise.all(complaints.map((c) => this.mapToComplaintResponse(c)));
  }

  async getMyComplaintSummary(currentUser) {
    const citizenId = currentUser._id;
    const total = await Complaint.countDocuments({ citizen: citizenId });
    const submitted = await Complaint.countDocuments({ citizen: citizenId, status: 'SUBMITTED' });
    const assigned = await Complaint.countDocuments({ citizen: citizenId, status: 'ASSIGNED' });
    const inProgress = await Complaint.countDocuments({ citizen: citizenId, status: 'IN_PROGRESS' });
    const resolved = await Complaint.countDocuments({ citizen: citizenId, status: 'RESOLVED' });
    const reopened = await Complaint.countDocuments({ citizen: citizenId, status: 'REOPENED' });

    return {
      total,
      submitted,
      assigned,
      inProgress,
      resolved,
      reopened,
      activeUnderRepair: assigned + inProgress,
    };
  }

  async mapToComplaintResponse(c) {
    const priority = priorityScoringService.calculatePriority(
      c.severity,
      c.category,
      c.createdAt
    );

    // Primary photo
    let primaryPhotoUrl = null;
    const firstAttachment = await ComplaintAttachment.findOne({ complaint: c._id })
      .sort({ createdAt: 1 })
      .select('fileName')
      .lean();

    if (firstAttachment) {
      primaryPhotoUrl = `/api/uploads/${firstAttachment.fileName}`;
    }

    return {
      id: c._id.toString(),
      referenceId: c.referenceId,
      title: c.title,
      description: c.description,
      categoryId: c.category ? c.category._id.toString() : null,
      categoryName: c.category ? c.category.name : 'Unknown',
      categoryIcon: c.category ? c.category.icon : null,
      severity: c.severity,
      status: c.status,
      latitude: c.latitude,
      longitude: c.longitude,
      address: c.address,
      landmark: c.landmark,
      citizenId: c.citizen ? c.citizen._id.toString() : null,
      citizenName: c.citizen ? c.citizen.fullName : null,
      assignedStaffId: c.assignedStaff ? c.assignedStaff._id.toString() : null,
      assignedStaffName: c.assignedStaff ? c.assignedStaff.fullName : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      resolvedAt: c.resolvedAt,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      primaryPhotoUrl,
    };
  }
}

module.exports = new ComplaintService();
module.exports.ComplaintService = ComplaintService;
module.exports.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
