const { processUploadedFiles } = require('../lib/imageProcessor');

const uploadRoomImages = async (req, res) => {
  try {
    if (req.adminSession?.role === 'property' && !req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const paths = await processUploadedFiles({ files: req.files, target: 'rooms' });
    res.json({ images: paths });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images', details: error.message });
  }
};

const uploadGalleryImages = async (req, res) => {
  try {
    if (req.adminSession?.role === 'property' && !req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const paths = await processUploadedFiles({ files: req.files, target: 'gallery' });
    res.json({ images: paths });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload gallery images', details: error.message });
  }
};

const uploadSiteImages = async (req, res) => {
  try {
    if (req.adminSession?.role !== 'master') {
      return res.status(403).json({ error: 'Only the master admin can upload site images' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const paths = await processUploadedFiles({ files: req.files, target: 'site' });
    res.json({ images: paths });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload site images', details: error.message });
  }
};

module.exports = { uploadRoomImages, uploadGalleryImages, uploadSiteImages };
