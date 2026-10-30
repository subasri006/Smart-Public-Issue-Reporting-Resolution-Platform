const express = require('express');
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const categoryRoutes = require('./categoryRoutes');
const adminRoutes = require('./adminRoutes');
const staffRoutes = require('./staffRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const uploadRoutes = require('./uploadRoutes');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/health', (req, res) => healthController.healthCheck(req, res));
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
