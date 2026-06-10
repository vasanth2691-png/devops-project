require('dotenv').config();
const express = require('express');
const path = require('path');
const { checkDbHealth } = require('./db');

const app = express();
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/health', async (_req, res) => {
  try {
    await checkDbHealth();
    res.status(200).json({
      status: 'ok',
      app: 'up',
      db: 'up',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      app: 'up',
      db: 'down',
      error: error.message
    });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/info', (_req, res) => {
  res.json({
    message: 'DevOps sample API running',
    docs: ['/', '/health', '/api/info']
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

module.exports = app;
