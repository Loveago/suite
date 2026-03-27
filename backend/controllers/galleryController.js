const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all gallery images
exports.getAllGalleryImages = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const propertyId = req.adminSession?.role === 'property'
      ? req.adminScopedProperty?.id
      : req.query.propertyId;

    if (req.adminSession?.role === 'property' && !propertyId) {
      return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
    }

    const images = await prisma.galleryImage.findMany({
      where: {
        ...(includeArchived ? {} : { isActive: true }),
        ...(propertyId ? { propertyId } : {}),
      },
      include: { property: true },
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
    const propertyId = req.adminSession?.role === 'property'
      ? req.adminScopedProperty?.id
      : req.body.propertyId;

    if (!propertyId) {
      return res.status(400).json({ error: 'Property is required' });
    }

    const image = await prisma.galleryImage.create({
      data: { url, caption, order: order || 0, isActive: true, archivedAt: null, propertyId },
      include: { property: true },
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
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true, propertyId: true },
    });

    if (!existingImage) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }

    if (req.adminSession?.role === 'property' && existingImage.propertyId !== req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'You do not have access to this property' });
    }

    const { url, caption, order, propertyId } = req.body;
    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        url,
        caption,
        order,
        ...(req.adminSession?.role !== 'property' && propertyId ? { propertyId } : {}),
      },
      include: { property: true },
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
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true, propertyId: true },
    });

    if (!existingImage) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }

    if (req.adminSession?.role === 'property' && existingImage.propertyId !== req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'You do not have access to this property' });
    }

    const image = await prisma.galleryImage.update({
      where: { id },
      data: { isActive: false, archivedAt: new Date() },
    });
    res.json({ message: 'Gallery image archived successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
};
