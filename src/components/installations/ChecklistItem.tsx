
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Camera, Eye } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface ChecklistItemData {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
  comments: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: (itemId: string) => void;
  onCommentChange: (itemId: string, comments: string) => void;
  onUploadPhoto: (itemId: string) => void;
  onViewPhotos: (itemId: string) => void;
  photoCount?: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const ChecklistItem = React.memo(({ 
  item, 
  onToggle, 
  onCommentChange, 
  onUploadPhoto, 
  onViewPhotos,
  photoCount = 0,
  isExpanded,
  onToggleExpanded
}: ChecklistItemProps) => {
  const [comments, setComments] = useState(item.comments || '');

  const debouncedCommentChange = useDebounce((value: string) => {
    onCommentChange(item.id, value);
  }, 500);

  const handleCommentChange = useCallback((value: string) => {
    setComments(value);
    debouncedCommentChange(value);
  }, [debouncedCommentChange]);

  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  const handleUploadPhoto = useCallback(() => {
    onUploadPhoto(item.id);
  }, [item.id, onUploadPhoto]);

  const handleViewPhotos = useCallback(() => {
    onViewPhotos(item.id);
  }, [item.id, onViewPhotos]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={item.completed}
          onCheckedChange={handleToggle}
          className="mt-1"
          aria-label={`Marker ${item.text} som ${item.completed ? 'ikke ' : ''}fullført`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`${item.completed ? 'line-through text-gray-500' : ''}`}>
              {item.text}
            </span>
            {item.required && (
              <Badge variant="destructive" className="text-xs">
                Påkrevd
              </Badge>
            )}
            {photoCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {photoCount} bilde{photoCount !== 1 ? 'r' : ''}
              </Badge>
            )}
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-green-500" aria-label="Fullført" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" aria-label="Venter" />
            )}
          </div>
          
          <div className="flex space-x-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Skjul detaljer' : 'Legg til kommentar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUploadPhoto}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              aria-label={`Last opp bilde for ${item.text}`}
            >
              <Camera className="w-4 h-4 mr-1" />
              Last opp bilde
            </Button>
            {photoCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewPhotos}
                className="p-0 h-auto text-blue-600 hover:text-blue-800"
                aria-label={`Se ${photoCount} bilder for ${item.text}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                Se bilder ({photoCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-7 space-y-3">
          <Textarea
            placeholder="Legg til kommentar eller notater..."
            value={comments}
            onChange={(e) => handleCommentChange(e.target.value)}
            rows={3}
            aria-label={`Kommentar for ${item.text}`}
          />
        </div>
      )}
    </div>
  );
});

ChecklistItem.displayName = 'ChecklistItem';
