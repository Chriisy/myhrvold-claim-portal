
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'auto' | string;
}

export const ResponsiveImage = ({
  src,
  alt,
  className,
  sizes = '100vw',
  srcSet,
  priority = false,
  onLoad,
  onError,
  placeholder = '/placeholder.svg',
  aspectRatio = 'auto'
}: ResponsiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'auto':
        return '';
      default:
        return aspectRatio;
    }
  };

  // Generate WebP srcSet if not provided
  const generateSrcSet = () => {
    if (srcSet) return srcSet;
    
    const baseUrl = src.split('.').slice(0, -1).join('.');
    const extension = src.split('.').pop();
    
    // Try WebP first, fallback to original
    return `${baseUrl}.webp 1x, ${baseUrl}@2x.webp 2x`;
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        getAspectRatioClass(),
        className
      )}
    >
      {/* Placeholder/skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <>
          {/* WebP version */}
          <picture>
            <source
              srcSet={generateSrcSet()}
              type="image/webp"
              sizes={sizes}
            />
            <img
              src={hasError ? placeholder : src}
              alt={alt}
              sizes={sizes}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </picture>
        </>
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
