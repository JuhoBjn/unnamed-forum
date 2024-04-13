const express = require('express');

const app = express();

app.use(express.json());

app.get('/healtcheck', (req, res) => {
  res.status(200).send('Pulsecheck OK');
});

module.exports = app;
