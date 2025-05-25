
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemHealthCheck } from '@/components/dashboard/SystemHealthCheck';
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor';
import { ErrorBoundaryWrapper } from '@/components/dashboard/ErrorBoundaryWrapper';
import { BarChart3, Activity, Settings, Download } from 'lucide-react';

const Reports = () => {
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
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Reklamasjonsrapport</h3>
                        <p className="text-sm text-gray-600">Komplett oversikt over alle reklamasjoner</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          CSV
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Kostnadsrapport</h3>
                        <p className="text-sm text-gray-600">Detaljert kostnadsanalyse per periode</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          CSV
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Leverandørrapport</h3>
                        <p className="text-sm text-gray-600">Ytelse og kostnader per leverandør</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          CSV
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50">
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
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
