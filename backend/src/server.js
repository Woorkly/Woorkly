const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
// cors est un middleware qui permet de gérer les requêtes cross-origin (CORS) entre le frontend et le backend. C'est indispensable
//  pour que le frontend puisse communiquer avec le backend sans être bloqué par les politiques de sécurité du navigateur.
app.use(cors());
app.use(express.json()); // Pour lire le JSON dans les requêtes POST

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Serveur Reserva opérationnel !');
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur : http://localhost:${PORT}`);
});