
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  breakpoint?: 'mobile' | 'tablet' | 'desktop' | 'all';
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'full',
  padding = 'md',
  breakpoint = 'all'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
    xl: 'p-8 sm:p-12 lg:p-16'
  };

  const breakpointClasses = {
    mobile: 'block md:hidden',
    tablet: 'hidden md:block lg:hidden',
    desktop: 'hidden lg:block',
    all: 'block'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      breakpointClasses[breakpoint],
      className
    )}>
      {children}
    </div>
  );
}
