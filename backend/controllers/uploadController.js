const uploadRoomImages = async (req, res) => {
  try {
    if (req.adminSession?.role === 'property' && !req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
    }

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
