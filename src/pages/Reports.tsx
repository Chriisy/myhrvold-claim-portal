
import React, { Suspense, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDateRangePicker } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileSpreadsheet, FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { ReportService, ReportType, ReportFormat } from '@/services/reports/reportService';
import { toast } from '@/hooks/use-toast';
import { addDays, startOfMonth } from 'date-fns';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: new Date()
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (type: ReportType, format: ReportFormat) => {
    setIsGenerating(true);
    try {
      await ReportService.generateReport(type, format, dateRange);
      toast({
        title: "Rapport generert",
        description: `${type} rapport i ${format.toUpperCase()} format er lastet ned`,
      });
    } catch (error) {
      toast({
        title: "Feil ved generering",
        description: "Kunne ikke generere rapport",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: 'claims' as ReportType,
      title: 'Reklamasjonsrapport',
      description: 'Oversikt over alle reklamasjoner i valgt periode',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'costs' as ReportType,
      title: 'Kostnadsrapport',
      description: 'Detaljert kostnadsoversikt for reklamasjoner',
      icon: DollarSign,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'suppliers' as ReportType,
      title: 'Leverandørrapport',
      description: 'Statistikk og ytelse per leverandør',
      icon: Users,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Rapporter</h1>
          <p className="text-gray-600">Generer og eksporter rapporter for analyse</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Velg periode</CardTitle>
          <CardDescription>
            Velg tidsperiode for rapportgenerering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Fra dato</label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Til dato</label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex space-x-2 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setDateRange({ start: startOfMonth(new Date()), end: new Date() })}
              >
                Denne måneden
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDateRange({ start: addDays(new Date(), -30), end: new Date() })}
              >
                Siste 30 dager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id, 'pdf')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(report.id, 'csv')}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Hurtigstatistikk</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-600">Totalt antall reklamasjoner</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-- kr</div>
                  <div className="text-sm text-gray-600">Total kostnad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">--</div>
                  <div className="text-sm text-gray-600">Aktive leverandører</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default Reports;
