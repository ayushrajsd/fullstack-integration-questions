const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

test('TC1 - Register returns 201 with token and user object', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Alice',
    email: 'alice@test.com',
    password: 'secret123',
  });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.email).toBe('alice@test.com');
  expect(res.body.user.password).toBeUndefined();

  const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
  expect(decoded.userId).toBe(res.body.user._id);
});

test('TC2 - Duplicate email returns 400', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Alice', email: 'alice@test.com', password: 'secret123',
  });

  const res = await request(app).post('/api/auth/register').send({
    name: 'Alice2', email: 'alice@test.com', password: 'other',
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Email already registered');
});

test('TC3 - Login with correct credentials returns 200 with token', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Bob', email: 'bob@test.com', password: 'mypassword',
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'bob@test.com', password: 'mypassword',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.email).toBe('bob@test.com');
  expect(res.body.user.password).toBeUndefined();
});

test('TC4 - Login with wrong password returns 401', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Bob', email: 'bob@test.com', password: 'mypassword',
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'bob@test.com', password: 'wrongpassword',
  });

  expect(res.statusCode).toBe(401);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Invalid credentials');
});
