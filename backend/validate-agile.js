const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });

  // Create Users A and B
  const userA = await mongoose.connection.collection('users').insertOne({
    name: 'User AA', email: 'useraa@test.local', isActive: true, role: 'user', firebaseUid: 'faa'
  });
  const userB = await mongoose.connection.collection('users').insertOne({
    name: 'User BB', email: 'userbb@test.local', isActive: true, role: 'user', firebaseUid: 'fbb'
  });

  const tokenA = jwt.sign({ id: userA.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenB = jwt.sign({ id: userB.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqA = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenA}` } });
  const reqB = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenB}` } });

  console.log('1. User A creates Workspace A');
  const resWsA = await reqA('/workspaces', 'post', { name: 'WS A', description: 'A' });
  const wsA = resWsA.data._id;

  console.log('2. User B creates Workspace B');
  const resWsB = await reqB('/workspaces', 'post', { name: 'WS B', description: 'B' });
  const wsB = resWsB.data._id;

  console.log('3. User A creates Epic in WS A');
  const resEpic = await reqA('/agile/epics', 'post', { name: 'Epic A', workspaceId: wsA });
  const epicId = resEpic.data._id;

  console.log('4. User B attempts to delete User A\'s Epic by passing their own workspaceId');
  const resDelEpic = await reqB(`/agile/epics/${epicId}?workspaceId=${wsB}`, 'delete');
  console.log('Epic Deletion Cross-Tenant:', resDelEpic.status === 403 || resDelEpic.status === 404 ? 'DENY (Correct)' : `ALLOW/FAIL (${resDelEpic.status})`);

  console.log('5. User A creates Task in WS A');
  const resTask = await reqA('/tasks', 'post', { title: 'Task A', workspaceId: wsA });
  const taskId = resTask.data._id;

  console.log('6. User A attempts to assign User B to Task A');
  const resAssign = await reqA(`/tasks/${taskId}`, 'put', { assignees: [userB.insertedId.toString()] });
  console.log('Task Assign Cross-Tenant:', resAssign.status === 403 ? 'DENY (Correct)' : `ALLOW/FAIL (${resAssign.status})`);

  console.log('7. User A attempts to move Task A to Workspace B');
  // Since User A is NOT a member of Workspace B, they shouldn't be able to move it. 
  // Even if they tried, our patch ignores workspaceId changes for tasks.
  const resMove = await reqA(`/tasks/${taskId}`, 'put', { workspaceId: wsB });
  // Since we just delete req.body.workspaceId, it should succeed but the workspaceId should remain wsA
  const taskAfterMove = await mongoose.connection.collection('tasks').findOne({ _id: new mongoose.Types.ObjectId(taskId) });
  console.log('Task Move Cross-Tenant:', taskAfterMove.workspaceId.toString() === wsA ? 'PREVENTED (Correct)' : 'ALLOWED (FAIL)');

  mongoose.disconnect();
}

runTest().catch(console.error);
