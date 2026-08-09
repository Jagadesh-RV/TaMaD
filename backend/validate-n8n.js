const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Create Users M and N
  const userM = await mongoose.connection.collection('users').insertOne({
    name: 'User M', email: 'userm@test.local', isActive: true, role: 'user', firebaseUid: 'fm'
  });
  const userN = await mongoose.connection.collection('users').insertOne({
    name: 'User N', email: 'usern@test.local', isActive: true, role: 'user', firebaseUid: 'fn'
  });

  const tokenM = jwt.sign({ id: userM.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenN = jwt.sign({ id: userN.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqM = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenM}` } });
  const reqN = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenN}` } });

  console.log('1. User M creates Team M');
  const resTeam = await reqM('/teams', 'post', { name: 'Team M' });
  const teamMId = resTeam.data?.team?._id;

  console.log('2. User N attempts to schedule a meeting for Team M (Triggering n8n)');
  const resMeeting = await reqN('/meetings', 'post', { 
    title: 'Hacked Meeting', 
    teamId: teamMId,
    startTime: new Date().toISOString(),
    duration: 60,
    meetingType: 'video'
  });
  
  console.log('n8n Trigger Cross-Tenant:', resMeeting.status === 403 || resMeeting.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resMeeting.status})`);
  
  mongoose.disconnect();
}

runTest().catch(console.error);
