
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
    <Card className={`transition-all duration-300 hover:shadow-xl shadow-lg ${
      isExpanded ? 'fixed inset-4 z-50 bg-white' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between pb-4 lg:pb-6">
        <div className="flex-1 card-header-spacing">
          <CardTitle className="text-heading-3">{title}</CardTitle>
          {description && (
            <p className="text-body text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={handleExport} className="btn-icon-sm">
              <Download />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-icon-sm"
          >
            {isExpanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isExpanded ? 'h-[calc(100vh-200px)] overflow-auto' : 'min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]'}>
        {children}
      </CardContent>
    </Card>
  );
};
