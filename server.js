const express = require('express');
const app = express();
app.use(express.json());

let lobbies = {};

// Clean up old lobbies every 10 seconds
setInterval(() => {
  const now = Date.now();
  Object.keys(lobbies).forEach((key) => {
    // Keep lobbies alive for 60 seconds (60000 ms) without a heartbeat
    if (now - lobbies[key].lastSeen > 60000) {
      console.log(`Deleting expired lobby: ${key}`);
      delete lobbies[key];
    }
  });
}, 10000);

// Register or update a lobby
app.post('/register', (req, res) => {
  const { id, host, port, name, extra } = req.body;
  if (!id || !host || !port || !name) {
    console.warn("Received malformed register request:", req.body);
    return res.status(400).json({ error: "Missing fields" });
  }
  lobbies[id] = { id, host, port, name, extra: extra || null, lastSeen: Date.now() };
  console.log(`Registered/Updated lobby: ${id}, Name: ${name}, Host: ${host}:${port}, Extra: ${extra || 'N/A'}`);
  res.json({ ok: true });
});

// Get all active lobbies
app.get('/lobbies', (req, res) => {
  const activeLobbies = Object.values(lobbies);
  console.log(`Returning ${activeLobbies.length} lobbies.`);
  res.json(activeLobbies); // Returns a direct array, not wrapped in { list: [] }
});

// NEW: Unregister a lobby
app.delete('/unregister/:id', (req, res) => {
  const lobbyIdToDelete = req.params.id;
  if (lobbies[lobbyIdToDelete]) {
    delete lobbies[lobbyIdToDelete];
    console.log(`Unregistered lobby: ${lobbyIdToDelete}`);
    res.json({ ok: true, message: `Lobby ${lobbyIdToDelete} unregistered.` });
  } else {
    console.warn(`Attempted to unregister non-existent lobby: ${lobbyIdToDelete}`);
    res.status(404).json({ error: "Lobby not found" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lobby server running on port ${PORT}`));