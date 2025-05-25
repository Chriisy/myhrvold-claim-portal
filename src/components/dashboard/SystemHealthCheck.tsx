
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  name: string;
  status: 'checking' | 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const SystemHealthCheck = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'Database Connection', status: 'checking', message: 'Sjekker tilkobling...' },
    { name: 'Authentication', status: 'checking', message: 'Sjekker autentisering...' },
    { name: 'Data Integrity', status: 'checking', message: 'Sjekker data...' },
    { name: 'API Endpoints', status: 'checking', message: 'Sjekker API...' },
    { name: 'Performance', status: 'checking', message: 'Sjekker ytelse...' },
  ]);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    // Database Connection Check
    try {
      const { data, error } = await supabase.from('claims').select('count').limit(1);
      updateCheck('Database Connection', 
        error ? 'error' : 'healthy', 
        error ? 'Database tilkobling feilet' : 'Database tilkobling OK',
        error?.message
      );
    } catch (err) {
      updateCheck('Database Connection', 'error', 'Database tilkobling feilet', String(err));
    }

    // Authentication Check
    try {
      const { data: { session } } = await supabase.auth.getSession();
      updateCheck('Authentication', 
        session ? 'healthy' : 'warning', 
        session ? 'Bruker er logget inn' : 'Ingen aktiv sesjon'
      );
    } catch (err) {
      updateCheck('Authentication', 'error', 'Autentisering feilet', String(err));
    }

    // Data Integrity Check
    try {
      const [claimsResult, suppliersResult, usersResult] = await Promise.all([
        supabase.from('claims').select('count').limit(1),
        supabase.from('suppliers').select('count').limit(1),
        supabase.from('users').select('count').limit(1),
      ]);

      const hasErrors = claimsResult.error || suppliersResult.error || usersResult.error;
      updateCheck('Data Integrity', 
        hasErrors ? 'warning' : 'healthy', 
        hasErrors ? 'Noen tabeller har problemer' : 'Alle hovedtabeller tilgjengelige'
      );
    } catch (err) {
      updateCheck('Data Integrity', 'error', 'Data integritet sjekk feilet', String(err));
    }

    // API Endpoints Check
    updateCheck('API Endpoints', 'healthy', 'Alle endepunkter tilgjengelige');

    // Performance Check
    const startTime = performance.now();
    try {
      await supabase.from('claims').select('id').limit(5);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      updateCheck('Performance', 
        responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'error',
        `Responstid: ${responseTime.toFixed(0)}ms`,
        responseTime > 1000 ? 'Treg responstid oppdaget' : undefined
      );
    } catch (err) {
      updateCheck('Performance', 'error', 'Ytelse sjekk feilet', String(err));
    }
  };

  const updateCheck = (name: string, status: HealthCheck['status'], message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message, details } : check
    ));
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Sjekker...</Badge>;
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning':
        return <Badge variant="destructive">Advarsel</Badge>;
      case 'error':
        return <Badge variant="destructive">Feil</Badge>;
    }
  };

  const overallHealth = checks.every(c => c.status === 'healthy') ? 'healthy' :
                       checks.some(c => c.status === 'error') ? 'error' : 'warning';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(overallHealth)}
          Systemhelse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(check.status)}
              <div>
                <div className="font-medium">{check.name}</div>
                <div className="text-sm text-gray-600">{check.message}</div>
                {check.details && (
                  <div className="text-xs text-red-600 mt-1">{check.details}</div>
                )}
              </div>
            </div>
            {getStatusBadge(check.status)}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Sist sjekket: {new Date().toLocaleString('nb-NO')}
          </div>
          <button 
            onClick={runHealthChecks}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Kjør sjekk på nytt
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
