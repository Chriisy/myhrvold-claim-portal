
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ControlHistoryItem {
  id: string;
  type: string;
  title: string;
  date_performed: string;
  performed_by: string;
  status: 'completed' | 'completed_with_deviation';
  deviations_count: number;
  comments?: string;
}

const SAMPLE_HISTORY: ControlHistoryItem[] = [
  {
    id: '1',
    type: 'lekkasjekontroll',
    title: 'Lekkasjekontroll - Anlegg A',
    date_performed: '2025-01-15',
    performed_by: 'Ola Hansen',
    status: 'completed',
    deviations_count: 0,
    comments: 'Alle kontroller OK. Ingen avvik registrert.'
  },
  {
    id: '2',
    type: 'egenkontroll',
    title: 'Egenkontroll - Q4 2024',
    date_performed: '2024-12-20',
    performed_by: 'Kari Normann',
    status: 'completed_with_deviation',
    deviations_count: 1,
    comments: 'Ett sertifikat nær utløp. Fornyelse påbegynt.'
  },
  {
    id: '3',
    type: 'tomming_gjenvinning',
    title: 'Tømming og gjenvinning - Service X',
    date_performed: '2024-12-10',
    performed_by: 'Per Andersen',
    status: 'completed',
    deviations_count: 0
  }
];

export const ControlHistory = () => {
  const [history] = useState<ControlHistoryItem[]>(SAMPLE_HISTORY);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kontrollhistorikk</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Eksporter rapport
          </Button>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Alle perioder</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="last-6-months">Siste 6 måneder</option>
          </select>
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
                  {history.filter(h => h.status === 'completed').length}
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
                  {history.filter(h => h.deviations_count > 0).length}
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
                        <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
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
        </CardContent>
      </Card>
    </div>
  );
};
