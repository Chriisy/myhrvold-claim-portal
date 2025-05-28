
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { type ClaimCost } from '@/hooks/useClaimCosts';

interface CostTableProps {
  costs: ClaimCost[];
  onEdit: (cost: ClaimCost) => void;
  onDelete: (cost: ClaimCost) => void;
}

export function CostTable({ costs, onEdit, onDelete }: CostTableProps) {
  if (!costs || costs.length === 0) {
    return <p className="text-gray-500">Ingen kostnader registrert.</p>;
  }

  return (
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
                  onClick={() => onEdit(cost)}
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
                        onClick={() => onDelete(cost)}
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
  );
}
