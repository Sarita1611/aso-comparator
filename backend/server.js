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
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

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
