const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/trips', require('./routes/trips.routes'));
app.use('/api', require('./routes/stops.routes')); // /trips/:tripId/stops, /stops/:id
app.use('/api', require('./routes/stopActivities.routes')); // /stops/:stopId/activities, /stop-activities/:id
app.use('/api', require('./routes/budget.routes')); // /trips/:tripId/budget
app.use('/api/cities', require('./routes/cities.routes'));
app.use('/api/activities', require('./routes/activities.routes'));
app.use('/api/community', require('./routes/community.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Centralized error handler — catches thrown/rejected errors from any route above.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => console.log(`Server listening on http://localhost:${config.port}`));
