import nodemailer from 'nodemailer';
import { z } from 'zod';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../utils/appError';
import { rateLimit } from 'express-rate-limit';

const emailConfigSchema = z.object({
  to: z.string().email(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string(),
  html: z.string(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
  })).optional(),
});

type EmailConfig = z.infer<typeof emailConfigSchema>;

export class EmailService {
  private static instance: EmailService;
  private readonly transporter: nodemailer.Transporter;
  private readonly rateLimiter: ReturnType<typeof rateLimit>;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    this.rateLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 emails per minute
      message: 'Too many emails sent. Please try again later.',
    });

    this.verifyConnection();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed:', error);
      throw new AppError(
        'Failed to connect to email service',
        500,
        'EMAIL_CONNECTION_ERROR'
      );
    }
  }

  async sendEmail(config: EmailConfig): Promise<void> {
    try {
      const validatedConfig = emailConfigSchema.parse(config);

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        ...validatedConfig,
      };

      await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: validatedConfig.to,
        subject: validatedConfig.subject,
      });
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new AppError(
        'Failed to send email',
        500,
        'EMAIL_SEND_ERROR'
      );
    }
  }

  async sendDailyReport(report: DailyReport): Promise<void> {
    const html = this.generateDailyReportTemplate(report);
    
    await this.sendEmail({
      to: config.email.reportRecipients.daily,
      cc: [config.email.supportEmail],
      subject: `Daily WiFi Status Report - ${new Date().toLocaleDateString()}`,
      html,
      attachments: [{
        filename: 'daily-report.json',
        content: JSON.stringify(report, null, 2),
      }],
    });
  }

  async sendMonthlyReport(report: MonthlyReport): Promise<void> {
    const html = this.generateMonthlyReportTemplate(report);
    
    await this.sendEmail({
      to: config.email.reportRecipients.monthly,
      cc: [config.email.supportEmail, config.email.creatorEmail],
      subject: `Monthly Error Report - ${new Date().toLocaleDateString('default', {
        month: 'long',
        year: 'numeric',
      })}`,
      html,
      attachments: [{
        filename: 'monthly-report.json',
        content: JSON.stringify(report, null, 2),
      }],
    });
  }

  async sendErrorAlert(error: ErrorReport): Promise<void> {
    const html = this.generateErrorAlertTemplate(error);
    
    await this.sendEmail({
      to: config.email.alertRecipients,
      subject: `[${error.severity}] System Alert - ${error.type}`,
      html,
    });
  }

  private generateDailyReportTemplate(report: DailyReport): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            .section { margin: 20px 0; }
            .stats { display: flex; justify-content: space-between; }
            .stat-box { background: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Daily WiFi Status Report</h2>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="section">
              <h3>Summary</h3>
              <div class="stats">
                <div class="stat-box">
                  <strong>Active Units:</strong> ${report.statusSummary.activeUnits}
                </div>
                <div class="stat-box">
                  <strong>Deactivated Units:</strong> ${report.statusSummary.deactivatedUnits.length}
                </div>
              </div>
            </div>

            <div class="section">
              <h3>Recent Activity</h3>
              ${report.requests.map(req => `
                <p>
                  ${req.command.type === 'DEACTIVATE_WIFI' ? '🔴' : '🟢'}
                  Unit ${req.command.unitNumber} - ${req.daName}
                  <br>
                  <small>${new Date(req.timestamp).toLocaleString()}</small>
                </p>
              `).join('')}
            </div>

            <div class="footer">
              <p>This is an automated report. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateMonthlyReportTemplate(report: MonthlyReport): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            .section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { padding: 10px; border: 1px solid #ddd; }
            .table th { background: #f8f9fa; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Monthly Error Report</h2>
              <p>${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}</p>
            </div>

            <div class="section">
              <h3>Error Summary</h3>
              <table class="table">
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
                ${report.errorBreakdown.map(category => `
                  <tr>
                    <td>${category.category}</td>
                    <td>${category.count}</td>
                    <td>${category.percentage.toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <div class="section">
              <h3>Billing Summary</h3>
              <table class="table">
                <tr>
                  <th>Tier</th>
                  <th>Errors</th>
                  <th>Rate</th>
                  <th>Cost</th>
                </tr>
                ${report.charges.breakdown.map(tier => `
                  <tr>
                    <td>${tier.tier}</td>
                    <td>${tier.errors}</td>
                    <td>R${tier.rate.toFixed(2)}</td>
                    <td>R${tier.cost.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="3"><strong>Total</strong></td>
                  <td><strong>R${report.charges.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h3>Top Errors</h3>
              ${report.topErrors.map(error => `
                <div style="margin-bottom: 15px;">
                  <strong>${error.message}</strong>
                  <br>
                  Count: ${error.count}
                  <br>
                  Last Occurrence: ${new Date(error.lastOccurrence).toLocaleString()}
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <p>
                For detailed information, please refer to the attached JSON report.
                <br>
                This is an automated report. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateErrorAlertTemplate(error: ErrorReport): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background: #fff3f3; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545; }
            .details { margin: 20px 0; }
            .code { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h2>⚠️ System Alert</h2>
              <p>
                <strong>Type:</strong> ${error.type}<br>
                <strong>Severity:</strong> ${error.severity}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </p>
            </div>

            <div class="details">
              <h3>Error Details</h3>
              <p>${error.message}</p>
              
              ${error.stackTrace ? `
                <h4>Stack Trace</h4>
                <pre class="code">${error.stackTrace}</pre>
              ` : ''}
              
              ${error.metadata ? `
                <h4>Additional Information</h4>
                <pre class="code">${JSON.stringify(error.metadata, null, 2)}</pre>
              ` : ''}
            </div>

            <p>
              Please investigate this issue promptly.
              <br>
              This is an automated alert. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}