
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/utils/authUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, session, login } = useAuth();

  // If user is authenticated and has a valid session, redirect
  if (user && session) {
    if (process.env.NODE_ENV === 'development') {
      console.log('User authenticated, redirecting to dashboard');
    }
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // Clean up before signup
        cleanupAuthState();
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0]
            }
          }
        });

        if (error) {
          setAuthError(error.message);
          toast({
            title: 'Registrering feilet',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registrering vellykket',
            description: 'Du kan nå logge inn med din nye konto.',
          });
          // Switch to login mode after successful signup
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting login...');
        }
        const success = await login(email, password);
        
        if (!success) {
          setAuthError('Ugyldig e-post eller passord.');
          toast({
            title: 'Innlogging feilet',
            description: 'Ugyldig e-post eller passord.',
            variant: 'destructive',
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Login successful, user should be redirected');
          }
          // Force page reload to ensure clean state
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'En ukjent feil oppstod';
      setAuthError(errorMessage);
      console.error('Auth error:', error);
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
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-800">{authError}</p>
              </div>
            )}
            
            {isSignUp && (
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ditt fulle navn"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din.epost@example.com"
                required
                disabled={isLoading}
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
                disabled={isLoading}
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
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
                setPassword('');
              }}
              className="text-myhrvold-primary hover:underline"
              disabled={isLoading}
            >
              {isSignUp 
                ? 'Har du allerede en konto? Logg inn' 
                : 'Trenger du en konto? Registrer deg'
              }
            </button>
          </div>

          {isLoading && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              <p className="text-gray-700">
                Behandler forespørsel... Hvis dette tar lang tid, prøv å oppdatere siden.
              </p>
            </div>
          )}

          {!isSignUp && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-800 mb-2"><strong>Test-bruker:</strong></p>
              <p className="text-blue-700">
                Du kan registrere deg med en ny e-post, eller bruke eksisterende brukerkontoer hvis du har dem.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
