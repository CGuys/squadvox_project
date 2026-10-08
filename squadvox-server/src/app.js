require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/squadvox/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ code: 404, msg: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ code: 500, msg: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`SquadVox Server is running on port ${port}`);
});
