import * as vscode from "vscode";

/**
 * Copy the Show Your Work prompt to clipboard
 */
export async function copyPromptToClipboard(
  context: vscode.ExtensionContext
): Promise<void> {
  // Read the template from the extension resources
  const templateUri = vscode.Uri.joinPath(
    context.extensionUri,
    "resources",
    "claude-command.md"
  );

  try {
    const templateContent = await vscode.workspace.fs.readFile(templateUri);
    const content = Buffer.from(templateContent).toString("utf-8");

    await vscode.env.clipboard.writeText(content);

    vscode.window.showInformationMessage(
      "Show Your Work prompt copied to clipboard!"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(`Failed to copy prompt: ${message}`);
  }
}
