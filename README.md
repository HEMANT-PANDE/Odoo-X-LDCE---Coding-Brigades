# GlobeTrotter

Personalized multi-city travel planning app — Odoo X LDCE Hackathon.

Plan and vision from `GlobeTrotter.pdf`. Users sign up, create a trip, add city stops
with dates, attach activities to each stop, and get a budget breakdown and itinerary
view. This repo currently has just the plan — build hasn't started.

## Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL

## Scope (MVP)

Building: auth, dashboard, create/list trips, itinerary builder (city + activity
search as picker modals), itinerary view, budget breakdown.

Stretch (post-MVP): drag-to-reorder, public shared itinerary link, user
profile/settings, admin/analytics dashboard.

## Database Schema

Six tables, raw SQL, no ORM:

- `users` — id, name, email (unique), password_hash, created_at
- `cities` — id, name, country, region, cost_index, popularity, image_url (seeded catalog)
- `activities` — id, city_id (FK), name, description, category, cost, duration_hours,
  image_url (seeded catalog, scoped to a city)
- `trips` — id, user_id (FK), name, start_date, end_date, description, cover_photo_url,
  optional budget overrides (`budget_transport_per_stop`, `budget_stay_per_day`,
  `budget_meals_per_day`, `total_budget`)
- `trip_stops` — id, trip_id (FK), city_id (FK), start_date, end_date, sort_order
- `trip_stop_activities` — id, trip_stop_id (FK), activity_id (FK), scheduled_date,
  scheduled_time, cost_override, notes

FKs cascade delete down the tree (trip → stops → stop_activities). Date-range validity
is checked in route handlers, not DB triggers. Budget is computed on read, not stored.

## API

```
Auth:       POST /api/auth/signup, /login, /forgot-password (mocked), GET /me
Trips:      GET/POST /api/trips, GET/PUT/DELETE /api/trips/:id
Stops:      GET/POST /api/trips/:tripId/stops, PUT/DELETE /api/stops/:id
Stop-acts:  GET/POST /api/stops/:stopId/activities, PUT/DELETE /api/stop-activities/:id
Cities:     GET /api/cities?search=&country=&region=&sort=
Activities: GET /api/activities?cityId=&category=&maxCost=&maxDuration=
Budget:     GET /api/trips/:tripId/budget
```

`GET /api/trips/:id` returns the full nested tree (stops + activities) — feeds both
the Itinerary Builder and Itinerary View screens.

## Folder Structure

```
/server
  src/db.js, config.js
  src/middleware/auth.js
  src/services/budget.js
  src/routes/*.routes.js
  src/index.js
  db/schema.sql, db/seed.sql
/client
  src/api/client.js
  src/context/AuthContext.jsx
  src/components/   -- Navbar, TripCard, ProtectedRoute, CityPicker, ActivityPicker, BudgetChart
  src/pages/        -- Login, Signup, Dashboard, CreateTrip, MyTrips, ItineraryBuilder, ItineraryView, Budget
  src/App.jsx, main.jsx
```

City/Activity Search are picker modals inside the Itinerary Builder, not standalone pages.

## Libraries

| Concern | Choice |
|---|---|
| DB access | Prisma (v6) + `@prisma/client` |
| Auth | `bcrypt` + `jsonwebtoken` (Bearer header) |
| Frontend routing | `react-router-dom` |
| HTTP client | native `fetch` |
| Charts | `recharts` |
| Dates | native `Date` + `date-fns` |

## Seed Data

`server/prisma/seed.js` — 24 cities (global + a few India-region ones) × 5 activities
each (one per category), generated from a small template. Run via `npm run prisma:seed`.

## Setup (already done)

Scaffolding, schema, and route/page skeletons are in place (see git history / prior
session). Before Phase 1 work: put a Postgres connection string in `server/.env`
(`DATABASE_URL`), then `cd server && npm run prisma:migrate && npm run prisma:seed`.

## Hour-by-Hour Plan (8-hour hackathon)

| Hour | Focus |
|---|---|
| 1 | Connect Postgres (`prisma:migrate` + `prisma:seed`), confirm client+server boot, split roles (backend/frontend). |
| 2 | Auth: signup/login API (bcrypt+JWT) + Login/Signup pages wired to it. |
| 3 | Trip CRUD API + CreateTrip, MyTrips, Dashboard wired to real data. |
| 4 | Itinerary Builder: stops API + Add Stop flow (CityPicker modal, date range). |
| 5 | Stop-activities API + ActivityPicker modal (filters, add/remove). |
| 6 | Budget calc API + Itinerary View (day-wise) + Budget page with recharts. |
| 7 | Polish: bug fixes, empty states, styling pass, error handling, full run-through. |
| 8 | Record and edit the 5-minute demo video; submit. |

## Verification

- Prisma Studio (`npm run prisma:studio`) or a query: confirm cascade deletes and
  date-range validation (checked in route handlers) reject bad input.
- Manual pass: signup → login → create trip → add 2+ stops → assign activities → view
  itinerary → view budget → re-login and confirm persistence.
- Smoke-test each API route, especially `GET /api/trips/:id` and
  `GET /api/trips/:tripId/budget`.
