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
  const { name, startDate, endDate, description, coverPhotoUrl, totalBudget, isPublic } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'name, startDate and endDate are required' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'endDate must be on or after startDate' });
  }
  const trip = await prisma.trip.create({
    data: { userId: req.user.id, name, startDate: new Date(startDate), endDate: new Date(endDate), description, coverPhotoUrl, totalBudget, isPublic: !!isPublic },
  });
  res.status(201).json(trip);
});

// Read-only discovery feed of other users' public trips ("Featured Expeditions"), not the owner's own edit view.
router.get('/public', requireAuth, async (req, res) => {
  const trips = await prisma.trip.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { firstName: true, lastName: true, photoUrl: true } },
      stops: { orderBy: { sortOrder: 'asc' }, select: { id: true, city: { select: { name: true, country: true } } } },
    },
    orderBy: { startDate: 'asc' },
  });
  res.json(trips.map((t) => ({
    ...t,
    stopCount: t.stops.length,
    location: t.stops[0]?.city ? `${t.stops[0].city.name}, ${t.stops[0].city.country}` : null,
    stops: undefined,
    status: tripStatus(t),
  })));
});

// No requireAuth — this is the actual sharable public link, viewable by anyone with the URL.
router.get('/public/:id', async (req, res) => {
  const trip = await prisma.trip.findFirst({
    where: { id: Number(req.params.id), isPublic: true },
    include: { ...stopsInclude, user: { select: { firstName: true, lastName: true, photoUrl: true } } },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ ...trip, status: tripStatus(trip) });
});

// Clone a public (or your own) trip into your account as a private, editable draft.
router.post('/:id/copy', requireAuth, async (req, res) => {
  const source = await prisma.trip.findFirst({
    where: { id: Number(req.params.id), OR: [{ userId: req.user.id }, { isPublic: true }] },
    include: { stops: { include: { activities: true } } },
  });
  if (!source) return res.status(404).json({ error: 'Trip not found' });

  const copy = await prisma.trip.create({
    data: {
      userId: req.user.id,
      name: `${source.name} (Copy)`,
      startDate: source.startDate,
      endDate: source.endDate,
      description: source.description,
      coverPhotoUrl: source.coverPhotoUrl,
      totalBudget: source.totalBudget,
      budgetTransportPerStop: source.budgetTransportPerStop,
      budgetStayPerDay: source.budgetStayPerDay,
      budgetMealsPerDay: source.budgetMealsPerDay,
      stops: {
        create: source.stops.map((s) => ({
          cityId: s.cityId,
          startDate: s.startDate,
          endDate: s.endDate,
          sortOrder: s.sortOrder,
          activities: {
            create: s.activities.map((a) => ({
              activityId: a.activityId,
              scheduledDate: a.scheduledDate,
              scheduledTime: a.scheduledTime,
              costOverride: a.costOverride,
              notes: a.notes,
            })),
          },
        })),
      },
    },
  });
  res.status(201).json(copy);
});

router.get('/:id', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({
    where: { id: Number(req.params.id), OR: [{ userId: req.user.id }, { isPublic: true }] },
    include: stopsInclude,
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ ...trip, status: tripStatus(trip) });
});

router.put('/:id', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { name, startDate, endDate, description, coverPhotoUrl, totalBudget, budgetTransportPerStop, budgetStayPerDay, budgetMealsPerDay, isPublic } = req.body;
  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: {
      name, description, coverPhotoUrl, totalBudget, budgetTransportPerStop, budgetStayPerDay, budgetMealsPerDay,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      ...(isPublic !== undefined ? { isPublic: !!isPublic } : {}),
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
