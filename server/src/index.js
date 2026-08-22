const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Feature routes are mounted here as each is built (Phase 1+):
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/trips', require('./routes/trips.routes'));
// app.use('/api/cities', require('./routes/cities.routes'));
// app.use('/api/activities', require('./routes/activities.routes'));

app.listen(config.port, () => console.log(`Server listening on http://localhost:${config.port}`));
