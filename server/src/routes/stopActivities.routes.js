const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateIntParam } = require('../middleware/params');

// Mounted at /api — routes carry their own /stops/:stopId/activities and /stop-activities prefixes.
const router = express.Router();
router.param('stopId', validateIntParam('stopId'));
router.param('id', validateIntParam('id'));

async function ownedStop(stopId, userId) {
  const stop = await prisma.tripStop.findUnique({ where: { id: Number(stopId) }, include: { trip: true } });
  return stop && stop.trip.userId === userId ? stop : null;
}

function withinStopDates(stop, date) {
  return new Date(date) >= new Date(stop.startDate) && new Date(date) <= new Date(stop.endDate);
}

router.get('/stops/:stopId/activities', requireAuth, async (req, res) => {
  const stop = await ownedStop(req.params.stopId, req.user.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  const activities = await prisma.tripStopActivity.findMany({
    where: { tripStopId: stop.id },
    include: { activity: true },
    orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
  });
  res.json(activities);
});

router.post('/stops/:stopId/activities', requireAuth, async (req, res) => {
  const stop = await ownedStop(req.params.stopId, req.user.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const { activityId, scheduledDate, scheduledTime, costOverride, notes } = req.body;
  if (!activityId || !scheduledDate) return res.status(400).json({ error: 'activityId and scheduledDate are required' });
  if (!withinStopDates(stop, scheduledDate)) return res.status(400).json({ error: 'scheduledDate must fall within the stop dates' });

  const created = await prisma.tripStopActivity.create({
    data: {
      tripStopId: stop.id,
      activityId: Number(activityId),
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime ? new Date(`1970-01-01T${scheduledTime}`) : null,
      costOverride,
      notes,
    },
    include: { activity: true },
  });
  res.status(201).json(created);
});

router.put('/stop-activities/:id', requireAuth, async (req, res) => {
  const sa = await prisma.tripStopActivity.findUnique({ where: { id: Number(req.params.id) }, include: { tripStop: { include: { trip: true } } } });
  if (!sa || sa.tripStop.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });

  const { scheduledDate, scheduledTime, costOverride, notes } = req.body;
  if (scheduledDate && !withinStopDates(sa.tripStop, scheduledDate)) {
    return res.status(400).json({ error: 'scheduledDate must fall within the stop dates' });
  }
  const updated = await prisma.tripStopActivity.update({
    where: { id: sa.id },
    data: {
      costOverride, notes,
      ...(scheduledDate ? { scheduledDate: new Date(scheduledDate) } : {}),
      ...(scheduledTime ? { scheduledTime: new Date(`1970-01-01T${scheduledTime}`) } : {}),
    },
    include: { activity: true },
  });
  res.json(updated);
});

router.delete('/stop-activities/:id', requireAuth, async (req, res) => {
  const sa = await prisma.tripStopActivity.findUnique({ where: { id: Number(req.params.id) }, include: { tripStop: { include: { trip: true } } } });
  if (!sa || sa.tripStop.trip.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  await prisma.tripStopActivity.delete({ where: { id: sa.id } });
  res.status(204).end();
});

module.exports = router;
