
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { pwaManager } from '@/utils/pwa';
import { toast } from '@/hooks/use-toast';

export const PWAInstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleInstallable = (event: CustomEvent) => {
      setIsInstallable(event.detail.installable);
      setIsVisible(event.detail.installable);
    };

    const handleUpdateAvailable = () => {
      toast({
        title: 'Oppdatering tilgjengelig',
        description: 'En ny versjon av appen er tilgjengelig. Last siden på nytt for å oppdatere.',
        duration: 10000,
      });
    };

    window.addEventListener('pwa-installable', handleInstallable as EventListener);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable as EventListener);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const success = await pwaManager.installApp();
    if (success) {
      toast({
        title: 'App installert',
        description: 'Myhrvold Portal er nå installert på enheten din.',
      });
      setIsVisible(false);
    } else {
      toast({
        title: 'Installasjon feilet',
        description: 'Kunne ikke installere appen. Prøv igjen senere.',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mx-auto max-w-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">
              Installer Myhrvold Portal
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Få rask tilgang direkte fra hjemskjermen
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1 h-8 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Installer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="h-8 text-xs"
              >
                Senere
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
