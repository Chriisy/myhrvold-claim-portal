
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useInternalControlHistory } from '@/hooks/useInternalControl';

export const ControlHistory = () => {
  const { data: history = [], isLoading } = useInternalControlHistory();

  const getStatusInfo = (status: string, deviations: number) => {
    if (status === 'completed_with_deviation' || deviations > 0) {
      return {
        label: `Fullført med ${deviations} avvik`,
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle
      };
    }
    return {
      label: 'Fullført uten avvik',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    };
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'lekkasjekontroll': 'Lekkasjekontroll',
      'egenkontroll': 'Egenkontroll',
      'tomming_gjenvinning': 'Tømming og gjenvinning',
      'pafylling': 'Påfylling'
    };
    return types[type] || type;
  };

  const exportReport = () => {
    console.log('Eksporterer rapport...');
  };

  if (isLoading) {
    return <div className="text-center py-4">Laster historikk...</div>;
  }

  const completedWithoutDeviations = history.filter(h => h.status === 'completed').length;
  const completedWithDeviations = history.filter(h => h.deviations_count > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kontrollhistorikk</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Eksporter rapport
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {completedWithoutDeviations}
                </p>
                <p className="text-sm text-gray-600">Fullført uten avvik</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {completedWithDeviations}
                </p>
                <p className="text-sm text-gray-600">Med avvik</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{history.length}</p>
                <p className="text-sm text-gray-600">Totale kontroller</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History list */}
      <Card>
        <CardHeader>
          <CardTitle>Detaljert historikk</CardTitle>
          <CardDescription>
            Alle gjennomførte kontroller og deres resultater
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen kontroller er registrert ennå</p>
              <p className="text-sm">Start med å fullføre en sjekkliste</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                const statusInfo = getStatusInfo(item.status, item.deviations_count);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <Badge variant="outline">{getTypeLabel(item.document_type)}</Badge>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(item.date_performed), 'dd.MM.yyyy', { locale: nb })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{item.performed_by}</span>
                          </div>
                        </div>
                        
                        {item.comments && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {item.comments}
                          </p>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Vis rapport
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
