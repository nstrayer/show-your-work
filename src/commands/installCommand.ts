import * as vscode from "vscode";
import * as path from "path";

/**
 * Install the Claude Code command file to the workspace
 */
export async function installClaudeCommand(
  context: vscode.ExtensionContext
): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "No workspace folder open. Please open a folder first."
    );
    return;
  }

  // Use the first workspace folder
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const claudeCommandsDir = path.join(workspaceRoot, ".claude", "commands");
  const targetPath = path.join(claudeCommandsDir, "show-your-work.md");

  // Read the template from the extension resources
  const templateUri = vscode.Uri.joinPath(
    context.extensionUri,
    "resources",
    "claude-command.md"
  );

  try {
    const templateContent = await vscode.workspace.fs.readFile(templateUri);
    const content = Buffer.from(templateContent).toString("utf-8");

    // Create the .claude/commands directory if it doesn't exist
    await vscode.workspace.fs.createDirectory(
      vscode.Uri.file(claudeCommandsDir)
    );

    // Check if file already exists
    const targetUri = vscode.Uri.file(targetPath);
    let shouldWrite = true;

    try {
      await vscode.workspace.fs.stat(targetUri);
      // File exists, ask user
      const answer = await vscode.window.showWarningMessage(
        "The file .claude/commands/show-your-work.md already exists. Overwrite?",
        "Yes",
        "No"
      );
      shouldWrite = answer === "Yes";
    } catch {
      // File doesn't exist, proceed with write
    }

    if (shouldWrite) {
      await vscode.workspace.fs.writeFile(
        targetUri,
        Buffer.from(content, "utf-8")
      );

      const openFile = await vscode.window.showInformationMessage(
        "Claude command installed at .claude/commands/show-your-work.md",
        "Open File"
      );

      if (openFile === "Open File") {
        const doc = await vscode.workspace.openTextDocument(targetUri);
        await vscode.window.showTextDocument(doc);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(
      `Failed to install Claude command: ${message}`
    );
  }
}
