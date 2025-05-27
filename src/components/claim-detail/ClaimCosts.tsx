
import { useState } from 'react';
import { useClaimCosts, useAddClaimCost, useUpdateClaimCost, useDeleteClaimCost, type ClaimCost } from '@/hooks/useClaimCosts';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ClaimCostsProps {
  claimId: string;
}

const ClaimCosts = ({ claimId }: ClaimCostsProps) => {
  const { data: costs, isLoading } = useClaimCosts(claimId);
  const { data: accountCodes } = useAccountCodes();
  const addCost = useAddClaimCost();
  const updateCost = useUpdateClaimCost();
  const deleteCost = useDeleteClaimCost();

  const [open, setOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<ClaimCost | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    voucher_no: '',
    konto_nr: 'none',
  });

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      voucher_no: '',
      konto_nr: 'none',
    });
    setEditingCost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const costData = {
      claim_id: claimId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      voucher_no: formData.voucher_no || null,
      konto_nr: formData.konto_nr === 'none' ? null : parseInt(formData.konto_nr),
      source: 'manual' as const,
    };

    try {
      if (editingCost) {
        await updateCost.mutateAsync({ id: editingCost.id, ...costData });
      } else {
        await addCost.mutateAsync(costData);
      }
      resetForm();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleEdit = (cost: ClaimCost) => {
    setEditingCost(cost);
    setFormData({
      description: cost.description,
      amount: cost.amount.toString(),
      date: cost.date,
      voucher_no: cost.voucher_no || '',
      konto_nr: cost.konto_nr?.toString() || 'none',
    });
    setOpen(true);
  };

  const handleDelete = async (cost: ClaimCost) => {
    await deleteCost.mutateAsync({ id: cost.id, claimId });
  };

  const totalCosts = costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0;

  if (isLoading) {
    return <div>Laster kostnader...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Kostnader</h3>
          <p className="text-sm text-gray-600">
            Total: kr {totalCosts.toLocaleString('nb-NO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kostnad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCost ? 'Rediger kostnad' : 'Legg til ny kostnad'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Beskrivelse</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Beløp</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Dato</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="voucher_no">Bilagsnummer</Label>
                <Input
                  id="voucher_no"
                  value={formData.voucher_no}
                  onChange={(e) => setFormData({ ...formData, voucher_no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="konto_nr">Konto</Label>
                <Select value={formData.konto_nr} onValueChange={(value) => setFormData({ ...formData, konto_nr: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg konto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen konto</SelectItem>
                    {accountCodes?.map((account) => (
                      <SelectItem key={account.konto_nr} value={account.konto_nr.toString()}>
                        {account.konto_nr} - {account.comment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={addCost.isPending || updateCost.isPending}>
                  {editingCost ? 'Oppdater' : 'Legg til'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!costs || costs.length === 0 ? (
        <p className="text-gray-500">Ingen kostnader registrert.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Bilag</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell>{cost.description}</TableCell>
                <TableCell>kr {cost.amount.toLocaleString('nb-NO', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{new Date(cost.date).toLocaleDateString('nb-NO')}</TableCell>
                <TableCell>{cost.voucher_no || '-'}</TableCell>
                <TableCell>{cost.konto_nr || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cost)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Slett kostnad</AlertDialogTitle>
                          <AlertDialogDescription>
                            Er du sikker på at du vil slette denne kostnaden? Denne handlingen kan ikke angres.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cost)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Slett
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ClaimCosts;
