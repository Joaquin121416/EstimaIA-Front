// server.js — sirve el build de Angular en Railway
const express = require('express');
const path = require('path');
const app = express();

const dist = path.join(__dirname, 'dist/estimaia-front/browser');

app.use(express.static(dist));
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EstimaIA Front running on port ${PORT}`));
