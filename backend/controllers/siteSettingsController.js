const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SITE_SETTINGS_KEY = 'global-site-settings';

const defaultSiteSettings = {
  general: {
    siteTitle: 'THE SUITE',
    siteTagline: 'Refined stays. Seamless booking. Signature comfort.',
    homeHeroPrimaryText: 'Experience',
    homeHeroHighlightText: 'Luxury',
    homeHeroSecondaryText: 'at THE SUITE',
    homeHeroDescription:
      'Discover elegant rooms, effortless reservations, and a boutique luxury experience designed for comfort from the first click.',
    homeBookingBadge: 'Instant confirmation',
    homeCtaTitle: 'Luxurious Comfort Awaits',
    homeCtaDescription:
      'Unwind in style and indulge in unparalleled comfort at THE SUITE. Your perfect getaway starts here.',
  },
  images: {
    homeHeroImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80',
    ],
    homeLuxuryCtaImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
    bookNowBackgroundImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80',
    ],
  },
};

const normalizeSiteSettings = (value = {}) => ({
  general: {
    ...defaultSiteSettings.general,
    ...(value.general || {}),
  },
  images: {
    ...defaultSiteSettings.images,
    ...(value.images || {}),
    homeHeroImages: Array.isArray(value.images?.homeHeroImages) && value.images.homeHeroImages.length > 0
      ? value.images.homeHeroImages
      : defaultSiteSettings.images.homeHeroImages,
    bookNowBackgroundImages: Array.isArray(value.images?.bookNowBackgroundImages) && value.images.bookNowBackgroundImages.length > 0
      ? value.images.bookNowBackgroundImages
      : defaultSiteSettings.images.bookNowBackgroundImages,
    homeLuxuryCtaImage: value.images?.homeLuxuryCtaImage || defaultSiteSettings.images.homeLuxuryCtaImage,
  },
});

const getSiteSettings = async (_req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SITE_SETTINGS_KEY } });
    res.json(normalizeSiteSettings(setting?.value || {}));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site settings', details: error.message });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    if (req.adminSession?.role !== 'master') {
      return res.status(403).json({ error: 'Only the master admin can update site settings' });
    }

    const settings = normalizeSiteSettings(req.body || {});
    const record = await prisma.siteSetting.upsert({
      where: { key: SITE_SETTINGS_KEY },
      update: { value: settings },
      create: { key: SITE_SETTINGS_KEY, value: settings },
    });

    res.json(normalizeSiteSettings(record.value || {}));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update site settings', details: error.message });
  }
};

module.exports = {
  SITE_SETTINGS_KEY,
  defaultSiteSettings,
  getSiteSettings,
  normalizeSiteSettings,
  updateSiteSettings,
};
