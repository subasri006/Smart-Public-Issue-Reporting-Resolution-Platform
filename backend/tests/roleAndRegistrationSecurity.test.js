const { setupTestDB } = require('./setup');
const authService = require('../src/services/authService');
const userService = require('../src/services/userService');
const complaintService = require('../src/services/complaintService');
const { User, ComplaintCategory, Complaint } = require('../src/models');

describe('RoleAndRegistrationSecurity Tests', () => {
  setupTestDB();

  test('1. Citizen registration strictly assigns ROLE_CITIZEN', async () => {
    const res = await authService.register({
      username: 'citizen1',
      email: 'citizen1@civicfix.org',
      password: 'password123',
      fullName: 'Alice Citizen',
    });

    expect(res.role).toBe('ROLE_CITIZEN');

    const saved = await User.findById(res.id);
    expect(saved.role).toBe('ROLE_CITIZEN');
  });

  test('2. Staff registration strictly assigns ROLE_STAFF and preserves department', async () => {
    const res = await authService.registerStaff({
      username: 'staff1',
      email: 'staff1@civicfix.org',
      password: 'password123',
      fullName: 'Officer Bob',
      department: 'Road Works Division',
    });

    expect(res.role).toBe('ROLE_STAFF');
    expect(res.department).toBe('Road Works Division');

    const saved = await User.findById(res.id);
    expect(saved.role).toBe('ROLE_STAFF');
    expect(saved.department).toBe('Road Works Division');
  });

  test('3. Public registration payload cannot create or escalate to ROLE_ADMIN', async () => {
    const res = await authService.register({
      username: 'hacker',
      email: 'hacker@civicfix.org',
      password: 'password123',
      fullName: 'Sneaky User',
      role: 'ROLE_ADMIN', // Attempted privilege escalation
    });

    expect(res.role).toBe('ROLE_CITIZEN');

    const saved = await User.findById(res.id);
    expect(saved.role).toBe('ROLE_CITIZEN');
  });

  test('4. Only one admin account can exist in the application', async () => {
    // 1. Create first admin
    const admin1 = await User.create({
      username: 'chief_admin',
      email: 'admin@civicfix.org',
      password: 'hash_password',
      fullName: 'Chief Administrator',
      role: 'ROLE_ADMIN',
    });
    expect(admin1).toBeDefined();

    // 2. Attempt to create a second admin via userService
    await expect(
      userService.createUser(
        {
          username: 'second_admin',
          email: 'admin2@civicfix.org',
          password: 'password123',
          fullName: 'Second Administrator',
          role: 'ROLE_ADMIN',
        },
        admin1
      )
    ).rejects.toThrow('An administrator account already exists. CivicFix permits exactly one administrator.');

    // 3. Attempt to promote an existing staff to admin
    const staff = await User.create({
      username: 'staff_candidate',
      email: 'staff_cand@civicfix.org',
      password: 'hash_password',
      fullName: 'Staff Candidate',
      role: 'ROLE_STAFF',
    });

    await expect(
      userService.updateUser(
        staff._id,
        {
          role: 'ROLE_ADMIN',
        },
        admin1
      )
    ).rejects.toThrow('Cannot promote user to administrator. CivicFix permits exactly one administrator.');

    // 4. Primary admin cannot be demoted or deactivated
    await expect(
      userService.updateUser(
        admin1._id,
        {
          role: 'ROLE_STAFF',
        },
        admin1
      )
    ).rejects.toThrow('Cannot change the role of the primary administrator.');

    await expect(
      userService.updateUser(
        admin1._id,
        {
          active: false,
        },
        admin1
      )
    ).rejects.toThrow('Cannot deactivate the primary administrator account.');
  });

  test('5. Duplicate email addresses and usernames are rejected with ConflictException (HTTP 409)', async () => {
    await authService.register({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice',
    });

    // Duplicate username
    await expect(
      authService.register({
        username: 'alice',
        email: 'different@example.com',
        password: 'password123',
        fullName: 'Another Alice',
      })
    ).rejects.toThrow('Username is already taken');

    // Duplicate email
    await expect(
      authService.register({
        username: 'alice2',
        email: 'alice@example.com',
        password: 'password123',
        fullName: 'Another Alice',
      })
    ).rejects.toThrow('Email is already registered');
  });

  test("6. Citizens cannot access unauthorized users' complaints", async () => {
    const citizen1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123',
      fullName: 'User One',
      role: 'ROLE_CITIZEN',
    });

    const citizen2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123',
      fullName: 'User Two',
      role: 'ROLE_CITIZEN',
    });

    const category = await ComplaintCategory.create({
      name: 'Sanitation',
      code: 'SANITATION',
    });

    const complaint = await complaintService.createComplaint(
      {
        title: 'Private issue on user1 property',
        description: 'Details only user1 should see in private view',
        categoryId: category._id.toString(),
        severity: 'LOW',
      },
      null,
      citizen1
    );

    // Citizen 1 can access
    const c1View = await complaintService.getComplaintDetails(complaint.id, citizen1);
    expect(c1View.id).toBe(complaint.id);

    // Citizen 2 is forbidden
    await expect(
      complaintService.getComplaintDetails(complaint.id, citizen2)
    ).rejects.toThrow("You do not have access to view this complaint's private details");
  });

  test('7. Staff and admin access restrictions work correctly', async () => {
    const citizen = await User.create({
      username: 'citizen_actor',
      email: 'citizen_actor@example.com',
      password: 'password',
      fullName: 'Citizen Actor',
      role: 'ROLE_CITIZEN',
    });

    const staff = await User.create({
      username: 'staff_actor',
      email: 'staff_actor@example.com',
      password: 'password',
      fullName: 'Staff Actor',
      role: 'ROLE_STAFF',
    });

    const category = await ComplaintCategory.create({
      name: 'Road',
      code: 'ROAD',
    });

    const complaint = await complaintService.createComplaint(
      {
        title: 'Broken road',
        description: 'Dangerous road crater',
        categoryId: category._id.toString(),
        severity: 'HIGH',
      },
      null,
      citizen
    );

    // Citizen cannot assign
    await expect(
      complaintService.assignComplaint(complaint.id, { staffId: staff._id.toString() }, citizen)
    ).rejects.toThrow('Citizens cannot assign complaints');

    // Citizen cannot update operational status
    await expect(
      complaintService.updateStatus(complaint.id, { status: 'IN_PROGRESS' }, null, citizen)
    ).rejects.toThrow('Citizens cannot modify operational status directly');

    // Staff CAN assign
    const assigned = await complaintService.assignComplaint(
      complaint.id,
      { staffId: staff._id.toString() },
      staff
    );
    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.assignedStaffName).toBe('Staff Actor');

    // Staff CAN update status to IN_PROGRESS
    const inProgress = await complaintService.updateStatus(
      complaint.id,
      { status: 'IN_PROGRESS', comment: 'Starting work' },
      null,
      staff
    );
    expect(inProgress.status).toBe('IN_PROGRESS');
  });
});
