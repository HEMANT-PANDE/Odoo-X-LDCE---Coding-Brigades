const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/mailer');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const router = express.Router();

function toPublicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

function sign(user) {
  const role = user.role || (user.isAdmin ? 'SUPER_ADMIN' : 'TRAVELER');
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin, role }, config.jwtSecret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone, city, country, bio, photoUrl } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, phone, city, country, bio, photoUrl },
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

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const genericResponse = { message: 'If that email exists, a reset link has been sent.' };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json(genericResponse);

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error('Failed to send password reset email:', err.message);
    return res.status(502).json({ error: 'Could not send reset email. Try again later.' });
  }

  res.json(genericResponse);
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token and password are required' });

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Reset link is invalid or has expired' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  res.json({ message: 'Password updated. You can now log in.' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(toPublicUser(user));
});

module.exports = router;
