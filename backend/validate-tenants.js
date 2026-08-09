const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });
  await mongoose.connection.collection('workspaces').deleteMany({ name: /Test Workspace/ });
  await mongoose.connection.collection('projects').deleteMany({ name: /Test Project/ });

  // 1. Create Users
  const userA = await mongoose.connection.collection('users').insertOne({
    name: 'User A', email: 'usera@test.local', isActive: true, role: 'user', firebaseUid: 'fa'
  });
  const userB = await mongoose.connection.collection('users').insertOne({
    name: 'User B', email: 'userb@test.local', isActive: true, role: 'user', firebaseUid: 'fb'
  });

  const tokenA = jwt.sign({ id: userA.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenB = jwt.sign({ id: userB.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    validateStatus: () => true // Don't throw on 4xx/5xx
  });

  const reqA = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenA}` } });
  const reqB = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenB}` } });

  console.log('Testing legitimate workspace creation...');
  const resWsA = await reqA('/workspaces', 'post', { name: 'Test Workspace A', description: 'A' });
  const wsA = resWsA.data;
  const resWsB = await reqB('/workspaces', 'post', { name: 'Test Workspace B', description: 'B' });
  const wsB = resWsB.data;

  console.log('Workspace A:', wsA._id);
  console.log('Workspace B:', wsB._id);

  console.log('Testing Legitimate Access...');
  const projA = await reqA('/projects', 'post', { name: 'Test Project A', workspaceId: wsA._id });
  console.log('User A creates Project A in Workspace A:', projA.status === 201 ? 'ALLOW' : `DENY (${projA.status})`);
  
  const projB = await reqB('/projects', 'post', { name: 'Test Project B', workspaceId: wsB._id });
  console.log('User B creates Project B in Workspace B:', projB.status === 201 ? 'ALLOW' : `DENY (${projB.status})`);

  console.log('Testing Unauthorized Access (Cross-Tenant Bypasses)...');
  // Attempt 1: User A tries to get Workspace B's projects
  const bypass1 = await reqA(`/projects?workspaceId=${wsB._id}`);
  console.log('User A -> GET Projects Workspace B:', bypass1.status === 403 || bypass1.status === 404 ? 'DENY' : `ALLOW (${bypass1.status})`);

  // Attempt 2: User A tries to create a project in Workspace B
  const bypass2 = await reqA('/projects', 'post', { name: 'Malicious Project', workspaceId: wsB._id });
  console.log('User A -> POST Project Workspace B:', bypass2.status === 403 || bypass2.status === 404 ? 'DENY' : `ALLOW (${bypass2.status})`);

  // Attempt 3: User A tries to GET Project B directly
  const bypass3 = await reqA(`/projects/${projB.data._id}`);
  console.log('User A -> GET Project B directly:', bypass3.status === 403 || bypass3.status === 404 ? 'DENY' : `ALLOW (${bypass3.status})`);

  // Attempt 4: User A tries to UPDATE Project B
  const bypass4 = await reqA(`/projects/${projB.data._id}`, 'put', { name: 'Hacked Project B' });
  console.log('User A -> UPDATE Project B directly:', bypass4.status === 403 || bypass4.status === 404 ? 'DENY' : `ALLOW (${bypass4.status})`);

  mongoose.disconnect();
}

runTest().catch(console.error);
