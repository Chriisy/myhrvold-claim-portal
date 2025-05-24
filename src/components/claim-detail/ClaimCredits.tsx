
import { useState } from 'react';
import { useClaimCredits, useAddCreditNote } from '@/hooks/useClaimCredits';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ClaimCreditsProps {
  claimId: string;
}

export function ClaimCredits({ claimId }: ClaimCreditsProps) {
  const { data: credits, isLoading, error } = useClaimCredits(claimId);
  const addCredit = useAddCreditNote();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    konto_nr: '',
    voucher_no: ''
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addCredit.mutateAsync({
      claim_id: claimId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      konto_nr: formData.konto_nr ? parseInt(formData.konto_nr) : undefined,
      voucher_no: formData.voucher_no || undefined
    });

    setFormData({ description: '', amount: '', konto_nr: '', voucher_no: '' });
    setOpen(false);
  };

  const handleDelete = async (creditId: string) => {
    try {
      const { error } = await supabase
        .from('credit_note')
        .delete()
        .eq('id', creditId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['credits', claimId] });
      toast({
        title: "Kreditnota slettet",
        description: "Kreditnotaen har blitt slettet.",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette kreditnotaen.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  if (isLoading) return <div>Laster kreditnotaer...</div>;
  if (error) return <div>Kunne ikke hente kreditnotaer</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kreditnotaer</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kreditnota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til ny kreditnota</DialogTitle>
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
                <Label htmlFor="voucher_no">Bilagsnummer</Label>
                <Input
                  id="voucher_no"
                  value={formData.voucher_no}
                  onChange={(e) => setFormData({ ...formData, voucher_no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="konto_nr">Kontonummer</Label>
                <Input
                  id="konto_nr"
                  type="number"
                  value={formData.konto_nr}
                  onChange={(e) => setFormData({ ...formData, konto_nr: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={addCredit.isPending}>
                  {addCredit.isPending ? 'Lagrer...' : 'Legg til'}
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
              <TableHead>Dato</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Bilagsnr</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credits.map((credit) => (
              <TableRow key={credit.id}>
                <TableCell>{new Date(credit.date).toLocaleDateString('nb-NO')}</TableCell>
                <TableCell>{credit.description}</TableCell>
                <TableCell>{formatCurrency(credit.amount)}</TableCell>
                <TableCell>{credit.voucher_no || '-'}</TableCell>
                <TableCell>{credit.konto_nr || '-'}</TableCell>
                <TableCell>
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
                        <AlertDialogAction onClick={() => handleDelete(credit.id)} className="bg-red-600 hover:bg-red-700">
                          Slett
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
