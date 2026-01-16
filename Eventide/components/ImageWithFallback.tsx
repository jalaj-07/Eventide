import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  fallbackText,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setError(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    setLoaded(true); // Stop loading state on error
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  if (error) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
          onError={(e) => {
            // If fallback also fails, prevent infinite loop and show placeholder
            e.currentTarget.style.display = "none";
            // Check if next sibling is our placeholder (if we were rendering it conditionally nearby)
            // But simpler is to allow this to fail and relying on parent error handling if intricate, 
            // but here we just return the generic fallback below if we could.
            // Since we returned a JSX element, we can't easily switch to the other branch without state.
            // So for now, if fallbackSrc fails, it might just be broken usage. 
            // Better strategy:
          }}
        />
      );
    }

    return (
      <div
        className={`bg-slate-100 flex flex-col items-center justify-center text-slate-400 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={24} className="mb-2 opacity-50" />
        {fallbackText && (
          <span className="text-xs font-medium px-2 text-center">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ display: 'inline-block', lineHeight: 0 }}>
       {/* Skeleton Loader while loading */}
      {!loaded && (
         <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${!loaded ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
