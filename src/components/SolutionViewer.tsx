import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Solution, SolutionStep } from '../types/solutions';

interface SolutionViewerProps {
  solution: Solution;
  className?: string;
}

export function SolutionViewer({ solution, className = '' }: SolutionViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900">{solution.title}</h3>
            <p className="text-sm text-gray-500">{solution.category}</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(solution.priority)}`}>
          {solution.priority}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Description</h4>
              <p className="mt-1 text-sm text-gray-600">{solution.description}</p>
            </div>

            {solution.symptoms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Symptoms</h4>
                <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                  {solution.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900">Resolution Steps</h4>
              <div className="mt-2 space-y-3">
                {solution.steps.map((step: SolutionStep) => (
                  <div key={step.order} className="pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-900">
                      {step.order}. {step.description}
                    </p>
                    {step.command && (
                      <pre className="mt-1 text-xs bg-gray-50 p-2 rounded">
                        {step.command}
                      </pre>
                    )}
                    {step.notes && (
                      <p className="mt-1 text-xs text-gray-600">{step.notes}</p>
                    )}
                    {step.warning && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {step.warning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {solution.prerequisites && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Prerequisites</h4>
                <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                  {solution.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {solution.thirdPartyContact && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Third-Party Contact</h4>
                <div className="mt-1 text-sm text-gray-600">
                  <p>{solution.thirdPartyContact.name}</p>
                  <p>{solution.thirdPartyContact.role}</p>
                  <p>{solution.thirdPartyContact.contact}</p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Last updated: {new Date(solution.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}