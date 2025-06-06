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
import { useSuppliers, useArchiveSupplier, type Supplier } from '@/hooks/useSuppliers';
import { EditSupplierModal } from '@/components/suppliers/EditSupplierModal';

interface ConfirmArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  supplierName: string;
}

const ConfirmArchiveDialog = ({ open, onOpenChange, onConfirm, supplierName }: ConfirmArchiveDialogProps) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Arkiver leverandør</h3>
        <p className="text-gray-600 mb-6">
          Er du sikker på at du vil arkivere leverandøren "{supplierName}"?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Arkiver
          </Button>
        </div>
      </div>
    </div>
  );
};

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
          <CardTitle>Leverandør Oversikt ({suppliers?.length || 0})</CardTitle>
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
                    {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('nb-NO') : '-'}
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

      <EditSupplierModal
        supplier={selectedSupplier}
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
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

export default SuppliersTable;
