const express = require('express');
const prisma = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));
router.use(requireAuth, requireAdmin);

// ── USER MANAGEMENT ──
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      country: true,
      photoUrl: true,
      role: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { trips: true, posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.put('/users/:id/role', async (req, res) => {
  const targetId = Number(req.params.id);
  const { role } = req.body;
  if (!['SUPER_ADMIN', 'AGENCY_ADMIN', 'TRAVELER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own admin role' });
  }
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isAdmin = role === 'SUPER_ADMIN' || role === 'AGENCY_ADMIN';
  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role, isAdmin },
    select: { id: true, role: true, isAdmin: true },
  });
  res.json(updated);
});

router.put('/users/:id/toggle-admin', async (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own admin role' });
  }
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const nextIsAdmin = !user.isAdmin;
  const nextRole = nextIsAdmin ? 'AGENCY_ADMIN' : 'TRAVELER';
  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isAdmin: nextIsAdmin, role: nextRole },
    select: { id: true, role: true, isAdmin: nextIsAdmin },
  });
  res.json(updated);
});

router.delete('/users/:id', async (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account from admin dashboard' });
  }
  await prisma.user.delete({ where: { id: targetId } });
  res.status(204).end();
});

// ── TRIP MANAGEMENT ──
router.get('/trips', async (req, res) => {
  const trips = await prisma.trip.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { stops: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(
    trips.map((t) => ({
      ...t,
      stopCount: t._count.stops,
      _count: undefined,
    }))
  );
});

router.post('/trips', async (req, res) => {
  const { userId, name, startDate, endDate, description, coverPhotoUrl, totalBudget } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'Trip name, startDate, and endDate are required' });
  }
  const targetUserId = userId ? Number(userId) : req.user.id;
  const trip = await prisma.trip.create({
    data: {
      userId: targetUserId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      coverPhotoUrl,
      totalBudget: totalBudget ? Number(totalBudget) : null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  res.status(201).json(trip);
});

router.put('/trips/:id', async (req, res) => {
  const tripId = Number(req.params.id);
  const { name, startDate, endDate, description, coverPhotoUrl, totalBudget } = req.body;
  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...(name ? { name } : {}),
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(coverPhotoUrl !== undefined ? { coverPhotoUrl } : {}),
      ...(totalBudget !== undefined ? { totalBudget: totalBudget ? Number(totalBudget) : null } : {}),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  res.json(updated);
});

router.delete('/trips/:id', async (req, res) => {
  const tripId = Number(req.params.id);
  await prisma.trip.delete({ where: { id: tripId } });
  res.status(204).end();
});

// ── COMMUNITY MODERATION ──
router.get('/community', async (req, res) => {
  const posts = await prisma.communityPost.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, photoUrl: true } },
      trip: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

router.delete('/community/:id', async (req, res) => {
  const postId = Number(req.params.id);
  await prisma.communityPost.delete({ where: { id: postId } });
  res.status(204).end();
});

// ── CITIES CATALOG MANAGEMENT ──
router.get('/cities', async (req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { popularity: 'desc' },
    include: { _count: { select: { stops: true, activities: true } } },
  });
  res.json(cities);
});

router.post('/cities', async (req, res) => {
  const { name, country, region, costIndex, popularity, imageUrl } = req.body;
  if (!name || !country || !costIndex) {
    return res.status(400).json({ error: 'City name, country, and costIndex are required' });
  }
  const city = await prisma.city.create({
    data: {
      name,
      country,
      region,
      costIndex: Number(costIndex),
      popularity: popularity ? Number(popularity) : 0,
      imageUrl,
    },
  });
  res.status(201).json(city);
});

router.put('/cities/:id', async (req, res) => {
  const cityId = Number(req.params.id);
  const { name, country, region, costIndex, popularity, imageUrl } = req.body;
  const updated = await prisma.city.update({
    where: { id: cityId },
    data: {
      ...(name ? { name } : {}),
      ...(country ? { country } : {}),
      ...(region !== undefined ? { region } : {}),
      ...(costIndex !== undefined ? { costIndex: Number(costIndex) } : {}),
      ...(popularity !== undefined ? { popularity: Number(popularity) } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
  });
  res.json(updated);
});

router.delete('/cities/:id', async (req, res) => {
  const cityId = Number(req.params.id);
  await prisma.city.delete({ where: { id: cityId } });
  res.status(204).end();
});

// ── ACTIVITIES CATALOG MANAGEMENT ──
router.get('/activities', async (req, res) => {
  const activities = await prisma.activity.findMany({
    include: {
      city: { select: { id: true, name: true, country: true } },
      _count: { select: { stopActivities: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json(activities);
});

router.post('/activities', async (req, res) => {
  const { cityId, name, description, category, cost, durationHours, imageUrl } = req.body;
  if (!cityId || !name || !category) {
    return res.status(400).json({ error: 'cityId, activity name, and category are required' });
  }
  const activity = await prisma.activity.create({
    data: {
      cityId: Number(cityId),
      name,
      description,
      category,
      cost: cost ? Number(cost) : 0,
      durationHours: durationHours ? Number(durationHours) : 1,
      imageUrl,
    },
    include: { city: { select: { id: true, name: true, country: true } } },
  });
  res.status(201).json(activity);
});

router.delete('/activities/:id', async (req, res) => {
  const activityId = Number(req.params.id);
  await prisma.activity.delete({ where: { id: activityId } });
  res.status(204).end();
});

// ── STATS & TRENDS ──
router.get('/stats/popular-cities', async (req, res) => {
  const grouped = await prisma.tripStop.groupBy({
    by: ['cityId'],
    _count: { cityId: true },
    orderBy: { _count: { cityId: 'desc' } },
    take: 10,
  });
  const cities = await prisma.city.findMany({
    where: { id: { in: grouped.map((g) => g.cityId) } },
  });
  res.json(
    grouped.map((g) => ({
      city: cities.find((c) => c.id === g.cityId),
      tripCount: g._count.cityId,
    }))
  );
});

router.get('/stats/popular-activities', async (req, res) => {
  const grouped = await prisma.tripStopActivity.groupBy({
    by: ['activityId'],
    _count: { activityId: true },
    orderBy: { _count: { activityId: 'desc' } },
    take: 10,
  });
  const activities = await prisma.activity.findMany({
    where: { id: { in: grouped.map((g) => g.activityId) } },
    include: { city: { select: { name: true, country: true } } },
  });
  res.json(
    grouped.map((g) => ({
      activity: activities.find((a) => a.id === g.activityId),
      bookingCount: g._count.activityId,
    }))
  );
});

router.get('/stats/trends', async (req, res) => {
  const [userCount, tripCount, postCount, stopCount, activityBookingCount, recentUsers, recentTrips] =
    await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.communityPost.count(),
      prisma.tripStop.count(),
      prisma.tripStopActivity.count(),
      prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.trip.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
    ]);

  res.json({
    userCount,
    tripCount,
    postCount,
    stopCount,
    activityBookingCount,
    signupsByDay: bucketByDay(recentUsers.map((u) => u.createdAt)),
    tripsByDay: bucketByDay(recentTrips.map((t) => t.createdAt)),
  });
});

function bucketByDay(dates) {
  const counts = {};
  for (const d of dates) {
    const key = new Date(d).toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

module.exports = router;
