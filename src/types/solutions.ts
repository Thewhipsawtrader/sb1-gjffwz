export type SolutionCategory = 
  | 'MIKROTIK'
  | 'WEBSITE'
  | 'TECHNICAL'
  | 'SECURITY'
  | 'INTEGRATION';

export type SolutionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SolutionStep {
  order: number;
  description: string;
  command?: string;
  notes?: string;
  warning?: string;
}

export interface Solution {
  id: string;
  category: SolutionCategory;
  title: string;
  description: string;
  priority: SolutionPriority;
  symptoms: string[];
  steps: SolutionStep[];
  prerequisites?: string[];
  relatedErrors?: string[];
  thirdPartyContact?: {
    name: string;
    role: string;
    contact: string;
  };
  additionalNotes?: string;
  lastUpdated: string;
}