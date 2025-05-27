
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
import { ResponsiveContainer } from '@/components/shared/ResponsiveContainer';

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
    <ResponsiveContainer maxWidth="7xl" padding="lg">
      <div className="space-y-8 lg:space-y-10 xl:space-y-12 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <SidebarTrigger className="lg:hidden" />
            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
              <p className="text-gray-600 text-base lg:text-lg xl:text-xl mt-2">Oversikt over alle reklamasjoner</p>
            </div>
          </div>
          <Link to="/claim/new" className="w-full lg:w-auto">
            <Button className="btn-primary w-full lg:w-auto lg:px-10 lg:py-4 xl:px-12 xl:py-5 text-lg lg:text-xl">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
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
          <CardHeader className="pb-6">
            <CardTitle className="text-xl lg:text-2xl xl:text-3xl">
              Reklamasjoner ({totalCount} totalt, viser side {currentPage} av {totalPages})
            </CardTitle>
            <CardDescription className="text-base lg:text-lg">
              {isLoading ? 'Laster reklamasjoner...' : 'Klikk på en reklamasjon for å se detaljer'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
    </ResponsiveContainer>
  );
};

export default ClaimsList;
