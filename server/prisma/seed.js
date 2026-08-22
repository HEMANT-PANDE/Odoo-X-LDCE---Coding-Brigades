// Seed the catalog tables (cities, activities) with demo data, plus one admin account.
// Run: npm run prisma:seed
const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// name, country, region, costIndex (relative avg daily cost), popularity, imageUrl
// Photos are real Wikimedia Commons images, fetched via Wikipedia's public REST API (no key needed).
const CITIES = [
  ['Paris', 'France', 'Western Europe', 180, 98, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg'],
  ['Rome', 'Italy', 'Southern Europe', 150, 92, 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg'],
  ['Barcelona', 'Spain', 'Southern Europe', 140, 88, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/1280px-Evening_light_over_Barcelona.jpg'],
  ['London', 'United Kingdom', 'Western Europe', 200, 95, 'https://upload.wikimedia.org/wikipedia/commons/6/67/London_Skyline_%28125508655%29.jpeg'],
  ['Amsterdam', 'Netherlands', 'Western Europe', 170, 80, 'https://upload.wikimedia.org/wikipedia/commons/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png'],
  ['Prague', 'Czech Republic', 'Eastern Europe', 90, 70, 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Prague_%286365119737%29.jpg'],
  ['Tokyo', 'Japan', 'East Asia', 190, 97, 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg'],
  ['Bangkok', 'Thailand', 'Southeast Asia', 60, 85, 'https://upload.wikimedia.org/wikipedia/commons/7/7d/4Y1A1159_Bangkok_%2833536795515%29.jpg'],
  ['Bali', 'Indonesia', 'Southeast Asia', 55, 90, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Kuta_Beach_%286924448550%29.jpg/1280px-Kuta_Beach_%286924448550%29.jpg'],
  ['Singapore', 'Singapore', 'Southeast Asia', 175, 82, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/1280px-Marina_Bay_Sands_%28I%29.jpg'],
  ['Dubai', 'UAE', 'Middle East', 210, 89, 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/1280px-Burj_Khalifa_2021.jpg'],
  ['New York', 'USA', 'North America', 230, 96, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/1280px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg'],
  ['San Francisco', 'USA', 'North America', 220, 78, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zeppelin-ride-020100925-195_%285029394846%29.jpg/1280px-Zeppelin-ride-020100925-195_%285029394846%29.jpg'],
  ['Sydney', 'Australia', 'Oceania', 195, 84, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/1280px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg'],
  ['Cape Town', 'South Africa', 'Africa', 80, 75, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Camps_bay_%2853460319478%29_%28cropped%29.jpg/1280px-Camps_bay_%2853460319478%29_%28cropped%29.jpg'],
  ['Rio de Janeiro', 'Brazil', 'South America', 95, 77, 'https://upload.wikimedia.org/wikipedia/commons/9/98/Cidade_Maravilhosa.jpg'],
  ['Jaipur', 'India', 'South Asia', 35, 83, 'https://upload.wikimedia.org/wikipedia/commons/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg'],
  ['Goa', 'India', 'South Asia', 40, 88, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/1280px-BeachFun.jpg'],
  ['Mumbai', 'India', 'South Asia', 50, 81, 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg'],
  ['Manali', 'India', 'South Asia', 30, 72, 'https://upload.wikimedia.org/wikipedia/commons/0/03/Manali_City.jpg'],
  ['Kyoto', 'Japan', 'East Asia', 160, 86, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kyoto%2C_Japan_%2849667780482%29.jpg/1280px-Kyoto%2C_Japan_%2849667780482%29.jpg'],
  ['Istanbul', 'Turkey', 'Middle East', 65, 79, 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Historical_peninsula_and_modern_skyline_of_Istanbul.jpg'],
  ['Vienna', 'Austria', 'Central Europe', 165, 76, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Schoenbrunn_philharmoniker_2012.jpg/1280px-Schoenbrunn_philharmoniker_2012.jpg'],
  ['Reykjavik', 'Iceland', 'Northern Europe', 200, 68, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg/1280px-Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg'],
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
  for (const [name, country, region, costIndex, popularity, imageUrl] of CITIES) {
    const city = await prisma.city.upsert({
      where: { name },
      update: { country, region, costIndex, popularity, imageUrl },
      create: { name, country, region, costIndex, popularity, imageUrl },
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
      })),
    });
  }
  console.log(`Seeded ${CITIES.length} cities with ${CITIES.length * CATEGORY_TEMPLATES.length} activities.`);

  // 1. Super Admin Account
  const superAdminEmail = 'superadmin@globetrotter.dev';
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: 'SUPER_ADMIN', isAdmin: true },
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
      isAdmin: true,
    },
  });

  // Legacy fallback admin@globetrotter.dev -> Super Admin as well
  await prisma.user.upsert({
    where: { email: 'admin@globetrotter.dev' },
    update: { role: 'SUPER_ADMIN', isAdmin: true },
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@globetrotter.dev',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
      isAdmin: true,
    },
  });

  // 2. Agency Admin Account
  const agencyEmail = 'agency@globetrotter.dev';
  await prisma.user.upsert({
    where: { email: agencyEmail },
    update: { role: 'AGENCY_ADMIN', isAdmin: true },
    create: {
      firstName: 'Agency',
      lastName: 'Planner',
      email: agencyEmail,
      passwordHash: await bcrypt.hash('agency123', 10),
      role: 'AGENCY_ADMIN',
      isAdmin: true,
    },
  });

  // 3. Demo Traveler Account
  const travelerEmail = 'traveler@globetrotter.dev';
  await prisma.user.upsert({
    where: { email: travelerEmail },
    update: { role: 'TRAVELER', isAdmin: false },
    create: {
      firstName: 'Alex',
      lastName: 'Traveler',
      email: travelerEmail,
      passwordHash: await bcrypt.hash('traveler123', 10),
      role: 'TRAVELER',
      isAdmin: false,
    },
  });

  console.log(`Seeded Role Hierarchy Accounts:
  - Super Admin: ${superAdminEmail} / admin123
  - Agency Admin: ${agencyEmail} / agency123
  - Traveler: ${travelerEmail} / traveler123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
