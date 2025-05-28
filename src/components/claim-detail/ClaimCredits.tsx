
import { useState } from 'react';
import { useClaimCredits, useAddClaimCredit, useUpdateClaimCredit, useDeleteClaimCredit, type ClaimCredit } from '@/hooks/useClaimCredits';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CreditForm } from './credits/CreditForm';
import { CreditTable } from './credits/CreditTable';

interface ClaimCreditsProps {
  claimId: string;
}

const ClaimCredits = ({ claimId }: ClaimCreditsProps) => {
  const { data: credits, isLoading } = useClaimCredits(claimId);
  const addCredit = useAddClaimCredit();
  const updateCredit = useUpdateClaimCredit();
  const deleteCredit = useDeleteClaimCredit();

  const [open, setOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<ClaimCredit | null>(null);

  const resetForm = () => {
    setEditingCredit(null);
  };

  const handleSubmit = async (creditData: {
    claim_id: string;
    description: string;
    amount: number;
    date: string;
    voucher_no?: string | null;
    konto_nr?: number | null;
    source: 'manual';
  }) => {
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
            <CreditForm
              claimId={claimId}
              editingCredit={editingCredit}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              isLoading={addCredit.isPending || updateCredit.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CreditTable
        credits={credits || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClaimCredits;
