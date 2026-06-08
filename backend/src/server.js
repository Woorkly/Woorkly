const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

// 1. Importation des routes (on les créera juste après)


const equipementRoutes = require("./routes/equipementsRoutes");
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const typeRoutes = require('./routes/typeRoutes');
const autRoutes = require('./routes/authRoute');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// --- MIDDLEWARES ---
// Allow the frontend (Vite) to send/receive cookies (HttpOnly token)
// Permet d'autoriser localhost et TOUTES les URL de preview ou principales de Vercel
const allowedOrigins = [
  'http://localhost:5173',
  /^https:\/\/dwwm-projet-front-.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Si pas d'origine (comme les outils style Insomnia/Postman) ou si l'origine correspond à la liste
    if (!origin || allowedOrigins.some(regex => typeof regex === 'string' ? regex === origin : regex.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
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

app.use('/api/types',typeRoutes);

app.use('/api/auth', autRoutes);

app.use('/api/reservations', reservationRoutes);

app.use('/api/admin', adminRoutes);
// --- LANCEMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Serveur lancé sur : ${PORT}`);
});
