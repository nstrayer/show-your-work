# TODO

## Critical (won't work without these)

- [x] **Add activation events for commands** - Currently only `onUri` is registered in package.json, so commands won't be available until a URI is opened. Need to add:
  ```json
  "activationEvents": [
    "onCommand:showYourWork.installClaudeCommand",
    "onCommand:showYourWork.copyPrompt"
  ]
  ```

- [x] **Bundle resources in VSIX** - `resources/claude-command.md` won't be included in the packaged extension. Add to package.json:
  ```json
  "files": [
    "out",
    "media",
    "resources"
  ]
  ```

## Recommended

- [x] **Add extension icon** - VS Code marketplace requires an icon. Create `media/icon.png` (128x128) and add to package.json:
  ```json
  "icon": "media/icon.png"
  ```

- [x] **Add vsce packaging** - Install `@vscode/vsce` as dev dependency and add package script:
  ```bash
  npm install --save-dev @vscode/vsce
  ```
  ```json
  "scripts": {
    "package": "vsce package"
  }
  ```

- [x] **Add tests** - Create basic tests for utility functions:
  - `src/utils/gistFetcher.ts` - test `parseGistId()` with various input formats
  - `src/utils/fileReferenceParser.ts` - test `parseFileReferences()` and `makeFileReferencesClickable()`

## Cleanup

- [x] **Remove unused import** - `src/commands/installCommand.ts` imports `fs` but uses `vscode.workspace.fs` instead

- [x] **Remove empty command** - `showYourWork.openFile` in `src/extension.ts` is registered but does nothing (file opening is handled via webview postMessage in `webviewPanel.ts`)

---

## UX Improvements

### Current Pain Points

- **Zero visual presence** - No sidebar, status bar, or welcome view. Users must know the extension exists and remember command names.
- **Discoverability gap** - New users have no guidance after installation
- **No configuration** - Can't customize paths for planning docs, gist visibility, etc.
- **Isolated commands** - No integration with editor/explorer context menus

### High Impact, Low Effort

- [x] **Welcome/Walkthrough Experience** - Add a VS Code walkthrough that appears on first install with steps for installing the Claude command, creating PR context, and reviewing PRs.

- [x] **Status Bar Item** - Show a subtle indicator when viewing a repo that has `.claude/commands/show-your-work.md` installed, or when in a PR context webview. Clicking opens a quick pick menu with available commands.

- [x] **Explorer Context Menu** - Add "Open Context from PR" to the SCM view and editor title bar (in diff view). Auto-detects PR for current branch.

### Medium Impact, Medium Effort

- [ ] **Activity Bar View (Sidebar Panel)** - A dedicated sidebar showing:
  - Quick actions (Install command, Open from PR, Copy prompt)
  - Recent gists/contexts viewed
  - Status of current workspace setup (whether Claude command is installed)

- [ ] **Settings/Configuration** - Add user-configurable settings:
  - `showYourWork.planningDocPaths` - Custom paths to scan for planning docs
  - `showYourWork.gistVisibility` - Default to "secret" or "public"
  - `showYourWork.autoOpenOnUriClick` - Control auto-open behavior

- [ ] **Keyboard Shortcuts** - Add default keybindings for common actions like "Open Context from PR"

### Lower Priority, Higher Effort

- [ ] **Webview Enhancements** - Table of contents for multi-file gists, search within context, collapse/expand sections, "Copy file reference" buttons

- [ ] **SCM Integration** - Show "View PR Context" button in Source Control panel when on a branch with an associated PR containing Show Your Work links

- [ ] **PR Creation Helper** - When creating a PR, offer to scan for planning docs and create the gist automatically

### Recommended First Iteration

1. ~~**Walkthrough**~~ - Done in v0.0.5
2. ~~**Status bar item**~~ - Done in v0.0.6
3. ~~**Explorer Context Menu**~~ - Done in v0.0.6
4. **Settings** - Users expect configurability; planning doc paths especially (NEXT)
