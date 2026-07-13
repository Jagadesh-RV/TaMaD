const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({ where: { userId: req.user.id } });
    res.json({ tags });
  } catch(err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, color = '#6366f1' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const tag = await prisma.tag.create({
      data: { name, color, userId: req.user.id }
    });
    res.status(201).json({ tag });
  } catch(err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    await prisma.tag.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: {
        ...(name && { name }),
        ...(color && { color })
      }
    });
    res.json({ message: 'Updated' });
  } catch(err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.tag.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ message: 'Deleted' });
  } catch(err) { next(err); }
});

module.exports = router;