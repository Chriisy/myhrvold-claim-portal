
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { useTechnicians } from '@/hooks/useTechnicians';
import { FilterDropdown } from './FilterDropdown';
import { format } from 'date-fns';
import { useState } from 'react';

export const EnhancedDashboardFilters = () => {
  const { filters, updateFilter, resetFilters } = useDashboardFilters();
  const { data: suppliers } = useSuppliers();
  const { data: accountCodes } = useAccountCodes();
  const { data: technicians } = useTechnicians();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      updateFilter('date_range', {
        start: range.from,
        end: range.to
      });
      setIsDatePickerOpen(false);
    }
  };

  const supplierOptions = [
    { value: '', label: 'Alle leverandører' },
    ...(suppliers?.map(supplier => ({
      value: supplier.id,
      label: supplier.name
    })) || [])
  ];

  const accountOptions = [
    { value: '', label: 'Alle kontoer' },
    ...(accountCodes?.map(account => ({
      value: account.konto_nr.toString(),
      label: `${account.konto_nr} - ${account.type}`
    })) || [])
  ];

  const technicianOptions = [
    { value: '', label: 'Alle teknikere' },
    ...(technicians?.map(tech => ({
      value: tech.id,
      label: tech.name
    })) || [])
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tidsperiode</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_range?.start ? (
                    filters.date_range.end ? (
                      <>
                        {format(filters.date_range.start, "dd.MM.yy")} -{" "}
                        {format(filters.date_range.end, "dd.MM.yy")}
                      </>
                    ) : (
                      format(filters.date_range.start, "dd.MM.yy")
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
                  defaultMonth={filters.date_range?.start}
                  selected={{
                    from: filters.date_range?.start,
                    to: filters.date_range?.end
                  }}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Supplier Filter */}
          <FilterDropdown
            label="Leverandør"
            value={filters.supplier_id || ''}
            options={supplierOptions}
            onSelect={(value) => updateFilter('supplier_id', value || undefined)}
            placeholder="Alle leverandører"
          />

          {/* Account Filter */}
          <FilterDropdown
            label="Konto"
            value={filters.konto_nr?.toString() || ''}
            options={accountOptions}
            onSelect={(value) => updateFilter('konto_nr', value ? parseInt(value) : undefined)}
            placeholder="Alle kontoer"
          />

          {/* Technician Filter */}
          <FilterDropdown
            label="Tekniker"
            value={filters.technician_id || ''}
            options={technicianOptions}
            onSelect={(value) => updateFilter('technician_id', value || undefined)}
            placeholder="Alle teknikere"
          />

          {/* Machine Model Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Maskinmodell</label>
            <Input
              placeholder="Søk maskinmodell..."
              value={filters.machine_model || ""}
              onChange={(e) => updateFilter('machine_model', e.target.value || undefined)}
              className="w-full"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Tilbakestill alle filtre
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardFilters;
