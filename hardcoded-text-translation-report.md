# Hardcoded Text Translation Report

## Summary
This report identifies all hardcoded English text in the React components of `dnd-session-manager/src/components/` that should be converted to use the translation system with `t()` function calls.

## Findings by Component

### 1. CharacterForm.tsx
**Line 223:**
```jsx
placeholder="Character notes, abilities, etc..."
```
**Should be:**
```jsx
placeholder={t('characterNotesPlaceholder')}
```
**Translation key needed:** `characterNotesPlaceholder`

### 2. DiceRoller.tsx
**Line 96:**
```jsx
placeholder="e.g., 2d8+3, 1d6"
```
**Should be:**
```jsx
placeholder={t('diceExamplePlaceholder')}
```
**Translation key needed:** `diceExamplePlaceholder`

### 3. ErrorBoundary.tsx
**Line 27:**
```jsx
<h2 className="text-red-500">Something went wrong.</h2>
```
**Should be:**
```jsx
<h2 className="text-red-500">{t('somethingWentWrong')}</h2>
```
**Note:** This component doesn't currently import `useI18n`, so it would need to be updated to use the translation system or handle errors differently.
**Translation key needed:** `somethingWentWrong`

### 4. LanguageSelector.tsx
**Line 28:**
```jsx
Select Language / 言語選択 / 选择语言 / Choisir Langue / Selecionar Idioma
```
**Should be:**
```jsx
{t('selectLanguage')}
```
**Note:** This is intentionally multilingual, but the component should handle this more elegantly.
**Translation key needed:** `selectLanguage`

**Line 71:**
```jsx
"Language preference is saved automatically"
```
**Should be:**
```jsx
{t('languageSavedAutomatically')}
```
**Translation key needed:** `languageSavedAutomatically`

### 5. Image Alt Text Issues

#### DnDSessionManager.tsx
**Line 109:**
```jsx
alt="D&D"
```
**Should be:**
```jsx
alt={t('dndLogo')}
```

**Line 173 and others:** Various image alt texts:
```jsx
alt="Combat"  // Should be: alt={t('combat')}
alt="Dice"    // Should be: alt={t('dice')}
alt="Notes"   // Should be: alt={t('notes')}
alt="No characters"  // Should be: alt={t('noCharacters')}
```

#### CombatTracker.tsx
**Line 137:**
```jsx
alt="Combat"
```
**Should be:**
```jsx
alt={t('combat')}
```

#### SessionNotes.tsx
**Line 16:**
```jsx
alt="Notes"
```
**Should be:**
```jsx
alt={t('notes')}
```

### 6. Keyboard Shortcut Text

#### BattleMapNew.tsx
**Lines 465-472:**
```jsx
title={`${t('undo')} (Ctrl+Z)`}
title={`${t('redo')} (Ctrl+Y)`}
```
**Should be:**
```jsx
title={t('undoShortcut')}  // "Undo (Ctrl+Z)"
title={t('redoShortcut')}  // "Redo (Ctrl+Y)"
```
**Translation keys needed:** `undoShortcut`, `redoShortcut`

## Summary of Required Translation Keys

The following translation keys need to be added to the translation files:

1. `characterNotesPlaceholder` - "Character notes, abilities, etc..."
2. `diceExamplePlaceholder` - "e.g., 2d8+3, 1d6"
3. `somethingWentWrong` - "Something went wrong."
4. `selectLanguage` - "Select Language"
5. `languageSavedAutomatically` - "Language preference is saved automatically"
6. `dndLogo` - "D&D Logo"
7. `noCharacters` - "No characters"
8. `undoShortcut` - "Undo (Ctrl+Z)"
9. `redoShortcut` - "Redo (Ctrl+Y)"

## Recommendations

1. **Update ErrorBoundary**: The ErrorBoundary component should be updated to support internationalization by accepting a translation function as a prop or using a different error handling approach.

2. **Image Alt Text**: All image alt attributes should use translation keys for better accessibility in different languages.

3. **LanguageSelector Improvements**: Consider a more elegant way to display the multilingual header that doesn't hardcode multiple languages.

4. **Keyboard Shortcuts**: Include keyboard shortcuts in translation keys so they can be localized for different keyboard layouts if needed.

5. **Consistent Pattern**: Ensure all user-visible text follows the same pattern of using `t('key')` function calls.

## Files That Need Updates

- `src/components/CharacterForm.tsx`
- `src/components/DiceRoller.tsx` 
- `src/components/ErrorBoundary.tsx`
- `src/components/LanguageSelector.tsx`
- `src/components/DnDSessionManager.tsx`
- `src/components/CombatTracker.tsx`
- `src/components/SessionNotes.tsx`
- `src/components/battle-map/BattleMapNew.tsx`
- Translation files in `src/lib/translations*.ts`

## Priority

**High Priority:**
- Placeholder text in forms (CharacterForm, DiceRoller)
- Error messages (ErrorBoundary)
- Language selector text

**Medium Priority:**
- Image alt text for accessibility
- Keyboard shortcut tooltips

**Low Priority:**
- Technical labels that might be universally understood
