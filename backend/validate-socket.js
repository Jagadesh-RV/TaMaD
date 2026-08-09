const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Create Users
  const userH = await mongoose.connection.collection('users').insertOne({
    name: 'User H', email: 'userh@test.local', isActive: true, role: 'user', firebaseUid: 'fh'
  });
  const userI = await mongoose.connection.collection('users').insertOne({
    name: 'User I', email: 'useri@test.local', isActive: true, role: 'user', firebaseUid: 'fi'
  });

  const tokenH = jwt.sign({ id: userH.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenI = jwt.sign({ id: userI.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqH = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenH}` } });

  console.log('1. User H creates Workspace H');
  const resWs = await reqH('/workspaces', 'post', { name: 'Workspace H', description: 'H' });
  const wsHId = resWs.data._id;

  console.log('2. Connect Sockets');
  const socketH = io('http://localhost:5000', { extraHeaders: { Authorization: `Bearer ${tokenH}` } });
  const socketI = io('http://localhost:5000', { extraHeaders: { Authorization: `Bearer ${tokenI}` } });

  await new Promise(r => setTimeout(r, 1000));

  console.log('3. User I attempts to emit typing_start to Workspace H');
  socketI.emit('typing_start', { workspaceId: wsHId, taskId: '123' });

  // Listen on socketH for typing event
  let received = false;
  socketH.on('user_typing', (data) => {
    if (data.userId === userI.insertedId.toString()) {
      received = true;
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('Emit cross-tenant event:', received ? 'ALLOW (FAIL)' : 'DENY (Correct)');

  socketH.disconnect();
  socketI.disconnect();
  mongoose.disconnect();
}

runTest().catch(console.error);
