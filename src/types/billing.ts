export interface ErrorTier {
  maxErrors: number;
  ratePerError: number;
}

export interface BillingPeriod {
  startDate: string;
  endDate: string;
}

export interface ProviderBill {
  provider: string;
  totalErrors: number;
  breakdown: {
    tier: string;
    errors: number;
    rate: number;
    cost: number;
  }[];
  totalCost: number;
}

export interface BillingReport {
  period: BillingPeriod;
  bills: ProviderBill[];
  totalErrors: number;
  totalCost: number;
}