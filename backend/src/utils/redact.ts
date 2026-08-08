export const redactConnectionString = (uri?: string): string => {
  if (!uri) return '(not configured)';
  try {
    const parsed = new URL(uri);
    if (parsed.username || parsed.password) {
      parsed.username = '';
      parsed.password = '';
    }
    return parsed.toString();
  } catch {
    return '(invalid uri)';
  }
};
