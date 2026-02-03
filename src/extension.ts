import * as vscode from "vscode";
import { ShowYourWorkUriHandler } from "./handlers/uriHandler";
import { installClaudeCommand } from "./commands/installCommand";
import { copyPromptToClipboard } from "./commands/copyPrompt";

export function activate(context: vscode.ExtensionContext): void {
  // Register URI handler for vscode://nstrayer.show-your-work/...
  const uriHandler = new ShowYourWorkUriHandler(context);
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "showYourWork.installClaudeCommand",
      () => installClaudeCommand(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "showYourWork.copyPrompt",
      () => copyPromptToClipboard(context)
    )
  );
}

export function deactivate(): void {
  // Cleanup if needed
}
