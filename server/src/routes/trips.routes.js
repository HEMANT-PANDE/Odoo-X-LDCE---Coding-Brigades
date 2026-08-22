const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));

function tripStatus(trip) {
  const now = new Date();
  if (new Date(trip.endDate) < now) return 'completed';
  if (new Date(trip.startDate) > now) return 'upcoming';
  return 'ongoing';
}

const stopsInclude = { stops: { orderBy: { sortOrder: 'asc' }, include: { city: true, activities: { include: { activity: true } } } } };

router.get('/', requireAuth, async (req, res) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user.id },
    include: { stops: { select: { id: true } } },
    orderBy: { startDate: 'asc' },
  });
  res.json(
    trips.map((t) => ({ ...t, stopCount: t.stops.length, stops: undefined, status: tripStatus(t) }))
  );
});

router.post('/', requireAuth, async (req, res) => {
  const { name, startDate, endDate, description, coverPhotoUrl, totalBudget } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'name, startDate and endDate are required' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'endDate must be on or after startDate' });
  }
  const trip = await prisma.trip.create({
    data: { userId: req.user.id, name, startDate: new Date(startDate), endDate: new Date(endDate), description, coverPhotoUrl, totalBudget },
  });
  res.status(201).json(trip);
});

router.get('/:id', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({ where: { id: Number(req.params.id), userId: req.user.id }, include: stopsInclude });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ ...trip, status: tripStatus(trip) });
});

router.put('/:id', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { name, startDate, endDate, description, coverPhotoUrl, totalBudget, budgetTransportPerStop, budgetStayPerDay, budgetMealsPerDay } = req.body;
  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: {
      name, description, coverPhotoUrl, totalBudget, budgetTransportPerStop, budgetStayPerDay, budgetMealsPerDay,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    },
  });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  await prisma.trip.delete({ where: { id: trip.id } });
  res.status(204).end();
});

module.exports = router;
