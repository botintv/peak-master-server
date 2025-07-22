const express = require('express');
const app = express();
app.use(express.json());

let lobbies = {};

setInterval(() => {
  const now = Date.now();
  Object.keys(lobbies).forEach((key) => {
    if (now - lobbies[key].lastSeen > 60000) delete lobbies[key];
  });
}, 10000);

app.post('/register', (req, res) => {
  const { id, host, port, name, extra } = req.body;
  if (!id || !host || !port || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }
  lobbies[id] = { id, host, port, name, extra: extra || null, lastSeen: Date.now() };
  res.json({ ok: true });
});

app.get('/lobbies', (req, res) => {
  res.json(Object.values(lobbies));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lobby server running on port ${PORT}`));