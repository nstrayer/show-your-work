import * as vscode from "vscode";
import * as path from "path";
import type { GistData } from "../utils/gistFetcher";
import { generateWebviewContent } from "./webviewContent";
import { getStatusBarManager } from "../extension";

const VIEW_TYPE = "showYourWork.contextViewer";

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Create or reveal the webview panel showing gist content
 */
export function createOrShowPanel(
  context: vscode.ExtensionContext,
  gist: GistData
): vscode.WebviewPanel {
  const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One;

  // If we already have a panel, update its content
  if (currentPanel) {
    currentPanel.reveal(column);
    updatePanelContent(currentPanel, context, gist);
    return currentPanel;
  }

  // Create a new panel
  currentPanel = vscode.window.createWebviewPanel(
    VIEW_TYPE,
    `Show Your Work: ${gist.description || "PR Context"}`,
    column,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "media"),
      ],
      retainContextWhenHidden: true,
    }
  );

  updatePanelContent(currentPanel, context, gist);

  // Notify status bar manager
  getStatusBarManager()?.onWebviewOpened();

  // Handle messages from the webview
  currentPanel.webview.onDidReceiveMessage(
    async (message) => {
      if (message.type === "openFile") {
        await openFileReference(message.data);
      }
    },
    undefined,
    context.subscriptions
  );

  // Clean up when panel is closed
  currentPanel.onDidDispose(
    () => {
      currentPanel = undefined;
      getStatusBarManager()?.onWebviewClosed();
    },
    undefined,
    context.subscriptions
  );

  return currentPanel;
}

function updatePanelContent(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  gist: GistData
): void {
  const styleUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "styles", "webview.css")
  );

  panel.webview.html = generateWebviewContent(
    gist,
    panel.webview.cspSource,
    styleUri.toString()
  );

  panel.title = `Show Your Work: ${gist.description || "PR Context"}`;
}

async function openFileReference(data: {
  path: string;
  line?: number;
  column?: number;
}): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage(
      "No workspace folder open. Cannot navigate to file reference."
    );
    return;
  }

  // Try to find the file in any workspace folder
  for (const folder of workspaceFolders) {
    const fileUri = vscode.Uri.joinPath(folder.uri, data.path);
    try {
      await vscode.workspace.fs.stat(fileUri);

      // File exists, open it
      const document = await vscode.workspace.openTextDocument(fileUri);
      const editor = await vscode.window.showTextDocument(document, {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false,
      });

      // Navigate to line/column if specified
      if (data.line) {
        const line = Math.max(0, data.line - 1); // VS Code uses 0-based lines
        const column = Math.max(0, (data.column || 1) - 1);
        const position = new vscode.Position(line, column);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      }

      return;
    } catch {
      // File not found in this workspace folder, try next
      continue;
    }
  }

  // File not found in any workspace folder
  vscode.window.showWarningMessage(
    `File not found: ${data.path}. Make sure you have the relevant repository checked out.`
  );
}
