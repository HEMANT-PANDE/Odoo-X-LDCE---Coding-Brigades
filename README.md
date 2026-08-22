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
| DB access | `pg` + parameterized SQL |
| Auth | `bcrypt` + `jsonwebtoken` (Bearer header) |
| Frontend routing | `react-router-dom` |
| HTTP client | native `fetch` |
| Charts | `recharts` |
| Dates | native `Date` + `date-fns` |

## Seed Data

`server/db/seed.sql` — ~20-25 cities (global + a few India-region ones), ~5-8
activities per city across all categories. Static INSERTs, run once via `psql -f seed.sql`.

## Build Order (~24-36h, 2-4 people)

1. **Setup** (~1-1.5h) — scaffold client/server, Postgres up, run `schema.sql`.
2. **Auth + Trip CRUD** (hrs 1-8) — first demoable slice: signup → login → create trip → My Trips.
3. **Itinerary Builder + City/Activity Search** (hrs 8-18) — add stops, assign activities.
4. **Itinerary View + Budget** (hrs 18-26) — day-wise view, budget breakdown + charts.
5. **Polish + Demo Prep** (hrs 26-36) — seed variety, empty states, bug fixes, demo script.

## Verification

- `psql`: confirm FK cascades and date-range CHECK constraints.
- Manual pass: signup → login → create trip → add 2+ stops → assign activities → view
  itinerary → view budget → re-login and confirm persistence.
- Smoke-test each API route, especially `GET /api/trips/:id` and
  `GET /api/trips/:tripId/budget`.
