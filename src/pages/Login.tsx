
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        toast({
          title: 'Pålogging feilet',
          description: 'Ugyldig e-post eller passord.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'En uventet feil oppstod. Prøv igjen.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-myhrvold-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-myhrvold-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div>
            <CardTitle className="text-2xl text-myhrvold-primary">Myhrvold Portal</CardTitle>
            <CardDescription>Logg inn til reklamasjon systemet</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din.epost@myhrvold.no"
                required
                className="rounded-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-input"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logger inn...' : 'Logg inn'}
            </Button>
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Demo: admin@myhrvold.no / admin123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
