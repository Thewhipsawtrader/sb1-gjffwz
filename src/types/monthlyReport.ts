export interface MonthlyErrorSummary {
  provider: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalErrors: number;
  errorBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
  charges: {
    totalAmount: number;
    breakdown: {
      tier: string;
      errors: number;
      rate: number;
      cost: number;
    }[];
  };
  topErrors: {
    message: string;
    count: number;
    lastOccurrence: string;
  }[];
  trends: {
    previousMonth: number;
    percentageChange: number;
  };
}

export interface EmailConfig {
  to: string;
  cc: string[];
  subject: string;
  attachments?: {
    filename: string;
    content: string;
  }[];
}