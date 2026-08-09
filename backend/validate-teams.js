const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });
  await mongoose.connection.collection('workspaces').deleteMany({ name: /Test Team/ });
  await mongoose.connection.collection('projects').deleteMany({ name: /Team Project/ });

  // Create Users A and C
  const userA = await mongoose.connection.collection('users').insertOne({
    name: 'User A', email: 'usera@test.local', isActive: true, role: 'user', firebaseUid: 'fa2'
  });
  const userC = await mongoose.connection.collection('users').insertOne({
    name: 'User C', email: 'userc@test.local', isActive: true, role: 'user', firebaseUid: 'fc'
  });

  const tokenA = jwt.sign({ id: userA.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenC = jwt.sign({ id: userC.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    validateStatus: () => true
  });

  const reqA = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenA}` } });
  const reqC = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenC}` } });

  console.log('1. User A creates Team Workspace');
  const resWs = await reqA('/workspaces', 'post', { name: 'Test Team', description: 'Team' });
  const ws = resWs.data;
  console.log('Workspace ID:', ws._id);

  console.log('2. User A invites User C');
  const inviteRes = await reqA(`/workspaces/${ws._id}/members`, 'post', { email: 'userc@test.local', role: 'member' });
  console.log('Invite User C:', inviteRes.status === 200 ? 'ALLOW' : `DENY (${inviteRes.status})`);

  console.log('3. User C accepts invitation (Implied by being added directly)');
  const getWsC = await reqC(`/workspaces/${ws._id}`);
  console.log('User C can view workspace:', getWsC.status === 200 ? 'ALLOW' : `DENY (${getWsC.status})`);

  console.log('4. User A changes User C role to admin');
  const roleRes = await reqA(`/workspaces/${ws._id}/members/role`, 'put', { userId: userC.insertedId.toString(), role: 'admin' });
  console.log('Change Role to admin:', roleRes.status === 200 ? 'ALLOW' : `DENY (${roleRes.status})`);

  // We skip suspension in this script since backend uses 'isActive' at the user level, not workspace level right now.
  
  console.log('7. User A removes User C');
  const remRes = await reqA(`/workspaces/${ws._id}/members/${userC.insertedId.toString()}`, 'delete');
  console.log('Remove User C:', remRes.status === 200 ? 'ALLOW' : `DENY (${remRes.status})`);

  console.log('8. User C attempts to access workspace');
  const getWsC2 = await reqC(`/workspaces/${ws._id}`);
  console.log('User C accesses workspace after removal:', getWsC2.status === 403 || getWsC2.status === 404 ? 'DENY' : `ALLOW (${getWsC2.status})`);

  mongoose.disconnect();
}

runTest().catch(console.error);
