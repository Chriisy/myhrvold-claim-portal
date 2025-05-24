
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Reports = () => {
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
        <Button className="btn-primary">
          <Download className="w-4 h-4 mr-2" />
          Eksporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapport Generering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Rapport funksjoner vil bli implementert i neste fase.</p>
            <p className="text-sm text-gray-500">Dette vil inkludere filtrering etter dato, leverandør, konto og CSV eksport.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
