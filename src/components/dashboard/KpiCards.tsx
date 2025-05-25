
import KpiCardsGrid from './KpiCardsGrid';
import { memo } from 'react';

// Backwards compatibility wrapper
const KpiCards = memo(() => {
  return <KpiCardsGrid />;
});

KpiCards.displayName = 'KpiCards';

export default KpiCards;
