
import React, { Suspense, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { useClaimsQuery } from '@/hooks/useClaimsQuery';

const ClaimsListTable = React.lazy(() => 
  import('@/components/claims/ClaimsListTable').then(module => ({ default: module.ClaimsListTable }))
);
const ClaimsListFilters = React.lazy(() => 
  import('@/components/claims/ClaimsListFilters').then(module => ({ default: module.ClaimsListFilters }))
);

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState('Alle');
  const [partNumberFilter, setPartNumberFilter] = useState('');
  const [page, setPage] = useState(1);

  const { 
    data: claimsData, 
    isLoading, 
    error 
  } = useClaimsQuery({
    searchTerm,
    statusFilter,
    categoryFilter,
    partNumberFilter,
    page,
    pageSize: 50
  });

  const claims = claimsData?.data || [];
  const hasAnyClaims = claims.length > 0 || (claimsData?.count || 0) > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
          <p className="text-gray-600">Administrer alle reklamasjoner og oppfølging</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <ClaimsListFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            partNumberFilter={partNumberFilter}
            setPartNumberFilter={setPartNumberFilter}
          />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <ClaimsListTable
            claims={claims}
            isLoading={isLoading}
            error={!!error}
            hasAnyClaims={hasAnyClaims}
          />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default ClaimsList;
