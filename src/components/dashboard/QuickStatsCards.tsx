
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { startOfDay, endOfDay } from 'date-fns';

export function QuickStatsCards() {
  const { filters } = useDashboardFilters();
  
  const { data: quickStats, isLoading } = useQuery({
    queryKey: ['dashboard', 'quick-stats', filters],
    queryFn: async () => {
      const today = new Date();
      const startToday = startOfDay(today);
      const endToday = endOfDay(today);

      let newTodayQuery = supabase
        .from('claims')
        .select('id')
        .gte('created_at', startToday.toISOString())
        .lte('created_at', endToday.toISOString())
        .is('deleted_at', null);

      let waitingQuery = supabase
        .from('claims')
        .select('id')
        .eq('status', 'Avventer')
        .is('deleted_at', null);

      let overdueQuery = supabase
        .from('claims')
        .select('id')
        .lt('due_date', today.toISOString().split('T')[0])
        .not('status', 'in', '("Bokført","Lukket")')
        .is('deleted_at', null);

      if (filters.supplier_id) {
        newTodayQuery = newTodayQuery.eq('supplier_id', filters.supplier_id);
        waitingQuery = waitingQuery.eq('supplier_id', filters.supplier_id);
        overdueQuery = overdueQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        newTodayQuery = newTodayQuery.eq('technician_id', filters.technician_id);
        waitingQuery = waitingQuery.eq('technician_id', filters.technician_id);
        overdueQuery = overdueQuery.eq('technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        newTodayQuery = newTodayQuery.ilike('machine_model', `%${filters.machine_model}%`);
        waitingQuery = waitingQuery.ilike('machine_model', `%${filters.machine_model}%`);
        overdueQuery = overdueQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }

      const [newTodayResult, waitingResult, overdueResult] = await Promise.all([
        newTodayQuery,
        waitingQuery,
        overdueQuery
      ]);

      if (newTodayResult.error) throw newTodayResult.error;
      if (waitingResult.error) throw waitingResult.error;
      if (overdueResult.error) throw overdueResult.error;

      return {
        newToday: newTodayResult.data?.length || 0,
        waiting: waitingResult.data?.length || 0,
        overdue: overdueResult.data?.length || 0
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Nye i dag
          </CardTitle>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Plus className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {quickStats?.newToday || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reklamasjoner opprettet i dag
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Venter på svar
          </CardTitle>
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {quickStats?.waiting || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reklamasjoner som avventer
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Overdue
          </CardTitle>
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-red-600">
              {quickStats?.overdue || 0}
            </div>
            {(quickStats?.overdue || 0) > 0 && (
              <Badge variant="destructive" className="text-xs">
                Krever oppmerksomhet
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reklamasjoner over frist
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
