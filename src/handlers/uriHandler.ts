import * as vscode from "vscode";
import { parseGistId, fetchGist } from "../utils/gistFetcher";
import { createOrShowPanel } from "../viewer/webviewPanel";

/**
 * Handle vscode://nstrayer.show-your-work/open?gist=<id_or_url> URIs
 */
export class ShowYourWorkUriHandler implements vscode.UriHandler {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async handleUri(uri: vscode.Uri): Promise<void> {
    // Expected format: vscode://nstrayer.show-your-work/open?gist=<id_or_url>
    if (uri.path !== "/open") {
      vscode.window.showErrorMessage(
        `Unknown Show Your Work URI path: ${uri.path}`
      );
      return;
    }

    const params = new URLSearchParams(uri.query);
    const gistParam = params.get("gist");

    if (!gistParam) {
      vscode.window.showErrorMessage(
        "Missing gist parameter in Show Your Work URI"
      );
      return;
    }

    const gistId = parseGistId(gistParam);

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Loading PR context...",
        cancellable: false,
      },
      async () => {
        try {
          const gist = await fetchGist(gistId);
          createOrShowPanel(this.context, gist);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          vscode.window.showErrorMessage(
            `Failed to load gist: ${message}. Make sure you have the gh CLI installed and authenticated, or that the gist is public.`
          );
        }
      }
    );
  }
}
