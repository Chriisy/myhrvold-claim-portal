
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface UserStatusIndicatorProps {
  createdAt: string;
  lastActive?: string;
}

export function UserStatusIndicator({ createdAt, lastActive }: UserStatusIndicatorProps) {
  const now = new Date();
  const userCreated = new Date(createdAt);
  const daysSinceCreation = Math.floor((now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24));
  
  // For now, we'll simulate last active based on creation date
  // In a real app, this would come from actual user activity tracking
  const isNewUser = daysSinceCreation <= 7;
  const isRecentlyActive = daysSinceCreation <= 30;

  if (isNewUser) {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        Ny bruker
      </Badge>
    );
  }

  if (isRecentlyActive) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Aktiv
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-gray-500 border-gray-200">
      <AlertCircle className="h-3 w-3 mr-1" />
      Inaktiv
    </Badge>
  );
}
