require("dotenv").config();
const express = require("express");
const cors = require("cors");

// 1. Importation des routes (on les créera juste après)
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const equipementRoutes = require("./routes/equipementsRoutes");

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Route de test
app.get("/", (req, res) => {
  res.send("Serveur Workly opérationnel !");
});

// 2. Utilisation des routes spécialisées
// Toutes les routes définies dans roomRoutes commenceront par /api/rooms
app.use("/api/rooms", roomRoutes);

app.use("/api/users", userRoutes);

app.use("/api/equipements", equipementRoutes);

// --- LANCEMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur : http://localhost:${PORT}`);
});
