
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FileDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: addDays(new Date(), 0),
  });
  const { filters } = useDashboardFilters();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from('claims')
        .select(`
          *,
          supplier:suppliers(*),
          technician:users!claims_technician_id_fkey(*),
          cost_lines(*),
          credit_notes(*)
        `)
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString());

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.machine_model) {
        query = query.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.technician_id) {
        query = query.eq('technician_id', filters.technician_id);
      }
      if (statusFilter && statusFilter !== 'all') {
        // Type assertion to ensure the statusFilter is a valid claim status
        const validStatuses = ['Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket'] as const;
        if (validStatuses.includes(statusFilter as any)) {
          query = query.eq('status', statusFilter);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Ingen data",
          description: "Fant ingen reklamasjoner med de valgte filtrene.",
        });
        return;
      }

      const csvRows = [];

      // Headers
      csvRows.push([
        "Reklamasjons ID", "Opprettet Dato", "Status", "Maskin Modell",
        "Leverandør Navn", "Tekniker Navn", "Total Kostnad", "Total Kreditnota"
      ].join(','));

      data.forEach(claim => {
        const totalCost = claim.cost_lines?.reduce((sum: number, line: any) => sum + line.amount, 0) || 0;
        const totalCredit = claim.credit_notes?.reduce((sum: number, note: any) => sum + note.amount, 0) || 0;

        const row = [
          claim.id,
          claim.created_at,
          claim.status,
          claim.machine_model || 'N/A',
          claim.supplier?.name || 'N/A',
          claim.technician?.name || 'N/A',
          totalCost,
          totalCredit
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'reklamasjoner.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke eksportere data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapporter</h1>
        <Button onClick={exportToCSV} disabled={isExporting}>
          {isExporting && <FileDown className="mr-2 h-4 w-4 animate-spin" />}
          Eksporter til CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Range Picker */}
        <div>
          <Label>Velg Periode</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date?.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}`
                  ) : (
                    format(date.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Velg en dato</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div>
          <Label>Status</Label>
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Alle Statuser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="Ny">Ny</SelectItem>
              <SelectItem value="Avventer">Avventer</SelectItem>
              <SelectItem value="Godkjent">Godkjent</SelectItem>
              <SelectItem value="Avslått">Avslått</SelectItem>
              <SelectItem value="Bokført">Bokført</SelectItem>
              <SelectItem value="Lukket">Lukket</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Reports;
