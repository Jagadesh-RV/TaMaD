const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_tamad_2026';

async function testAutomationCreate() {
  await mongoose.connect('mongodb://localhost:27017/tamad');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Workspace = mongoose.model('Workspace', new mongoose.Schema({}, { strict: false }));
  
  // Find a user who is in a workspace
  const workspace = await Workspace.findOne({ type: 'team' }).lean();
  if (!workspace) {
    console.log("No workspace found");
    process.exit(1);
  }
  
  const memberId = workspace.members[0].userId;
  const user = await User.findById(memberId).lean();
  
  const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
  
  console.log(`Workspace ID: ${workspace._id.toString()}`);
  console.log(`User ID: ${user._id.toString()}`);
  
  const payload = {
      workspaceId: workspace._id.toString(),
      name: 'Notify on Urgent tasks',
      isActive: true,
      trigger: {
        event: 'TASK_CREATED',
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' }
        ]
      },
      action: {
        type: 'SEND_NOTIFICATION',
        payload: { message: 'A new high priority task was added!' }
      }
    };
    
  try {
    const response = await fetch('http://localhost:5002/api/v1/automations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
  
  mongoose.disconnect();
}

testAutomationCreate();
