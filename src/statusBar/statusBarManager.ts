import * as vscode from "vscode";
import * as path from "path";

const COMMAND_PATH = ".claude/commands/show-your-work.md";

export interface StatusBarManager {
  updateVisibility(): Promise<void>;
  onWebviewOpened(): void;
  onWebviewClosed(): void;
  dispose(): void;
}

export function createStatusBarManager(
  context: vscode.ExtensionContext
): StatusBarManager {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(bookmark) Show Your Work";
  statusBarItem.tooltip = "Click for Show Your Work actions";
  statusBarItem.command = "showYourWork.statusBarClicked";

  let webviewOpen = false;

  async function checkCommandInstalled(): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return false;
    }

    for (const folder of workspaceFolders) {
      const commandUri = vscode.Uri.joinPath(folder.uri, COMMAND_PATH);
      try {
        await vscode.workspace.fs.stat(commandUri);
        return true;
      } catch {
        // File not found in this folder
      }
    }
    return false;
  }

  async function updateVisibility(): Promise<void> {
    const installed = await checkCommandInstalled();
    if (installed || webviewOpen) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }

  function onWebviewOpened(): void {
    webviewOpen = true;
    statusBarItem.show();
  }

  function onWebviewClosed(): void {
    webviewOpen = false;
    updateVisibility();
  }

  // Initial visibility check
  updateVisibility();

  // Watch for workspace folder changes
  const folderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    updateVisibility();
  });

  // Watch for file changes in .claude/commands/
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    `**/${COMMAND_PATH}`
  );
  fileWatcher.onDidCreate(() => updateVisibility());
  fileWatcher.onDidDelete(() => updateVisibility());

  context.subscriptions.push(statusBarItem, folderWatcher, fileWatcher);

  return {
    updateVisibility,
    onWebviewOpened,
    onWebviewClosed,
    dispose: () => {
      statusBarItem.dispose();
      folderWatcher.dispose();
      fileWatcher.dispose();
    },
  };
}

export async function showStatusBarMenu(): Promise<void> {
  const items: vscode.QuickPickItem[] = [
    {
      label: "$(globe) Open Context from PR...",
      description: "Open a PR context gist in the viewer",
    },
    {
      label: "$(add) Install Claude Command",
      description: "Install the command to .claude/commands/",
    },
    {
      label: "$(clippy) Copy Prompt to Clipboard",
      description: "Copy the prompt template",
    },
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a Show Your Work action",
  });

  if (!selected) {
    return;
  }

  if (selected.label.includes("Open Context from PR")) {
    await vscode.commands.executeCommand("showYourWork.openFromPr");
  } else if (selected.label.includes("Install Claude Command")) {
    await vscode.commands.executeCommand("showYourWork.installClaudeCommand");
  } else if (selected.label.includes("Copy Prompt")) {
    await vscode.commands.executeCommand("showYourWork.copyPrompt");
  }
}
