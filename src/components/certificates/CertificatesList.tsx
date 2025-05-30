
import { useState } from 'react';
import { useFGasCertificates } from '@/hooks/useFGasCertificates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';
import { AddCertificateModal } from './AddCertificateModal';
import { EditCertificateModal } from './EditCertificateModal';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Shield, Calendar, User, Building, Edit } from 'lucide-react';

interface CertificatesListProps {
  filterType: 'personal' | 'company' | 'all';
}

export const CertificatesList = ({ filterType }: CertificatesListProps) => {
  const { data: certificates = [], isLoading, error } = useFGasCertificates(filterType);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

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

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'I': 'bg-blue-100 text-blue-800',
      'II': 'bg-green-100 text-green-800',
      'III': 'bg-yellow-100 text-yellow-800',
      'IV': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}>
        Kat. {category}
      </Badge>
    );
  };

  const handleEditClick = (certificate: any) => {
    setSelectedCertificate(certificate);
    setEditModalOpen(true);
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
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            F-gass Sertifikater
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <Table>
              <TableHeader className="sticky top-0 bg-white border-b z-10">
                <TableRow>
                  <TableHead className="min-w-[120px]">Nr.</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[80px]">Kat.</TableHead>
                  <TableHead className="min-w-[150px]">Innehaver</TableHead>
                  <TableHead className="min-w-[110px]">Fødsel</TableHead>
                  <TableHead className="min-w-[110px]">Utstedt</TableHead>
                  <TableHead className="min-w-[110px]">Utløper</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium text-sm">{cert.certificate_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {cert.certificate_type === 'personal' ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Building className="w-3 h-3" />
                        )}
                        <span className="text-xs">
                          {cert.certificate_type === 'personal' ? 'Personlig' : 'Bedrift'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.category && getCategoryBadge(cert.category)}
                    </TableCell>
                    <TableCell className="text-sm">{cert.holder_name}</TableCell>
                    <TableCell>
                      {cert.birth_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">
                            {new Date(cert.birth_date).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">
                          {new Date(cert.issue_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">
                          {new Date(cert.expiry_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(cert.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(cert)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditCertificateModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCertificate(null);
        }}
        certificate={selectedCertificate}
      />
    </>
  );
};

export default CertificatesList;
