# TODO

## Critical (won't work without these)

- [ ] **Add activation events for commands** - Currently only `onUri` is registered in package.json, so commands won't be available until a URI is opened. Need to add:
  ```json
  "activationEvents": [
    "onCommand:showYourWork.installClaudeCommand",
    "onCommand:showYourWork.copyPrompt"
  ]
  ```

- [ ] **Bundle resources in VSIX** - `resources/claude-command.md` won't be included in the packaged extension. Add to package.json:
  ```json
  "files": [
    "out",
    "media",
    "resources"
  ]
  ```

## Recommended

- [ ] **Add extension icon** - VS Code marketplace requires an icon. Create `media/icon.png` (128x128) and add to package.json:
  ```json
  "icon": "media/icon.png"
  ```

- [ ] **Add vsce packaging** - Install `@vscode/vsce` as dev dependency and add package script:
  ```bash
  npm install --save-dev @vscode/vsce
  ```
  ```json
  "scripts": {
    "package": "vsce package"
  }
  ```

- [ ] **Add tests** - Create basic tests for utility functions:
  - `src/utils/gistFetcher.ts` - test `parseGistId()` with various input formats
  - `src/utils/fileReferenceParser.ts` - test `parseFileReferences()` and `makeFileReferencesClickable()`

## Cleanup

- [ ] **Remove unused import** - `src/commands/installCommand.ts` imports `fs` but uses `vscode.workspace.fs` instead

- [ ] **Remove empty command** - `showYourWork.openFile` in `src/extension.ts` is registered but does nothing (file opening is handled via webview postMessage in `webviewPanel.ts`)
