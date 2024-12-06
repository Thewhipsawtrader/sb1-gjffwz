import { IssueReport, EmailRecipient } from '../types/issues';
import { BugSeverity } from '../types/bugs';
import { ErrorSeverity } from '../types/errors';

export class EmailService {
  private static readonly SUPPORT_EMAIL = 'support@surelink.com';
  private static readonly CREATOR_EMAIL = 'creator@surelink.com';
  private static readonly SITE_NAME = 'Student Residence WiFi Management';

  private static async sendEmail(
    subject: string,
    body: string,
    recipients: EmailRecipient[]
  ): Promise<void> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          body,
          recipients,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  static async sendIssueReport(issue: IssueReport): Promise<void> {
    const subject = `[${issue.severity}] Mikrotik ${issue.type} - ${this.SITE_NAME}`;
    
    const recipients: EmailRecipient[] = [
      { email: this.SUPPORT_EMAIL, name: 'Support Team', type: 'TO' },
      { email: this.CREATOR_EMAIL, name: 'System Creator', type: 'CC' },
    ];

    const body = this.formatIssueEmail(issue);
    await this.sendEmail(subject, body, recipients);
  }

  static async sendBugReport(severity: BugSeverity, body: string): Promise<void> {
    const subject = `[${severity}] Website Bug Report - ${this.SITE_NAME}`;
    
    const recipients: EmailRecipient[] = [
      { email: this.SUPPORT_EMAIL, name: 'Support Team', type: 'TO' },
      { email: this.CREATOR_EMAIL, name: 'System Creator', type: 'CC' },
    ];

    await this.sendEmail(subject, body, recipients);
  }

  static async sendTechnicalError(severity: ErrorSeverity, body: string): Promise<void> {
    const subject = `[${severity}] Technical Error - ${this.SITE_NAME}`;
    
    const recipients: EmailRecipient[] = [
      { email: this.SUPPORT_EMAIL, name: 'Support Team', type: 'TO' },
      { email: this.CREATOR_EMAIL, name: 'System Creator', type: 'CC' },
    ];

    await this.sendEmail(subject, body, recipients);
  }

  private static formatIssueEmail(issue: IssueReport): string {
    const timestamp = new Date(issue.timestamp).toLocaleString();
    
    let email = `Dear Support Team,\n\n`;
    email += `We have detected a ${issue.severity.toLowerCase()} severity issue with the Mikrotik router at ${this.SITE_NAME}. Below are the details:\n\n`;
    
    email += `Issue Type: ${issue.type.replace(/_/g, ' ')}\n`;
    email += `Severity: ${issue.severity}\n`;
    email += `Detected At: ${timestamp}\n`;
    email += `Status: ${issue.status}\n\n`;
    
    email += `Description:\n${issue.description}\n\n`;

    if (issue.possibleCause) {
      email += `Possible Cause:\n${issue.possibleCause}\n\n`;
    }

    if (issue.thirdPartyInvolved) {
      email += `Third-Party Involvement:\n`;
      email += `Please note that this router is managed by a third-party provider. `;
      email += `Recent changes to the router configuration may have created conflicts with our system. `;
      email += `We recommend coordinating with the third-party team to resolve any potential conflicts.\n\n`;
    }

    if (issue.stepsTaken?.length) {
      email += `Steps Already Taken:\n`;
      issue.stepsTaken.forEach((step, index) => {
        email += `${index + 1}. ${step}\n`;
      });
      email += '\n';
    }

    if (issue.suggestedResolution?.length) {
      email += `Suggested Resolution Steps:\n`;
      issue.suggestedResolution.forEach((step, index) => {
        email += `${index + 1}. ${step}\n`;
      });
      email += '\n';
    }

    email += `Please investigate this issue promptly. If you need any additional information or clarification, don't hesitate to reach out.\n\n`;
    
    email += `Best Regards,\n`;
    email += `Surelink Support Team`;

    return email;
  }
}