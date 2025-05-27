
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedDashboardFilters from './EnhancedDashboardFilters';

export const MobileOptimizedFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <EnhancedDashboardFilters />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filtre</span>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Åpne filtre
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Avanserte Filtre
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <EnhancedDashboardFilters />
              </div>
            </SheetContent>
          </Sheet>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Trykk på "Åpne filtre" for å justere søkekriterier
        </p>
      </CardContent>
    </Card>
  );
};
