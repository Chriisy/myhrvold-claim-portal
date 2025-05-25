
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className = '', delay = 0 }: AnimatedCardProps) => {
  return (
    <Card 
      className={`
        transition-all duration-500 ease-out
        hover:shadow-xl hover:-translate-y-1
        animate-in slide-in-from-bottom-4 fade-in
        ${className}
      `}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </Card>
  );
};
