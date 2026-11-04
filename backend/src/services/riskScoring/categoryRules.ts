import { CRITICAL_INDICATOR_TYPES, SCORE_THRESHOLDS } from '../../config/scoring';
import type { CategoryReason, Indicator, RiskLevel } from '../../types/analysis';

export interface CategoryEvaluation {
  riskLevel: RiskLevel;
  categoryReason: CategoryReason;
}

export function evaluateCategory(
  riskScore: number,
  indicators: Indicator[],
  hasFailedMandatoryCheck: boolean,
  canConclude: boolean = true
): CategoryEvaluation {
  let riskLevel: RiskLevel = 'low';
  let categoryReason: CategoryReason = 'score';

  if (riskScore >= SCORE_THRESHOLDS.HIGH_MIN) {
    riskLevel = 'high';
    categoryReason = 'score';
  } else if (riskScore >= SCORE_THRESHOLDS.REVIEW_MIN) {
    riskLevel = 'review';
    categoryReason = 'score';
  } else {
    riskLevel = 'low';
    categoryReason = 'score';
  }

  if (hasFailedMandatoryCheck && riskLevel === 'low') {
    riskLevel = 'review';
    categoryReason = 'partial_data';
  }

  let hasCritical = false;
  for (const ind of indicators) {
    if (CRITICAL_INDICATOR_TYPES.includes(ind.type)) {
      hasCritical = true;
      break;
    }
  }

  if (hasCritical) {
    riskLevel = 'high';
    categoryReason = 'critical_indicator';
  } else if (!canConclude) {
    riskLevel = 'review';
    categoryReason = 'inconclusive';
  }

  if (hasFailedMandatoryCheck && riskLevel === 'low') {
    riskLevel = 'review';
    categoryReason = 'partial_data';
  }

  return { riskLevel, categoryReason };
}

