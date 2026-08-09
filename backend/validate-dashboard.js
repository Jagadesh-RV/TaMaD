const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });

  // Create Users X and Y
  const userX = await mongoose.connection.collection('users').insertOne({
    name: 'User XX', email: 'userxx@test.local', isActive: true, role: 'user', firebaseUid: 'fxx'
  });
  const userY = await mongoose.connection.collection('users').insertOne({
    name: 'User YY', email: 'useryy@test.local', isActive: true, role: 'user', firebaseUid: 'fyy'
  });

  const tokenX = jwt.sign({ id: userX.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenY = jwt.sign({ id: userY.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqX = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenX}` } });
  const reqY = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenY}` } });

  console.log('1. User X creates Workspace X');
  const resWsX = await reqX('/workspaces', 'post', { name: 'WS X', description: 'X' });
  const wsX = resWsX.data._id;

  console.log('2. User X fetches their dashboard to create it');
  const resDashX = await reqX(`/dashboards?workspaceId=${wsX}`, 'get');
  const dashXId = resDashX.data._id;

  console.log('3. User Y attempts to fetch User X\'s dashboard');
  const resDashYFetch = await reqY(`/dashboards?workspaceId=${wsX}`, 'get');
  console.log('Dashboard Access Cross-Tenant:', resDashYFetch.status === 403 || resDashYFetch.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resDashYFetch.status})`);

  console.log('4. User Y attempts to update User X\'s dashboard');
  const resDashYUpdate = await reqY(`/dashboards/${dashXId}?workspaceId=${wsX}`, 'put', { name: 'Hacked' });
  console.log('Dashboard Update Cross-Tenant:', resDashYUpdate.status === 403 || resDashYUpdate.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resDashYUpdate.status})`);

  console.log('5. User Y attempts to fetch User X\'s analytics summary');
  const resAnalY = await reqY(`/analytics/summary?workspaceId=${wsX}`, 'get');
  console.log('Analytics Access Cross-Tenant:', resAnalY.status === 403 || resAnalY.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resAnalY.status})`);

  mongoose.disconnect();
}

runTest().catch(console.error);
