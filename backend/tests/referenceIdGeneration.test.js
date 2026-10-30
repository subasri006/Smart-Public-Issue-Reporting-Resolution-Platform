const { setupTestDB } = require('./setup');
const referenceIdGeneratorService = require('../src/services/referenceIdGeneratorService');
const complaintService = require('../src/services/complaintService');
const { Complaint, ComplaintCategory, User } = require('../src/models');

describe('ReferenceIdGeneration Tests', () => {
  setupTestDB();

  let testCategory;
  let testCitizen;

  beforeEach(async () => {
    testCategory = await ComplaintCategory.create({
      name: 'Road Damage',
      code: 'ROAD',
      weight: 20,
      icon: 'Construction',
    });

    testCitizen = await User.create({
      username: 'citizen1',
      email: 'citizen1@example.com',
      password: 'password123',
      fullName: 'John Citizen',
      role: 'ROLE_CITIZEN',
    });
  });

  test('Two or more complaints created via ComplaintService receive different unique reference IDs', async () => {
    const request1 = {
      title: 'Deep pothole on 5th cross main junction',
      description: 'Damaging car suspensions and causing bike skids',
      categoryId: testCategory._id.toString(),
      severity: 'HIGH',
      latitude: 12.9716,
      longitude: 77.5946,
      address: '5th Cross',
      landmark: 'Signal',
    };

    const request2 = {
      title: 'Dangerous broken water pipe leaking onto pavement',
      description: 'Continuous overflow flooding sidewalk and roadway',
      categoryId: testCategory._id.toString(),
      severity: 'CRITICAL',
      latitude: 12.972,
      longitude: 77.595,
      address: '6th Cross',
      landmark: 'Near School',
    };

    const response1 = await complaintService.createComplaint(request1, null, testCitizen);
    const response2 = await complaintService.createComplaint(request2, null, testCitizen);

    expect(response1).toBeDefined();
    expect(response2).toBeDefined();

    const ref1 = response1.referenceId;
    const ref2 = response2.referenceId;

    expect(ref1).toBeDefined();
    expect(ref2).toBeDefined();
    expect(ref1).not.toBe(ref2);

    expect(ref1).toMatch(/^CF-\d{4}-\d{2}-\d{4,}$/);
    expect(ref2).toMatch(/^CF-\d{4}-\d{2}-\d{4,}$/);

    const persisted1 = await Complaint.findOne({ referenceId: ref1 });
    const persisted2 = await Complaint.findOne({ referenceId: ref2 });

    expect(persisted1).not.toBeNull();
    expect(persisted2).not.toBeNull();
    expect(persisted1.title).toBe(request1.title);
    expect(persisted2.title).toBe(request2.title);
    expect(persisted1.referenceId).not.toBe(persisted2.referenceId);
  });

  test('Multiple sequential reference ID generations produce strictly increasing values', async () => {
    const testDate = new Date(2026, 9, 24); // Oct 2026

    const ref1 = await referenceIdGeneratorService.generateNextReferenceId(testDate);
    const ref2 = await referenceIdGeneratorService.generateNextReferenceId(testDate);
    const ref3 = await referenceIdGeneratorService.generateNextReferenceId(testDate);

    expect(ref1).toBe('CF-2026-10-0001');
    expect(ref2).toBe('CF-2026-10-0002');
    expect(ref3).toBe('CF-2026-10-0003');
  });

  test('Concurrent complaint reference ID generation produces zero duplicates', async () => {
    const testDate = new Date(2026, 9, 25);
    const count = 10;

    const promises = Array.from({ length: count }, () =>
      referenceIdGeneratorService.generateNextReferenceId(testDate)
    );

    const results = await Promise.all(promises);
    const uniqueRefs = new Set(results);

    expect(uniqueRefs.size).toBe(count);
  });
});
