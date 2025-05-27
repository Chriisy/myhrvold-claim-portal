
import { Users } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function UserManagementHeader() {
  return (
    <div className="flex items-center gap-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-myhrvold-primary" />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Brukeradministrasjon</h1>
          <p className="text-gray-600">Administrer brukere, roller og tillatelser</p>
        </div>
      </div>
    </div>
  );
}
