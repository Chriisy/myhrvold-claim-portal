
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Users, 
  Building2, 
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TouchNavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  badge?: number;
}

const navigationItems: TouchNavItem[] = [
  { icon: Home, label: 'Oversikt', path: '/' },
  { icon: FileText, label: 'Reklamasjoner', path: '/claims' },
  { icon: Building2, label: 'Leverandører', path: '/suppliers' },
  { icon: Users, label: 'Brukere', path: '/users' },
  { icon: BarChart3, label: 'Rapporter', path: '/reports' }
];

export const TouchOptimizedNav = () => {
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle swipe gestures for navigation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const threshold = 100; // Minimum swipe distance
    const restraint = 100; // Maximum vertical distance

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      setTouchStartX(startX);
      setIsGestureActive(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isGestureActive) return;
      
      const touch = e.touches[0];
      const distanceX = touch.clientX - startX;
      const distanceY = touch.clientY - startY;
      
      // Only handle horizontal swipes
      if (Math.abs(distanceY) < restraint) {
        setCurrentTranslate(distanceX);
        
        // Prevent default scrolling for horizontal swipes
        if (Math.abs(distanceX) > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isGestureActive) return;
      
      const touch = e.changedTouches[0];
      const distanceX = touch.clientX - startX;
      const distanceY = touch.clientY - startY;
      
      setIsGestureActive(false);
      setCurrentTranslate(0);
      
      // Check if it's a valid swipe
      if (Math.abs(distanceX) >= threshold && Math.abs(distanceY) <= restraint) {
        const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);
        
        if (distanceX > 0 && currentIndex > 0) {
          // Swipe right - go to previous page
          navigate(navigationItems[currentIndex - 1].path);
        } else if (distanceX < 0 && currentIndex < navigationItems.length - 1) {
          // Swipe left - go to next page
          navigate(navigationItems[currentIndex + 1].path);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname, navigate, isGestureActive]);

  // Add haptic feedback for touch interactions
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Very short vibration
    }
  };

  const handleNavigation = (path: string) => {
    triggerHapticFeedback();
    navigate(path);
  };

  const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < navigationItems.length - 1;

  return (
    <>
      {/* Swipe indicator */}
      {isGestureActive && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg pointer-events-none">
          <div className="flex items-center gap-2">
            {currentTranslate > 50 && canGoBack && (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Forrige side</span>
              </>
            )}
            {currentTranslate < -50 && canGoForward && (
              <>
                <span className="text-sm">Neste side</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 px-3 min-h-[44px] min-w-[44px]',
                  'text-xs font-medium rounded-lg transition-colors',
                  isActive 
                    ? 'text-myhrvold-primary bg-myhrvold-primary/10' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-none">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
};
