import axios from 'axios';
import crypto from 'crypto';

// Map of events to workspace webhook URLs
// In a real production system, this would be stored in the database under Workspace Settings.
// For now, we will provide a generic method to dispatch events to a user-provided webhook.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dispatchN8nWebhook = async (webhookUrl: string, event: string, payload: any) => {
  if (!webhookUrl) return;

  try {
    const timestamp = new Date().toISOString();
    const data = { event, payload, timestamp };
    const body = JSON.stringify(data);
    
    const secret = process.env.N8N_WEBHOOK_SECRET || '';
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-TaMaD-Signature': signature,
        'X-TaMaD-Timestamp': timestamp
      }
    });
    console.log(`[n8n] Successfully dispatched event ${event} to ${webhookUrl}`);
  } catch (_error) {
    console.error(`[n8n] Failed to dispatch event ${event}:`, error.message);
  }
};
