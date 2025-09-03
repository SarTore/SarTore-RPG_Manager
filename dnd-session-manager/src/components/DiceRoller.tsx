import React, { useState } from 'react';
import { DiceType, DiceRoll } from '../lib/types';
import { rollDice, rollWithAdvantage, rollWithDisadvantage, rollDamage } from '../lib/dice';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { Dices, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DiceRoller() {
  const { t } = useI18n();
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [customExpression, setCustomExpression] = useState('');

  const addRoll = (type: string, result: number, details: string) => {
    const newRoll: DiceRoll = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      result,
      details,
      timestamp: Date.now(),
    };
    setRolls(prev => [newRoll, ...prev.slice(0, 9)]); // Keep last 10 rolls
  };

  const rollSingle = (sides: number) => {
    const result = rollDice(sides)[0];
    addRoll(`d${sides}`, result, `d${sides}: ${result}`);
  };

  const rollMultiple = (sides: number, count: number) => {
    const results = rollDice(sides, count);
    const total = results.reduce((sum, roll) => sum + roll, 0);
    const details = `${count}d${sides}: [${results.join(', ')}] = ${total}`;
    addRoll(`${count}d${sides}`, total, details);
  };

  const rollAdvantage = () => {
    const { rolls: rollResults, result } = rollWithAdvantage();
    addRoll('Advantage', result, `Advantage: [${rollResults.join(', ')}] = ${result}`);
  };

  const rollDisadvantage = () => {
    const { rolls: rollResults, result } = rollWithDisadvantage();
    addRoll('Disadvantage', result, `Disadvantage: [${rollResults.join(', ')}] = ${result}`);
  };

  const rollCustom = () => {
    if (!customExpression.trim()) return;
    
    const { total, details } = rollDamage(customExpression);
    addRoll(customExpression, total, details);
    setCustomExpression('');
  };

  const clearRolls = () => {
    setRolls([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Dices className="w-5 h-5 mr-2" />
          {t('diceRoller')}
        </h2>
        <Button variant="outline" size="sm" onClick={clearRolls} disabled={rolls.length === 0}>
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('clear')}
        </Button>
      </div>

      {/* Standard Dice */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('standardDice')}</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[4, 6, 8, 10, 12, 20].map((sides) => (
            <Button
              key={sides}
              variant="outline"
              size="sm"
              onClick={() => rollSingle(sides)}
              className="h-12 w-full flex flex-col items-center justify-center"
            >
              <div className="text-xs font-medium">d{sides}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Common Rolls */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('commonRolls')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={() => rollMultiple(6, 4)}>
            {t('statsRoll')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => rollMultiple(6, 2)}>
            2d6
          </Button>
          <Button variant="outline" size="sm" onClick={rollAdvantage}>
            {t('advantage')}
          </Button>
          <Button variant="outline" size="sm" onClick={rollDisadvantage}>
            {t('disadvantage')}
          </Button>
        </div>
      </div>

      {/* Custom Expression */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('customRoll')}</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customExpression}
            onChange={(e) => setCustomExpression(e.target.value)}
            placeholder={t('diceExamplePlaceholder')}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && rollCustom()}
          />
          <Button onClick={rollCustom} disabled={!customExpression.trim()}>
            {t('roll')}
          </Button>
        </div>
      </div>

      {/* Roll History */}
      {rolls.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('recentRolls')}</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {rolls.map((roll) => (
              <div
                key={roll.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white">{roll.details}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(roll.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className={cn(
                  'text-lg font-bold px-3 py-1 rounded',
                  roll.result === 20 && roll.type.includes('d20') 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : roll.result === 1 && roll.type.includes('d20')
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                )}>
                  {roll.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}