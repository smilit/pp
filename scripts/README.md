# Translation Scripts

This directory contains utility scripts for managing i18n translations.

## Useful Scripts

### `extract_remaining_todos.py`
Extracts all `[TODO: Translate]` entries from `en.json` for manual translation.

**Usage:**
```bash
python scripts/extract_remaining_todos.py
```

**Output:** `translations-remaining.json` - Contains all untranslated entries

### `import_translations.py`
Imports translated entries from `translations-remaining.json` back into `en.json`.

**Usage:**
1. Fill in translations in `translations-remaining.json`
2. Run: `python scripts/import_translations.py`

### `translate_all.py`
Contains comprehensive translation dictionary (1200+ entries) for reference.
Can be used as a base for future translations.

## Workflow for Adding New Translations

When upstream adds new Chinese text:

1. **Extract new TODOs:**
   ```bash
   python scripts/extract_remaining_todos.py
   ```

2. **Translate entries:**
   Edit `translations-remaining.json` and add English translations

3. **Import translations:**
   ```bash
   python scripts/import_translations.py
   ```

4. **Verify:**
   Check `en.json` for any remaining `[TODO]` markers

## Translation Guidelines

- **Use full sentences/phrases** - Not word-by-word translation
- **Context-aware** - Consider where the text appears in the UI
- **Natural English** - Translate meaning, not literal words
- **Consistent terminology** - Use same terms for same concepts

## Current Status

- **Total entries:** 3,568
- **Translated:** 3,568 (100%)
- **Coverage:** 100%
