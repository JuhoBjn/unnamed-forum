const express = require('express');

const app = express();

app.use(express.json());

app.get('/healthcheck', (req, res) => {
  res.status(200).send('Healthcheck OK');
});

const authRouter = require('./routes/auth');
app.use('/', authRouter);

module.exports = app;
