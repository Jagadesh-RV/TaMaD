import User from '../models/User';

export const seedAdmin = async () => {
  const existing = await User.findOne({ email: 'admin@tamad.app' });
  if (existing) return;

  await User.create({
    name: 'Admin User',
    email: 'admin@tamad.app',
    password: 'ChangeMe123!',
    role: 'admin',
    preferences: { theme: 'system', language: 'en', timezone: 'UTC' },
  });
};
