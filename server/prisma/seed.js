// Seed the catalog tables (cities, activities) with demo data, plus one admin account
// and one demo multi-city trip (full day-by-day schedule, for exercising the itinerary view).
// Run: npm run prisma:seed
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// name, country, region, costIndex (relative avg daily cost), popularity, imageUrl, lat, lng
// Photos are real Wikimedia Commons images, fetched via Wikipedia's public REST API (no key needed).
const CITIES = [
  ['Paris', 'France', 'Western Europe', 180, 98, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg', 48.8566, 2.3522],
  ['Rome', 'Italy', 'Southern Europe', 150, 92, 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg', 41.9028, 12.4964],
  ['Barcelona', 'Spain', 'Southern Europe', 140, 88, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/1280px-Evening_light_over_Barcelona.jpg', 41.3874, 2.1686],
  ['London', 'United Kingdom', 'Western Europe', 200, 95, 'https://upload.wikimedia.org/wikipedia/commons/6/67/London_Skyline_%28125508655%29.jpeg', 51.5074, -0.1278],
  ['Amsterdam', 'Netherlands', 'Western Europe', 170, 80, 'https://upload.wikimedia.org/wikipedia/commons/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png', 52.3676, 4.9041],
  ['Prague', 'Czech Republic', 'Eastern Europe', 90, 70, 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Prague_%286365119737%29.jpg', 50.0755, 14.4378],
  ['Tokyo', 'Japan', 'East Asia', 190, 97, 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg', 35.6762, 139.6503],
  ['Bangkok', 'Thailand', 'Southeast Asia', 60, 85, 'https://upload.wikimedia.org/wikipedia/commons/7/7d/4Y1A1159_Bangkok_%2833536795515%29.jpg', 13.7563, 100.5018],
  ['Bali', 'Indonesia', 'Southeast Asia', 55, 90, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Kuta_Beach_%286924448550%29.jpg/1280px-Kuta_Beach_%286924448550%29.jpg', -8.65, 115.2167],
  ['Singapore', 'Singapore', 'Southeast Asia', 175, 82, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/1280px-Marina_Bay_Sands_%28I%29.jpg', 1.3521, 103.8198],
  ['Dubai', 'UAE', 'Middle East', 210, 89, 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/1280px-Burj_Khalifa_2021.jpg', 25.2048, 55.2708],
  ['New York', 'USA', 'North America', 230, 96, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/1280px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg', 40.7128, -74.006],
  ['San Francisco', 'USA', 'North America', 220, 78, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zeppelin-ride-020100925-195_%285029394846%29.jpg/1280px-Zeppelin-ride-020100925-195_%285029394846%29.jpg', 37.7749, -122.4194],
  ['Sydney', 'Australia', 'Oceania', 195, 84, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/1280px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg', -33.8688, 151.2093],
  ['Cape Town', 'South Africa', 'Africa', 80, 75, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Camps_bay_%2853460319478%29_%28cropped%29.jpg/1280px-Camps_bay_%2853460319478%29_%28cropped%29.jpg', -33.9249, 18.4241],
  ['Rio de Janeiro', 'Brazil', 'South America', 95, 77, 'https://upload.wikimedia.org/wikipedia/commons/9/98/Cidade_Maravilhosa.jpg', -22.9068, -43.1729],
  ['Jaipur', 'India', 'South Asia', 35, 83, 'https://upload.wikimedia.org/wikipedia/commons/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg', 26.9124, 75.7873],
  ['Goa', 'India', 'South Asia', 40, 88, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/1280px-BeachFun.jpg', 15.4909, 73.8278],
  ['Mumbai', 'India', 'South Asia', 50, 81, 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg', 19.076, 72.8777],
  ['Manali', 'India', 'South Asia', 30, 72, 'https://upload.wikimedia.org/wikipedia/commons/0/03/Manali_City.jpg', 32.2432, 77.1892],
  ['Kyoto', 'Japan', 'East Asia', 160, 86, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kyoto%2C_Japan_%2849667780482%29.jpg/1280px-Kyoto%2C_Japan_%2849667780482%29.jpg', 35.0116, 135.7681],
  ['Istanbul', 'Turkey', 'Middle East', 65, 79, 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Historical_peninsula_and_modern_skyline_of_Istanbul.jpg', 41.0082, 28.9784],
  ['Vienna', 'Austria', 'Central Europe', 165, 76, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Schoenbrunn_philharmoniker_2012.jpg/1280px-Schoenbrunn_philharmoniker_2012.jpg', 48.2082, 16.3738],
  ['Reykjavik', 'Iceland', 'Northern Europe', 200, 68, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg/1280px-Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg', 64.1466, -21.9426],
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
  for (const [name, country, region, costIndex, popularity, imageUrl, lat, lng] of CITIES) {
    const city = await prisma.city.upsert({
      where: { name },
      update: { country, region, costIndex, popularity, imageUrl, lat, lng },
      create: { name, country, region, costIndex, popularity, imageUrl, lat, lng },
    });
    const activityCount = await prisma.activity.count({ where: { cityId: city.id } });
    if (activityCount > 0) continue; // already seeded — re-running shouldn't duplicate activities

    await prisma.activity.createMany({
      data: CATEGORY_TEMPLATES.map(([category, nameFn, description, costFactor, durationHours]) => ({
        cityId: city.id,
        name: nameFn(name),
        description,
        category,
        cost: Math.round(costIndex * costFactor * 100) / 100,
        durationHours,
        imageUrl, // no per-activity photos in this dataset — the city photo is a reasonable stand-in
      })),
    });
  }
  console.log(`Seeded ${CITIES.length} cities with ${CITIES.length * CATEGORY_TEMPLATES.length} activities.`);

  const adminEmail = 'admin@globetrotter.dev';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
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

  const existingDemoTrip = await prisma.trip.findFirst({ where: { userId: admin.id, name: 'Classic Western Europe Loop' } });
  const demoTrip = existingDemoTrip || await prisma.trip.create({
    data: {
      userId: admin.id,
      name: 'Classic Western Europe Loop',
      startDate: d('2026-09-15'),
      endDate: d('2026-09-22'),
      description: 'Demo route showing a full day-by-day schedule across three city stops.',
      totalBudget: 3500,
    },
  });

  if (!existingDemoTrip) {
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
  } else {
    console.log(`Demo trip "${demoTrip.name}" already exists (trip #${demoTrip.id}) — skipped.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
