
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock claims data
const mockClaims = [
  {
    id: 'RK-2024-001',
    customer: 'TM Service Oslo',
    status: 'Ny',
    category: 'ServiceJobb',
    supplier: 'Comenda',
    machine: 'Comenda FC45',
    technician: 'Erik Moe',
    salesperson: 'Mylnvold AS',
    created: '2024-12-18',
    amount: 12500
  },
  {
    id: 'RK-2024-002',
    customer: 'Myhrvold AS',
    status: 'Avventer',
    category: 'Produkt',
    supplier: 'Westfold Telemark',
    machine: 'PF45 Circle K',
    technician: 'Thor Hammerfest',
    salesperson: 'Mylnvold AS',
    created: '2024-12-17',
    amount: 8900
  },
  {
    id: 'RK-2024-003',
    customer: 'Comenda Norge AS',
    status: 'Godkjent',
    category: 'Del',
    supplier: 'Comenda',
    machine: 'FC45 Thon Hammerfest',
    technician: 'Trond Erik Moe',
    salesperson: 'Mylnvold AS',
    created: '2024-12-16',
    amount: 15600
  },
  {
    id: 'RK-2024-004',
    customer: 'TechAS',
    status: 'Avslått',
    category: 'Installasjon',
    supplier: 'Pemal Miljøteknikk AS',
    machine: 'PF45 Circle K Haukids',
    technician: 'Bamesen Cooltech AS',
    salesperson: 'Mylnvold AS',
    created: '2024-12-15',
    amount: 22100
  }
];

const statusOptions = ['Alle', 'Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket'];
const categoryOptions = ['Alle', 'ServiceJobb', 'Installasjon', 'Montasje', 'Produkt', 'Del'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ny': return 'bg-orange-100 text-orange-800';
    case 'Avventer': return 'bg-blue-100 text-blue-800';
    case 'Godkjent': return 'bg-green-100 text-green-800';
    case 'Avslått': return 'bg-red-100 text-red-800';
    case 'Bokført': return 'bg-purple-100 text-purple-800';
    case 'Lukket': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [categoryFilter, setCategoryFilter] = useState('Alle');

  const filteredClaims = mockClaims.filter(claim => {
    const matchesSearch = claim.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.machine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Alle' || claim.status === statusFilter;
    const matchesCategory = categoryFilter === 'Alle' || claim.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Søk kunde, ID eller maskin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reklamasjoner ({filteredClaims.length})</CardTitle>
          <CardDescription>Klikk på en reklamasjon for å se detaljer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-3">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-semibold text-myhrvold-primary">{claim.id}</p>
                      <p className="text-sm text-gray-600">{claim.created}</p>
                    </div>
                    <div>
                      <p className="font-medium">{claim.customer}</p>
                      <p className="text-sm text-gray-600">{claim.machine}</p>
                    </div>
                    <div>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{claim.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Leverandør</p>
                      <p className="font-medium">{claim.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tekniker</p>
                      <p className="font-medium">{claim.technician}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Beløp</p>
                        <p className="font-semibold">{claim.amount.toLocaleString('nb-NO')} kr</p>
                      </div>
                      <Link to={`/claim/${claim.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Se
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {filteredClaims.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Ingen reklamasjoner funnet med gjeldende filtre.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsList;
