
import { useState } from 'react';
import { ReportService, ReportType, ReportFormat } from '@/services/reports/reportService';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async (
    type: ReportType,
    format: ReportFormat,
    dateRange?: { start: Date; end: Date }
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: 'Genererer rapport',
        description: 'Vennligst vent mens rapporten genereres...',
      });

      switch (type) {
        case 'claims':
          await ReportService.generateClaimsReport(format, dateRange);
          break;
        case 'costs':
          await ReportService.generateCostsReport(format, dateRange);
          break;
        case 'suppliers':
          await ReportService.generateSuppliersReport(format, dateRange);
          break;
      }

      toast({
        title: 'Rapport generert',
        description: 'Rapporten har blitt lastet ned til din enhet.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Feil ved generering av rapport',
        description: 'Det oppstod en feil ved generering av rapporten. Prøv igjen.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating
  };
};
