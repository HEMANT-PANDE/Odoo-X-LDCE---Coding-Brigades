const express = require('express');
const prisma = require('../db');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));

router.get('/', async (req, res) => {
  const { cityId, category, maxCost, maxDuration, search } = req.query;
  const activities = await prisma.activity.findMany({
    where: {
      ...(cityId ? { cityId: Number(cityId) } : {}),
      ...(category ? { category: String(category) } : {}),
      ...(maxCost ? { cost: { lte: Number(maxCost) } } : {}),
      ...(maxDuration ? { durationHours: { lte: Number(maxDuration) } } : {}),
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
    },
    include: { city: true },
    orderBy: { name: 'asc' },
  });
  res.json(activities);
});

router.get('/:id', async (req, res) => {
  const activity = await prisma.activity.findUnique({ where: { id: Number(req.params.id) }, include: { city: true } });
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(activity);
});

module.exports = router;
