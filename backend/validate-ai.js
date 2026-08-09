const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Create Users K and L
  const userK = await mongoose.connection.collection('users').insertOne({
    name: 'User K', email: 'userk@test.local', isActive: true, role: 'user', firebaseUid: 'fk'
  });
  const userL = await mongoose.connection.collection('users').insertOne({
    name: 'User L', email: 'userl@test.local', isActive: true, role: 'user', firebaseUid: 'fl'
  });

  const tokenK = jwt.sign({ id: userK.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenL = jwt.sign({ id: userL.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqK = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenK}` } });
  const reqL = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenL}` } });

  console.log('1. User K creates Workspace K');
  const resWs = await reqK('/workspaces', 'post', { name: 'Workspace K', description: 'K' });
  const wsKId = resWs.data._id;

  console.log('2. User L attempts to query AI for Workspace K summary');
  const resChat = await reqL('/ai/chat', 'post', { query: 'summarize', workspaceId: wsKId });
  
  console.log('AI Cross-Tenant Query:', resChat.status === 403 || resChat.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resChat.status})`);
  
  mongoose.disconnect();
}

runTest().catch(console.error);
