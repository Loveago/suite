const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all gallery images
exports.getAllGalleryImages = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const images = await prisma.galleryImage.findMany({
      where: includeArchived ? undefined : { isActive: true },
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
      data: { url, caption, order: order || 0, isActive: true, archivedAt: null },
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
    const image = await prisma.galleryImage.update({
      where: { id },
      data: { isActive: false, archivedAt: new Date() },
    });
    res.json({ message: 'Gallery image archived successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
};
