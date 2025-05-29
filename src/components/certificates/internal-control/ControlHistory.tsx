import { useInternalControlHistory } from '@/hooks/useInternalControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { EmptyState } from '../EmptyState';

export const ControlHistory = () => {
  const { data: history = [], isLoading } = useInternalControlHistory();

  const getStatusBadge = (status: string, deviationsCount: number) => {
    if (status === 'completed' && deviationsCount === 0) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Fullført
        </Badge>
      );
    } else if (status === 'completed_with_deviation' || deviationsCount > 0) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Fullført med avvik
        </Badge>
      );
    }
    return <Badge variant="secondary">Ukjent</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster historikk...</div>;
  }

  if (history.length === 0) {
    return (
      <EmptyState
        title="Ingen kontrollhistorikk ennå"
        description="Utførte sjekklister vil vises her når de er fullført."
        actionLabel="Gå til sjekklister"
        onAction={() => {/* TODO: Switch to checklists tab */}}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Kontrollhistorikk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dato utført</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avvik</TableHead>
              <TableHead>Kommentarer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((check) => (
              <TableRow key={check.id}>
                <TableCell className="font-medium">{check.title}</TableCell>
                <TableCell>{check.document_type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(check.date_performed).toLocaleDateString('nb-NO')}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(check.status, check.deviations_count)}
                </TableCell>
                <TableCell>
                  {check.deviations_count > 0 && (
                    <Badge variant="destructive">
                      {check.deviations_count} avvik
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {check.comments && (
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {check.comments}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ControlHistory;
