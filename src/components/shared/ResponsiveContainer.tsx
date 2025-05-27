
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'screen-xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  breakpoint?: 'mobile' | 'tablet' | 'desktop' | 'all';
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'screen-xl',
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
    'screen-xl': 'max-w-screen-xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3 lg:p-4',
    md: 'p-4 lg:p-6 xl:p-8',
    lg: 'p-6 lg:p-8 xl:p-12',
    xl: 'p-8 lg:p-12 xl:p-16'
  };

  const breakpointClasses = {
    mobile: 'block lg:hidden',
    tablet: 'hidden md:block xl:hidden',
    desktop: 'hidden xl:block',
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
