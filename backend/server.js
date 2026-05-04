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
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
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

// 3 minute timeout for long AI analysis calls
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

// AppTweak health check
app.get('/api/health/apptweak', async (req, res) => {
  try {
    const response = await fetch(
      'https://public-api.apptweak.com/api/public/store/apps/metadata.json?apps=284882215&country=in&language=en&device=iphone',
      {
        headers: {
          'x-apptweak-key': process.env.APPTWEAK_KEY,
          'accept': 'application/json',
          'accept-encoding': 'identity',
        }
      }
    );
    const data = await response.json();
    const appData = data.result?.['284882215']?.metadata;
    if (response.ok && appData) {
      res.json({ status: '✅ AppTweak working', testApp: appData.title, httpStatus: response.status });
    } else {
      res.json({ status: '❌ Bad response', httpStatus: response.status, raw: JSON.stringify(data).slice(0, 300) });
    }
  } catch (err) {
    res.json({ status: '❌ Failed', error: err.message });
  }
});

// Test route — delete after debugging is done
app.get('/api/test-moneyview', async (req, res) => {
  try {
    const response = await fetch(
      'https://public-api.apptweak.com/api/public/store/apps/metadata.json?apps=6468976019&country=in&language=en&device=iphone',
      { headers: { 'x-apptweak-key': process.env.APPTWEAK_KEY, 'accept': 'application/json', 'accept-encoding': 'identity' } }
    );
    const text = await response.text();
    res.json({
      status: response.status,
      keySet: !!process.env.APPTWEAK_KEY,
      rawResponse: text.slice(0, 1000)
    });
  } catch (err) {
    res.json({ error: err.message });
  }
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
