const complaintService = require('../services/complaintService');
const duplicateDetectionService = require('../services/duplicateDetectionService');
const { ApiResponse } = require('../utils/apiResponse');

class ComplaintController {
  async createComplaint(req, res, next) {
    try {
      const response = await complaintService.createComplaint(
        req.body,
        req.file || null,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Complaint registered successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async getComplaints(req, res, next) {
    try {
      const response = await complaintService.getComplaints(req.query, req.user);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getComplaintById(req, res, next) {
    try {
      const response = await complaintService.getComplaintDetails(req.params.id, req.user);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async updateComplaint(req, res, next) {
    try {
      const response = await complaintService.updateComplaint(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Complaint updated successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async withdrawComplaint(req, res, next) {
    try {
      const reason = req.query.reason || 'Cancelled by reporter';
      await complaintService.withdrawComplaint(req.params.id, reason, req.user);
      return res.status(200).json(ApiResponse.ok('Complaint withdrawn successfully', null));
    } catch (err) {
      next(err);
    }
  }

  async assignComplaint(req, res, next) {
    try {
      const response = await complaintService.assignComplaint(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Complaint assigned successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const response = await complaintService.updateStatus(
        req.params.id,
        req.body,
        req.file || null,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Status updated successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async reopenComplaint(req, res, next) {
    try {
      const reason = req.query.reason;
      const response = await complaintService.reopenComplaint(
        req.params.id,
        reason,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Complaint reopened successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async addComment(req, res, next) {
    try {
      const response = await complaintService.addComment(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Comment added successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file provided for upload'));
      }
      const isResolutionEvidence =
        req.body.isResolutionEvidence === 'true' ||
        req.query.isResolutionEvidence === 'true';

      const response = await complaintService.uploadAttachment(
        req.params.id,
        req.file,
        isResolutionEvidence,
        req.user
      );
      return res.status(200).json(ApiResponse.ok('Attachment uploaded successfully', response));
    } catch (err) {
      next(err);
    }
  }

  async checkDuplicate(req, res, next) {
    try {
      const response = await duplicateDetectionService.checkDuplicate(req.body);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getPublicMapComplaints(req, res, next) {
    try {
      const response = await complaintService.getPublicMapComplaints();
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getPublicRecentComplaints(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 4;
      const response = await complaintService.getPublicRecentComplaints(limit);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async getMyComplaintSummary(req, res, next) {
    try {
      const response = await complaintService.getMyComplaintSummary(req.user);
      return res.status(200).json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ComplaintController();
