
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Eye, Edit2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { user } = useAuth();
  const { consent, openSettings } = useCookieConsent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '',
    department: '',
  });

  const handleSave = () => {
    // Implementer lagring av brukerdata
    toast({
      title: "Profil oppdatert",
      description: "Dine personlige opplysninger er lagret.",
    });
    setIsEditing(false);
  };

  const handleExportData = () => {
    // Implementer dataeksport
    const userData = {
      profile: formData,
      cookieConsent: consent,
      accountCreated: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Her vil du hente faktiske data fra databasen
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `myhrvold-persondata-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data eksportert",
      description: "Dine personopplysninger er lastet ned som JSON-fil.",
    });
  };

  const handleDeleteAccount = () => {
    // Implementer kontosletting
    toast({
      title: "Kontosletting forespurt",
      description: "Vi har mottatt din forespørsel om kontosletting. Du vil høre fra oss innen 30 dager.",
      variant: "destructive",
    });
  };

  const getCookieStatusColor = (enabled: boolean) => {
    return enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-myhrvold-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Min profil</h1>
          <p className="text-gray-600">Administrer dine personlige opplysninger og personverninnstillinger</p>
        </div>

        {/* Personlige opplysninger */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-myhrvold-primary">Personlige opplysninger</h2>
            <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? 'Avbryt' : 'Rediger'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="department">Avdeling</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-2">
              <Button onClick={handleSave} className="btn-primary">
                Lagre endringer
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Avbryt
              </Button>
            </div>
          )}
        </Card>

        {/* Personvern og cookies */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-myhrvold-primary mb-6">Personvern og cookies</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Cookie-innstillinger
              </h3>
              {consent ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Nødvendige cookies</span>
                    <Badge className="bg-green-100 text-green-800">Påkrevd</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Analytiske cookies</span>
                    <Badge className={getCookieStatusColor(consent.analytics)}>
                      {consent.analytics ? 'Aktivert' : 'Deaktivert'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Markedsføringscookies</span>
                    <Badge className={getCookieStatusColor(consent.marketing)}>
                      {consent.marketing ? 'Aktivert' : 'Deaktivert'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Preferanse-cookies</span>
                    <Badge className={getCookieStatusColor(consent.preferences)}>
                      {consent.preferences ? 'Aktivert' : 'Deaktivert'}
                    </Badge>
                  </div>
                  <Button onClick={openSettings} variant="outline" className="mt-3">
                    Endre cookie-innstillinger
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Ingen cookie-preferanser registrert.</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-4">Personverninnstillinger</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="text-sm font-medium">Databehandling for analyse</span>
                    <p className="text-xs text-gray-600">Tillater anonymisert analyse av bruksmønster</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Berettiget interesse</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="text-sm font-medium">Markedsføringskommunikasjon</span>
                    <p className="text-xs text-gray-600">E-post om nye funksjoner og oppdateringer</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Deaktivert</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dine rettigheter */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-myhrvold-primary mb-6">Dine rettigheter (GDPR)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-myhrvold-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Rett til innsyn</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Se hvilke personopplysninger vi har om deg
                  </p>
                  <Button onClick={handleExportData} variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Last ned mine data
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Edit2 className="h-5 w-5 text-myhrvold-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Rett til retting</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Rett feil i dine personopplysninger
                  </p>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Rediger profil
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-myhrvold-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Rett til begrensning</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Be om begrenset behandling av dine data
                  </p>
                  <Button variant="outline" size="sm">
                    Kontakt support
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-red-200">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-2 text-red-700">Rett til sletting</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Be om sletting av dine personopplysninger
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Slett konto
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Slett brukerkonto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Er du sikker på at du vil slette din brukerkonto? Denne handlingen kan ikke angres. 
                          Alle dine personopplysninger vil bli slettet i henhold til vår datalagringspolicy, 
                          men noen data kan bli oppbevart for regnskapsformål i henhold til lovkrav.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          Ja, slett kontoen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Trenger du hjelp?</h4>
            <p className="text-sm text-blue-700">
              Hvis du har spørsmål om dine rettigheter eller vil utøve dem, kan du kontakte oss på{' '}
              <a href="mailto:personvern@myhrvold.no" className="underline">
                personvern@myhrvold.no
              </a>
              {' '}eller lese vår{' '}
              <a href="/privacy-policy" className="underline">
                personvernpolicy
              </a>
              .
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
