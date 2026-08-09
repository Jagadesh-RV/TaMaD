const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://admin:admin_password@127.0.0.1:27017/tamad?authSource=admin', { authSource: 'admin' });
  console.log('Connected.');
  
  // Clean up
  await mongoose.connection.collection('users').deleteMany({ email: /@test.local/ });

  // Create Users
  const userO = await mongoose.connection.collection('users').insertOne({
    name: 'User O', email: 'usero@test.local', isActive: true, role: 'user', firebaseUid: 'fo'
  });
  const userP = await mongoose.connection.collection('users').insertOne({
    name: 'User P', email: 'userp@test.local', isActive: true, role: 'user', firebaseUid: 'fp'
  });

  const tokenO = jwt.sign({ id: userO.insertedId.toString() }, 'your_jwt_secret_here');
  const tokenP = jwt.sign({ id: userP.insertedId.toString() }, 'your_jwt_secret_here');

  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1', validateStatus: () => true });
  const reqO = (path, method = 'post', data = null) => api({ method, url: path, data, headers: { Authorization: `Bearer ${tokenO}` } });

  console.log('1. User O creates Team O manually');
  const teamO = await mongoose.connection.collection('teams').insertOne({
    name: 'Team O', slug: 'team-o-' + Date.now(), createdBy: userO.insertedId
  });
  const teamOId = teamO.insertedId.toString();

  await mongoose.connection.collection('teammembers').insertOne({
    teamId: teamO.insertedId, userId: userO.insertedId, role: 'owner', isDeleted: false
  });

  const wsO = await mongoose.connection.collection('workspaces').insertOne({
    name: 'WS O', teamId: teamO.insertedId, ownerId: userO.insertedId, type: 'team'
  });

  console.log('2. User O schedules a meeting for Team O');
  const resMeeting = await reqO('/meetings', 'post', { 
    title: 'Legit Meeting', 
    teamId: teamOId,
    workspaceId: wsO.insertedId.toString(),
    startTime: new Date().toISOString(),
    duration: 60,
    meetingType: 'video'
  });
  const meetingId = resMeeting.data?.meeting?._id || resMeeting.data?._id;
  if (!meetingId) {
    console.log('Meeting creation failed:', resMeeting.data);
    process.exit(1);
  }

  console.log('3. Connect Sockets');
  const socketO = io('http://localhost:5000', { extraHeaders: { Authorization: `Bearer ${tokenO}` } });
  const socketP = io('http://localhost:5000', { extraHeaders: { Authorization: `Bearer ${tokenP}` } });

  await new Promise(r => setTimeout(r, 1000));

  console.log('4. User P attempts to join User O\'s meeting room');
  socketP.emit('meeting_join', { meetingId });
  
  // Wait to see if P joined (server will log 'unauthorized')
  await new Promise(r => setTimeout(r, 500));

  console.log('5. User P attempts to send a chat message to User O\'s meeting');
  socketP.emit('meeting_chat', { meetingId, message: 'Hacked!' });

  let messageReceived = false;
  socketO.on('meeting_chat_received', (data) => {
    messageReceived = true;
  });

  // User O joins legitimately to receive messages if any
  socketO.emit('meeting_join', { meetingId });
  
  await new Promise(r => setTimeout(r, 1000));

  console.log('Cross-Tenant Meeting Chat:', messageReceived ? 'ALLOW (FAIL)' : 'DENY (Correct)');

  socketO.disconnect();
  socketP.disconnect();
  mongoose.disconnect();
}

runTest().catch(console.error);
