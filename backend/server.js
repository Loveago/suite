require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/rooms', express.json(), roomRoutes);
app.use('/api/bookings', express.json(), bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', express.json(), galleryRoutes);
app.use('/api/properties', express.json(), propertyRoutes);
app.use('/api/site-settings', express.json(), siteSettingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'THE SUITE API is running' });
});

app.listen(PORT, () => {
  console.log(`THE SUITE backend running on port ${PORT}`);
});
