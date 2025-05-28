
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { type ClaimCredit } from '@/hooks/useClaimCredits';

interface CreditTableProps {
  credits: ClaimCredit[];
  onEdit: (credit: ClaimCredit) => void;
  onDelete: (credit: ClaimCredit) => void;
}

export function CreditTable({ credits, onEdit, onDelete }: CreditTableProps) {
  if (!credits || credits.length === 0) {
    return <p className="text-gray-500">Ingen kreditnotaer registrert.</p>;
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
                  onClick={() => onEdit(credit)}
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
                        onClick={() => onDelete(credit)}
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
