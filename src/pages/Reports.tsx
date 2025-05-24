
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, CalendarIcon, Filter } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    supplier_id: '',
    machine_model: '',
    status: '',
    date_range: {
      start: subDays(new Date(), 30),
      end: new Date()
    }
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { data: suppliers } = useSuppliers();
  const { toast } = useToast();

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setFilters(prev => ({
        ...prev,
        date_range: {
          start: range.from,
          end: range.to
        }
      }));
      setIsDatePickerOpen(false);
    }
  };

  const exportClaimsToCSV = async () => {
    setIsExporting(true);
    try {
      // Build query
      let query = supabase
        .from('claims')
        .select(`
          id,
          created_at,
          status,
          customer_name,
          customer_no,
          machine_model,
          machine_serial,
          description,
          category,
          warranty,
          department,
          suppliers(name),
          users!claims_technician_id_fkey(name),
          cost_line(amount, description, date, konto_nr),
          credit_note(amount, description, date, konto_nr)
        `)
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.machine_model) {
        query = query.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data: claims, error } = await query;

      if (error) throw error;

      // Transform data for CSV
      const csvData = claims?.map(claim => ({
        'Reklamasjon ID': claim.id,
        'Opprettet': format(new Date(claim.created_at || ''), 'dd.MM.yyyy'),
        'Status': claim.status,
        'Kunde': claim.customer_name || '',
        'Kundenr': claim.customer_no || '',
        'Maskin': claim.machine_model || '',
        'Serienr': claim.machine_serial || '',
        'Beskrivelse': claim.description || '',
        'Kategori': claim.category || '',
        'Garanti': claim.warranty ? 'Ja' : 'Nei',
        'Avdeling': claim.department || '',
        'Leverandør': claim.suppliers?.name || '',
        'Tekniker': claim.users?.name || '',
        'Totale kostnader': claim.cost_line?.reduce((sum, line) => sum + Number(line.amount), 0) || 0,
        'Totale kreditnotaer': claim.credit_note?.reduce((sum, note) => sum + Number(note.amount), 0) || 0
      })) || [];

      // Convert to CSV
      const csvContent = convertToCSV(csvData);
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reklamasjoner_${format(filters.date_range.start, 'ddMMyyyy')}_${format(filters.date_range.end, 'ddMMyyyy')}.csv`;
      link.click();
      
      toast({
        title: 'Eksport fullført',
        description: `${csvData.length} reklamasjoner eksportert til CSV.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Eksport feilet',
        description: 'Det oppstod en feil under eksporten.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(';');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape values that contain semicolons or quotes
        if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(';')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Rapporter</h1>
            <p className="text-gray-600">Eksporter og analyser data</p>
          </div>
        </div>
      </div>

      {/* Export Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Eksportfiltre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Supplier Filter */}
            <Select 
              value={filters.supplier_id} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, supplier_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Leverandør" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle leverandører</SelectItem>
                {suppliers?.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Machine Model Filter */}
            <Input
              placeholder="Maskinmodell..."
              value={filters.machine_model}
              onChange={(e) => setFilters(prev => ({ ...prev, machine_model: e.target.value }))}
            />

            {/* Status Filter */}
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle statuser</SelectItem>
                <SelectItem value="Ny">Ny</SelectItem>
                <SelectItem value="Avventer">Avventer</SelectItem>
                <SelectItem value="Godkjent">Godkjent</SelectItem>
                <SelectItem value="Avslått">Avslått</SelectItem>
                <SelectItem value="Bokført">Bokført</SelectItem>
                <SelectItem value="Lukket">Lukket</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
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
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Eksporter Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Reklamasjonsrapport (CSV)</h3>
                <p className="text-sm text-gray-600">
                  Eksporter alle reklamasjoner med kostnader og kreditnotaer basert på valgte filtre
                </p>
              </div>
              <Button 
                onClick={exportClaimsToCSV}
                disabled={isExporting}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Eksporterer...' : 'Eksporter CSV'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
