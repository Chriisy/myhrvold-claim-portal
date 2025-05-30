
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { pwaManager } from '@/utils/pwa';
import { toast } from '@/hooks/use-toast';

export const PushNotificationSettings = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    claims: true,
    maintenance: true,
    certificates: true,
    general: false
  });

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Check if already subscribed to push notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    }

    // Load saved notification settings
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        setNotificationSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await pwaManager.requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: 'Varslinger aktivert',
          description: 'Du vil nå motta push-varslinger fra appen.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Varslinger avvist',
          description: 'Du kan aktivere varslinger senere i nettleserinnstillingene.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke be om tillatelse til varslinger.',
        variant: 'destructive',
      });
    }
  };

  const subscribeToPush = async () => {
    try {
      const subscription = await pwaManager.subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        toast({
          title: 'Push-varslinger aktivert',
          description: 'Du er nå registrert for push-varslinger.',
          duration: 5000,
        });

        // Here you would typically send the subscription to your server
        console.log('Push subscription:', subscription);
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke registrere for push-varslinger.',
        variant: 'destructive',
      });
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          toast({
            title: 'Push-varslinger deaktivert',
            description: 'Du vil ikke lenger motta push-varslinger.',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke avregistrere push-varslinger.',
        variant: 'destructive',
      });
    }
  };

  const updateNotificationSettings = (key: string, value: boolean) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
    
    toast({
      title: 'Innstillinger oppdatert',
      description: `Varslinger for ${getSettingLabel(key)} er ${value ? 'aktivert' : 'deaktivert'}.`,
      duration: 3000,
    });
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      claims: 'reklamasjoner',
      maintenance: 'vedlikehold',
      certificates: 'sertifikater',
      general: 'generelle meldinger'
    };
    return labels[key] || key;
  };

  const sendTestNotification = async () => {
    if (notificationPermission === 'granted') {
      try {
        new Notification('Test-varsling fra Myhrvold Portal', {
          body: 'Dette er en test-varsling for å sjekke at alt fungerer som det skal.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'test-notification',
          requireInteraction: false,
          silent: false
        });
        
        toast({
          title: 'Test-varsling sendt',
          description: 'Sjekk om du mottok varslinga.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to send test notification:', error);
        toast({
          title: 'Feil',
          description: 'Kunne ikke sende test-varsling.',
          variant: 'destructive',
        });
      }
    }
  };

  const getPermissionIcon = () => {
    switch (notificationPermission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPermissionText = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'Varslinger er tillatt';
      case 'denied':
        return 'Varslinger er blokkert';
      default:
        return 'Varslinger ikke aktivert';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push-varslinger
        </CardTitle>
        <CardDescription>
          Konfigurer hvilke varslinger du ønsker å motta fra appen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getPermissionIcon()}
            <div>
              <p className="font-medium">{getPermissionText()}</p>
              <p className="text-sm text-gray-600">
                {notificationPermission === 'granted' 
                  ? 'Du kan motta varslinger fra denne appen'
                  : notificationPermission === 'denied'
                  ? 'Aktiver varslinger i nettleserinnstillingene'
                  : 'Klikk for å aktivere varslinger'
                }
              </p>
            </div>
          </div>
          
          {notificationPermission !== 'granted' && (
            <Button onClick={requestPermission} variant="outline">
              Aktiver varslinger
            </Button>
          )}
        </div>

        {/* Push Notification Subscription */}
        {notificationPermission === 'granted' && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Push-varslinger</p>
              <p className="text-sm text-gray-600">
                {isSubscribed 
                  ? 'Du er registrert for push-varslinger'
                  : 'Registrer deg for å motta varslinger når appen er lukket'
                }
              </p>
            </div>
            
            {isSubscribed ? (
              <Button onClick={unsubscribeFromPush} variant="outline">
                <BellOff className="w-4 h-4 mr-2" />
                Deaktiver
              </Button>
            ) : (
              <Button onClick={subscribeToPush}>
                <Bell className="w-4 h-4 mr-2" />
                Aktiver
              </Button>
            )}
          </div>
        )}

        {/* Notification Settings */}
        {notificationPermission === 'granted' && (
          <div className="space-y-4">
            <h3 className="font-medium">Varslingstyper</h3>
            
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="cursor-pointer">
                  {getSettingLabel(key).charAt(0).toUpperCase() + getSettingLabel(key).slice(1)}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updateNotificationSettings(key, checked)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Test Notification */}
        {notificationPermission === 'granted' && (
          <div className="pt-4 border-t">
            <Button onClick={sendTestNotification} variant="outline" className="w-full">
              Send test-varsling
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
