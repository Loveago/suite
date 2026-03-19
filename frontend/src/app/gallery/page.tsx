'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import Image from 'next/image';

const galleryImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
  'https://images.unsplash.com/photo-1616594039964-58e5f4f7b7dd?w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
              Explore the elegance and luxury of THE SUITE through our curated collection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-dark-border bg-dark-card cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-dark" />
                  </div>
                </div>
              </motion.div>
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
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full h-full bg-cover bg-center rounded-xl"
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  minHeight: '60vh',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
