// Seed the catalog tables (cities, activities) with demo data, plus one admin account.
// Run: npm run prisma:seed
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// name, country, region, costIndex (relative avg daily cost), popularity
const CITIES = [
  ['Paris', 'France', 'Western Europe', 180, 98],
  ['Rome', 'Italy', 'Southern Europe', 150, 92],
  ['Barcelona', 'Spain', 'Southern Europe', 140, 88],
  ['London', 'United Kingdom', 'Western Europe', 200, 95],
  ['Amsterdam', 'Netherlands', 'Western Europe', 170, 80],
  ['Prague', 'Czech Republic', 'Eastern Europe', 90, 70],
  ['Tokyo', 'Japan', 'East Asia', 190, 97],
  ['Bangkok', 'Thailand', 'Southeast Asia', 60, 85],
  ['Bali', 'Indonesia', 'Southeast Asia', 55, 90],
  ['Singapore', 'Singapore', 'Southeast Asia', 175, 82],
  ['Dubai', 'UAE', 'Middle East', 210, 89],
  ['New York', 'USA', 'North America', 230, 96],
  ['San Francisco', 'USA', 'North America', 220, 78],
  ['Sydney', 'Australia', 'Oceania', 195, 84],
  ['Cape Town', 'South Africa', 'Africa', 80, 75],
  ['Rio de Janeiro', 'Brazil', 'South America', 95, 77],
  ['Jaipur', 'India', 'South Asia', 35, 83],
  ['Goa', 'India', 'South Asia', 40, 88],
  ['Mumbai', 'India', 'South Asia', 50, 81],
  ['Manali', 'India', 'South Asia', 30, 72],
  ['Kyoto', 'Japan', 'East Asia', 160, 86],
  ['Istanbul', 'Turkey', 'Middle East', 65, 79],
  ['Vienna', 'Austria', 'Central Europe', 165, 76],
  ['Reykjavik', 'Iceland', 'Northern Europe', 200, 68],
];

// One activity template per category; cost scales with the city's cost index.
const CATEGORY_TEMPLATES = [
  ['sightseeing', (c) => `${c} Landmarks Walking Tour`, 'Guided walk through the city\'s must-see sights.', 0.15, 3],
  ['food', (c) => `${c} Local Food Tasting`, 'Sample signature local dishes with a small group.', 0.12, 2],
  ['adventure', (c) => `${c} Adventure Excursion`, 'Outdoor half-day adventure activity near the city.', 0.25, 4],
  ['culture', (c) => `${c} Museum & Heritage Tour`, 'Visit top museums and heritage sites.', 0.1, 2.5],
  ['relaxation', (c) => `${c} Sunset Cruise`, 'Relaxed evening cruise with skyline views.', 0.2, 2],
];

async function main() {
  console.log('Seeding cities...');
  for (const [name, country, region, costIndex, popularity] of CITIES) {
    const city = await prisma.city.create({
      data: { name, country, region, costIndex, popularity },
    });
    await prisma.activity.createMany({
      data: CATEGORY_TEMPLATES.map(([category, nameFn, description, costFactor, durationHours]) => ({
        cityId: city.id,
        name: nameFn(name),
        description,
        category,
        cost: Math.round(costIndex * costFactor * 100) / 100,
        durationHours,
      })),
    });
  }
  console.log(`Seeded ${CITIES.length} cities with ${CITIES.length * CATEGORY_TEMPLATES.length} activities.`);

  const adminEmail = 'admin@globetrotter.dev';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Admin', lastName: 'User', email: adminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      isAdmin: true,
    },
  });
  console.log(`Seeded admin account: ${adminEmail} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
