const request = require('supertest');
const { setupTestDB } = require('./setup');
const app = require('../src/app');
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

describe('AuthController Integration Tests', () => {
  setupTestDB();

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('adminSecret123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@civicfix.org',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'ROLE_ADMIN',
      active: true,
    });
  });

  test('Should login successfully with initial admin credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'admin@civicfix.org', password: 'adminSecret123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.role).toBe('ROLE_ADMIN');
    expect(res.body.data.email).toBe('admin@civicfix.org');
  });

  test('Should reject invalid login credentials with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'admin@civicfix.org', password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid username/email or password');
  });

  test('Citizen registration assigns CITIZEN role strictly', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'citizen_john',
      email: 'john@example.com',
      password: 'securePassword123',
      fullName: 'John Citizen',
      role: 'ROLE_ADMIN', // Privilege escalation attempt
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ROLE_CITIZEN');
  });

  test('Staff registration assigns STAFF role strictly', async () => {
    const res = await request(app).post('/api/auth/register/staff').send({
      username: 'staff_sarah',
      email: 'sarah@civicfix.gov',
      password: 'staffPassword123',
      fullName: 'Officer Sarah',
      department: 'Sanitation Department',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ROLE_STAFF');
    expect(res.body.data.department).toBe('Sanitation Department');
  });

  test('Duplicate email registration attempts are rejected with 409 Conflict', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'user_orig',
      email: 'duplicate@test.com',
      password: 'password123',
      fullName: 'Original User',
    });

    const res = await request(app).post('/api/auth/register').send({
      username: 'user_dup',
      email: 'duplicate@test.com',
      password: 'password123',
      fullName: 'Duplicate User',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email is already registered');
  });

  test('Accessing /api/auth/me with valid Bearer token returns profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'admin', password: 'adminSecret123' });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.username).toBe('admin');
    expect(meRes.body.data.email).toBe('admin@civicfix.org');
    expect(meRes.body.data.role).toBe('ROLE_ADMIN');
  });

  test('Accessing protected endpoint without JWT returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
