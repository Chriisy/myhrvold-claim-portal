
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
        <div className="flex-1">
          <CardTitle className="text-lg lg:text-xl xl:text-2xl">{title}</CardTitle>
          {description && (
            <p className="text-sm lg:text-base text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={handleExport} className="lg:px-3 lg:py-2">
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:px-3 lg:py-2"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isExpanded ? 'h-[calc(100vh-200px)] overflow-auto' : 'min-h-[400px] lg:min-h-[450px] xl:min-h-[500px]'}>
        {children}
      </CardContent>
    </Card>
  );
};
