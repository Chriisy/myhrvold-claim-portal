
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { format } from 'date-fns';
import { useState } from 'react';

export const EnhancedDashboardFilters = () => {
  const { filters, updateFilter, resetFilters } = useDashboardFilters();
  const { data: suppliers } = useSuppliers();
  const { data: accountCodes } = useAccountCodes();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    updateFilter('dateRange', range);
    if (range?.from && range?.to) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Avanserte Filtre
        </CardTitle>
        <CardDescription>Filtrer data for bedre innsikt i reklamasjoner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tidsperiode</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "dd.MM.yy")} -{" "}
                        {format(filters.dateRange.to, "dd.MM.yy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "dd.MM.yy")
                    )
                  ) : (
                    <span>Velg periode</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Supplier Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Leverandør</label>
            <Select value={filters.supplierId || 'all'} onValueChange={(value) => updateFilter('supplierId', value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Alle leverandører" />
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
          </div>

          {/* Account Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Konto</label>
            <Select value={filters.accountId || 'all'} onValueChange={(value) => updateFilter('accountId', value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Alle kontoer" />
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
          </div>

          {/* Reset Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Reset</label>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Tilbakestill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardFilters;
