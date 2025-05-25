
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export type ReportType = 'claims' | 'costs' | 'suppliers';
export type ReportFormat = 'csv' | 'pdf';

interface ClaimReport {
  id: string;
  created_at: string;
  customer_name: string;
  machine_model: string;
  category: string;
  status: string;
  supplier_name: string;
  technician_name: string;
  total_cost: number;
}

interface CostReport {
  account_code: number;
  description: string;
  amount: number;
  claim_id: string;
  customer_name: string;
  date: string;
}

interface SupplierReport {
  supplier_name: string;
  claims_count: number;
  total_cost: number;
  avg_cost: number;
  open_claims: number;
}

export class ReportService {
  static async generateClaimsReport(format: ReportFormat, dateRange?: { start: Date; end: Date }) {
    const data = await this.fetchClaimsData(dateRange);
    
    if (format === 'csv') {
      return this.exportClaimsToCSV(data);
    } else {
      return this.exportClaimsToPDF(data, dateRange);
    }
  }

  static async generateCostsReport(format: ReportFormat, dateRange?: { start: Date; end: Date }) {
    const data = await this.fetchCostsData(dateRange);
    
    if (format === 'csv') {
      return this.exportCostsToCSV(data);
    } else {
      return this.exportCostsToPDF(data, dateRange);
    }
  }

  static async generateSuppliersReport(format: ReportFormat, dateRange?: { start: Date; end: Date }) {
    const data = await this.fetchSuppliersData(dateRange);
    
    if (format === 'csv') {
      return this.exportSuppliersToCSV(data);
    } else {
      return this.exportSuppliersToPDF(data, dateRange);
    }
  }

