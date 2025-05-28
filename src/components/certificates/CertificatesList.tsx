
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useFGasCertificates } from '@/hooks/useFGasCertificates';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface CertificatesListProps {
  filterType: 'personal' | 'company' | 'all';
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'expiring_soon': return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'pending_renewal': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Aktiv';
    case 'expiring_soon': return 'Utløper snart';
    case 'expired': return 'Utløpt';
    case 'pending_renewal': return 'Venter fornyelse';
    default: return status;
  }
};

export const CertificatesList = ({ filterType }: CertificatesListProps) => {
  const { data: certificates, isLoading } = useFGasCertificates(filterType);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Ingen sertifikater funnet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {certificates.map((certificate) => {
        const daysUntilExpiry = Math.ceil((new Date(certificate.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div key={certificate.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(certificate.status)}
                  <h3 className="font-semibold text-myhrvold-primary">
                    {certificate.certificate_number}
                  </h3>
                  <Badge className={`${getStatusColor(certificate.status)} text-xs`}>
                    {getStatusText(certificate.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {certificate.certificate_type === 'personal' ? 'Personlig' : 'Bedrift'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Innehaver</p>
                    <p className="font-medium">{certificate.holder_name || 'Bedriftssertifikat'}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Utløpsdato</p>
                    <p className="font-medium">
                      {format(new Date(certificate.expiry_date), 'dd.MM.yyyy', { locale: nb })}
                    </p>
                    {daysUntilExpiry > 0 && daysUntilExpiry <= 90 && (
                      <p className="text-xs text-yellow-600">
                        {daysUntilExpiry} dager igjen
                      </p>
                    )}
                    {daysUntilExpiry <= 0 && (
                      <p className="text-xs text-red-600">
                        Utløpt for {Math.abs(daysUntilExpiry)} dager siden
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Utstedt av</p>
                    <p className="font-medium">{certificate.issuing_authority || 'Ikke oppgitt'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Detaljer
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
