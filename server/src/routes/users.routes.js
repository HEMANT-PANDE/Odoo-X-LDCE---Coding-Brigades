const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/me', requireAuth, async (req, res) => {
  const { firstName, lastName, email, phone, city, country, bio, photoUrl, language } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, email, phone, city, country, bio, photoUrl, language },
  });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

router.get('/me/destinations', requireAuth, async (req, res) => {
  const destinations = await prisma.savedDestination.findMany({
    where: { userId: req.user.id },
    include: { city: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(destinations);
});

router.post('/me/destinations', requireAuth, async (req, res) => {
  const cityId = Number(req.body.cityId);
  if (!Number.isInteger(cityId)) return res.status(400).json({ error: 'A valid cityId is required' });
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) return res.status(404).json({ error: 'City not found' });
  const destination = await prisma.savedDestination.upsert({
    where: { userId_cityId: { userId: req.user.id, cityId } },
    update: {},
    create: { userId: req.user.id, cityId },
    include: { city: true },
  });
  res.status(201).json(destination);
});

router.delete('/me/destinations/:cityId', requireAuth, async (req, res) => {
  const cityId = Number(req.params.cityId);
  if (!Number.isInteger(cityId)) return res.status(400).json({ error: 'A valid cityId is required' });
  await prisma.savedDestination.deleteMany({ where: { userId: req.user.id, cityId } });
  res.status(204).end();
});

router.delete('/me', requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  res.status(204).end();
});

module.exports = router;
