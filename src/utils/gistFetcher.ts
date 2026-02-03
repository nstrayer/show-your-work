import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface GistFile {
  filename: string;
  content: string;
  language?: string;
}

export interface GistData {
  id: string;
  description: string;
  files: GistFile[];
  owner: string;
  url: string;
}

/**
 * Extract gist ID from various input formats:
 * - Raw ID: "abc123def456"
 * - Full URL: "https://gist.github.com/user/abc123def456"
 * - URL with file: "https://gist.github.com/user/abc123def456#file-readme-md"
 */
export function parseGistId(input: string): string {
  // Remove any URL encoding
  const decoded = decodeURIComponent(input);

  // If it looks like a URL, extract the ID
  if (decoded.includes("gist.github.com")) {
    const match = decoded.match(/gist\.github\.com\/[^/]+\/([a-f0-9]+)/i);
    if (match) {
      return match[1];
    }
  }

  // Otherwise assume it's a raw ID - strip any hash fragments
  return decoded.split("#")[0].trim();
}

/**
 * Fetch gist data using gh CLI (preferred) or GitHub API fallback
 */
export async function fetchGist(gistId: string): Promise<GistData> {
  // Try gh CLI first
  try {
    return await fetchGistViaCli(gistId);
  } catch {
    // Fallback to GitHub API for public gists
    return await fetchGistViaApi(gistId);
  }
}

async function fetchGistViaCli(gistId: string): Promise<GistData> {
  const { stdout } = await execAsync(
    `gh gist view ${gistId} --json description,files,owner,url`
  );

  const data = JSON.parse(stdout);

  const files: GistFile[] = Object.entries(data.files).map(
    ([filename, fileData]: [string, unknown]) => {
      const file = fileData as { content: string; language?: string };
      return {
        filename,
        content: file.content,
        language: file.language,
      };
    }
  );

  return {
    id: gistId,
    description: data.description || "",
    files,
    owner: data.owner?.login || "unknown",
    url: data.url,
  };
}

interface GitHubGistResponse {
  description: string | null;
  files: Record<string, { content: string; language?: string }>;
  owner: { login: string } | null;
  html_url: string;
}

async function fetchGistViaApi(gistId: string): Promise<GistData> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch gist: ${response.statusText}`);
  }

  const data = (await response.json()) as GitHubGistResponse;

  const files: GistFile[] = Object.entries(data.files).map(
    ([filename, fileData]) => ({
      filename,
      content: fileData.content,
      language: fileData.language,
    })
  );

  return {
    id: gistId,
    description: data.description || "",
    files,
    owner: data.owner?.login || "unknown",
    url: data.html_url,
  };
}
