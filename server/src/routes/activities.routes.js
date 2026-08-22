const express = require('express');
const prisma = require('../db');
const config = require('../config');
const { fetchLiveActivities } = require('../services/places');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));

const LIVE_TOPUP_THRESHOLD = 5;

router.get('/', async (req, res) => {
  const { cityId, category, maxCost, maxDuration, search } = req.query;
  const catalog = await prisma.activity.findMany({
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
  const results = catalog.map((a) => ({ ...a, source: 'catalog' }));

  const wantsLive = cityId && (config.activitySource === 'dynamic' || (config.activitySource === 'hybrid' && results.length < LIVE_TOPUP_THRESHOLD));
  if (wantsLive) {
    const city = await prisma.city.findUnique({ where: { id: Number(cityId) } });
    if (city) {
      let live = await fetchLiveActivities(city, { category: category || undefined });
      const known = new Set(results.map((a) => a.name.toLowerCase()));
      live = live.filter((a) => !known.has(a.name.toLowerCase()));
      if (maxCost) live = live.filter((a) => a.cost <= Number(maxCost));
      if (maxDuration) live = live.filter((a) => a.durationHours <= Number(maxDuration));
      if (search) live = live.filter((a) => a.name.toLowerCase().includes(String(search).toLowerCase()));
      results.push(...live.map((a) => ({ ...a, city })));
    }
  }

  res.json(results);
});

router.get('/:id', async (req, res) => {
  const activity = await prisma.activity.findUnique({ where: { id: Number(req.params.id) }, include: { city: true } });
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(activity);
});

module.exports = router;
