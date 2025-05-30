
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Sync, Trash2, AlertCircle } from 'lucide-react';
import { backgroundSyncManager } from '@/utils/backgroundSync';
import { toast } from '@/hooks/use-toast';

export const OfflineFormHandler = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; data: any }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Tilkoblet',
        description: 'Enheten er tilkoblet internett. Synkroniserer ventende forespørsler...',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Frakoblet',
        description: 'Enheten er frakoblet internett. Skjemaer vil bli lagret lokalt.',
        duration: 5000,
      });
    };

    const handleSyncSuccess = (event: CustomEvent) => {
      toast({
        title: 'Synkronisering vellykket',
        description: 'Skjemadata ble sendt til serveren.',
        duration: 3000,
      });
      updatePendingRequests();
    };

    const handleSyncFailed = (event: CustomEvent) => {
      toast({
        title: 'Synkronisering feilet',
        description: 'Kunne ikke sende skjemadata. Vil prøve igjen senere.',
        variant: 'destructive',
        duration: 5000,
      });
      updatePendingRequests();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync-success', handleSyncSuccess as EventListener);
    window.addEventListener('sync-failed', handleSyncFailed as EventListener);

    // Initial load of pending requests
    updatePendingRequests();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-success', handleSyncSuccess as EventListener);
      window.removeEventListener('sync-failed', handleSyncFailed as EventListener);
    };
  }, []);

  const updatePendingRequests = () => {
    const pending = backgroundSyncManager.getPendingRequests();
    setPendingRequests(pending);
  };

  const forceSyncAll = async () => {
    toast({
      title: 'Synkroniserer...',
      description: 'Forsøker å sende alle ventende forespørsler.',
      duration: 3000,
    });
    
    await backgroundSyncManager.syncPendingRequests();
    updatePendingRequests();
  };

  const clearPendingRequests = () => {
    localStorage.removeItem('pendingRequests');
    setPendingRequests([]);
    toast({
      title: 'Ventende forespørsler fjernet',
      description: 'Alle lokalt lagrede forespørsler er slettet.',
      duration: 3000,
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('nb-NO');
  };

  const getRequestTypeLabel = (id: string) => {
    if (id.includes('claim')) return 'Reklamasjon';
    if (id.includes('supplier')) return 'Leverandør';
    if (id.includes('user')) return 'Bruker';
    if (id.includes('certificate')) return 'Sertifikat';
    return 'Ukjent';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          Offline-skjemaer
          {pendingRequests.length > 0 && (
            <Badge variant="secondary">
              {pendingRequests.length} ventende
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Status: {isOnline ? 'Tilkoblet' : 'Frakoblet'}
          {!isOnline && ' - Skjemaer lagres lokalt og sendes når tilkoblingen er tilbake'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={`p-4 rounded-lg ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={`font-medium ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
              {isOnline ? 'Enheten er tilkoblet internett' : 'Enheten er frakoblet internett'}
            </span>
          </div>
          
          {!isOnline && (
            <p className="text-sm text-red-700 mt-2">
              Skjemaer du sender inn vil bli lagret lokalt og sendt automatisk når tilkoblingen er tilbake.
            </p>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Ventende forespørsler ({pendingRequests.length})
              </h3>
              <div className="space-x-2">
                {isOnline && (
                  <Button onClick={forceSyncAll} size="sm" variant="outline">
                    <Sync className="w-4 h-4 mr-2" />
                    Synkroniser nå
                  </Button>
                )}
                <Button onClick={clearPendingRequests} size="sm" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Fjern alle
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {getRequestTypeLabel(request.id)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTimestamp(request.data.timestamp)}
                      </p>
                      {request.data.retryCount > 0 && (
                        <p className="text-xs text-amber-600">
                          Forsøk: {request.data.retryCount + 1}/3
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {request.data.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Pending Requests */}
        {pendingRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sync className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Ingen ventende forespørsler</p>
            <p className="text-sm">Alle skjemaer er synkronisert</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Hvordan det fungerer:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Skjemaer sendes normalt når du er tilkoblet</li>
            <li>• Når du er frakoblet, lagres skjemaer lokalt</li>
            <li>• Automatisk synkronisering når tilkoblingen kommer tilbake</li>
            <li>• Opp til 3 forsøk på å sende hver forespørsel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
