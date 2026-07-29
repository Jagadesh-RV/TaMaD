import axios from 'axios';

// Map of events to workspace webhook URLs
// In a real production system, this would be stored in the database under Workspace Settings.
// For now, we will provide a generic method to dispatch events to a user-provided webhook.

export const dispatchN8nWebhook = async (webhookUrl: string, event: string, payload: any) => {
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      event,
      payload,
      timestamp: new Date().toISOString(),
    });
    console.log(`[n8n] Successfully dispatched event ${event} to ${webhookUrl}`);
  } catch (error: any) {
    console.error(`[n8n] Failed to dispatch event ${event}:`, error.message);
  }
};
