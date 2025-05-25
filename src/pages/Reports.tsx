
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SystemHealthCheck } from '@/components/dashboard/SystemHealthCheck';
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor';
import { ErrorBoundaryWrapper } from '@/components/dashboard/ErrorBoundaryWrapper';
import { ReportDateRangePicker } from '@/components/reports/ReportDateRangePicker';
import { BarChart3, Activity, Settings, Download, FileText, Calculator, Building } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useState } from 'react';
import { subDays } from 'date-fns';

const Reports = () => {
  const { generateReport, isGenerating } = useReports();
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });

  const handleDownload = (type: 'claims' | 'costs' | 'suppliers', format: 'csv' | 'pdf') => {
    generateReport(type, format, dateRange);
  };

  return (
    <ErrorBoundaryWrapper title="Feil ved lasting av rapporter">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Rapporter & System</h1>
            <p className="text-gray-600">Detaljerte rapporter og systemovervåking</p>
          </div>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Rapporter
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Systemhelse
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ytelse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Tilgjengelige Rapporter
                  </CardTitle>
                  <CardDescription>
                    Last ned detaljerte rapporter i ulike formater
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <ReportDateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                    />
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Reklamasjonsrapport</h3>
                          <p className="text-sm text-gray-600">Komplett oversikt over alle reklamasjoner</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('claims', 'csv')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('claims', 'pdf')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="font-semibold">Kostnadsrapport</h3>
                          <p className="text-sm text-gray-600">Detaljert kostnadsanalyse per periode</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('costs', 'csv')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('costs', 'pdf')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">Leverandørrapport</h3>
                          <p className="text-sm text-gray-600">Ytelse og kostnader per leverandør</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('suppliers', 'csv')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload('suppliers', 'pdf')}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        <span className="text-sm">Genererer rapport...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="grid gap-6">
              <ErrorBoundaryWrapper title="Feil ved lasting av systemhelse">
                <SystemHealthCheck />
              </ErrorBoundaryWrapper>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid gap-6">
              <ErrorBoundaryWrapper title="Feil ved lasting av ytelsesmonitor">
                <PerformanceMonitor />
              </ErrorBoundaryWrapper>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundaryWrapper>
  );
};

export default Reports;
