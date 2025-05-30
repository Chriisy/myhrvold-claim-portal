
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ProjectStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

const statusOptions = [
  { value: 'Ny', label: 'Ny', color: 'bg-blue-100 text-blue-800' },
  { value: 'Påbegynt', label: 'Påbegynt', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Ferdig', label: 'Ferdig', color: 'bg-green-100 text-green-800' },
  { value: 'Avvik', label: 'Avvik', color: 'bg-red-100 text-red-800' }
];

export const ProjectStatusSelector = ({ currentStatus, onStatusChange }: ProjectStatusSelectorProps) => {
  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Status:</span>
      <Select value={currentStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue>
            {currentStatusOption && (
              <Badge className={currentStatusOption.color}>
                {currentStatusOption.label}
              </Badge>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge className={option.color}>
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
