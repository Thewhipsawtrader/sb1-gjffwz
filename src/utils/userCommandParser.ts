import { UserCommand, UserCommandType } from '../types/userManagement';

const COMMAND_PATTERNS = {
  ADD_USER: /add\s+(?:student|user)\s+([A-Za-z]+)\s+([A-Za-z]+),?\s+(?:unit|apt\.?|apartment)\s+([A-Za-z0-9-]+)(?:,?\s+username:?\s+([A-Za-z0-9]+))?(?:,?\s+password:?\s+([A-Za-z0-9@#$%^&*]+))?/i,
  REMOVE_USER: /remove\s+(?:student|user)\s+([A-Za-z]+)\s+([A-Za-z]+)(?:,?\s+(?:unit|apt\.?|apartment)\s+([A-Za-z0-9-]+))?/i,
  UPDATE_USER: /update\s+(?:student|user)\s+([A-Za-z]+)\s+([A-Za-z]+)\s+from\s+(?:unit|apt\.?|apartment)\s+([A-Za-z0-9-]+)\s+to\s+(?:unit|apt\.?|apartment)\s+([A-Za-z0-9-]+)(?:,?\s+change\s+username\s+to\s+([A-Za-z0-9]+))?/i,
};

export function parseUserCommand(input: string): UserCommand | null {
  // Normalize input
  const normalizedInput = input.toLowerCase().trim();
  
  // Try ADD_USER pattern
  const addMatch = input.match(COMMAND_PATTERNS.ADD_USER);
  if (addMatch) {
    return {
      type: 'ADD_USER',
      firstName: addMatch[1],
      lastName: addMatch[2],
      unitNumber: addMatch[3],
      username: addMatch[4],
      password: addMatch[5],
    };
  }

  // Try REMOVE_USER pattern
  const removeMatch = input.match(COMMAND_PATTERNS.REMOVE_USER);
  if (removeMatch) {
    return {
      type: 'REMOVE_USER',
      firstName: removeMatch[1],
      lastName: removeMatch[2],
      unitNumber: removeMatch[3] || '',
    };
  }

  // Try UPDATE_USER pattern
  const updateMatch = input.match(COMMAND_PATTERNS.UPDATE_USER);
  if (updateMatch) {
    return {
      type: 'UPDATE_USER',
      firstName: updateMatch[1],
      lastName: updateMatch[2],
      unitNumber: updateMatch[3],
      newUnitNumber: updateMatch[4],
      newUsername: updateMatch[5],
    };
  }

  return null;
}