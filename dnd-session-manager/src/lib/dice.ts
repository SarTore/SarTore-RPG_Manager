import { DiceType } from '../lib/types';

export function rollDice(sides: number, count: number = 1): number[] {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

export function rollD20(): number {
  return rollDice(20)[0];
}

export function rollWithAdvantage(): { rolls: number[], result: number } {
  const rolls = rollDice(20, 2);
  return { rolls, result: Math.max(...rolls) };
}

export function rollWithDisadvantage(): { rolls: number[], result: number } {
  const rolls = rollDice(20, 2);
  return { rolls, result: Math.min(...rolls) };
}

export function rollDamage(diceExpression: string): { total: number, details: string } {
  // Parse expressions like "2d8+3" or "1d6"
  const match = diceExpression.match(/(\d+)d(\d+)(?:([+-])(\d+))?/i);
  if (!match) {
    return { total: 0, details: 'Invalid dice expression' };
  }

  const [, countStr, sidesStr, operator, modifierStr] = match;
  const count = parseInt(countStr, 10);
  const sides = parseInt(sidesStr, 10);
  const modifier = modifierStr ? parseInt(modifierStr, 10) : 0;
  
  const rolls = rollDice(sides, count);
  let total = rolls.reduce((sum, roll) => sum + roll, 0);
  
  if (operator === '+') {
    total += modifier;
  } else if (operator === '-') {
    total -= modifier;
  }
  
  const rollDetails = rolls.join(' + ');
  const modifierText = modifier ? ` ${operator} ${modifier}` : '';
  const details = `${rollDetails}${modifierText} = ${total}`;
  
  return { total, details };
}

export function rollInitiative(modifier: number = 0): number {
  return rollD20() + modifier;
}