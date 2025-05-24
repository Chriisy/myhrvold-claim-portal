
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClaimWizard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/claims">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Ny Reklamasjon</h1>
          <p className="text-gray-600">Opprett en ny reklamasjon</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrer Reklamasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Reklamasjon registrering wizard vil bli implementert i neste fase.</p>
            <p className="text-sm text-gray-500">Dette vil inkludere steg-for-steg veiledning for å registrere kunde, maskin, kategori, og filer.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimWizard;
