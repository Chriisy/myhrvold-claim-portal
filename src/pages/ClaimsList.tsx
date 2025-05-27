
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
                <p className="text-gray-600 text-sm lg:text-base xl:text-lg mt-1">Oversikt over alle reklamasjoner</p>
              </div>
            </div>
            <Link to="/claim/new" className="w-full lg:w-auto">
              <Button className="btn-primary w-full lg:w-auto lg:px-6 lg:py-3 xl:px-8 xl:py-4 text-base lg:text-lg">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
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
            <CardHeader className="pb-4 lg:pb-6">
              <CardTitle className="text-lg lg:text-xl xl:text-2xl">
                Reklamasjoner ({totalCount} totalt, viser side {currentPage} av {totalPages})
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                {isLoading ? 'Laster reklamasjoner...' : 'Klikk på en reklamasjon for å se detaljer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
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
