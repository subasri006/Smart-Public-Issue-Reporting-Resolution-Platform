const express = require('express');
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createComplaintSchema,
  assignComplaintSchema,
  updateStatusSchema,
  addCommentSchema,
  checkDuplicateSchema,
} = require('../validators/complaintValidator');

const router = express.Router();

// Publicly accessible endpoints
router.post('/check-duplicate', validate(checkDuplicateSchema), (req, res, next) =>
  complaintController.checkDuplicate(req, res, next)
);

router.get('/public-map', (req, res, next) =>
  complaintController.getPublicMapComplaints(req, res, next)
);

router.get('/public-recent', (req, res, next) =>
  complaintController.getPublicRecentComplaints(req, res, next)
);

// Authenticated endpoints
router.get('/my-summary', authenticate, (req, res, next) =>
  complaintController.getMyComplaintSummary(req, res, next)
);

router.post(
  '/',
  authenticate,
  upload.single('photo'),
  validate(createComplaintSchema),
  (req, res, next) => complaintController.createComplaint(req, res, next)
);

router.get('/', authenticate, (req, res, next) =>
  complaintController.getComplaints(req, res, next)
);

router.get('/:id', authenticate, (req, res, next) =>
  complaintController.getComplaintById(req, res, next)
);

router.put('/:id', authenticate, (req, res, next) =>
  complaintController.updateComplaint(req, res, next)
);

router.delete('/:id', authenticate, (req, res, next) =>
  complaintController.withdrawComplaint(req, res, next)
);

router.post(
  '/:id/assign',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  validate(assignComplaintSchema),
  (req, res, next) => complaintController.assignComplaint(req, res, next)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.single('resolutionEvidence'),
  validate(updateStatusSchema),
  (req, res, next) => complaintController.updateStatus(req, res, next)
);

router.post('/:id/reopen', authenticate, (req, res, next) =>
  complaintController.reopenComplaint(req, res, next)
);

router.post(
  '/:id/comments',
  authenticate,
  validate(addCommentSchema),
  (req, res, next) => complaintController.addComment(req, res, next)
);

router.post(
  '/:id/attachments',
  authenticate,
  upload.single('file'),
  (req, res, next) => complaintController.uploadAttachment(req, res, next)
);

module.exports = router;
