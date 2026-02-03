import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SHOW_YOUR_WORK_URI_PATTERN =
  /vscode:\/\/nstrayer\.show-your-work\/open\?gist=[a-f0-9]+/gi;

interface DetectedPr {
  number: number;
  title: string;
}

interface ParsedPrInput {
  type: "number" | "url";
  number: string;
  owner?: string;
  repo?: string;
}

/**
 * Parse user input to determine if it's a PR number or full URL
 */
function parsePrInput(input: string): ParsedPrInput | null {
  const trimmed = input.trim();

  // Check if it's just a number
  if (/^\d+$/.test(trimmed)) {
    return { type: "number", number: trimmed };
  }

  // Check if it's a GitHub PR URL
  const urlMatch = trimmed.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i
  );
  if (urlMatch) {
    return {
      type: "url",
      owner: urlMatch[1],
      repo: urlMatch[2],
      number: urlMatch[3],
    };
  }

  return null;
}

/**
 * Try to detect a PR associated with the current branch
 */
async function detectCurrentBranchPr(): Promise<DetectedPr | null> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      return null;
    }

    const { stdout } = await execAsync(
      'gh pr view --json number,title --jq "{ number: .number, title: .title }"',
      { cwd: workspaceFolder }
    );

    const parsed = JSON.parse(stdout.trim());
    if (parsed.number && parsed.title) {
      return { number: parsed.number, title: parsed.title };
    }
    return null;
  } catch {
    // No PR found for current branch, or gh CLI error
    return null;
  }
}

/**
 * Fetch PR body using gh CLI
 */
async function fetchPrBody(parsed: ParsedPrInput): Promise<string> {
  let command: string;

  if (parsed.type === "url" && parsed.owner && parsed.repo) {
    command = `gh pr view ${parsed.number} --repo ${parsed.owner}/${parsed.repo} --json body --jq .body`;
  } else {
    // Let gh auto-detect repo from current directory
    command = `gh pr view ${parsed.number} --json body --jq .body`;
  }

  // Use workspace folder as cwd so gh can detect the repo
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const { stdout } = await execAsync(command, { cwd: workspaceFolder });
  return stdout;
}

/**
 * Extract all Show Your Work URIs from text
 */
function extractShowYourWorkUris(text: string): string[] {
  const matches = text.match(SHOW_YOUR_WORK_URI_PATTERN);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Prompt user to enter a PR number or URL manually
 */
async function promptForPrInput(): Promise<ParsedPrInput | null> {
  const input = await vscode.window.showInputBox({
    prompt: "Enter a PR number or GitHub PR URL",
    placeHolder:
      "PR number or URL (e.g., 123 or https://github.com/owner/repo/pull/123)",
    validateInput: (value) => {
      if (!value.trim()) {
        return "Please enter a PR number or URL";
      }
      const parsed = parsePrInput(value);
      if (!parsed) {
        return "Invalid input. Enter a PR number or a GitHub PR URL";
      }
      return null;
    },
  });

  if (!input) {
    return null; // User cancelled
  }

  return parsePrInput(input);
}

/**
 * Command to open Show Your Work context from a GitHub PR
 */
export async function openFromPr(): Promise<void> {
  // Try to detect PR for current branch
  const detectedPr = await detectCurrentBranchPr();

  let parsed: ParsedPrInput | null = null;

  if (detectedPr) {
    // Show quick pick with detected PR and option to enter different one
    const items: vscode.QuickPickItem[] = [
      {
        label: `PR #${detectedPr.number}`,
        description: detectedPr.title,
        detail: "Current branch",
      },
      {
        label: "Enter different PR...",
        description: "Specify a PR number or URL",
      },
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a PR to check for Show Your Work context",
    });

    if (!selected) {
      return; // User cancelled
    }

    if (selected.label.startsWith("PR #")) {
      parsed = { type: "number", number: String(detectedPr.number) };
    } else {
      parsed = await promptForPrInput();
    }
  } else {
    // No PR detected, go straight to manual input
    parsed = await promptForPrInput();
  }

  if (!parsed) {
    return; // User cancelled or invalid input
  }

  // Fetch PR body with progress
  let prBody: string;
  try {
    prBody = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Fetching PR details...",
        cancellable: false,
      },
      async () => fetchPrBody(parsed)
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (message.includes("gh: command not found")) {
      vscode.window.showErrorMessage(
        "GitHub CLI (gh) not found. Please install it: https://cli.github.com"
      );
    } else if (message.includes("not logged in")) {
      vscode.window.showErrorMessage(
        "Not authenticated with GitHub CLI. Run 'gh auth login' in your terminal."
      );
    } else if (message.includes("Could not resolve")) {
      vscode.window.showErrorMessage(
        "Could not determine repository. Please provide a full PR URL or run from within a git repository."
      );
    } else {
      vscode.window.showErrorMessage(`Failed to fetch PR: ${message}`);
    }
    return;
  }

  // Extract Show Your Work URIs
  const uris = extractShowYourWorkUris(prBody);

  if (uris.length === 0) {
    vscode.window.showInformationMessage(
      "No Show Your Work links found in this PR description."
    );
    return;
  }

  // Select URI (or pick if multiple)
  let selectedUri: string;

  if (uris.length === 1) {
    selectedUri = uris[0];
  } else {
    // Show quick pick for multiple URIs
    const items = uris.map((uri) => {
      const gistMatch = uri.match(/gist=([a-f0-9]+)/i);
      const gistId = gistMatch ? gistMatch[1] : "unknown";
      return {
        label: `Gist: ${gistId}`,
        description: uri,
        uri,
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Multiple Show Your Work links found. Select one to open.",
    });

    if (!selected) {
      return; // User cancelled
    }

    selectedUri = selected.uri;
  }

  // Open the URI using VS Code's URI handler
  const uri = vscode.Uri.parse(selectedUri);
  await vscode.env.openExternal(uri);
}
