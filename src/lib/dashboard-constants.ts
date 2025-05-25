
export const DASHBOARD_CONSTANTS = {
  CHART_DIMENSIONS: {
    HEIGHT: 300,
    WIDTH: '100%',
    DONUT_INNER_RADIUS: 60,
    DONUT_OUTER_RADIUS: 100,
    PIE_OUTER_RADIUS: 120,
    PADDING_ANGLE: 5,
  },
  COLORS: {
    PRIMARY: '#223368',
    SECONDARY: '#4050a1',
    CHART_PALETTE: [
      '#223368',
      '#4050a1', 
      '#6366f1', 
      '#8b5cf6', 
      '#a855f7',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#8b5cf6'
    ],
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
  LOADING_STATES: {
    SKELETON_ROWS: 3,
    RETRY_DELAY: 1000,
  },
} as const;
