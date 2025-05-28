
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell } from 'lucide-react';
import { useExpiringCertificates } from '@/hooks/useFGasCertificates';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export const ExpiringCertificatesAlert = () => {
  const { data: expiringCertificates, isLoading } = useExpiringCertificates();

  if (isLoading || !expiringCertificates || expiringCertificates.length === 0) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">
        Sertifikater som utløper snart
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <div className="mt-2 space-y-2">
          {expiringCertificates.slice(0, 3).map((cert) => (
            <div key={cert.certificate_id} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{cert.certificate_number}</span>
                {cert.holder_name && <span className="text-sm"> - {cert.holder_name}</span>}
              </div>
              <div className="text-sm">
                Utløper: {format(new Date(cert.expiry_date), 'dd.MM.yyyy', { locale: nb })}
                <span className="ml-2 text-xs">
                  ({cert.days_until_expiry} dager)
                </span>
              </div>
            </div>
          ))}
          {expiringCertificates.length > 3 && (
            <p className="text-sm">
              ...og {expiringCertificates.length - 3} flere
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button size="sm" variant="outline" className="text-yellow-800 border-yellow-300">
            <Bell className="w-4 h-4 mr-2" />
            Send påminnelser
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
