
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface ReportDateRangePickerProps {
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
}

export const ReportDateRangePicker = ({
  dateRange,
  onDateRangeChange
}: ReportDateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        start: range.from,
        end: range.to
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Periode:</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange ? (
              `${format(dateRange.start, 'dd.MM.yyyy', { locale: nb })} - ${format(dateRange.end, 'dd.MM.yyyy', { locale: nb })}`
            ) : (
              <span>Velg periode</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.start}
            selected={{
              from: dateRange.start,
              to: dateRange.end
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={nb}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
