
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, Award, AlertTriangle, Clock, FileText } from 'lucide-react';
import { CertificatesList } from '@/components/certificates/CertificatesList';
import { AddCertificateModal } from '@/components/certificates/AddCertificateModal';
import { CertificateStats } from '@/components/certificates/CertificateStats';
import { ExpiringCertificatesAlert } from '@/components/certificates/ExpiringCertificatesAlert';
import { usePermissions } from '@/hooks/usePermissions';

const FGasCertificates = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'personal' | 'company' | 'all'>('all');
  const { isAdmin, canManageUsers } = usePermissions();
  
  const canManageCertificates = isAdmin() || canManageUsers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">F-gass Sertifikater</h1>
            <p className="text-gray-600">Oversikt over F-gass sertifikater og fornyelser</p>
          </div>
        </div>
        {canManageCertificates && (
          <Button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nytt Sertifikat
          </Button>
        )}
      </div>

      <ExpiringCertificatesAlert />
      
      <CertificateStats />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-myhrvold-primary" />
                Sertifikatoversikt
              </CardTitle>
              <CardDescription>
                Alle F-gass sertifikater i bedriften
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                Alle
              </Button>
              <Button 
                variant={selectedType === 'personal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('personal')}
              >
                Personlige
              </Button>
              <Button 
                variant={selectedType === 'company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('company')}
              >
                Bedrift
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CertificatesList filterType={selectedType} />
        </CardContent>
      </Card>

      {showAddModal && (
        <AddCertificateModal 
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default FGasCertificates;
