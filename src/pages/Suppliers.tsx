
import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NewSupplierModal } from '@/components/claim-wizard/NewSupplierModal';
import { SuppliersTable } from '@/components/SuppliersTable';

const Suppliers = () => {
  const [newSupplierModalOpen, setNewSupplierModalOpen] = useState(false);

  const handleSupplierCreated = (supplierId: string) => {
    console.log('New supplier created with ID:', supplierId);
    // The suppliers list will automatically refresh due to React Query
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Leverandører</h1>
            <p className="text-gray-600">Administrer leverandører</p>
          </div>
        </div>
        <Button 
          className="btn-primary"
          onClick={() => setNewSupplierModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny Leverandør
        </Button>
      </div>

      <SuppliersTable />

      <NewSupplierModal
        open={newSupplierModalOpen}
        onOpenChange={setNewSupplierModalOpen}
        onSupplierCreated={handleSupplierCreated}
      />
    </div>
  );
};

export default Suppliers;
