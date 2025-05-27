
import { Card, CardContent } from '@/components/ui/card';
import { UserWithPermissions } from '@/hooks/useUsers';
import { memo } from 'react';

interface UserStatsCardsProps {
  users: UserWithPermissions[];
}

export const UserStatsCards = memo(({ users }: UserStatsCardsProps) => {
  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.user_role === 'admin').length || 0,
    saksbehandlere: users?.filter(u => u.user_role === 'saksbehandler').length || 0,
    teknikere: users?.filter(u => u.user_role === 'tekniker').length || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Totale brukere</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.admins}</div>
          <p className="text-xs text-muted-foreground">Administratorer</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.saksbehandlere}</div>
          <p className="text-xs text-muted-foreground">Saksbehandlere</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.teknikere}</div>
          <p className="text-xs text-muted-foreground">Teknikere</p>
        </CardContent>
      </Card>
    </div>
  );
});

UserStatsCards.displayName = 'UserStatsCards';
