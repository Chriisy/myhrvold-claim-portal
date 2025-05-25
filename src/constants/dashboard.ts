
export const DASHBOARD_CONSTANTS = {
  CHART_DIMENSIONS: {
    HEIGHT: 300,
    WIDTH: '100%',
  },
  COLORS: {
    PRIMARY: '#223368',
    SECONDARY: '#4050a1',
    CHART_PALETTE: ['#223368', '#4050a1', '#6366f1', '#8b5cf6', '#a855f7'],
  },
  CACHE_TIMES: {
    STALE_TIME: 15 * 60 * 1000, // 15 minutes
    GC_TIME: 30 * 60 * 1000, // 30 minutes
  },
  QUERY_LIMITS: {
    RECENT_CLAIMS: 5,
    TOP_ACCOUNTS: 5,
    TOP_SUPPLIERS: 5,
  },
} as const;
