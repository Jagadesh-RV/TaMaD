const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        tags: {
          create: [
            { name: 'Work', color: '#6366f1' },
            { name: 'Personal', color: '#f43f5e' },
            { name: 'Health', color: '#22c55e' },
            { name: 'Learning', color: '#f59e0b' },
          ]
        },
        workspaces: {
          create: {
            role: 'owner',
            workspace: {
              create: {
                name: 'Personal Workspace',
                description: 'Default personal workspace'
              }
            }
          }
        }
      },
      select: { id: true, name: true, email: true, avatar: true, theme: true, timezone: true }
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) { next(err); }
});

// Me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatar: true, theme: true, timezone: true }
    });
    res.json({ user });
  } catch (err) { next(err); }
});

// Update profile
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { name, theme, timezone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(theme && { theme }),
        ...(timezone && { timezone })
      },
      select: { id: true, name: true, email: true, avatar: true, theme: true, timezone: true }
    });
    res.json({ user });
  } catch (err) { next(err); }
});

module.exports = router;