  private static async fetchClaimsData(dateRange?: { start: Date; end: Date }): Promise<ClaimReport[]> {
    return ErrorService.withRetry(async () => {
      let query = supabase
        .from('claims')
        .select(`
          id,
          created_at,
          customer_name,
          machine_model,
          category,
          status,
          suppliers(name),
          technician:users!claims_technician_id_fkey(name)
        `)
        .is('deleted_at', null);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data: claims, error: claimsError } = await query;

      if (claimsError) {
        ErrorService.handleSupabaseError(claimsError, 'laste reklamasjoner');
        throw claimsError;
      }

      // Get cost totals for each claim
      const claimsWithCosts = await Promise.all(
        (claims || []).map(async (claim) => {
          const { data: costs } = await supabase
            .from('cost_line')
            .select('amount')
            .eq('claim_id', claim.id);

          const totalCost = costs?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;

          return {
            id: claim.id,
            created_at: claim.created_at,
            customer_name: claim.customer_name || 'Ikke oppgitt',
            machine_model: claim.machine_model || 'Ikke oppgitt',
            category: claim.category || 'Ikke oppgitt',
            status: claim.status,
            supplier_name: (claim.suppliers as any)?.name || 'Ikke oppgitt',
            technician_name: (claim.technician as any)?.name || 'Ikke oppgitt',
            total_cost: totalCost
          };
        })
      );

      return claimsWithCosts;
    });
  }

  private static async fetchCostsData(dateRange?: { start: Date; end: Date }): Promise<CostReport[]> {
    return ErrorService.withRetry(async () => {
      let query = supabase
        .from('cost_line')
        .select(`
          konto_nr,
          description,
          amount,
          date,
          claim_id,
          claims(customer_name)
        `);

      if (dateRange) {
        query = query
          .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.end, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        ErrorService.handleSupabaseError(error, 'laste kostnader');
        throw error;
      }

      return (data || []).map(cost => ({
        account_code: cost.konto_nr || 0,
        description: cost.description,
        amount: cost.amount,
        claim_id: cost.claim_id,
        customer_name: (cost.claims as any)?.customer_name || 'Ikke oppgitt',
        date: cost.date
      }));
    });
  }

  private static async fetchSuppliersData(dateRange?: { start: Date; end: Date }): Promise<SupplierReport[]> {
    return ErrorService.withRetry(async () => {
      let query = supabase
        .from('suppliers')
        .select(`
          id,
          name,
          claims(id, status, created_at)
        `)
        .is('deleted_at', null);

      const { data, error } = await query;

      if (error) {
        ErrorService.handleSupabaseError(error, 'laste leverandører');
        throw error;
      }

      const suppliersWithStats = await Promise.all(
        (data || []).map(async (supplier) => {
          let claims = (supplier.claims as any) || [];
          
          if (dateRange) {
            claims = claims.filter((claim: any) => {
              const claimDate = new Date(claim.created_at);
              return claimDate >= dateRange.start && claimDate <= dateRange.end;
            });
          }

          // Get cost totals for supplier claims
          const claimIds = claims.map((claim: any) => claim.id);
          const { data: costs } = await supabase
            .from('cost_line')
            .select('amount')
            .in('claim_id', claimIds);

          const totalCost = costs?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
          const openClaims = claims.filter((claim: any) => 
            ['Ny', 'Pågår', 'Venter på leverandør'].includes(claim.status)
          ).length;

          return {
            supplier_name: supplier.name,
            claims_count: claims.length,
            total_cost: totalCost,
            avg_cost: claims.length > 0 ? totalCost / claims.length : 0,
            open_claims: openClaims
          };
        })
      );

      return suppliersWithStats.filter(supplier => supplier.claims_count > 0);
    });
  }

  private static exportClaimsToCSV(data: ClaimReport[]): void {
    const headers = [
      'Reklamasjon ID',
      'Opprettet dato',
      'Kunde',
      'Maskinmodell',
      'Kategori',
      'Status',
      'Leverandør',
      'Tekniker',
      'Total kostnad'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(claim => [
        claim.id,
        format(new Date(claim.created_at), 'dd.MM.yyyy', { locale: nb }),
        `"${claim.customer_name}"`,
        `"${claim.machine_model}"`,
        `"${claim.category}"`,
        `"${claim.status}"`,
        `"${claim.supplier_name}"`,
        `"${claim.technician_name}"`,
        claim.total_cost.toFixed(2)
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'reklamasjonsrapport.csv', 'text/csv');
  }

  private static exportClaimsToPDF(data: ClaimReport[], dateRange?: { start: Date; end: Date }): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Reklamasjonsrapport', 20, 20);
    
    if (dateRange) {
      doc.setFontSize(12);
      doc.text(
        `Periode: ${format(dateRange.start, 'dd.MM.yyyy', { locale: nb })} - ${format(dateRange.end, 'dd.MM.yyyy', { locale: nb })}`,
        20, 30
      );
    }
    
    doc.setFontSize(10);
    doc.text(`Generert: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: nb })}`, 20, 40);

    // Table
    const tableData = data.map(claim => [
      claim.id.substring(0, 8) + '...',
      format(new Date(claim.created_at), 'dd.MM.yyyy', { locale: nb }),
      claim.customer_name,
      claim.machine_model,
      claim.category,
      claim.status,
      claim.supplier_name,
      claim.technician_name,
      `${claim.total_cost.toFixed(2)} kr`
    ]);

    autoTable(doc, {
      head: [['ID', 'Dato', 'Kunde', 'Maskin', 'Kategori', 'Status', 'Leverandør', 'Tekniker', 'Kostnad']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save('reklamasjonsrapport.pdf');
  }

  private static exportCostsToCSV(data: CostReport[]): void {
    const headers = [
      'Kontokode',
      'Beskrivelse',
      'Beløp',
      'Dato',
      'Reklamasjon ID',
      'Kunde'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(cost => [
        cost.account_code,
        `"${cost.description}"`,
        cost.amount.toFixed(2),
        cost.date,
        cost.claim_id,
        `"${cost.customer_name}"`
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'kostnadsrapport.csv', 'text/csv');
  }

  private static exportCostsToPDF(data: CostReport[], dateRange?: { start: Date; end: Date }): void {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Kostnadsrapport', 20, 20);
    
    if (dateRange) {
      doc.setFontSize(12);
      doc.text(
        `Periode: ${format(dateRange.start, 'dd.MM.yyyy', { locale: nb })} - ${format(dateRange.end, 'dd.MM.yyyy', { locale: nb })}`,
        20, 30
      );
    }
    
    doc.setFontSize(10);
    doc.text(`Generert: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: nb })}`, 20, 40);

    const tableData = data.map(cost => [
      cost.account_code.toString(),
      cost.description,
      `${cost.amount.toFixed(2)} kr`,
      cost.date,
      cost.claim_id.substring(0, 8) + '...',
      cost.customer_name
    ]);

    autoTable(doc, {
      head: [['Konto', 'Beskrivelse', 'Beløp', 'Dato', 'Reklamasjon', 'Kunde']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    const totalAmount = data.reduce((sum, cost) => sum + cost.amount, 0);
    doc.setFontSize(12);
    doc.text(`Total: ${totalAmount.toFixed(2)} kr`, 20, (doc as any).lastAutoTable.finalY + 20);

    doc.save('kostnadsrapport.pdf');
  }

  private static exportSuppliersToCSV(data: SupplierReport[]): void {
    const headers = [
      'Leverandør',
      'Antall reklamasjoner',
      'Total kostnad',
      'Gjennomsnittlig kostnad',
      'Åpne reklamasjoner'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(supplier => [
        `"${supplier.supplier_name}"`,
        supplier.claims_count,
        supplier.total_cost.toFixed(2),
        supplier.avg_cost.toFixed(2),
        supplier.open_claims
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'leverandørrapport.csv', 'text/csv');
  }

  private static exportSuppliersToPDF(data: SupplierReport[], dateRange?: { start: Date; end: Date }): void {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Leverandørrapport', 20, 20);
    
    if (dateRange) {
      doc.setFontSize(12);
      doc.text(
        `Periode: ${format(dateRange.start, 'dd.MM.yyyy', { locale: nb })} - ${format(dateRange.end, 'dd.MM.yyyy', { locale: nb })}`,
        20, 30
      );
    }
    
    doc.setFontSize(10);
    doc.text(`Generert: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: nb })}`, 20, 40);

    const tableData = data.map(supplier => [
      supplier.supplier_name,
      supplier.claims_count.toString(),
      `${supplier.total_cost.toFixed(2)} kr`,
      `${supplier.avg_cost.toFixed(2)} kr`,
      supplier.open_claims.toString()
    ]);

    autoTable(doc, {
      head: [['Leverandør', 'Antall', 'Total kostnad', 'Gj.snitt kostnad', 'Åpne']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save('leverandørrapport.pdf');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
