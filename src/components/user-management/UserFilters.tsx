
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearchBar } from './UserSearchBar';
import { Filter } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserFiltersProps {
  onSearch: (query: string) => void;
  roleFilter: UserRole | 'all';
  onRoleFilterChange: (role: UserRole | 'all') => void;
}

export function UserFilters({ onSearch, roleFilter, onRoleFilterChange }: UserFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Søk og filtrer brukere</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <UserSearchBar onSearch={onSearch} />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value as UserRole | 'all')}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">Alle roller</option>
              <option value="admin">Administrator</option>
              <option value="saksbehandler">Saksbehandler</option>
              <option value="avdelingsleder">Avdelingsleder</option>
              <option value="tekniker">Tekniker</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
