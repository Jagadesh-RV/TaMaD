const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });
  await mongoose.connection.collection('workspaces').deleteMany({ name: /Personal Workspace/ });
  await mongoose.connection.collection('workspaces').deleteMany({ name: /Team Mode Workspace/ });

  // Create Users D and E
  const userD = await mongoose.connection.collection('users').insertOne({
    name: 'User D', email: 'userd@test.local', isActive: true, role: 'user', firebaseUid: 'fd'
  });
  const userE = await mongoose.connection.collection('users').insertOne({
    name: 'User E', email: 'usere@test.local', isActive: true, role: 'user', firebaseUid: 'fe'
  });

  const tokenD = jwt.sign({ id: userD.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenE = jwt.sign({ id: userE.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    validateStatus: () => true
  });

  const reqD = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenD}` } });
  
  console.log('1. User D gets their default workspace (Triggers creation)');
  const resAuthWs = await reqD('/auth/workspace', 'get');
  console.log('Get Personal Workspace:', resAuthWs.status === 200 ? 'ALLOW' : `DENY (${resAuthWs.status})`);
  
  const personalWsId = resAuthWs.data?.workspace?._id;
  
  if (personalWsId) {
    console.log('2. User D tries to invite User E to Personal Workspace');
    const inviteRes = await reqD(`/workspaces/${personalWsId}/members`, 'post', { email: 'usere@test.local', role: 'member' });
    console.log('Invite to Personal Workspace:', inviteRes.status === 400 ? 'DENY (Correct)' : `ALLOW/FAIL (${inviteRes.status})`);
  } else {
    console.log('Failed to fetch personal workspace ID');
  }

  console.log('3. User D creates Team Workspace');
  const resWs = await reqD('/workspaces', 'post', { name: 'Team Mode Workspace', description: 'Team' });
  const teamWsId = resWs.data?._id;

  if (teamWsId) {
    console.log('4. User D tries to invite User E to Team Workspace');
    const inviteResTeam = await reqD(`/workspaces/${teamWsId}/members`, 'post', { email: 'usere@test.local', role: 'member' });
    console.log('Invite to Team Workspace:', inviteResTeam.status === 200 ? 'ALLOW (Correct)' : `DENY (${inviteResTeam.status})`);
  }
  
  mongoose.disconnect();
}

runTest().catch(console.error);
