const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function toPublicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

function sign(user) {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, config.jwtSecret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone, city, country, bio } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, phone, city, country, bio },
  });
  res.status(201).json({ token: sign(user), user: toPublicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: sign(user), user: toPublicUser(user) });
});

// Mocked — no SMTP in a hackathon build, just acknowledges the request.
router.post('/forgot-password', async (req, res) => {
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(toPublicUser(user));
});

module.exports = router;
