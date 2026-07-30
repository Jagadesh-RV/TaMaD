export const checkMeetingPermissions = (role: string, action: string) => {
  if (role === 'host') return true;
  if (role === 'viewer' && ['mute', 'video', 'screenshare'].includes(action)) return false;
  return true;
};
