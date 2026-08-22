const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { computeBudget } = require('../services/budget');
const { validateIntParam } = require('../middleware/params');

const router = express.Router();
router.param('tripId', validateIntParam('tripId'));

router.get('/trips/:tripId/budget', requireAuth, async (req, res) => {
  const trip = await prisma.trip.findFirst({
    where: { id: Number(req.params.tripId), userId: req.user.id },
    include: { stops: { include: { city: true, activities: { include: { activity: true } } } } },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(computeBudget(trip));
});

module.exports = router;
