const express = require('express');
const prisma = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, country, region, sort } = req.query;
  const cities = await prisma.city.findMany({
    where: {
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      ...(country ? { country: { equals: String(country), mode: 'insensitive' } } : {}),
      ...(region ? { region: { equals: String(region), mode: 'insensitive' } } : {}),
    },
    orderBy: sort === 'name' ? { name: 'asc' } : { popularity: 'desc' },
  });
  res.json(cities);
});

router.get('/:id', async (req, res) => {
  const city = await prisma.city.findUnique({ where: { id: Number(req.params.id) } });
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
});

module.exports = router;
