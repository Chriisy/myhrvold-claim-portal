
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClaimsQuery } from '@/hooks/useClaimsQuery';
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
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-6 lg:py-8 xl:py-10">
        <div className="card-content-spacing">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="card-header-spacing">
                <h1 className="text-heading-1 text-myhrvold-primary">Reklamasjoner</h1>
                <p className="text-body text-muted-foreground">Oversikt over alle reklamasjoner</p>
              </div>
            </div>
            <Link to="/claim/new" className="w-full lg:w-auto">
              <Button className="btn-primary btn-icon-md w-full lg:w-auto lg:px-6 lg:py-3">
                <Plus strokeWidth={2} />
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

          <Card className="shadow-lg">
            <CardHeader className="card-header-spacing card-padding">
              <CardTitle className="text-heading-3">
                Reklamasjoner ({totalCount} totalt, viser side {currentPage} av {totalPages})
              </CardTitle>
              <CardDescription className="text-body">
                {isLoading ? 'Laster reklamasjoner...' : 'Klikk på en reklamasjon for å se detaljer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-spacing">
              <div className="overflow-x-auto lg:overflow-visible">
                <ClaimsListTable
                  claims={claims}
                  isLoading={isLoading}
                  error={!!error}
                  hasAnyClaims={totalCount > 0}
                />
              </div>
              
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
      </div>
    </div>
  );
};

export default ClaimsList;
