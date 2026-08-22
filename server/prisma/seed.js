// Seed the catalog tables (cities, activities) with demo data, plus one admin account
// and one demo multi-city trip (full day-by-day schedule, for exercising the itinerary view).
// Run: npm run prisma:seed
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// name, country, region, costIndex (relative avg daily cost), popularity, lat, lng
const CITIES = [
  ['Paris', 'France', 'Western Europe', 180, 98, 48.8566, 2.3522],
  ['Rome', 'Italy', 'Southern Europe', 150, 92, 41.9028, 12.4964],
  ['Barcelona', 'Spain', 'Southern Europe', 140, 88, 41.3874, 2.1686],
  ['London', 'United Kingdom', 'Western Europe', 200, 95, 51.5074, -0.1278],
  ['Amsterdam', 'Netherlands', 'Western Europe', 170, 80, 52.3676, 4.9041],
  ['Prague', 'Czech Republic', 'Eastern Europe', 90, 70, 50.0755, 14.4378],
  ['Tokyo', 'Japan', 'East Asia', 190, 97, 35.6762, 139.6503],
  ['Bangkok', 'Thailand', 'Southeast Asia', 60, 85, 13.7563, 100.5018],
  ['Bali', 'Indonesia', 'Southeast Asia', 55, 90, -8.65, 115.2167],
  ['Singapore', 'Singapore', 'Southeast Asia', 175, 82, 1.3521, 103.8198],
  ['Dubai', 'UAE', 'Middle East', 210, 89, 25.2048, 55.2708],
  ['New York', 'USA', 'North America', 230, 96, 40.7128, -74.006],
  ['San Francisco', 'USA', 'North America', 220, 78, 37.7749, -122.4194],
  ['Sydney', 'Australia', 'Oceania', 195, 84, -33.8688, 151.2093],
  ['Cape Town', 'South Africa', 'Africa', 80, 75, -33.9249, 18.4241],
  ['Rio de Janeiro', 'Brazil', 'South America', 95, 77, -22.9068, -43.1729],
  ['Jaipur', 'India', 'South Asia', 35, 83, 26.9124, 75.7873],
  ['Goa', 'India', 'South Asia', 40, 88, 15.4909, 73.8278],
  ['Mumbai', 'India', 'South Asia', 50, 81, 19.076, 72.8777],
  ['Manali', 'India', 'South Asia', 30, 72, 32.2432, 77.1892],
  ['Kyoto', 'Japan', 'East Asia', 160, 86, 35.0116, 135.7681],
  ['Istanbul', 'Turkey', 'Middle East', 65, 79, 41.0082, 28.9784],
  ['Vienna', 'Austria', 'Central Europe', 165, 76, 48.2082, 16.3738],
  ['Reykjavik', 'Iceland', 'Northern Europe', 200, 68, 64.1466, -21.9426],
];

// One activity template per category; cost scales with the city's cost index.
const CATEGORY_TEMPLATES = [
  ['sightseeing', (c) => `${c} Landmarks Walking Tour`, 'Guided walk through the city\'s must-see sights.', 0.15, 3],
  ['food', (c) => `${c} Local Food Tasting`, 'Sample signature local dishes with a small group.', 0.12, 2],
  ['adventure', (c) => `${c} Adventure Excursion`, 'Outdoor half-day adventure activity near the city.', 0.25, 4],
  ['culture', (c) => `${c} Museum & Heritage Tour`, 'Visit top museums and heritage sites.', 0.1, 2.5],
  ['relaxation', (c) => `${c} Sunset Cruise`, 'Relaxed evening cruise with skyline views.', 0.2, 2],
];

function d(dateStr) {
  return new Date(dateStr);
}

async function main() {
  console.log('Seeding cities...');
  for (const [name, country, region, costIndex, popularity, lat, lng] of CITIES) {
    const city = await prisma.city.create({
      data: { name, country, region, costIndex, popularity, lat, lng },
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
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Admin', lastName: 'User', email: adminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      isAdmin: true,
    },
  });
  console.log(`Seeded admin account: ${adminEmail} / admin123`);

  // Demo route: Paris -> Rome -> Barcelona, 8 days, one activity booked per day
  // (except one day left free) so the Itinerary View's full day-by-day iteration has real data.
  const demoStops = [
    { city: 'Paris', startDate: '2026-09-15', endDate: '2026-09-17' },
    { city: 'Rome', startDate: '2026-09-18', endDate: '2026-09-19' },
    { city: 'Barcelona', startDate: '2026-09-20', endDate: '2026-09-22' },
  ];
  const cities = await prisma.city.findMany({
    where: { name: { in: demoStops.map((s) => s.city) } },
    include: { activities: true },
  });
  const cityByName = Object.fromEntries(cities.map((c) => [c.name, c]));

  const demoTrip = await prisma.trip.create({
    data: {
      userId: admin.id,
      name: 'Classic Western Europe Loop',
      startDate: d('2026-09-15'),
      endDate: d('2026-09-22'),
      description: 'Demo route showing a full day-by-day schedule across three city stops.',
      totalBudget: 3500,
    },
  });

  let sortOrder = 0;
  for (const { city: cityName, startDate, endDate } of demoStops) {
    const city = cityByName[cityName];
    const stop = await prisma.tripStop.create({
      data: { tripId: demoTrip.id, cityId: city.id, startDate: d(startDate), endDate: d(endDate), sortOrder: sortOrder++ },
    });

    const days = [];
    for (let dt = d(startDate); dt <= d(endDate); dt.setDate(dt.getDate() + 1)) days.push(new Date(dt));

    let activityIndex = 0;
    for (const day of days) {
      // Skip Rome's second day on purpose — demonstrates the "free day" placeholder.
      if (cityName === 'Rome' && day.toISOString().slice(0, 10) === '2026-09-19') continue;
      const activity = city.activities[activityIndex % city.activities.length];
      activityIndex++;
      await prisma.tripStopActivity.create({
        data: { tripStopId: stop.id, activityId: activity.id, scheduledDate: day },
      });
    }
  }
  console.log(`Seeded demo trip "${demoTrip.name}" (trip #${demoTrip.id}) with a full multi-city day-by-day schedule.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
