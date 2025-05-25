
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useTechnicians } from '@/hooks/useTechnicians';
import { cn } from '@/lib/utils';

const EnhancedDashboardFilters = () => {
  const { filters, updateFilter, resetFilters } = useDashboardFilters();
  const { data: suppliers } = useSuppliers();
  const { data: technicians } = useTechnicians();
  
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Avanserte Filtre</CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tilbakestill
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Fra dato</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date_range.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_range.start ? (
                    format(filters.date_range.start, "PPP", { locale: nb })
                  ) : (
                    <span>Velg dato</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date_range.start}
                  onSelect={(date) => {
                    if (date) {
                      updateFilter('date_range', {
                        ...filters.date_range,
                        start: date
                      });
                    }
                    setStartDateOpen(false);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Til dato</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date_range.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_range.end ? (
                    format(filters.date_range.end, "PPP", { locale: nb })
                  ) : (
                    <span>Velg dato</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date_range.end}
                  onSelect={(date) => {
                    if (date) {
                      updateFilter('date_range', {
                        ...filters.date_range,
                        end: date
                      });
                    }
                    setEndDateOpen(false);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Supplier Filter */}
          <div className="space-y-2">
            <Label>Leverandør</Label>
            <Select
              value={filters.supplier_id || ''}
              onValueChange={(value) => updateFilter('supplier_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle leverandører" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle leverandører</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Machine Model Filter */}
          <div className="space-y-2">
            <Label>Maskinmodell</Label>
            <Input
              placeholder="Søk maskinmodell"
              value={filters.machine_model || ''}
              onChange={(e) => updateFilter('machine_model', e.target.value || undefined)}
            />
          </div>

          {/* Part Number Filter */}
          <div className="space-y-2">
            <Label>Delenummer</Label>
            <Input
              placeholder="Søk delenummer"
              value={filters.part_number || ''}
              onChange={(e) => updateFilter('part_number', e.target.value || undefined)}
            />
          </div>

          {/* Technician Filter */}
          <div className="space-y-2">
            <Label>Tekniker</Label>
            <Select
              value={filters.technician_id || ''}
              onValueChange={(value) => updateFilter('technician_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle teknikere" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle teknikere</SelectItem>
                {technicians?.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Code Filter */}
          <div className="space-y-2">
            <Label>Kontonummer</Label>
            <Input
              type="number"
              placeholder="Søk kontonummer"
              value={filters.konto_nr || ''}
              onChange={(e) => updateFilter('konto_nr', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardFilters;
