# Show Your Work - VS Code Extension

A VS Code extension that helps developers share planning context for AI-assisted PRs via GitHub Gists.

## Project Overview

- **Name**: `show-your-work`
- **Publisher**: `nstrayer`
- **URI Scheme**: `vscode://nstrayer.show-your-work/open?gist=...`

## Architecture

```
src/
├── extension.ts              # Entry point, registers commands & URI handler
├── commands/
│   ├── installCommand.ts     # Installs Claude command to .claude/commands/
│   └── copyPrompt.ts         # Copies prompt to clipboard
├── handlers/
│   └── uriHandler.ts         # Handles vscode:// URIs, fetches gist, opens viewer
├── viewer/
│   ├── webviewPanel.ts       # Creates/manages webview panel
│   └── webviewContent.ts     # Generates HTML with rendered markdown
└── utils/
    ├── gistFetcher.ts        # Fetches gist via gh CLI or GitHub API
    └── fileReferenceParser.ts # Parses file:line references in content
```

## Commands

| Command | ID | Description |
|---------|-----|-------------|
| Install Claude Command | `showYourWork.installClaudeCommand` | Creates `.claude/commands/show-your-work.md` in workspace |
| Copy Prompt | `showYourWork.copyPrompt` | Copies prompt template to clipboard |

## Key Files

- `resources/claude-command.md` - Template installed by the Install command
- `media/styles/webview.css` - Webview styling using VS Code CSS variables

## Development

```bash
npm install     # Install dependencies
npm run compile # Build
npm run watch   # Watch mode
# Press F5 in VS Code to launch extension host
```

## Gist Fetching

The extension tries `gh gist view` first (uses existing auth), then falls back to the GitHub API for public gists.

## File References

The viewer makes file references clickable:
- Colon notation: `src/file.ts:45` or `src/file.ts:45:10`
- Markdown links: `[text](src/file.ts#L45)`

Clicking opens the file in the editor at the specified line.
