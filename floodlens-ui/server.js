const express = require("C:/Flood Predicting Model/flood-prediction-backend/node_modules/express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.all("/api/ml/*", (req, res) => {
  const ML_URL = process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000";
  const targetUrl = new URL(req.originalUrl, ML_URL);
  fetch(targetUrl, { method: req.method, body: req.body ? JSON.stringify(req.body) : undefined, headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => res.json(data))
    .catch(err => res.status(502).json({ error: err.message }));
});

app.all("/api/backend/*", (req, res) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  const targetUrl = new URL(req.originalUrl.replace("/api/backend", ""), BACKEND_URL);
  fetch(targetUrl, { method: req.method, body: req.body ? JSON.stringify(req.body) : undefined, headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => res.json(data))
    .catch(err => res.status(502).json({ error: err.message }));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  🌊 FloodLens Umeed AI running at http://localhost:${PORT}`);
  console.log(`  📡 ML Service: ${process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000"}`);
  console.log(`  🔗 Backend: ${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}\n`);
});
