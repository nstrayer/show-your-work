# PRD: Show Your Work

**Status:** Draft
**Created:** 2026-02-02

## Problem Statement

When developers use AI assistance (Claude Code, Cursor, etc.) to create PRs, reviewers reasonably adjust their scrutiny level based on how the code was produced. However, there's no standardized way for contributors to show the rigor behind their AI-assisted work - the planning, research, and iteration that went into it.

This creates a problematic incentive structure:
- Contributors who did thoughtful AI-assisted work have no way to demonstrate it
- Reviewers must either over-scrutinize everything or take a leap of faith
- It's unfair to ask a reviewer to be more careful than the contributor was, but there's no visibility into contributor effort
- As a result, many contributors simply hide AI use entirely, which is worse for everyone

The core insight: **reviewers review code differently if they know it was hand-written vs AI-generated, and having context about what went into the AI generation is essential for understanding the output.**

## Target Users

**Primary:** Contributors who use AI dev tools and want to demonstrate their work was thoughtful, not just generated. Specifically:
- Developers contributing to projects with scrutinizing code review cultures
- Contributors who care about their reputation and want PRs merged efficiently
- Teams where AI-assisted development is common and transparency is valued

**Secondary:** PR reviewers who benefit from seeing the planning context, reducing back-and-forth and building trust with contributors.

## Current Alternatives

| Approach | Why It's Insufficient |
|----------|----------------------|
| Long PR descriptions | Manual, inconsistent, clutters the PR body with walls of text |
| Linking to gists manually | Works but: no standard format, easy to miss, raw gist UI is utilitarian |
| Linking external docs | Fragmented (Google Docs, Notion), no standard format, often forgotten |
| Comments in code | Pollutes the codebase with context that doesn't belong there |
| Do nothing | Most common - contributors just submit code and hope for the best |

The key friction: even when contributors *do* link planning docs, reviewers often miss them or don't click through because there's no standard place to look and no signal that context is worth reading.

## Proposed Solution

A VS Code extension that handles both sides of the workflow: helping contributors package and share their planning context, and helping reviewers view that context alongside the code.

**MVP (v1) - Single VS Code Extension**

The extension serves two user workflows:

### Contributor Workflow (Sharing)

1. **Trigger** - The VS Code extension provides a command/prompt that the contributor copies and pastes into Claude Code
   - Extension does NOT create gists itself - it just facilitates the handoff to Claude Code
   - Alternative: install a custom command to `.claude/commands/` that Claude Code picks up automatically

2. **Content gathering (in Claude Code)** - The command interactively collects planning context:
   - Scans known locations (e.g., `thoughts/`, `.pr-context/`)
   - Shows contributor what will be included
   - Contributor can review, edit, and remove items before proceeding
   - Contributor can manually add conversation excerpts if desired (copy/paste)

3. **Gist creation (in Claude Code)** - Creates the gist via `gh gist create`
   - Requires `gh` CLI installed and authenticated (reasonable assumption for AI-assisted dev workflows)
   - No custom OAuth or authentication needed - uses existing `gh` auth

4. **Badge output** - Claude Code prints options for the PR description; contributor copies preferred format:
   - **Visual badge:** `[![Show Your Work](https://img.shields.io/badge/Show_Your_Work-View-blue)](vscode://show-your-work/open?gist=...) | [View on GitHub](https://gist.github.com/...)`
   - **Plain URL:** `**Show Your Work:** https://gist.github.com/...`
   - Both include `vscode://` link (for extension users) and raw gist link (fallback)

### Reviewer Workflow (Viewing)

1. **Discovery** - Reviewer sees PR on GitHub web, notices the context badge in the description

2. **Handoff** - Clicking the badge opens VS Code with the planning context loaded
   - Primary path: `vscode://show-your-work/open?gist=...` URI handler triggers the extension directly
   - Fallback path: plain gist link for reviewers without the extension (they see raw gist on GitHub)

3. **Side-by-side view** - The extension displays:
   - Planning context on one side (PRD, implementation plan, conversation excerpts)
   - Referenced code files on the other side

4. **Navigation** - File references in the plan (e.g., `src/auth/login.ts:45`) are clickable
   - Clicking jumps to that file and line in the side-by-side view
   - Plan becomes a navigation aid for the review itself

