
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { format } from 'date-fns';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const MobileOptimizedFilters = () => {
  const { filters, updateFilter, resetFilters } = useDashboardFilters();
  const { data: suppliers } = useSuppliers();
  const { data: accountCodes } = useAccountCodes();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      updateFilter('date_range', {
        start: range.from,
        end: range.to
      });
      setIsDatePickerOpen(false);
    }
  };

  const hasActiveFilters = filters.supplier_id || filters.konto_nr || filters.machine_model || filters.date_range.start;

  return (
    <Card className="w-full shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5 text-myhrvold-primary" strokeWidth={2} />
                Avanserte Filtre
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-1 bg-myhrvold-primary text-white text-xs rounded-full">
                    Aktive
                  </span>
                )}
              </CardTitle>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Periode</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" strokeWidth={2} />
                      <span className="truncate">
                        {filters.date_range.start && filters.date_range.end
                          ? `${format(filters.date_range.start, 'dd.MM.yyyy')} - ${format(filters.date_range.end, 'dd.MM.yyyy')}`
                          : "Velg datoperiode"
                        }
                      </span>
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

              {/* Supplier Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Leverandør</label>
                <Select 
                  value={filters.supplier_id || "all"} 
                  onValueChange={(value) => updateFilter('supplier_id', value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
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
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kontonummer</label>
                <Select 
                  value={filters.konto_nr?.toString() || "all"} 
                  onValueChange={(value) => updateFilter('konto_nr', value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Alle kontoer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle kontoer</SelectItem>
                    {accountCodes?.map(account => (
                      <SelectItem key={account.konto_nr} value={account.konto_nr.toString()}>
                        {account.konto_nr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Machine Model Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Maskinmodell</label>
                <Input
                  placeholder="Søk på maskinmodell..."
                  value={filters.machine_model || ""}
                  onChange={(e) => updateFilter('machine_model', e.target.value || undefined)}
                  className="w-full"
                />
              </div>

              {/* Technician Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tekniker</label>
                <Select 
                  value={filters.technician_id || "all"} 
                  onValueChange={(value) => updateFilter('technician_id', value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Alle teknikere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle teknikere</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters} 
                  className="w-full"
                  disabled={!hasActiveFilters}
                >
                  <RotateCcw className="w-4 h-4 mr-2" strokeWidth={2} />
                  Tilbakestill
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MobileOptimizedFilters;
