const uploadRoomImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const paths = req.files.map((file) => `/uploads/rooms/${file.filename}`);
    res.json({ images: paths });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images', details: error.message });
  }
};

module.exports = { uploadRoomImages };
