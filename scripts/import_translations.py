#!/usr/bin/env python3
"""Import translations from translations-remaining.json back to en.json"""
import json
from pathlib import Path

EN_FILE = Path(__file__).parent.parent / 'src' / 'i18n' / 'patches' / 'en.json'
INPUT_FILE = Path(__file__).parent.parent / 'translations-remaining.json'

if not INPUT_FILE.exists():
    print(f"Error: {INPUT_FILE} not found")
    print("Run extract_remaining_todos.py first")
    exit(1)

print("Loading translations...")
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    translations = json.load(f)

print("Loading en.json...")
with open(EN_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Apply translations
count = 0
for key, value in data.items():
    if isinstance(value, str) and value.startswith('[TODO: Translate]'):
        chinese = value.replace('[TODO: Translate] ', '')
        if chinese in translations and translations[chinese]:
            data[key] = translations[chinese]
            count += 1

print(f"Applied {count} translations")
print("Saving en.json...")

with open(EN_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done!")
