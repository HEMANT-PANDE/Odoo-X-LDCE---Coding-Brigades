const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

// Mounted at /api — routes carry their own /trips/:tripId/stops and /stops prefixes.
const router = express.Router();

async function ownedTrip(tripId, userId) {
  return prisma.trip.findFirst({ where: { id: Number(tripId), userId } });
}

function withinTripDates(trip, startDate, endDate) {
  return new Date(startDate) >= new Date(trip.startDate) && new Date(endDate) <= new Date(trip.endDate);
}

router.get('/trips/:tripId/stops', requireAuth, async (req, res) => {
  const trip = await ownedTrip(req.params.tripId, req.user.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const stops = await prisma.tripStop.findMany({
    where: { tripId: trip.id },
    orderBy: { sortOrder: 'asc' },
    include: { city: true, activities: { include: { activity: true } } },
  });
  res.json(stops);
});

router.post('/trips/:tripId/stops', requireAuth, async (req, res) => {
  const trip = await ownedTrip(req.params.tripId, req.user.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const { cityId, startDate, endDate } = req.body;
  if (!cityId || !startDate || !endDate) return res.status(400).json({ error: 'cityId, startDate and endDate are required' });
  if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ error: 'endDate must be on or after startDate' });
  if (!withinTripDates(trip, startDate, endDate)) return res.status(400).json({ error: 'Stop dates must fall within the trip dates' });

  const count = await prisma.tripStop.count({ where: { tripId: trip.id } });
  const stop = await prisma.tripStop.create({
    data: { tripId: trip.id, cityId: Number(cityId), startDate: new Date(startDate), endDate: new Date(endDate), sortOrder: count },
    include: { city: true, activities: true },
  });
  res.status(201).json(stop);
});

router.put('/stops/:id', requireAuth, async (req, res) => {
  const stop = await prisma.tripStop.findUnique({ where: { id: Number(req.params.id) }, include: { trip: true } });
  if (!stop || stop.trip.userId !== req.user.id) return res.status(404).json({ error: 'Stop not found' });

  const { startDate, endDate, sortOrder } = req.body;
  const nextStart = startDate ?? stop.startDate;
  const nextEnd = endDate ?? stop.endDate;
  if (new Date(nextEnd) < new Date(nextStart)) return res.status(400).json({ error: 'endDate must be on or after startDate' });
  if (!withinTripDates(stop.trip, nextStart, nextEnd)) return res.status(400).json({ error: 'Stop dates must fall within the trip dates' });

  const updated = await prisma.tripStop.update({
    where: { id: stop.id },
    data: {
      sortOrder,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    },
    include: { city: true },
  });
  res.json(updated);
});

router.delete('/stops/:id', requireAuth, async (req, res) => {
  const stop = await prisma.tripStop.findUnique({ where: { id: Number(req.params.id) }, include: { trip: true } });
  if (!stop || stop.trip.userId !== req.user.id) return res.status(404).json({ error: 'Stop not found' });
  await prisma.tripStop.delete({ where: { id: stop.id } });
  res.status(204).end();
});

module.exports = router;
