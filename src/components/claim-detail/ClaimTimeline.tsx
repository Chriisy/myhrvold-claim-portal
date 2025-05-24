
import { useState } from 'react';
import { useClaimTimeline } from '@/hooks/useClaimTimeline';
import { useAddTimelineEvent } from '@/hooks/useAddTimelineEvent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ClaimTimelineProps {
  claimId: string;
}

export function ClaimTimeline({ claimId }: ClaimTimelineProps) {
  const { data: events, isLoading, error } = useClaimTimeline(claimId);
  const addEvent = useAddTimelineEvent();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addEvent.mutateAsync({
      claim_id: claimId,
      message: message.trim(),
      created_by: 'current-user-id' // This should come from auth context
    });

    setMessage('');
    setOpen(false);
  };

  const handleDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_item')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['timeline', claimId] });
      toast({
        title: "Hendelse slettet",
        description: "Tidslinjehendelsen har blitt slettet.",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette hendelsen.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Laster tidslinje...</div>;
  if (error) return <div>Kunne ikke hente tidslinje</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tidslinje</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til hendelse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til ny hendelse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message">Beskrivelse</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beskriv hendelsen..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={addEvent.isPending}>
                  {addEvent.isPending ? 'Lagrer...' : 'Legg til'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!events || events.length === 0 ? (
        <p className="text-gray-500">Ingen tidslinjehendelser registrert.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="border-l-2 border-blue-200 pl-4 py-2 flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-500">
                  {new Date(event.created_at).toLocaleString('nb-NO')}
                </div>
                <div className="text-gray-900">{event.message}</div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Slett hendelse</AlertDialogTitle>
                    <AlertDialogDescription>
                      Er du sikker på at du vil slette denne tidslinjehendelsen? Denne handlingen kan ikke angres.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700">
                      Slett
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
