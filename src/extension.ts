import * as vscode from "vscode";
import { ShowYourWorkUriHandler } from "./handlers/uriHandler";
import { installClaudeCommand } from "./commands/installCommand";
import { copyPromptToClipboard } from "./commands/copyPrompt";
import { openFromPr } from "./commands/openFromPr";
import {
  createStatusBarManager,
  showStatusBarMenu,
  StatusBarManager,
} from "./statusBar/statusBarManager";

let statusBarManager: StatusBarManager | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // Create status bar manager
  statusBarManager = createStatusBarManager(context);

  // Register URI handler for vscode://nstrayer.show-your-work/...
  const uriHandler = new ShowYourWorkUriHandler(context);
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "showYourWork.installClaudeCommand",
      async () => {
        await installClaudeCommand(context);
        statusBarManager?.updateVisibility();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "showYourWork.copyPrompt",
      () => copyPromptToClipboard(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("showYourWork.openFromPr", () =>
      openFromPr()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("showYourWork.statusBarClicked", () =>
      showStatusBarMenu()
    )
  );
}

export function getStatusBarManager(): StatusBarManager | undefined {
  return statusBarManager;
}

export function deactivate(): void {
  statusBarManager?.dispose();
  statusBarManager = undefined;
}
