
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useSuppliers, useDeleteSupplier, type Supplier } from '@/hooks/useSuppliers';
import { NewSupplierModal } from '@/components/claim-wizard/NewSupplierModal';
import { EditSupplierModal } from '@/components/suppliers/EditSupplierModal';

const Suppliers = () => {
  const { data: suppliers, isLoading } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const [newSupplierModalOpen, setNewSupplierModalOpen] = useState(false);
  const [editSupplierModalOpen, setEditSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierModalOpen(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne leverandøren?')) {
      await deleteSupplier.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Leverandører</h1>
            <p className="text-gray-600">Laster leverandører...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-myhrvold-primary" />
            <div>
              <h1 className="text-3xl font-bold text-myhrvold-primary">Leverandører</h1>
              <p className="text-gray-600">Administrer leverandører og kontaktinformasjon</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setNewSupplierModalOpen(true)}
          className="bg-myhrvold-primary hover:bg-myhrvold-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ny leverandør
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Leverandøroversikt</span>
              <Badge variant="secondary">
                {suppliers?.length || 0} leverandører
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suppliers && suppliers.length > 0 ? (
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{supplier.name}</h3>
                      {supplier.contact_name && (
                        <p className="text-sm text-gray-600">
                          Kontakt: {supplier.contact_name}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1">
                        {supplier.contact_phone && (
                          <p className="text-sm text-gray-600">
                            📞 {supplier.contact_phone}
                          </p>
                        )}
                        {supplier.contact_email && (
                          <p className="text-sm text-gray-600">
                            ✉️ {supplier.contact_email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Rediger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Slett
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ingen leverandører registrert
                </h3>
                <p className="text-gray-600 mb-4">
                  Kom i gang ved å legge til din første leverandør.
                </p>
                <Button
                  onClick={() => setNewSupplierModalOpen(true)}
                  className="bg-myhrvold-primary hover:bg-myhrvold-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til leverandør
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewSupplierModal
        open={newSupplierModalOpen}
        onOpenChange={setNewSupplierModalOpen}
        onSupplierCreated={() => {
          // Modal closes automatically after creation
        }}
      />

      <EditSupplierModal
        supplier={selectedSupplier}
        open={editSupplierModalOpen}
        onOpenChange={setEditSupplierModalOpen}
      />
    </div>
  );
};

export default Suppliers;
