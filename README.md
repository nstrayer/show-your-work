# Show Your Work

A VS Code extension that helps developers share planning context for AI-assisted PRs via GitHub Gists, and helps reviewers view that context alongside code.

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=nstrayer.show-your-work) or [Open VSX](https://open-vsx.org/extension/nstrayer/show-your-work).

Or search for "Show Your Work" in the VS Code extensions panel.

## Features

### For Contributors

**Install Claude Command**: Adds a Claude Code command to your workspace that helps create gists with your planning context.

1. Run "Show Your Work: Install Claude Command" from the command palette
2. Use `/project:show-your-work` in Claude Code to create a gist with your planning docs
3. Add the badge to your PR description

**Copy Prompt**: Copies the prompt to clipboard for manual use.

### For Reviewers

**Open from PR**: Quickly open planning context from any GitHub PR.

1. Run "Show Your Work: Open Context from PR" from the command palette
2. Enter a PR number (if you're in a cloned repo) or a full GitHub PR URL
3. The extension finds and opens any Show Your Work links in the PR description

**Click a badge**: Click a "Show Your Work" badge in a PR to open the planning context directly in VS Code:

```
vscode://nstrayer.show-your-work/open?gist=<gist_id>
```

The extension displays a rich webview with:
- Rendered markdown content
- Clickable file references (e.g., `src/auth/login.ts:45`)
- VS Code theme integration

## Requirements

- `gh` CLI installed and authenticated (for private gists)
- Public gists work without authentication

## Commands

| Command | Description |
|---------|-------------|
| `Show Your Work: Install Claude Command` | Install the Claude Code command file to your workspace |
| `Show Your Work: Copy Prompt to Clipboard` | Copy the prompt for manual use |
| `Show Your Work: Open Context from PR` | Open planning context from a GitHub PR number or URL |

## URI Scheme

The extension handles URIs in this format:

```
vscode://nstrayer.show-your-work/open?gist=<id_or_url>
```

The gist parameter accepts:
- Raw gist ID: `abc123def456`
- Full URL: `https://gist.github.com/user/abc123def456`

## Badge Format

Add this badge to your PR description:

```markdown
[![Show Your Work](https://img.shields.io/badge/Show_Your_Work-View_Context-blue?logo=github)](vscode://nstrayer.show-your-work/open?gist=YOUR_GIST_ID)
```

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Run extension in development
# Press F5 in VS Code
```

## License

MIT
