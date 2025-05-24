
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Suppliers = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Leverandører</h1>
            <p className="text-gray-600">Administrer leverandører</p>
          </div>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Ny Leverandør
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leverandør Oversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Leverandør administrasjon vil bli implementert i neste fase.</p>
            <p className="text-sm text-gray-500">Dette vil inkludere CRUD operasjoner for leverandører med kontaktinformasjon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
