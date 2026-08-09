const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Create Users F and G
  const userF = await mongoose.connection.collection('users').insertOne({
    name: 'User F', email: 'userf@test.local', isActive: true, role: 'user', firebaseUid: 'ff'
  });
  const userG = await mongoose.connection.collection('users').insertOne({
    name: 'User G', email: 'userg@test.local', isActive: true, role: 'user', firebaseUid: 'fg'
  });

  const tokenF = jwt.sign({ id: userF.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenG = jwt.sign({ id: userG.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    validateStatus: () => true
  });

  const reqF = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenF}` } });
  const reqG = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenG}` } });

  console.log('1. Setup Workspaces');
  const resWsF = await reqF('/workspaces', 'post', { name: 'Storage Ws F', description: 'F' });
  const wsFId = resWsF.data._id;
  const resWsG = await reqG('/workspaces', 'post', { name: 'Storage Ws G', description: 'G' });
  const wsGId = resWsG.data._id;

  console.log('2. User F tries to generate upload URL for User G\'s workspace');
  const upRes = await reqF('/files/upload-url', 'post', { fileName: 'malicious.pdf', workspaceId: wsGId });
  console.log('Upload Cross-Tenant:', upRes.status === 403 || upRes.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${upRes.status})`);

  console.log('3. User G uploads file legitimately');
  const fileRes = await reqG('/files', 'post', { 
    originalName: 'legit.pdf', 
    url: 'http://example.com/legit.pdf', 
    storagePath: `workspaces/${wsGId}/123_legit.pdf`, 
    workspaceId: wsGId 
  });
  const fileId = fileRes.data._id;

  console.log('4. User F tries to generate download URL for User G\'s file');
  const downRes = await reqF(`/files/${fileId}/download-url`);
  console.log('Download Cross-Tenant:', downRes.status === 403 || downRes.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${downRes.status})`);
  
  mongoose.disconnect();
}

runTest().catch(console.error);
