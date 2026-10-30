const { AuditLog } = require('../models');
const { PagedResponse } = require('../utils/apiResponse');

class AuditService {
  async log(action, entityName, entityId, performedBy, details, ipAddress = null) {
    try {
      const performedById = performedBy
        ? performedBy._id || performedBy.id || performedBy
        : null;

      await AuditLog.create({
        action,
        entityName,
        entityId: entityId ? String(entityId) : null,
        performedBy: performedById,
        details,
        ipAddress,
      });
    } catch (err) {
      console.error('[AuditService Error] Failed to write audit log:', err.message);
    }
  }

  async getLogs(page = 0, size = 20) {
    const pageNum = Math.max(0, parseInt(page, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(size, 10) || 20));

    const totalElements = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('performedBy', 'fullName username role')
      .sort({ createdAt: -1 })
      .skip(pageNum * pageSize)
      .limit(pageSize)
      .lean();

    const content = logs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      entityName: log.entityName,
      entityId: log.entityId,
      performedByName: log.performedBy ? log.performedBy.fullName : 'System',
      performedByRole: log.performedBy
        ? log.performedBy.role.replace('ROLE_', '')
        : 'SYSTEM',
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    }));

    return PagedResponse.create(content, pageNum, pageSize, totalElements);
  }
}

module.exports = new AuditService();
module.exports.AuditService = AuditService;
