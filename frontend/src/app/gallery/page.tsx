'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, GalleryImage, Property, getImageUrl } from '@/lib/api';
import { defaultProperties, fallbackGalleryImagesByProperty } from '@/lib/default-room-catalog';

interface GallerySection {
  property: Property;
  images: { id: string; url: string; caption?: string | null }[];
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string | null } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    Promise.allSettled([api.properties.getAll(), api.gallery.getAll()]).then(([propertiesResult, galleryResult]) => {
      const propertiesData = propertiesResult.status === 'fulfilled' ? propertiesResult.value : [];
      const galleryData = galleryResult.status === 'fulfilled' ? galleryResult.value : [];

      const properties = propertiesData.length > 0 ? propertiesData : defaultProperties;
      const galleryFetchFailed = galleryResult.status === 'rejected';

      const nextSections = properties.map((property) => {
        const propertyImages = galleryData
          .filter((image) => image.propertyId === property.id)
          .map((image) => ({
            id: image.id,
            url: getImageUrl(image.url),
            caption: image.caption,
          }));

        const fallbackImages = galleryFetchFailed
          ? (fallbackGalleryImagesByProperty[property.slug] || []).map((url, index) => ({
              id: `${property.id}-fallback-${index}`,
              url,
            }))
          : [];

        return {
          property,
          images: propertyImages.length > 0 ? propertyImages : fallbackImages,
        };
      });

      const propertyOrder = defaultProperties.map((property) => property.slug);
      nextSections.sort((a, b) => propertyOrder.indexOf(a.property.slug) - propertyOrder.indexOf(b.property.slug));

      setSections(nextSections);
      setGalleryLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-light text-gold font-serif italic mb-4">
              Property Gallery
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto text-center">
              Explore both properties through curated visual collections from Tema and Accra.
            </p>
          </motion.div>

          <div className="space-y-14">
            {!galleryLoaded
              ? [1, 2].map((section) => (
                  <section key={`gallery-skeleton-${section}`}>
                    <div className="mb-6 text-center sm:text-left">
                      <div className="h-3 w-24 bg-dark-border rounded animate-pulse mb-3 mx-auto sm:mx-0" />
                      <div className="h-9 w-72 bg-dark-border rounded animate-pulse mb-3 mx-auto sm:mx-0" />
                      <div className="h-4 w-full max-w-2xl bg-dark-border rounded animate-pulse mx-auto sm:mx-0" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[1, 2, 3].map((card) => (
                        <div key={`gallery-card-skeleton-${section}-${card}`} className="aspect-[4/3] rounded-2xl border border-dark-border bg-dark-card animate-pulse" />
                      ))}
                    </div>
                  </section>
                ))
              : sections.map((section, sectionIndex) => (
                  <section key={section.property.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: sectionIndex * 0.08 }}
                      className="mb-6 text-center sm:text-left"
                    >
                      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-gold/70">Property</p>
                      <h2 className="text-3xl sm:text-4xl font-light text-white font-serif italic">
                        {section.property.name} <span className="text-gold">· {section.property.city}</span>
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm text-gray-400">
                        {section.property.description || `Explore ${section.property.name} in ${section.property.city}.`}
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {section.images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          whileHover={{ y: -8 }}
                          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-dark-border bg-dark-card cursor-pointer"
                          onClick={() => setSelectedImage({ url: image.url, caption: image.caption })}
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${image.url})` }}
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-dark" />
                            </div>
                          </div>
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3">
                              <p className="text-sm text-white">{image.caption}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </section>
                ))}
          </div>
        </div>

        {/* Lightbox */}
        {mounted && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold hover:bg-gold/30 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-6xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || 'Gallery image'}
                className="w-auto max-w-full max-h-[85vh] rounded-xl object-contain"
              />
              {selectedImage.caption && (
                <div className="mt-4 rounded-xl border border-dark-border bg-dark-card/80 px-4 py-3 text-center text-sm text-gray-200">
                  {selectedImage.caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
