
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
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="flex-1">
          <CardTitle className="text-xl lg:text-2xl xl:text-3xl">{title}</CardTitle>
          {description && (
            <p className="text-sm lg:text-base xl:text-lg text-gray-600 mt-2">{description}</p>
          )}
        </div>
        <div className="flex gap-3">
          {onExport && (
            <Button variant="outline" size="default" onClick={handleExport} className="lg:px-4 lg:py-2">
              <Download className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="default" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:px-4 lg:py-2"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isExpanded ? 'h-[calc(100vh-200px)] overflow-auto' : 'min-h-[450px] lg:min-h-[550px] xl:min-h-[650px]'}>
        {children}
      </CardContent>
    </Card>
  );
};
