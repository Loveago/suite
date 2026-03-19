const express = require('express');
const cors = require('cors');
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'THE SUITE API is running' });
});

app.listen(PORT, () => {
  console.log(`THE SUITE backend running on port ${PORT}`);
});
