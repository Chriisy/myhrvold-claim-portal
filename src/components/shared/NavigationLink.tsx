
import React, { useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface NavigationLinkProps extends LinkProps {
  prefetchQueries?: string[][];
  preloadModule?: () => Promise<any>;
  children: React.ReactNode;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  prefetchQueries = [],
  preloadModule,
  onMouseEnter,
  ...props
}) => {
  const queryClient = useQueryClient();
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPrefetched) {
      // Preload module if specified
      if (preloadModule) {
        preloadModule().catch(console.warn);
      }

      // Prefetch queries
      prefetchQueries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey,
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      });

      setIsPrefetched(true);
    }

    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  return (
    <Link
      {...props}
      onMouseEnter={handleMouseEnter}
    />
  );
};
