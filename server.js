require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const vehiculesRoutes = require('./routes/vehicules');
app.use('/api/vehicules', vehiculesRoutes);

const vroomRoutes = require('./routes/vroom');
app.use('/api/vroom', vroomRoutes);

const catalogueRoutes = require('./routes/catalogue');
app.use('/api/catalogue', catalogueRoutes);

const rappelsRoutes = require('./routes/rappels');
app.use('/api/rappels', rappelsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Exemple : http://localhost:${PORT}/api/vehicules/vin/1HGCM82633A004352?region=USA`);
});
