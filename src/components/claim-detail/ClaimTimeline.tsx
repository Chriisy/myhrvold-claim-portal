
import { useState } from 'react';
import { useClaimTimeline } from '@/hooks/useClaimTimeline';
import { useAddTimelineEvent } from '@/hooks/useAddTimelineEvent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  User, 
  FileText, 
  Upload, 
  Trash, 
  Edit, 
  DollarSign, 
  CreditCard,
  Activity 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ClaimTimelineProps {
  claimId: string;
}

interface TimelineEvent {
  id: string;
  claim_id: string;
  message: string;
  event_type: 'manual' | 'status_change' | 'file_upload' | 'file_delete' | 'claim_update' | 'cost_added' | 'credit_added';
  metadata: any;
  created_by: string;
  created_at: string;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'manual':
      return <User className="h-4 w-4" />;
    case 'status_change':
      return <Activity className="h-4 w-4" />;
    case 'file_upload':
      return <Upload className="h-4 w-4" />;
    case 'file_delete':
      return <Trash className="h-4 w-4" />;
    case 'claim_update':
      return <Edit className="h-4 w-4" />;
    case 'cost_added':
      return <DollarSign className="h-4 w-4" />;
    case 'credit_added':
      return <CreditCard className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'manual':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'status_change':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'file_upload':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'file_delete':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'claim_update':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cost_added':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'credit_added':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEventTypeLabel = (eventType: string) => {
  switch (eventType) {
    case 'manual':
      return 'Manuell hendelse';
    case 'status_change':
      return 'Statusendring';
    case 'file_upload':
      return 'Fil lastet opp';
    case 'file_delete':
      return 'Fil slettet';
    case 'claim_update':
      return 'Reklamasjon oppdatert';
    case 'cost_added':
      return 'Kostnad lagt til';
    case 'credit_added':
      return 'Kreditnota lagt til';
    default:
      return 'Ukjent';
  }
};

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
        <div className="space-y-4">
          {events.map((event: TimelineEvent) => (
            <div key={event.id} className="flex gap-4 p-4 bg-white rounded-lg border">
              {/* Icon and line */}
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full border ${getEventColor(event.event_type)}`}>
                  {getEventIcon(event.event_type)}
                </div>
                <div className="w-px bg-gray-200 flex-1 mt-2 min-h-4"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${getEventColor(event.event_type)}`}>
                        {getEventTypeLabel(event.event_type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString('nb-NO')}
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm leading-relaxed">{event.message}</p>
                    
                    {/* Show metadata if available */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {event.event_type === 'status_change' && event.metadata.old_status && (
                          <div className="text-gray-600">
                            Endring: {event.metadata.old_status} → {event.metadata.new_status}
                          </div>
                        )}
                        {event.event_type === 'file_upload' && event.metadata.file_size && (
                          <div className="text-gray-600">
                            Filstørrelse: {(event.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                        {(event.event_type === 'cost_added' || event.event_type === 'credit_added') && event.metadata.amount && (
                          <div className="text-gray-600">
                            Beløp: kr {event.metadata.amount}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button only for manual events */}
                  {event.event_type === 'manual' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 ml-2">
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
