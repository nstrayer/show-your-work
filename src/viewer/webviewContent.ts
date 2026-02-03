import { marked } from "marked";
import type { GistData } from "../utils/gistFetcher";
import { makeFileReferencesClickable } from "../utils/fileReferenceParser";

/**
 * Generate the HTML content for the webview panel
 */
export function generateWebviewContent(
  gist: GistData,
  webviewCspSource: string,
  styleUri: string
): string {
  const filesHtml = gist.files
    .map((file) => {
      const isMarkdown =
        file.filename.endsWith(".md") || file.filename.endsWith(".markdown");

      let contentHtml: string;
      if (isMarkdown) {
        // Render markdown and make file references clickable
        const rendered = marked.parse(file.content) as string;
        contentHtml = makeFileReferencesClickable(rendered);
      } else {
        // Show as preformatted text with file references clickable
        const escaped = escapeHtml(file.content);
        const withLinks = makeFileReferencesClickable(escaped);
        contentHtml = `<pre><code>${withLinks}</code></pre>`;
      }

      return `
        <section class="gist-file">
          <header class="file-header">
            <span class="file-icon">📄</span>
            <span class="file-name">${escapeHtml(file.filename)}</span>
          </header>
          <div class="file-content">
            ${contentHtml}
          </div>
        </section>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewCspSource} 'unsafe-inline'; script-src ${webviewCspSource};">
  <link href="${styleUri}" rel="stylesheet">
  <title>Show Your Work - ${escapeHtml(gist.description || "PR Context")}</title>
</head>
<body>
  <div class="container">
    <header class="gist-header">
      <h1>${escapeHtml(gist.description || "PR Planning Context")}</h1>
      <div class="gist-meta">
        <span class="owner">By ${escapeHtml(gist.owner)}</span>
        <a href="${gist.url}" class="gist-link" title="View on GitHub">View on GitHub</a>
      </div>
    </header>

    <main class="gist-content">
      ${filesHtml}
    </main>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Handle clicks on file reference links
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList && target.classList.contains('file-reference')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href && href.startsWith('command:showYourWork.openFile?')) {
          const params = decodeURIComponent(href.split('?')[1]);
          vscode.postMessage({
            type: 'openFile',
            data: JSON.parse(params)
          });
        }
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
