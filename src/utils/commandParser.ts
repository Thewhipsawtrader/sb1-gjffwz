import { CommandType, ParsedCommand, CommandDefinition } from '../types/command';

const COMMANDS: CommandDefinition[] = [
  {
    type: 'DEACTIVATE_WIFI',
    keywords: ['deactivate wifi', 'disable wifi', 'turn off wifi'],
    regex: /(?:deactivate|disable|turn off)\s+wifi/i,
  },
  {
    type: 'ACTIVATE_WIFI',
    keywords: ['activate wifi', 'enable wifi', 'turn on wifi'],
    regex: /(?:activate|enable|turn on)\s+wifi/i,
  },
];

const UNIT_REGEX = /(?:unit|apt\.?|apartment)\s*([A-Za-z0-9-]+)/i;
const NAME_REGEX = /(?:for|student)\s+([A-Za-z]+)\s+([A-Za-z]+)/i;
const REASON_REGEX = /(?:due to|because|reason:|:)\s+(.+?)(?:\.|$)/i;

export function parseCommand(input: string): ParsedCommand | null {
  // Normalize input
  const normalizedInput = input.toLowerCase().trim();
  
  // Find matching command
  const matchedCommand = COMMANDS.find(cmd => 
    cmd.keywords.some(keyword => normalizedInput.includes(keyword.toLowerCase())) ||
    cmd.regex.test(normalizedInput)
  );

  if (!matchedCommand) return null;

  // Extract unit number
  const unitMatch = input.match(UNIT_REGEX);
  if (!unitMatch) return null;

  // Extract name if present
  const nameMatch = input.match(NAME_REGEX);
  
  // Extract reason if present
  const reasonMatch = input.match(REASON_REGEX);

  return {
    type: matchedCommand.type,
    unitNumber: unitMatch[1],
    ...(nameMatch && {
      firstName: nameMatch[1],
      lastName: nameMatch[2],
    }),
    ...(reasonMatch && {
      reason: reasonMatch[1].trim(),
    }),
  };
}