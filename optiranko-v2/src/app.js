const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { errorHandler } = require('./middlewares/error.middleware');

// Import Routes
const authRoutes = require('./modules/auth/auth.routes');
const websiteRoutes = require('./modules/websites/website.routes');
const auditRoutes = require('./modules/audits/audit.routes');
const planRoutes = require('./modules/plans/plan.routes');
const orgRoutes = require('./modules/organizations/org.routes'); 

const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/websites', websiteRoutes);
app.use('/api/v1/audits', auditRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/organizations', orgRoutes);

app.use((req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use(errorHandler);

module.exports = app;