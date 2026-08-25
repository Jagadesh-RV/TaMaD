import logger from '../../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const triggerMeetingAutomation = async (event: string, payload: any) => {
  logger.info(`Automation Event: ${event}`, payload);
  // Implementation for n8n integration here
};
