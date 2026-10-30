const { setupTestDB } = require('./setup');
const analyticsService = require('../src/services/analyticsService');
const complaintService = require('../src/services/complaintService');
const { Complaint, ComplaintCategory, User } = require('../src/models');

describe('AnalyticsAndDataIntegrity Tests', () => {
  setupTestDB();

  test('Empty database returns zero counts, zero rate and non-negative avg hours', async () => {
    const summary = await analyticsService.getSummary();

    expect(summary.totalComplaints).toBe(0);
    expect(summary.submittedCount).toBe(0);
    expect(summary.assignedCount).toBe(0);
    expect(summary.inProgressCount).toBe(0);
    expect(summary.activeUnderRepairCount).toBe(0);
    expect(summary.resolvedCount).toBe(0);
    expect(summary.reopenedCount).toBe(0);
    expect(summary.criticalCount).toBe(0);
    expect(summary.highCount).toBe(0);
    expect(summary.resolutionRate).toBe(0.0);
    expect(summary.avgResolutionHours).toBe(0.0);
  });

  test('Active Under Repair accurately aggregates Assigned and In Progress complaints', async () => {
    const user = await User.create({
      username: 'user_analytics',
      email: 'user_analytics@example.com',
      password: 'password',
      fullName: 'Analytics User',
      role: 'ROLE_CITIZEN',
    });

    const category = await ComplaintCategory.create({
      name: 'Water',
      code: 'WATER',
    });

    // 2 Assigned, 3 In Progress
    await Complaint.create([
      {
        referenceId: 'CF-2026-10-0001',
        title: 'Assigned 1',
        description: 'Desc',
        category: category._id,
        severity: 'LOW',
        status: 'ASSIGNED',
        citizen: user._id,
      },
      {
        referenceId: 'CF-2026-10-0002',
        title: 'Assigned 2',
        description: 'Desc',
        category: category._id,
        severity: 'LOW',
        status: 'ASSIGNED',
        citizen: user._id,
      },
      {
        referenceId: 'CF-2026-10-0003',
        title: 'In Progress 1',
        description: 'Desc',
        category: category._id,
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        citizen: user._id,
      },
      {
        referenceId: 'CF-2026-10-0004',
        title: 'In Progress 2',
        description: 'Desc',
        category: category._id,
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        citizen: user._id,
      },
      {
        referenceId: 'CF-2026-10-0005',
        title: 'In Progress 3',
        description: 'Desc',
        category: category._id,
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        citizen: user._id,
      },
    ]);

    const summary = await analyticsService.getSummary();
    expect(summary.assignedCount).toBe(2);
    expect(summary.inProgressCount).toBe(3);
    expect(summary.activeUnderRepairCount).toBe(5);
  });

  test('Negative duration in flawed timestamps is ignored and never displays negative avg resolution time', async () => {
    const user = await User.create({
      username: 'user_flawed',
      email: 'user_flawed@example.com',
      password: 'password',
      fullName: 'Flawed User',
      role: 'ROLE_CITIZEN',
    });

    const category = await ComplaintCategory.create({
      name: 'Power',
      code: 'POWER',
    });

    const now = new Date();
    const futureCreated = new Date(now.getTime() + 10 * 3600 * 1000); // Created 10h in the future

    await Complaint.create({
      referenceId: 'CF-2026-10-0010',
      title: 'Time Traveler Complaint',
      description: 'Desc',
      category: category._id,
      severity: 'LOW',
      status: 'RESOLVED',
      citizen: user._id,
      createdAt: futureCreated,
      resolvedAt: now, // results in negative duration
    });

    const summary = await analyticsService.getSummary();
    expect(summary.avgResolutionHours).toBeGreaterThanOrEqual(0.0);
    expect(summary.avgResolutionHours).toBe(0.0);
  });

  test('My complaint summary returns accurate counts for authenticated citizen across pagination', async () => {
    const citizen = await User.create({
      username: 'citizen_summary',
      email: 'citizen_summary@example.com',
      password: 'password',
      fullName: 'Summary Citizen',
      role: 'ROLE_CITIZEN',
    });

    const category = await ComplaintCategory.create({
      name: 'Street',
      code: 'STREET',
    });

    await Complaint.create([
      {
        referenceId: 'CF-2026-10-0021',
        title: 'Submitted Issue',
        description: 'Desc',
        category: category._id,
        severity: 'LOW',
        status: 'SUBMITTED',
        citizen: citizen._id,
      },
      {
        referenceId: 'CF-2026-10-0022',
        title: 'Assigned Issue',
        description: 'Desc',
        category: category._id,
        severity: 'MEDIUM',
        status: 'ASSIGNED',
        citizen: citizen._id,
      },
      {
        referenceId: 'CF-2026-10-0023',
        title: 'Resolved Issue',
        description: 'Desc',
        category: category._id,
        severity: 'HIGH',
        status: 'RESOLVED',
        citizen: citizen._id,
      },
    ]);

    const summary = await complaintService.getMyComplaintSummary(citizen);

    expect(summary.total).toBe(3);
    expect(summary.submitted).toBe(1);
    expect(summary.assigned).toBe(1);
    expect(summary.inProgress).toBe(0);
    expect(summary.resolved).toBe(1);
    expect(summary.activeUnderRepair).toBe(1);
  });
});
