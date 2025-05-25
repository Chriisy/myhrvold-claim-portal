
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClaimsQuery } from '@/hooks/useClaimsQuery';
import { ClaimsListFilters } from '@/components/claims/ClaimsListFilters';
import { ClaimsListTable } from '@/components/claims/ClaimsListTable';

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState('Alle');
  const [partNumberFilter, setPartNumberFilter] = useState('');
  
  const { data: claims, isLoading, error } = useClaimsQuery();

  const filteredClaims = claims?.filter(claim => {
    const matchesSearch = claim.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.machine_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Alle' || claim.status === statusFilter;
    const matchesCategory = categoryFilter === 'Alle' || claim.category === categoryFilter;
    const matchesPartNumber = !partNumberFilter || claim.part_number?.toLowerCase().includes(partNumberFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPartNumber;
  }) || [];

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
        <Link to="/claim/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ny Reklamasjon
          </Button>
        </Link>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Reklamasjoner ({filteredClaims.length})</CardTitle>
          <CardDescription>
            {isLoading ? 'Laster reklamasjoner...' : 'Klikk på en reklamasjon for å se detaljer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClaimsListTable
            claims={filteredClaims}
            isLoading={isLoading}
            error={!!error}
            hasAnyClaims={!!claims && claims.length > 0}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsList;
