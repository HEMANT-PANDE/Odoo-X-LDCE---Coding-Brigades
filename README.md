# GlobeTrotter

Personalized multi-city travel planning app — Odoo X LDCE Hackathon.

Built to the official mockup (`GlobeTrotter - 8 hours.png`), which is richer than the
original problem-statement PDF: it adds a Community feed and a fuller registration
form, and organizes trip listing/admin around specific tabs. All 12 mockup screens are
implemented, full stack.

## Stack

- Frontend: React (Vite) + Tailwind v4 + shadcn/ui (`base-nova` style, Base UI
  primitives, not Radix) + lucide-react icons + Google Sans, light theme only
- Backend: Node.js + Express
- Database: PostgreSQL via Prisma (v6 — v7 requires driver adapters, more moving parts
  than a hackathon needs)

### Design system

Brand palette lives in `client/src/index.css` as CSS variables (`--primary: #525ea7`,
`--accent: #ffc349`, plus `#5facd3`/`#97dde9` for chart tones 3-4). No dark-mode
variant — deliberately light-only per the brand. shadcn components are generated
source (not an npm package) in `client/src/components/ui/*` — edit them directly
rather than reinstalling. Buttons/menu-items that act as router links use Base UI's
`render={<Link .../>}` prop instead of Radix's `asChild`.

## Pages (all built)

1. Login, 2. Registration (+ Forgot Password), 3. Dashboard, 4. Create Trip,
5. Itinerary Builder ("Sections" = city stops + activities), 6. My Trips
(Ongoing/Upcoming/Completed), 7. Profile (edit + preplanned/previous trips),
8. Search (city + activity, tabbed), 9. Itinerary View (day-wise, with a Budget page),
10. Community (post/browse trip experiences), 11. Calendar (month view of trips),
12. Admin (manage users, popular cities/activities, trends — admin-only).

Simplifications from the mockup, called out rather than silently built:
- Community has no likes/comments — just post + browse + delete-own.
- No drag-to-reorder in the builder; stops keep creation order.
- Itinerary "Sections" are still backed by a real city + date range (not freeform
  text) — needed to satisfy the relational-DB requirement.

## Database Schema (`server/prisma/schema.prisma`)

- `User` — firstName, lastName, email (unique), phone, city, country, bio, photoUrl,
  passwordHash, isAdmin, createdAt
- `City` — seeded catalog: name, country, region, costIndex, popularity, imageUrl
- `Activity` — seeded catalog, scoped to a city: name, description, category, cost,
  durationHours, imageUrl
- `Trip` — userId (FK), name, startDate, endDate, description, coverPhotoUrl, optional
  budget overrides (transport/stay/meals per unit), totalBudget
- `TripStop` — a city visited within a trip, its own date range, sortOrder
- `TripStopActivity` — an activity scheduled into a stop: scheduledDate/Time,
  costOverride, notes
- `CommunityPost` — userId (FK), optional tripId (FK), content, imageUrl, createdAt

FKs cascade delete down the tree (trip → stops → stop_activities). Date-range validity
(stop within trip, activity within stop) is checked in route handlers, not DB
triggers. Budget is computed on read from stops + activities, never stored.

## API

```
Auth:       POST /api/auth/signup, /login, /forgot-password (mocked), GET /me
Users:      PUT/DELETE /api/users/me
Trips:      GET/POST /api/trips, GET/PUT/DELETE /api/trips/:id   (status: ongoing/upcoming/completed)
Stops:      GET/POST /api/trips/:tripId/stops, PUT/DELETE /api/stops/:id
Stop-acts:  GET/POST /api/stops/:stopId/activities, PUT/DELETE /api/stop-activities/:id
Cities:     GET /api/cities?search=&country=&region=&sort=
Activities: GET /api/activities?cityId=&category=&maxCost=&maxDuration=
Budget:     GET /api/trips/:tripId/budget
Community:  GET/POST /api/community, DELETE /api/community/:id
Admin:      GET /api/admin/users, DELETE /api/admin/users/:id,
            GET /api/admin/stats/{popular-cities,popular-activities,trends}   (isAdmin only)
```

