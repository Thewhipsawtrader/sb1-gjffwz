import { ErrorCollectionService } from './errorCollectionService';
import { BillingPeriod, ProviderBill, BillingReport, ErrorTier } from '../types/billing';

export class BillingService {
  private static instance: BillingService;
  private readonly errorTiers: ErrorTier[] = [
    { maxErrors: 1000, ratePerError: 0.10 },
    { maxErrors: 5000, ratePerError: 0.09 },
    { maxErrors: 10000, ratePerError: 0.08 },
    { maxErrors: Infinity, ratePerError: 0.07 },
  ];

  private constructor() {}

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  calculateProviderBill(provider: string, errorCount: number): ProviderBill {
    let remainingErrors = errorCount;
    let totalCost = 0;
    const breakdown = [];

    for (const tier of this.errorTiers) {
      if (remainingErrors <= 0) break;

      const errorsInTier = Math.min(
        remainingErrors,
        tier.maxErrors === Infinity ? remainingErrors : tier.maxErrors
      );

      const tierCost = errorsInTier * tier.ratePerError;
      totalCost += tierCost;

      breakdown.push({
        tier: this.getTierName(tier),
        errors: errorsInTier,
        rate: tier.ratePerError,
        cost: tierCost,
      });

      remainingErrors -= errorsInTier;
    }

    return {
      provider,
      totalErrors: errorCount,
      breakdown,
      totalCost: Number(totalCost.toFixed(2)),
    };
  }

  private getTierName(tier: ErrorTier): string {
    if (tier.maxErrors === Infinity) {
      return 'Over 10,000';
    }
    if (tier.maxErrors === 1000) {
      return 'Up to 1,000';
    }
    if (tier.maxErrors === 5000) {
      return '1,001 - 5,000';
    }
    return '5,001 - 10,000';
  }

  generateMonthlyBillingReport(year: number, month: number): BillingReport {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const errorReport = ErrorCollectionService.getInstance()
      .getErrorReport(startDate, endDate);

    const bills: ProviderBill[] = [];
    let totalErrors = 0;
    let totalCost = 0;

    for (const [provider, stats] of Object.entries(errorReport.providers)) {
      const providerBill = this.calculateProviderBill(provider, stats.total);
      bills.push(providerBill);
      totalErrors += stats.total;
      totalCost += providerBill.totalCost;
    }

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      bills: bills.sort((a, b) => b.totalErrors - a.totalErrors),
      totalErrors,
      totalCost: Number(totalCost.toFixed(2)),
    };
  }
}