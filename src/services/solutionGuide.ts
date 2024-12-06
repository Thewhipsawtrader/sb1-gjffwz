import { Solution, SolutionCategory, SolutionStep } from '../types/solutions';
import { ErrorCategory } from '../types/errors';
import { IssueType } from '../types/issues';
import { v4 as uuidv4 } from 'uuid';

export class SolutionGuide {
  private static instance: SolutionGuide;
  private solutions: Map<string, Solution> = new Map();

  private constructor() {
    this.initializeSolutions();
  }

  static getInstance(): SolutionGuide {
    if (!SolutionGuide.instance) {
      SolutionGuide.instance = new SolutionGuide();
    }
    return SolutionGuide.instance;
  }

  private initializeSolutions(): void {
    // Mikrotik Connection Solutions
    this.addSolution({
      id: uuidv4(),
      category: 'MIKROTIK',
      title: 'Router Connection Issues',
      description: 'Solutions for handling Mikrotik router connection problems',
      priority: 'HIGH',
      symptoms: [
        'Unable to connect to router API',
        'High latency in responses',
        'Authentication failures'
      ],
      steps: [
        {
          order: 1,
          description: 'Verify Network Connectivity',
          command: 'ping router_ip_address',
          notes: 'Ensure stable network connection to router'
        },
        {
          order: 2,
          description: 'Check Router Configuration',
          command: 'ssh admin@router_ip',
          notes: 'Verify API service is running'
        },
        {
          order: 3,
          description: 'Review Recent Changes',
          notes: 'Check configuration history for recent modifications'
        },
        {
          order: 4,
          description: 'Contact Third-Party Provider',
          warning: 'Only if issues persist after local troubleshooting'
        }
      ],
      prerequisites: [
        'Admin access to router',
        'Network diagnostic tools'
      ],
      thirdPartyContact: {
        name: 'Router Management Team',
        role: 'Network Administrator',
        contact: 'support@routermanagement.com'
      },
      lastUpdated: new Date().toISOString()
    });

    // Website Bug Solutions
    this.addSolution({
      id: uuidv4(),
      category: 'WEBSITE',
      title: 'UI Component Failures',
      description: 'Solutions for handling website interface issues',
      priority: 'MEDIUM',
      symptoms: [
        'Blank screens',
        'Component rendering errors',
        'JavaScript console errors'
      ],
      steps: [
        {
          order: 1,
          description: 'Clear Browser Cache',
          notes: 'Instruct user to clear cache and cookies'
        },
        {
          order: 2,
          description: 'Check Browser Console',
          notes: 'Review error messages and stack traces'
        },
        {
          order: 3,
          description: 'Verify React Component State',
          notes: 'Use React DevTools to inspect component tree'
        },
        {
          order: 4,
          description: 'Test in Different Browser',
          notes: 'Verify if issue is browser-specific'
        }
      ],
      prerequisites: [
        'Browser DevTools access',
        'React DevTools installed'
      ],
      lastUpdated: new Date().toISOString()
    });

    // Technical Error Solutions
    this.addSolution({
      id: uuidv4(),
      category: 'TECHNICAL',
      title: 'API Integration Failures',
      description: 'Solutions for handling API and system integration issues',
      priority: 'HIGH',
      symptoms: [
        'Failed API requests',
        'Timeout errors',
        'Data synchronization issues'
      ],
      steps: [
        {
          order: 1,
          description: 'Check API Status',
          command: 'curl -I api_endpoint',
          notes: 'Verify API endpoint availability'
        },
        {
          order: 2,
          description: 'Review Error Logs',
          notes: 'Check application logs for detailed error messages'
        },
        {
          order: 3,
          description: 'Verify Authentication',
          notes: 'Ensure API keys and tokens are valid'
        },
        {
          order: 4,
          description: 'Test API Endpoints',
          command: 'npm run test:api',
          notes: 'Run API integration tests'
        }
      ],
      prerequisites: [
        'API documentation',
        'Access to logging system'
      ],
      lastUpdated: new Date().toISOString()
    });
  }

  private addSolution(solution: Solution): void {
    this.solutions.set(solution.id, solution);
  }

  findSolutionsByCategory(category: SolutionCategory): Solution[] {
    return Array.from(this.solutions.values())
      .filter(solution => solution.category === category);
  }

  findSolutionForError(errorCategory: ErrorCategory): Solution | null {
    return Array.from(this.solutions.values())
      .find(solution => solution.relatedErrors?.includes(errorCategory)) || null;
  }

  findSolutionForIssue(issueType: IssueType): Solution | null {
    const categoryMap: Record<IssueType, SolutionCategory> = {
      'CONNECTION_ERROR': 'MIKROTIK',
      'CONFIGURATION_CONFLICT': 'MIKROTIK',
      'API_ERROR': 'TECHNICAL',
      'AUTHENTICATION_ERROR': 'SECURITY'
    };

    return this.findSolutionsByCategory(categoryMap[issueType])[0] || null;
  }

  getAllSolutions(): Solution[] {
    return Array.from(this.solutions.values());
  }

  updateSolution(id: string, updates: Partial<Solution>): void {
    const solution = this.solutions.get(id);
    if (solution) {
      this.solutions.set(id, {
        ...solution,
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    }
  }
}