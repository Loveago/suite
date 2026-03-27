const { PrismaClient } = require('@prisma/client');
const { getAdminSessionFromRequest } = require('../lib/adminAuth');

const prisma = new PrismaClient();

const normalizeProperty = (property) => {
  if (!property) {
    return null;
  }

  const normalizedName = property.name?.trim().toLowerCase();
  const isAccraProperty = normalizedName === 'american house' || normalizedName === 'kingstel escape';

  return {
    ...property,
    name: isAccraProperty ? 'Kingstel Escape' : property.name,
    slug: isAccraProperty ? 'kingstel-escape-accra' : property.slug || 'the-suite-tema',
    city: property.city || (isAccraProperty ? 'Accra' : 'Tema'),
  };
};

const requireAdminSession = (req, res, next) => {
  const session = getAdminSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  req.adminSession = session;
  return next();
};

const loadScopedProperty = async (req, _res, next) => {
  if (!req.adminSession || req.adminSession.role !== 'property' || !req.adminSession.propertySlug) {
    return next();
  }

  const property = await prisma.property.findFirst({
    where: {
      OR: [
        { slug: req.adminSession.propertySlug },
        req.adminSession.propertySlug === 'kingstel-escape-accra'
          ? { name: { in: ['Kingstel Escape', 'American House'] } }
          : { name: 'The Suite' },
      ],
    },
  });

  req.adminScopedProperty = normalizeProperty(property);
  return next();
};

const requireScopedPropertyMatch = (resolvePropertyId) => async (req, res, next) => {
  if (!req.adminSession) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.adminSession.role !== 'property') {
    return next();
  }

  if (!req.adminScopedProperty?.id) {
    return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
  }

  const targetPropertyId = await resolvePropertyId(req);

  if (!targetPropertyId) {
    return res.status(400).json({ error: 'Property is required' });
  }

  if (targetPropertyId !== req.adminScopedProperty.id) {
    return res.status(403).json({ error: 'You do not have access to this property' });
  }

  return next();
};

module.exports = {
  loadScopedProperty,
  normalizeProperty,
  requireAdminSession,
  requireScopedPropertyMatch,
};
