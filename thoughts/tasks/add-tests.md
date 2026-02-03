# Task: Add Tests for Utility Functions

**Status:** in-progress
**Last Updated:** 2026-02-02

## Context for Claude

When working with this task, keep this file updated:
- **Current State**: Update when test files are completed
- **Decisions Made**: Add when you choose between approaches (include why)
- **Key Files**: Add files you discover that are central but weren't listed
- **Gap detection**: If you had to look something up that should have been documented here, add it immediately

Keep updates concise - bullet points, not paragraphs.

## Overview

Add unit tests for utility functions in the Show Your Work VS Code extension, focusing on `parseGistId()` in gistFetcher.ts and `parseFileReferences()`/`makeFileReferencesClickable()` in fileReferenceParser.ts.

## Key Files

- `src/utils/gistFetcher.ts` - Contains `parseGistId()` that extracts gist IDs from various URL formats
- `src/utils/fileReferenceParser.ts` - Contains file reference parsing for clickable links in viewer
- `package.json` - Will need test scripts and dev dependencies added

## Decisions Made

- **Mocha + VS Code test**: Using standard VS Code extension testing approach for consistency with ecosystem conventions and official docs

## Current State

Fresh start - no test infrastructure exists yet.

**Next steps:**
1. Set up test infrastructure (Mocha config, test scripts in package.json)
2. Create test files for both utility modules
3. Write tests for `parseGistId()` with various input formats (full URLs, gist IDs, etc.)
4. Write tests for `parseFileReferences()` and `makeFileReferencesClickable()`

## Related Docs

- [PRD](../prds/show-your-work.md) - Main product requirements
- [TODO.md](../../TODO.md) - Lists testing as a recommended improvement

## Notes

- Tests should cover colon notation (`src/file.ts:45`) and markdown links (`[text](src/file.ts#L45)`)
- `parseGistId()` needs to handle full gist URLs, raw URLs, and bare gist IDs
