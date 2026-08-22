const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));

router.get('/', async (req, res) => {
  const { search } = req.query;
  const posts = await prisma.communityPost.findMany({
    where: search ? { content: { contains: String(search), mode: 'insensitive' } } : {},
    include: { user: { select: { id: true, firstName: true, lastName: true, photoUrl: true } }, trip: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

router.post('/', requireAuth, async (req, res) => {
  const { content, imageUrl, tripId } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required' });
  const post = await prisma.communityPost.create({
    data: { userId: req.user.id, content, imageUrl, tripId: tripId ? Number(tripId) : null },
    include: { user: { select: { id: true, firstName: true, lastName: true, photoUrl: true } }, trip: { select: { id: true, name: true } } },
  });
  res.status(201).json(post);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const post = await prisma.communityPost.findUnique({ where: { id: Number(req.params.id) } });
  if (!post || post.userId !== req.user.id) return res.status(404).json({ error: 'Post not found' });
  await prisma.communityPost.delete({ where: { id: post.id } });
  res.status(204).end();
});

module.exports = router;
