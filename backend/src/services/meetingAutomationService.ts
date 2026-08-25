import Meeting from '../models/Meeting';
import MeetingTranscript from '../models/MeetingTranscript';
import MeetingActionItem from '../models/MeetingActionItem';
import mongoose from 'mongoose';
import { io } from '../index';

import { dispatchN8nWebhook } from './n8nService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const triggerN8NMeetingWorkflow = async (event: string, meetingData: any) => {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    await dispatchN8nWebhook(n8nWebhookUrl, event, meetingData);
  } else {
    console.log(`[MeetingAutomation] n8n URL not configured. Event: ${event}`);
  }
};

export const generateMockAISummary = async (meetingId: mongoose.Types.ObjectId) => {
  // In production, this would use the existing AI module to summarize MeetingTranscript
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return;

  const mockSummary = "The team discussed the upcoming sprint goals and resolved the architecture blockers. Next steps are to finalize the database schema and review UI mockups.";
  meeting.aiSummary = mockSummary;
  await meeting.save();

  // Mock extracting action items
  await MeetingActionItem.create({
    meetingId,
    text: "Finalize database schema",
    status: 'pending'
  });

  // Notify team
  io.to(`team_${meeting.teamId}`).emit('meeting_summary_ready', { meetingId: meeting._id });

  await triggerN8NMeetingWorkflow('MEETING_ENDED', { meetingId, summary: mockSummary });
};
