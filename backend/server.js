import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appDataRouter from './routes/appData.js';
import analyzeRouter from './routes/analyze.js';
import historyRouter from './routes/history.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    // Also allow any vercel.app subdomain and the exact production URL
    if (
      allowed.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.railway.app')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// Increase default request timeout to 3 minutes for long AI analysis calls
app.use((req, res, next) => {
  res.setTimeout(180000, () => {
    res.status(503).json({ error: 'Request timed out. Please try again.' });
  });
  next();
});

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/app', appDataRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ASO Comparator API running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 ASO Comparator API running on http://localhost:${PORT}`);
  console.log(`📊 Ready to analyze apps!`);
});