`GET /api/trips/:id` returns the full nested tree (stops → city, activities → activity)
— feeds the Itinerary Builder, Itinerary View, and Calendar.

## Folder Structure

```
/server
  src/db.js, config.js
  src/middleware/auth.js         -- requireAuth, requireAdmin
  src/services/budget.js         -- pure computeBudget()
  src/routes/*.routes.js
  src/index.js
  prisma/schema.prisma, prisma/seed.js
/client
  src/api/client.js
  src/context/AuthContext.jsx
  src/components/   -- Navbar, TripCard, ProtectedRoute, AdminRoute, Modal, CityPicker, ActivityPicker
  src/pages/        -- Login, Signup, ForgotPassword, Dashboard, CreateTrip, MyTrips,
                       ItineraryBuilder, ItineraryView, Budget, Search, Profile,
                       Community, Calendar, Admin
  src/App.jsx, main.jsx
```

CityPicker/ActivityPicker are shared components — used as modals inside the Itinerary
Builder and as the full-page Search screen.

## Libraries

| Concern | Choice |
|---|---|
| DB access | Prisma (v6, `prisma-client-js` generator — plain CommonJS output) |
| Auth | `bcrypt` + `jsonwebtoken` (Bearer header) |
| Frontend routing | `react-router-dom` |
| HTTP client | native `fetch` |
| Charts | `recharts` |
| Dates | native `Date` (+ `date-fns` if range math gets hairy) |

## Seed Data

`server/prisma/seed.js` — 24 cities (global + a few India-region ones) × 5 activities
each (one per category), plus one admin account (`admin@globetrotter.dev` /
`admin123`) for testing the Admin pages. Run via `npm run prisma:seed`.

## Setup

1. Put a real Postgres connection string in `server/.env` → `DATABASE_URL`.
2. `cd server && npm run prisma:migrate && npm run prisma:seed`
3. `npm run dev` from the repo root (runs client + server together).

Everything else (scaffolding, schema, all 12 pages, all routes) is already built.

## Hour-by-Hour Plan (8-hour hackathon, 4 people)

| Hour | Hemant (backend: auth/trips/budget) | Krish (backend: catalog/stops) | Banshari (frontend: auth/trips) | Jainee (frontend: builder/budget) |
|---|---|---|---|---|
| 1 | DB connect, `prisma:migrate` + `prisma:seed`, confirm server boots | Review schema + seed via Prisma Studio | `npm install` client, confirm it boots, review routes | Agree on API payload shapes with backend pair |
| 2 | Verify auth API against Login/Signup pages | Verify cities/activities API against Search page | Wire up Login/Signup/ForgotPassword end-to-end | Wire CityPicker/ActivityPicker against live API |
| 3 | Verify trips API against Dashboard/MyTrips/CreateTrip | Verify stops API against Itinerary Builder | Polish Dashboard, MyTrips, CreateTrip | Polish Itinerary Builder (Add Stop flow) |
| 4 | Verify budget API/calc against real seeded trips | Verify stop-activities API | Polish ItineraryView (day-wise) | Polish activity assignment in the builder |
| 5 | Add Community backend edge cases | Add Admin stats edge cases | Build/polish Profile page | Build/polish Budget page charts |
| 6 | Cross-test Admin panel | Cross-test Community + Calendar | Cross-test all frontend flows | Cross-test builder → view → budget flow |
| 7 | Full team: run-through, cross-test each other's flows, fix bugs, styling pass, confirm demo path end-to-end |
| 8 | Drives the screen recording, narrates | Preps clean demo trip data, watches for live bugs | Wrote/times the 5-min demo script beforehand | Edits/trims recording, exports, handles submission |

## Verification

- Prisma Studio (`npm run prisma:studio`): confirm cascade deletes and that route-level
  date-range validation rejects bad input.
- Manual pass: signup → login → create trip → add 2+ stops → assign activities → view
  itinerary → view budget → post to Community → check Calendar → (as admin) check
  Admin panel → re-login and confirm persistence.
- Smoke-test each API route, especially `GET /api/trips/:id`,
  `GET /api/trips/:tripId/budget`, and the `/api/admin/*` routes (401/403 without a
  valid admin token).
