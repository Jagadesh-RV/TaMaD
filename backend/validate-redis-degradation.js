const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Create User J
  await mongoose.connection.collection('users').deleteMany({ email: 'userj@test.local' });
  const userJ = await mongoose.connection.collection('users').insertOne({
    name: 'User J', email: 'userj@test.local', isActive: true, role: 'user', firebaseUid: 'fj'
  });

  const tokenJ = jwt.sign({ id: userJ.insertedId.toString() }, 'your_jwt_secret_here');
  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqJ = (path, method = 'get', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenJ}` } });

  console.log('1. User J fetches workspaces (with Redis stopped)');
  const start = Date.now();
  const resWs = await reqJ('/workspaces');
  const duration = Date.now() - start;
  
  if (resWs.status === 200) {
    console.log('Graceful Degradation: PASS (Status 200, took ' + duration + 'ms)');
  } else {
    console.log('Graceful Degradation: FAIL (Status ' + resWs.status + ')');
  }
  
  mongoose.disconnect();
}

runTest().catch(console.error);
