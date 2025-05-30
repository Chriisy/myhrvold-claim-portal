
import React, { Suspense } from 'react';

// Tree-shakable recharts imports - only import what we need
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Optimized chart components with minimal bundle impact
export const OptimizedBarChart = React.memo(({ children, ...props }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsBarChart {...props}>
      {children}
    </RechartsBarChart>
  </ResponsiveContainer>
));

export const OptimizedPieChart = React.memo(({ children, ...props }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart {...props}>
      {children}
    </RechartsPieChart>
  </ResponsiveContainer>
));

// Re-export only needed components
export {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  Cell,
  Legend
};

// Lazy load heavy chart components only when needed
export const LazyAdvancedChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: ({ type, ...props }: { type: 'area' | 'line' | 'scatter' } & any) => {
      switch (type) {
        case 'area':
          return <module.AreaChart {...props} />;
        case 'line':
          return <module.LineChart {...props} />;
        case 'scatter':
          return <module.ScatterChart {...props} />;
        default:
          return null;
      }
    }
  }))
);

OptimizedBarChart.displayName = 'OptimizedBarChart';
OptimizedPieChart.displayName = 'OptimizedPieChart';
