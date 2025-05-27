
import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InteractiveChartWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  onExport?: () => void;
}

export const InteractiveChartWrapper = ({ 
  title, 
  description, 
  children, 
  onExport 
}: InteractiveChartWrapperProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      toast({
        title: "Eksport",
        description: "Eksportfunksjonalitet kommer snart!",
      });
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      isExpanded ? 'fixed inset-4 z-50 bg-white' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isExpanded ? 'h-[calc(100vh-200px)] overflow-auto' : ''}>
        {children}
      </CardContent>
    </Card>
  );
};
