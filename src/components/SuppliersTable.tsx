
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Archive, Phone, Mail, User } from 'lucide-react';
import { useSuppliers, useArchiveSupplier } from '@/hooks/useSuppliers';
import { NewSupplierModal } from '@/components/claim-wizard/NewSupplierModal';
import { ConfirmArchiveDialog } from '@/components/ConfirmArchiveDialog';
import { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

export const SuppliersTable = () => {
  const { data: suppliers, isLoading, error } = useSuppliers();
  const archiveSupplier = useArchiveSupplier();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [supplierToArchive, setSupplierToArchive] = useState<Supplier | null>(null);

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditModalOpen(true);
  };

  const handleArchiveClick = (supplier: Supplier) => {
    setSupplierToArchive(supplier);
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (supplierToArchive) {
      await archiveSupplier.mutateAsync(supplierToArchive.id);
      setArchiveDialogOpen(false);
      setSupplierToArchive(null);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedSupplier(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Laster leverandører...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Feil ved lasting av leverandører: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leverandør Oversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Ingen leverandører funnet.</p>
            <p className="text-sm text-gray-500">Klikk "Ny Leverandør" for å opprette din første leverandør.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leverandør Oversikt ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>Kontaktperson</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Opprettet</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    {supplier.contact_name ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {supplier.contact_name}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.contact_phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${supplier.contact_phone}`} className="text-blue-600 hover:underline">
                          {supplier.contact_phone}
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.contact_email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${supplier.contact_email}`} className="text-blue-600 hover:underline">
                          {supplier.contact_email}
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(supplier.created_at).toLocaleDateString('nb-NO')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(supplier)}
                        title="Rediger leverandør"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveClick(supplier)}
                        title="Arkiver leverandør"
                        disabled={archiveSupplier.isPending}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewSupplierModal
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
        supplier={selectedSupplier}
        mode="edit"
      />

      <ConfirmArchiveDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleConfirmArchive}
        supplierName={supplierToArchive?.name || ''}
      />
    </>
  );
};
