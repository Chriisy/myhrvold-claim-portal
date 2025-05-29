
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText } from 'lucide-react';
import { AddCertificateModal } from './AddCertificateModal';

export const FGasHeaderActions = () => {
  const [addCertificateOpen, setAddCertificateOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button onClick={() => setAddCertificateOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Legg til sertifikat
      </Button>
      
      <AddCertificateModal 
        open={addCertificateOpen} 
        onClose={() => setAddCertificateOpen(false)} 
      />
    </div>
  );
};
