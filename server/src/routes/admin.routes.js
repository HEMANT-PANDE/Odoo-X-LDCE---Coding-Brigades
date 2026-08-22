const express = require('express');
const prisma = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('id', validateIntParam('id'));
router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, isAdmin: true, createdAt: true, _count: { select: { trips: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

router.get('/stats/popular-cities', async (req, res) => {
  const grouped = await prisma.tripStop.groupBy({ by: ['cityId'], _count: { cityId: true }, orderBy: { _count: { cityId: 'desc' } }, take: 10 });
  const cities = await prisma.city.findMany({ where: { id: { in: grouped.map((g) => g.cityId) } } });
  res.json(grouped.map((g) => ({ city: cities.find((c) => c.id === g.cityId), tripCount: g._count.cityId })));
});

router.get('/stats/popular-activities', async (req, res) => {
  const grouped = await prisma.tripStopActivity.groupBy({ by: ['activityId'], _count: { activityId: true }, orderBy: { _count: { activityId: 'desc' } }, take: 10 });
  const activities = await prisma.activity.findMany({ where: { id: { in: grouped.map((g) => g.activityId) } } });
  res.json(grouped.map((g) => ({ activity: activities.find((a) => a.id === g.activityId), bookingCount: g._count.activityId })));
});

router.get('/stats/trends', async (req, res) => {
  const [userCount, tripCount, postCount, recentUsers, recentTrips] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.communityPost.count(),
    prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.trip.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
  ]);
  res.json({
    userCount, tripCount, postCount,
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
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
}

module.exports = router;
