const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/me', requireAuth, async (req, res) => {
  const { firstName, lastName, phone, city, country, bio, photoUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, city, country, bio, photoUrl },
  });
  const { passwordHash, ...rest } = user;
  res.json(rest);
});

router.delete('/me', requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  res.status(204).end();
});

module.exports = router;
