
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export const EnhancedDashboardFilters = () => {
  const { filters, updateFilter, resetFilters } = useDashboardFilters();
  const { data: suppliers } = useSuppliers();
  const { data: accountCodes } = useAccountCodes();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('dashboard-filters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        // Apply saved filters if they exist
        Object.entries(parsed).forEach(([key, value]) => {
          if (key === 'date_range' && value) {
            const dateRange = value as { start: string; end: string };
            updateFilter('date_range', {
              start: new Date(dateRange.start),
              end: new Date(dateRange.end)
            });
          } else if (value) {
            updateFilter(key as any, value);
          }
        });
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    const filtersToSave = {
      ...filters,
      date_range: {
        start: filters.date_range.start.toISOString(),
        end: filters.date_range.end.toISOString()
      }
    };
    localStorage.setItem('dashboard-filters', JSON.stringify(filtersToSave));
  }, [filters]);

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      updateFilter('date_range', {
        start: range.from,
        end: range.to
      });
      setIsDatePickerOpen(false);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    localStorage.removeItem('dashboard-filters');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtre
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Supplier Filter */}
          <Select 
            value={filters.supplier_id || "all"} 
            onValueChange={(value) => updateFilter('supplier_id', value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Leverandør" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle leverandører</SelectItem>
              {suppliers?.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Account Code Filter */}
          <Select 
            value={filters.konto_nr?.toString() || "all"} 
            onValueChange={(value) => updateFilter('konto_nr', value === "all" ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Konto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle kontoer</SelectItem>
              {accountCodes?.map(account => (
                <SelectItem key={account.konto_nr} value={account.konto_nr.toString()}>
                  {account.konto_nr} - {account.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Machine Model Filter */}
          <Input
            placeholder="Maskinmodell..."
            value={filters.machine_model || ""}
            onChange={(e) => updateFilter('machine_model', e.target.value || undefined)}
          />

          {/* Date Range Filter */}
          <div className="md:col-span-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_range.start && filters.date_range.end
                    ? `${format(filters.date_range.start, 'dd.MM.yyyy')} - ${format(filters.date_range.end, 'dd.MM.yyyy')}`
                    : "Velg datoperiode"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.date_range.start,
                    to: filters.date_range.end
                  }}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reset Filters */}
          <Button variant="outline" onClick={handleResetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tilbakestill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardFilters;
