import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  title?: string; // Optional caption
}

interface MediaGalleryProps {
  media: MediaItem[];
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, className = "" }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % media.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + media.length) % media.length);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Grid View */}
      <div className={`grid gap-2 ${media.length === 1 ? 'grid-cols-1' : media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        {media.slice(0, 3).map((item, index) => (
          <div 
            key={index} 
            className={`relative group cursor-pointer overflow-hidden rounded-xl ${media.length === 3 && index === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
            onClick={() => openLightbox(index)}
          >
            {item.type === 'video' ? (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-70" />
                    ) : (
                        <div className="absolute inset-0 bg-black/40" />
                    )}
                    <Play className="w-12 h-12 text-white absolute z-10 fill-white/20" />
                </div>
            ) : (
                <img 
                    src={item.url} 
                    alt={`Gallery item ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
            )}
            
            {/* Overlay for "More" if there are more than 3 items */}
            {index === 2 && media.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">+{media.length - 3}</span>
                </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={closeLightbox}>
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
          >
            <X size={32} />
          </button>

          <button 
            onClick={prevSlide}
            className="absolute left-4 text-white/20 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10"
          >
            <ChevronLeft size={40} />
          </button>

          <div 
            className="max-w-5xl max-h-[85vh] w-full p-4 relative flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {media[lightboxIndex].type === 'video' ? (
                <video 
                    src={media[lightboxIndex].url} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" 
                />
            ) : (
                <img 
                    src={media[lightboxIndex].url} 
                    alt="Lightbox view" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-scale-in" 
                />
            )}
            
            {media[lightboxIndex].title && (
                <div className="absolute bottom-[-3rem] left-0 right-0 text-center text-white/80 font-medium">
                    {media[lightboxIndex].title}
                </div>
            )}
          </div>

          <button 
            onClick={nextSlide}
            className="absolute right-4 text-white/20 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10"
          >
            <ChevronRight size={40} />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {media.map((_, idx) => (
                <button 
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${idx === lightboxIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'}`}
                />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
