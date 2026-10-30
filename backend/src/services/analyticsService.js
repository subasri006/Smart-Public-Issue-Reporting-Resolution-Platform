const { Complaint, User, ComplaintCategory } = require('../models');

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
};

class AnalyticsService {
  async getSummary() {
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'SUBMITTED' });
    const assigned = await Complaint.countDocuments({ status: 'ASSIGNED' });
    const inProgress = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
    const resolved = await Complaint.countDocuments({ status: 'RESOLVED' });
    const reopened = await Complaint.countDocuments({ status: 'REOPENED' });

    const critical = await Complaint.countDocuments({ severity: 'CRITICAL' });
    const high = await Complaint.countDocuments({ severity: 'HIGH' });

    const resolutionRate = total > 0 ? (resolved / total) * 100.0 : 0.0;

    // Average resolution time in hours
    const resolvedComplaints = await Complaint.find({
      status: 'RESOLVED',
      resolvedAt: { $ne: null },
    })
      .select('createdAt resolvedAt')
      .lean();

    let totalHours = 0;
    let validResolvedCount = 0;

    for (const c of resolvedComplaints) {
      if (c.createdAt && c.resolvedAt) {
        const createdTime = new Date(c.createdAt).getTime();
        const resolvedTime = new Date(c.resolvedAt).getTime();
        const diffHours = (resolvedTime - createdTime) / (1000 * 60 * 60);

        if (diffHours >= 0) {
          totalHours += diffHours;
          validResolvedCount++;
        }
      }
    }

    const avgResolutionHours =
      validResolvedCount > 0 ? totalHours / validResolvedCount : 0.0;

    const totalCitizens = await User.countDocuments({ role: 'ROLE_CITIZEN' });
    const totalStaff = await User.countDocuments({ role: 'ROLE_STAFF' });

    return {
      totalComplaints: total,
      submittedCount: submitted,
      assignedCount: assigned,
      inProgressCount: inProgress,
      activeUnderRepairCount: assigned + inProgress,
      resolvedCount: resolved,
      reopenedCount: reopened,
      criticalCount: critical,
      highCount: high,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      avgResolutionHours: Math.max(0.0, Math.round(avgResolutionHours * 10) / 10),
      totalCitizens,
      totalStaff,
    };
  }

  async getCategoryStats() {
    const total = await Complaint.countDocuments();
    const results = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'complaintcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      {
        $unwind: {
          path: '$categoryDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          category: { $ifNull: ['$categoryDoc.name', 'Other'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return results.map((r) => {
      const pct = total > 0 ? (r.count / total) * 100.0 : 0.0;
      return {
        category: r.category,
        count: r.count,
        percentage: Math.round(pct * 10) / 10,
      };
    });
  }

  async getStatusStats() {
    const total = await Complaint.countDocuments();
    const results = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }

    const allStatuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'];
    return allStatuses.map((status) => {
      const count = counts[status] || 0;
      const pct = total > 0 ? (count / total) * 100.0 : 0.0;
      return {
        status,
        label: STATUS_LABELS[status] || status,
        count,
        percentage: Math.round(pct * 10) / 10,
      };
    });
  }

  async getTrends(days = 14) {
    const windowDays = days > 0 && days <= 90 ? parseInt(days, 10) : 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (windowDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const complaints = await Complaint.find({
      $or: [{ createdAt: { $gte: startDate } }, { resolvedAt: { $gte: startDate } }],
    })
      .select('createdAt resolvedAt')
      .lean();

    const formatDateKey = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const submittedMap = {};
    const resolvedMap = {};

    for (const c of complaints) {
      if (c.createdAt) {
        const cDate = new Date(c.createdAt);
        if (cDate >= startDate) {
          const k = formatDateKey(cDate);
          submittedMap[k] = (submittedMap[k] || 0) + 1;
        }
      }
      if (c.resolvedAt) {
        const rDate = new Date(c.resolvedAt);
        if (rDate >= startDate) {
          const k = formatDateKey(rDate);
          resolvedMap[k] = (resolvedMap[k] || 0) + 1;
        }
      }
    }

    const trendPoints = [];
    for (let i = 0; i < windowDays; i++) {
      const cur = new Date(startDate);
      cur.setDate(cur.getDate() + i);
      const k = formatDateKey(cur);
      trendPoints.push({
        date: k,
        submitted: submittedMap[k] || 0,
        resolved: resolvedMap[k] || 0,
      });
    }

    return trendPoints;
  }

  async getAreaStats() {
    const results = await Complaint.aggregate([
      {
        $project: {
          area: {
            $cond: [
              { $and: [{ $ne: ['$address', null] }, { $ne: ['$address', ''] }] },
              '$address',
              'Unknown',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return results.map((r) => ({
      area: r._id,
      count: r.count,
    }));
  }

  async exportComplaintsCsv() {
    const complaints = await Complaint.find()
      .populate('category', 'name')
      .populate('citizen', 'fullName')
      .populate('assignedStaff', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const header = [
      'Reference ID',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Priority Score',
      'Citizen Name',
      'Assigned Staff',
      'Address',
      'Landmark',
      'Latitude',
      'Longitude',
      'Created At',
      'Resolved At',
    ].join(',');

    const rows = complaints.map((c) => {
      return [
        escapeCsv(c.referenceId),
        escapeCsv(c.title),
        escapeCsv(c.category ? c.category.name : 'General'),
        c.severity,
        c.status,
        c.priorityScore,
        escapeCsv(c.citizen ? c.citizen.fullName : 'Anonymous'),
        escapeCsv(c.assignedStaff ? c.assignedStaff.fullName : 'Unassigned'),
        escapeCsv(c.address),
        escapeCsv(c.landmark),
        c.latitude != null ? c.latitude : '',
        c.longitude != null ? c.longitude : '',
        escapeCsv(formatDate(c.createdAt)),
        escapeCsv(formatDate(c.resolvedAt)),
      ].join(',');
    });

    const csvContent = [header, ...rows].join('\r\n');
    return Buffer.from(csvContent, 'utf-8');
  }
}

module.exports = new AnalyticsService();
module.exports.AnalyticsService = AnalyticsService;
