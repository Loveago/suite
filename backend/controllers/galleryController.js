const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all gallery images
exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
};

// Create a new gallery image
exports.createGalleryImage = async (req, res) => {
  try {
    const { url, caption, order } = req.body;
    const image = await prisma.galleryImage.create({
      data: { url, caption, order: order || 0 },
    });
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create gallery image' });
  }
};

// Update a gallery image
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, caption, order } = req.body;
    const image = await prisma.galleryImage.update({
      where: { id },
      data: { url, caption, order },
    });
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gallery image' });
  }
};

// Delete a gallery image
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.galleryImage.delete({ where: { id } });
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
};
