
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface MobileOptimizedSidebarProps {
  children: ReactNode;
  trigger?: ReactNode;
  className?: string;
}

export function MobileOptimizedSidebar({ 
  children, 
  trigger,
  className 
}: MobileOptimizedSidebarProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="md:hidden">
      <Menu className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className={cn(
          'w-[300px] sm:w-[350px] p-0',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Meny</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
