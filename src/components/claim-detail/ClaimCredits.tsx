
import { useState } from 'react';
import { useClaimCredits, useAddClaimCredit, useUpdateClaimCredit, useDeleteClaimCredit, type ClaimCredit } from '@/hooks/useClaimCredits';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ClaimCreditsProps {
  claimId: string;
}

const ClaimCredits = ({ claimId }: ClaimCreditsProps) => {
  const { data: credits, isLoading } = useClaimCredits(claimId);
  const { data: accountCodes } = useAccountCodes();
  const addCredit = useAddClaimCredit();
  const updateCredit = useUpdateClaimCredit();
  const deleteCredit = useDeleteClaimCredit();

  const [open, setOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<ClaimCredit | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    voucher_no: '',
    konto_nr: '',
  });

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      voucher_no: '',
      konto_nr: '',
    });
    setEditingCredit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const creditData = {
      claim_id: claimId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      voucher_no: formData.voucher_no || null,
      konto_nr: formData.konto_nr ? parseInt(formData.konto_nr) : null,
      source: 'manual' as const,
    };

    try {
      if (editingCredit) {
        await updateCredit.mutateAsync({ id: editingCredit.id, ...creditData });
      } else {
        await addCredit.mutateAsync(creditData);
      }
      resetForm();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleEdit = (credit: ClaimCredit) => {
    setEditingCredit(credit);
    setFormData({
      description: credit.description,
      amount: credit.amount.toString(),
      date: credit.date,
      voucher_no: credit.voucher_no || '',
      konto_nr: credit.konto_nr?.toString() || '',
    });
    setOpen(true);
  };

  const handleDelete = async (credit: ClaimCredit) => {
    await deleteCredit.mutateAsync({ id: credit.id, claimId });
  };

  const totalCredits = credits?.reduce((sum, credit) => sum + credit.amount, 0) || 0;

  if (isLoading) {
    return <div>Laster kreditnotaer...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Kreditnotaer</h3>
          <p className="text-sm text-gray-600">
            Total: kr {totalCredits.toLocaleString('nb-NO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kreditnota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCredit ? 'Rediger kreditnota' : 'Legg til ny kreditnota'}
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
                    <SelectItem value="">Ingen konto</SelectItem>
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
                <Button type="submit" disabled={addCredit.isPending || updateCredit.isPending}>
                  {editingCredit ? 'Oppdater' : 'Legg til'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!credits || credits.length === 0 ? (
        <p className="text-gray-500">Ingen kreditnotaer registrert.</p>
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
            {credits.map((credit) => (
              <TableRow key={credit.id}>
                <TableCell>{credit.description}</TableCell>
                <TableCell>kr {credit.amount.toLocaleString('nb-NO', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{new Date(credit.date).toLocaleDateString('nb-NO')}</TableCell>
                <TableCell>{credit.voucher_no || '-'}</TableCell>
                <TableCell>{credit.konto_nr || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(credit)}
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
                          <AlertDialogTitle>Slett kreditnota</AlertDialogTitle>
                          <AlertDialogDescription>
                            Er du sikker på at du vil slette denne kreditnotaen? Denne handlingen kan ikke angres.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(credit)}
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

export default ClaimCredits;
