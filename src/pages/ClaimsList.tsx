
import React, { useState, Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

// Lazy load components with correct import syntax for named exports
const ClaimsListTable = React.lazy(() => import('@/components/claims/ClaimsListTable').then(module => ({ default: module.ClaimsListTable })));
const ClaimsListFilters = React.lazy(() => import('@/components/claims/ClaimsListFilters').then(module => ({ default: module.ClaimsListFilters })));

const ClaimsList = () => {
  const [filters, setFilters] = useState({});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
            <p className="text-gray-600">Administrer og følg opp reklamasjoner</p>
          </div>
        </div>
        <Link to="/claims/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ny Reklamasjon
          </Button>
        </Link>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <ClaimsListFilters onFiltersChange={setFilters} />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <ClaimsListTable filters={filters} />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default ClaimsList;
