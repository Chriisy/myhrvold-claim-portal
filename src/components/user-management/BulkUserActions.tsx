
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Users, Shield, UserCheck } from 'lucide-react';
import { UserWithPermissions } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface BulkUserActionsProps {
  selectedUsers: UserWithPermissions[];
  onBulkRoleChange: (userIds: string[], role: UserRole) => void;
  onSelectAll: (selected: boolean) => void;
  totalUsers: number;
}

export function BulkUserActions({ 
  selectedUsers, 
  onBulkRoleChange, 
  onSelectAll, 
  totalUsers 
}: BulkUserActionsProps) {
  const selectedCount = selectedUsers.length;
  const isAllSelected = selectedCount === totalUsers && totalUsers > 0;
  const isSomeSelected = selectedCount > 0 && selectedCount < totalUsers;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 border rounded-lg">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isSomeSelected;
          }}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
        />
        <span className="text-sm font-medium">
          {selectedCount > 0 ? `${selectedCount} valgt` : 'Velg alle'}
        </span>
      </div>

      {selectedCount > 0 && (
        <>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {selectedCount} brukere valgt
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Endre rolle
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => onBulkRoleChange(selectedUsers.map(u => u.id), 'admin')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Administrator
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBulkRoleChange(selectedUsers.map(u => u.id), 'saksbehandler')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Saksbehandler
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBulkRoleChange(selectedUsers.map(u => u.id), 'avdelingsleder')}
              >
                <Users className="h-4 w-4 mr-2" />
                Avdelingsleder
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBulkRoleChange(selectedUsers.map(u => u.id), 'tekniker')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Tekniker
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
