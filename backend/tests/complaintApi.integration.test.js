const request = require('supertest');
const { setupTestDB } = require('./setup');
const app = require('../src/app');
const { User, ComplaintCategory } = require('../src/models');
const authService = require('../src/services/authService');

describe('ComplaintApi Integration Tests', () => {
  setupTestDB();

  let citizenToken;
  let staffToken;
  let testCitizen;
  let testStaff;
  let testCategory;

  beforeEach(async () => {
    testCategory = await ComplaintCategory.create({
      name: 'Road Infrastructure',
      code: 'ROAD',
      weight: 20,
    });

    testCitizen = await User.create({
      username: 'citizen_bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Citizen',
      role: 'ROLE_CITIZEN',
      active: true,
    });

    testStaff = await User.create({
      username: 'staff_officer',
      email: 'officer@example.com',
      password: 'password123',
      fullName: 'Staff Officer',
      role: 'ROLE_STAFF',
      active: true,
    });

    citizenToken = authService.generateToken(testCitizen);
    staffToken = authService.generateToken(testStaff);
  });

  test('Citizen can report a new issue and receives human-readable reference ID', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Dangerous sinkhole on highway',
        description: 'Large opening in asphalt near exit 4B',
        categoryId: testCategory._id.toString(),
        severity: 'CRITICAL',
        latitude: 12.9716,
        longitude: 77.5946,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceId).toMatch(/^CF-\d{4}-\d{2}-\d{4,}$/);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  test('Multiple complaint submissions receive unique, distinct reference IDs', async () => {
    const res1 = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Issue Number 1',
        description: 'Description of complaint 1',
        categoryId: testCategory._id.toString(),
        severity: 'LOW',
      });

    const res2 = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Issue Number 2',
        description: 'Description of complaint 2',
        categoryId: testCategory._id.toString(),
        severity: 'MEDIUM',
      });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.data.referenceId).not.toBe(res2.body.data.referenceId);
  });

  test('Staff member can assign complaint to staff', async () => {
    // 1. Citizen creates complaint
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Broken street sign',
        description: 'Sign lying on the sidewalk',
        categoryId: testCategory._id.toString(),
        severity: 'LOW',
      });

    const complaintId = createRes.body.data.id;

    // 2. Staff assigns complaint
    const assignRes = await request(app)
      .post(`/api/complaints/${complaintId}/assign`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        staffId: testStaff._id.toString(),
        notes: 'Assigned for immediate cleanup',
      });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.status).toBe('ASSIGNED');
    expect(assignRes.body.data.assignedStaffName).toBe('Staff Officer');
  });

  test('Citizen cannot update operational status directly (403 Forbidden)', async () => {
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Unauthorized status test',
        description: 'Testing forbidden update',
        categoryId: testCategory._id.toString(),
        severity: 'LOW',
      });

    const complaintId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        status: 'IN_PROGRESS',
      });

    expect(updateRes.status).toBe(403);
  });

  test('Public map endpoint is accessible without authentication', async () => {
    const res = await request(app).get('/api/complaints/public-map');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
