
import { useState } from 'react';
import { useFGasCertificates } from '@/hooks/useFGasCertificates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';
import { AddCertificateModal } from './AddCertificateModal';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Shield, Calendar, User, Building } from 'lucide-react';

interface CertificatesListProps {
  filterType: 'personal' | 'company' | 'all';
}

export const CertificatesList = ({ filterType }: CertificatesListProps) => {
  const { data: certificates = [], isLoading, error } = useFGasCertificates(filterType);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktiv', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      expiring_soon: { label: 'Utløper snart', variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800' },
      expired: { label: 'Utløpt', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster sertifikater...</div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          <p>Feil ved lasting av sertifikater: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <>
        <EmptyState
          title="Ingen sertifikater ennå"
          description="Legg til ditt første F-gass-sertifikat for å komme i gang med sertifikatadministrasjon."
          actionLabel="Legg til sertifikat"
          onAction={() => setAddModalOpen(true)}
        />
        <AddCertificateModal 
          open={addModalOpen} 
          onClose={() => setAddModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          F-gass Sertifikater
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sertifikatnummer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Innehaver</TableHead>
              <TableHead>Utstedelsesdato</TableHead>
              <TableHead>Utløpsdato</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.certificate_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {cert.certificate_type === 'personal' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                    {cert.certificate_type === 'personal' ? 'Personlig' : 'Bedrift'}
                  </div>
                </TableCell>
                <TableCell>{cert.holder_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(cert.issue_date).toLocaleDateString('nb-NO')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(cert.expiry_date).toLocaleDateString('nb-NO')}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(cert.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CertificatesList;
