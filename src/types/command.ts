export type CommandType = 'DEACTIVATE_WIFI' | 'ACTIVATE_WIFI';

export interface ParsedCommand {
  type: CommandType;
  unitNumber: string;
  firstName?: string;
  lastName?: string;
  reason?: string;
}

export interface CommandDefinition {
  type: CommandType;
  keywords: string[];
  regex: RegExp;
}

export type CommandStatus = 'pending' | 'processing' | 'success' | 'error';

export interface CommandResult {
  status: CommandStatus;
  message: string;
  timestamp: string;
}