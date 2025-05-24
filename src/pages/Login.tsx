
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast({
            title: 'Registrering feilet',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registrering vellykket',
            description: 'Sjekk e-posten din for bekreftelseslenke.',
          });
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          toast({
            title: 'Innlogging feilet',
            description: 'Ugyldig e-post eller passord.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'En feil oppstod',
        description: 'Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-myhrvold-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-myhrvold-primary">
            Myhrvold Reklamasjonssystem
          </CardTitle>
          <p className="text-gray-600">
            {isSignUp ? 'Opprett ny konto' : 'Logg inn for å fortsette'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din.epost@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Skriv inn passord"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Behandler...' : (isSignUp ? 'Registrer' : 'Logg inn')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-myhrvold-primary hover:underline"
            >
              {isSignUp 
                ? 'Har du allerede en konto? Logg inn' 
                : 'Trenger du en konto? Registrer deg'
              }
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-800 mb-2"><strong>Eksisterende bruker:</strong></p>
              <p className="text-blue-700">
                Hvis du allerede har opprettet en konto, bruk e-posten og passordet du registrerte deg med.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
