/**
 * Represents a parsed file reference
 */
export interface FileReference {
  path: string;
  line?: number;
  column?: number;
  original: string;
}

/**
 * Parse file references from content
 *
 * Supported formats:
 * - Colon notation: `src/auth/login.ts:45` or `src/auth/login.ts:45:10`
 * - Markdown links: `[text](src/auth/login.ts#L45)`
 */
export function parseFileReferences(content: string): FileReference[] {
  const references: FileReference[] = [];
  const seen = new Set<string>();

  // Pattern for colon notation: path/file.ext:line or path/file.ext:line:column
  // Must start with word char or ./ and have a file extension
  const colonPattern =
    /(?<![`\](\w])(?:\.\/)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?(?![`\w])/g;

  let match;
  while ((match = colonPattern.exec(content)) !== null) {
    const original = match[0];
    if (seen.has(original)) {
      continue;
    }
    seen.add(original);

    references.push({
      path: match[1],
      line: parseInt(match[2], 10),
      column: match[3] ? parseInt(match[3], 10) : undefined,
      original,
    });
  }

  // Pattern for markdown links with line numbers: [text](path#L45) or [text](path#L45-L50)
  const markdownPattern =
    /\[([^\]]+)\]\(([^)#]+)#L(\d+)(?:-L\d+)?\)/g;

  while ((match = markdownPattern.exec(content)) !== null) {
    const original = match[0];
    if (seen.has(original)) {
      continue;
    }
    seen.add(original);

    references.push({
      path: match[2],
      line: parseInt(match[3], 10),
      original,
    });
  }

  return references;
}

/**
 * Convert file references in content to clickable links for webview
 */
export function makeFileReferencesClickable(content: string): string {
  let result = content;

  // Replace colon notation references
  const colonPattern =
    /(?<![`\](\w])(?:\.\/)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?(?![`\w])/g;

  result = result.replace(colonPattern, (match, path, line, column) => {
    const lineNum = parseInt(line, 10);
    const colNum = column ? parseInt(column, 10) : 1;
    const uri = `command:showYourWork.openFile?${encodeURIComponent(
      JSON.stringify({ path, line: lineNum, column: colNum })
    )}`;
    return `<a href="${uri}" class="file-reference" title="Open ${path} at line ${lineNum}">${match}</a>`;
  });

  return result;
}
