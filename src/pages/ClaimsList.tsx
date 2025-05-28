
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClaimsQuery } from '@/hooks/queries/useClaimsQuery';
import { ClaimsListFilters } from '@/components/claims/ClaimsListFilters';
import { ClaimsListTable } from '@/components/claims/ClaimsListTable';
import { ClaimsPagination } from '@/components/claims/ClaimsPagination';

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState('Alle');
  const [partNumberFilter, setPartNumberFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: result, isLoading, error } = useClaimsQuery({
    searchTerm,
    statusFilter,
    categoryFilter,
    partNumberFilter,
    page: currentPage,
    pageSize: 50
  });

  const claims = result?.data || [];
  const totalCount = result?.count || 0;
  const totalPages = result?.totalPages || 1;

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'partNumber':
        setPartNumberFilter(value);
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
            <p className="text-gray-600">Oversikt over alle reklamasjoner</p>
          </div>
        </div>
        <Link to="/new-claim">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ny Reklamasjon
          </Button>
        </Link>
      </div>

      <ClaimsListFilters
        searchTerm={searchTerm}
        setSearchTerm={(value) => handleFilterChange('search', value)}
        statusFilter={statusFilter}
        setStatusFilter={(value) => handleFilterChange('status', value)}
        categoryFilter={categoryFilter}
        setCategoryFilter={(value) => handleFilterChange('category', value)}
        partNumberFilter={partNumberFilter}
        setPartNumberFilter={(value) => handleFilterChange('partNumber', value)}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Reklamasjoner ({totalCount} totalt, viser side {currentPage} av {totalPages})
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Laster reklamasjoner...' : 'Klikk på en reklamasjon for å se detaljer'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClaimsListTable
            claims={claims}
            isLoading={isLoading}
            error={!!error}
            hasAnyClaims={totalCount > 0}
          />
          
          {totalPages > 1 && (
            <ClaimsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalCount}
              itemsPerPage={50}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsList;
