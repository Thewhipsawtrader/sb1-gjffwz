import { v4 as uuidv4 } from 'uuid';
import { MonthlyErrorSummary, EmailConfig } from '../types/monthlyReport';
import { ErrorCollectionService } from './errorCollectionService';
import { BillingService } from './billingService';
import { EmailService } from './emailService';
import { ThirdPartyIdentifier } from '../types/errorCollection';

export class MonthlyReportService {
  private static instance: MonthlyReportService;
  private readonly supportEmail = 'support@surelink.cloud';
  private readonly creatorEmail = 'creator@surelink.com';

  private readonly providerEmails: Record<ThirdPartyIdentifier, string> = {
    MIKROTIK: 'support@mikrotik.com',
    WHATSAPP: 'api-support@whatsapp.com',
    EMAIL: 'support@emailprovider.com',
    CLERK: 'support@clerk.dev',
    OTHER: 'support@surelink.cloud',
  };

  private constructor() {
    this.scheduleMonthlyReports();
  }

  static getInstance(): MonthlyReportService {
    if (!MonthlyReportService.instance) {
      MonthlyReportService.instance = new MonthlyReportService();
    }
    return MonthlyReportService.instance;
  }

  private scheduleMonthlyReports(): void {
    setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        this.generateAndSendAllReports();
      }
    }, 60000); // Check every minute
  }

  async generateAndSendAllReports(): Promise<void> {
    const providers: ThirdPartyIdentifier[] = ['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER'];
    
    for (const provider of providers) {
      const report = await this.generateMonthlyReport(provider);
      await this.sendMonthlyReport(provider, report);
    }
  }

  private async generateMonthlyReport(provider: ThirdPartyIdentifier): Promise<MonthlyErrorSummary> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const errorService = ErrorCollectionService.getInstance();
    const billingService = BillingService.getInstance();
    
    const errorReport = errorService.getErrorReport(startDate, endDate);
    const providerErrors = errorReport.errors.filter(error => error.provider === provider);
    const providerStats = errorReport.providers[provider];
    
    // Calculate billing
    const billing = billingService.calculateProviderBill(provider, providerStats.total);

    // Get previous month's data for trends
    const previousStartDate = new Date(startDate);
    previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousReport = errorService.getErrorReport(previousStartDate, previousEndDate);
    const previousTotal = previousReport.providers[provider]?.total || 0;

    // Get top errors
    const errorCounts = new Map<string, { count: number; lastOccurrence: string }>();
    providerErrors.forEach(error => {
      const current = errorCounts.get(error.message) || { count: 0, lastOccurrence: error.timestamp };
      errorCounts.set(error.message, {
        count: current.count + 1,
        lastOccurrence: error.timestamp,
      });
    });

    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastOccurrence: data.lastOccurrence,
      }));

    return {
      provider,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalErrors: providerStats.total,
      errorBreakdown: Object.entries(providerStats.byCategory).map(([category, count]) => ({
        category,
        count,
        percentage: (count / providerStats.total) * 100,
      })),
      charges: {
        totalAmount: billing.totalCost,
        breakdown: billing.breakdown,
      },
      topErrors,
      trends: {
        previousMonth: previousTotal,
        percentageChange: previousTotal === 0 ? 100 : 
          ((providerStats.total - previousTotal) / previousTotal) * 100,
      },
    };
  }

  private async sendMonthlyReport(
    provider: ThirdPartyIdentifier,
    report: MonthlyErrorSummary
  ): Promise<void> {
    const emailConfig: EmailConfig = {
      to: this.providerEmails[provider],
      cc: [this.supportEmail, this.creatorEmail],
      subject: `Monthly Error Report - ${provider} - ${new Date().toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
      })}`,
      attachments: [{
        filename: `${provider.toLowerCase()}-error-report-${report.period.startDate.split('T')[0]}.json`,
        content: JSON.stringify(report, null, 2),
      }],
    };

    const emailBody = this.formatEmailBody(report);
    await EmailService.getInstance().sendEmail(emailConfig, emailBody);
  }

  private formatEmailBody(report: MonthlyErrorSummary): string {
    const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;
    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

    return `
Dear ${report.provider} Support Team,

Please find below the monthly error report for ${new Date(report.period.startDate).toLocaleString('default', { 
  month: 'long', 
  year: 'numeric'
})}.

SUMMARY
-------
Total Errors: ${report.totalErrors.toLocaleString()}
Total Charges: ${formatCurrency(report.charges.totalAmount)}
Month-over-Month Change: ${formatPercentage(report.trends.percentageChange)}

ERROR BREAKDOWN
--------------
${report.errorBreakdown.map(category => 
  `${category.category}: ${category.count.toLocaleString()} (${formatPercentage(category.percentage)})`
).join('\n')}

TOP RECURRING ERRORS
------------------
${report.topErrors.map((error, index) => 
  `${index + 1}. ${error.message}\n   Count: ${error.count}\n   Last Occurrence: ${
    new Date(error.lastOccurrence).toLocaleString()
  }`
).join('\n\n')}

BILLING BREAKDOWN
---------------
${report.charges.breakdown.map(tier => 
  `${tier.tier}: ${tier.errors.toLocaleString()} errors @ ${formatCurrency(tier.rate)} each = ${
    formatCurrency(tier.cost)
  }`
).join('\n')}

A detailed JSON report is attached for your records. Please review and take necessary actions to address recurring issues.

Best Regards,
Surelink Support Team
    `.trim();
  }

  getReportForProvider(
    provider: ThirdPartyIdentifier,
    year: number,
    month: number
  ): Promise<MonthlyErrorSummary> {
    return this.generateMonthlyReport(provider);
  }
}