
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ClaimsListFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  partNumberFilter: string;
  setPartNumberFilter: (value: string) => void;
}

const statusOptions = ['Alle', 'Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket'];
const categoryOptions = ['Alle', 'Service', 'Installasjon', 'Produkt', 'Del'];

export const ClaimsListFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  partNumberFilter,
  setPartNumberFilter
}: ClaimsListFiltersProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="card-padding">
        <CardTitle className="icon-text-md">
          <Filter strokeWidth={2} />
          Filtre
        </CardTitle>
      </CardHeader>
      <CardContent className="card-padding">
        <div className="filters-grid">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2} />
            <Input
              placeholder="Søk kunde, ID, maskin eller adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 lg:pl-12 text-body"
            />
          </div>
          <Input
            placeholder="Søk på delenummer..."
            value={partNumberFilter}
            onChange={(e) => setPartNumberFilter(e.target.value)}
            className="text-body"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-body">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status} className="text-body">{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="text-body">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(category => (
                <SelectItem key={category} value={category} className="text-body">{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
