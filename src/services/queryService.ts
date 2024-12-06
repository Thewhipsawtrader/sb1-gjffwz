import { ParsedQuery, WifiHistory } from '../types/query';
import { MikrotikService } from './mikrotik';
import { ReportStore } from '../stores/reportStore';

export class QueryService {
  static async processQuery(query: ParsedQuery): Promise<WifiHistory | null> {
    try {
      // Get unit status and history
      const unit = await MikrotikService.getUnitDetails(query.unitNumber);
      if (!unit) return null;

      // Get recent actions from report store
      const recentActions = ReportStore.getRequestsSinceLastReport()
        .filter(entry => entry.command.unitNumber === query.unitNumber)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Find last deactivation and activation
      const lastDeactivation = recentActions.find(
        action => action.command.type === 'DEACTIVATE_WIFI'
      );
      const lastActivation = recentActions.find(
        action => action.command.type === 'ACTIVATE_WIFI'
      );

      return {
        unitNumber: unit.unitNumber,
        residentName: unit.residentName,
        currentStatus: unit.active ? 'active' : 'deactivated',
        ...(lastDeactivation && {
          lastDeactivation: {
            date: lastDeactivation.timestamp,
            by: lastDeactivation.daName,
            reason: lastDeactivation.command.reason || 'No reason provided',
          },
        }),
        ...(lastActivation && {
          lastActivation: {
            date: lastActivation.timestamp,
            by: lastActivation.daName,
          },
        }),
      };
    } catch (error) {
      console.error('Error processing query:', error);
      return null;
    }
  }

  static formatQueryResponse(history: WifiHistory): string {
    const status = history.currentStatus === 'active' ? 'Active' : 'Deactivated';
    let response = `Status for Unit ${history.unitNumber} (${history.residentName}): ${status}\n\n`;

    if (history.lastDeactivation) {
      response += `Last Deactivation:\n`;
      response += `• Date: ${new Date(history.lastDeactivation.date).toLocaleString()}\n`;
      response += `• By: ${history.lastDeactivation.by}\n`;
      response += `• Reason: ${history.lastDeactivation.reason}\n\n`;
    }

    if (history.lastActivation) {
      response += `Last Activation:\n`;
      response += `• Date: ${new Date(history.lastActivation.date).toLocaleString()}\n`;
      response += `• By: ${history.lastActivation.by}\n`;
    }

    return response;
  }
}