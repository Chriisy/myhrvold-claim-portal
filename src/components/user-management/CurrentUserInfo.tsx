
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentLabel } from '@/lib/constants/departments';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'avdelingsleder':
      return 'default' as const;
    case 'saksbehandler':
      return 'secondary' as const;
    case 'tekniker':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
};

export function CurrentUserInfo() {
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <AlertCircle className="h-5 w-5" />
          Din brukerinformasjon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-sm text-gray-600">{currentUser.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={getRoleBadgeVariant(currentUser.user_role || 'tekniker')}>
                {roleLabels[currentUser.user_role || 'tekniker']}
              </Badge>
              <Badge variant="outline">
                {getDepartmentLabel(currentUser.department || 'oslo')}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Rolle: {roleLabels[currentUser.user_role || 'tekniker']}</p>
            <p className="text-sm text-gray-600">Avdeling: {getDepartmentLabel(currentUser.department || 'oslo')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
