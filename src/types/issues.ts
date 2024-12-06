export type IssueType = 'CONNECTION_ERROR' | 'CONFIGURATION_CONFLICT' | 'API_ERROR' | 'AUTHENTICATION_ERROR';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IssueReport {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  timestamp: string;
  siteName: string;
  description: string;
  possibleCause?: string;
  stepsTaken?: string[];
  suggestedResolution?: string[];
  thirdPartyInvolved?: boolean;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface EmailRecipient {
  email: string;
  name: string;
  type: 'TO' | 'CC' | 'BCC';
}