**Prerequisite:** Reviewer must have the repo checked out locally for file navigation to work. If files don't exist locally, references are displayed but not clickable.

**Why Gists (not custom hosting):**
- No authentication system to build - use GitHub's
- No abuse/moderation concerns - GitHub handles it
- No retention policy decisions - contributors control their gists
- No storage costs or infrastructure to maintain
- Contributors can edit/delete via familiar GitHub UI

**Why VS Code (not browser extension):**
- Reviews often happen in VS Code via GitHub PR extension
- Enables direct navigation from plan references to actual code
- Side-by-side view is more useful than inline web preview
- Single extension handles both contributor and reviewer workflows

**Dependencies:**
- **Contributors:** Must have `gh` CLI installed and authenticated (for gist creation)
- **Reviewers:** Must have the VS Code extension installed (for rich viewing experience; fallback to raw gist otherwise)
- **Reviewers (for navigation):** Must have the repo checked out locally

**What it is NOT:**
- Not a hosting service (uses GitHub Gists for storage)
- Not a web app (VS Code is the primary experience; web fallback optional)
- Not a tool that generates planning docs (use Claude Code, etc. for that)
- Not a verification/authenticity system (trust-based)
- Not an analytics platform (no tracking of views or engagement)

## Success Criteria

**Primary signal:** Reviewer feedback - reviewers explicitly say the context helped them understand the PR better.

**Supporting indicators:**
1. **Team adoption:** The internal team uses it for AI-assisted PRs within 30 days of launch
2. **Reviewer engagement:** Reviewers open context in VS Code (click the badge)
3. **Reduced friction:** Fewer clarifying questions in PR comments compared to PRs without context
4. **Organic spread:** People outside the team start using it without being asked

## Non-Goals

- **Content hosting:** We don't store planning docs - GitHub Gists handles storage, authentication, and moderation.
- **Web-first experience:** VS Code is the primary experience. A web fallback is optional/future.
- **Verification/authenticity:** We don't prove the docs are real or unmodified. Trust-based.
- **Analytics/tracking:** No metrics on views, engagement, etc. Keep it simple.
- **AI artifact generation:** We don't help create the docs, just link and display them.
- **Non-GitHub platforms:** MVP focuses on GitHub. GitLab/Bitbucket support could come later.
- **Non-VS Code editors:** MVP is VS Code only. Other editors (JetBrains, etc.) could come later.

## Open Questions

None remaining for v1.

## Resolved Decisions

- **Naming:** "Show Your Work" - evokes the math class concept of demonstrating your process
- **URI handler:** Direct `vscode://` link with fallback to raw gist
- **Gist creation:** Claude Code via `gh` CLI (not VS Code extension)
- **Authentication:** Uses existing `gh` CLI auth (no custom OAuth)
- **Gist structure:** Single multi-file gist per PR. All planning artifacts bundled together as separate files within one gist.
- **Badge:** Two options in output - shields.io dynamic badge for visual display, plus plain gist URL for simplicity. Contributor chooses which to use in PR description.
- **Conversation export:** Descoped from v1. Manual copy/paste if contributor wants to include conversation excerpts.
- **Content detection:** Scan typical locations (`thoughts/`, `.pr-context/`, etc.) then prompt user to confirm selection and add any additional files. No manifest file required.
- **Update flow:** Append/version - new files added to existing gist with version suffixes (e.g., `plan-v2.md`). Badge URL stays stable.
- **File reference format:** Parse both colon notation (`src/auth/login.ts:45`) and markdown links (`[file](path#L45)`). Colon notation matches Claude Code output and stack traces; markdown links are GitHub-compatible.
- **Viewer layout:** Single scrollable view with all docs concatenated, separated by headers. Everything visible at once.

## Distribution Strategy

1. **Internal first:** Use on internal team PRs to validate the workflow and iterate
2. **VS Code Marketplace:** Publish extension for easy installation (one-click install barrier is key)
3. **OSS communities:** Share in relevant Discord/Slack communities where AI-assisted development is discussed
4. **Word of mouth:** Let adoption grow organically through developers who find it useful

No plans for paid marketing or partnerships in v1.
