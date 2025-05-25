
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, Settings } from 'lucide-react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

export const CookieBanner = () => {
  const { showBanner, acceptAll, rejectAll, savePreferences, closeBanner } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="mx-auto max-w-4xl p-6 shadow-lg border-t-4 border-t-myhrvold-primary bg-white">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-myhrvold-primary mb-2">
                Vi bruker informasjonskapsler (cookies)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Vi bruker cookies for å forbedre din opplevelse på nettstedet vårt. Noen cookies er 
                nødvendige for at siden skal fungere, mens andre hjelper oss med å forstå hvordan du 
                bruker nettstedet og forbedre tjenestene våre. Du kan lese mer i vår{' '}
                <Link to="/privacy-policy" className="text-myhrvold-primary underline">
                  personvernpolicy
                </Link>
                {' '}og{' '}
                <Link to="/cookie-policy" className="text-myhrvold-primary underline">
                  cookie-policy
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={acceptAll} className="btn-primary">
                  Godta alle
                </Button>
                <Button onClick={rejectAll} variant="outline">
                  Kun nødvendige
                </Button>
                <Button 
                  onClick={() => setShowSettings(true)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Innstillinger
                </Button>
              </div>
            </div>
            <Button
              onClick={closeBanner}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cookie-innstillinger</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Nødvendige cookies</h4>
                  <p className="text-sm text-gray-600">
                    Disse cookies er nødvendige for at nettstedet skal fungere og kan ikke slås av.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Analytiske cookies</h4>
                  <p className="text-sm text-gray-600">
                    Hjelper oss å forstå hvordan besøkende bruker nettstedet ved å samle inn informasjon anonymt.
                  </p>
                </div>
                <Switch 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Markedsføringscookies</h4>
                  <p className="text-sm text-gray-600">
                    Brukes til å vise relevante annonser og spore effektiviteten av markedsføringskampanjer.
                  </p>
                </div>
                <Switch 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Preferanse-cookies</h4>
                  <p className="text-sm text-gray-600">
                    Husker dine valg og personlige innstillinger for å gi deg en bedre opplevelse.
                  </p>
                </div>
                <Switch 
                  checked={preferences.preferences}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, preferences: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)} variant="outline">
              Avbryt
            </Button>
            <Button onClick={handleSavePreferences} className="btn-primary">
              Lagre innstillinger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
