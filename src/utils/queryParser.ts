import { QueryType, ParsedQuery } from '../types/query';

const QUERY_PATTERNS = [
  {
    type: 'STATUS_CHECK' as QueryType,
    patterns: [
      /(?:is|check if|what is the status of)\s+(?:student\s+)?([A-Za-z]+)\s+([A-Za-z]+)(?:'s)?\s+(?:wifi|status)/i,
      /(?:status|wifi status)\s+(?:for|of)\s+(?:student\s+)?([A-Za-z]+)\s+([A-Za-z]+)/i,
      /(?:is|check)\s+(?:unit|apartment)\s+([A-Za-z0-9-]+)\s+(?:active|deactivated)/i,
    ],
  },
];

const UNIT_REGEX = /(?:unit|apt\.?|apartment)\s*([A-Za-z0-9-]+)/i;

export function parseQuery(input: string): ParsedQuery | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // Try to match query patterns
  for (const queryPattern of QUERY_PATTERNS) {
    for (const pattern of queryPattern.patterns) {
      const match = input.match(pattern);
      if (match) {
        // Extract unit number if present
        const unitMatch = input.match(UNIT_REGEX);
        
        return {
          type: queryPattern.type,
          unitNumber: unitMatch ? unitMatch[1] : '',
          ...(match.length > 2 && {
            firstName: match[1],
            lastName: match[2],
          }),
        };
      }
    }
  }

  return null;
}