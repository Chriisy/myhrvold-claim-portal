
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { OptimizedLoadingStates } from './OptimizedLoadingStates';

interface OptimizedSuspenseProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'dashboard' | 'form' | 'table' | 'card';
}

const fallbackVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const contentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

export const OptimizedSuspense: React.FC<OptimizedSuspenseProps> = ({
  fallback,
  children,
  variant = 'dashboard'
}) => {
  const getFallback = () => {
    if (fallback) return fallback;
    
    switch (variant) {
      case 'form':
        return <OptimizedLoadingStates.Form />;
      case 'table':
        return <OptimizedLoadingStates.Table />;
      case 'card':
        return <OptimizedLoadingStates.Card />;
      default:
        return <OptimizedLoadingStates.Dashboard />;
    }
  };

  const animatedFallback = (
    <motion.div
      variants={fallbackVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {getFallback()}
    </motion.div>
  );

  return (
    <Suspense fallback={animatedFallback}>
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </Suspense>
  );
};
