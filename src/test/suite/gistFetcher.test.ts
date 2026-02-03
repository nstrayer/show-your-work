import * as assert from "assert";
import { parseGistId } from "../../utils/gistFetcher";

suite("parseGistId", () => {
  test("raw gist ID returns unchanged", () => {
    const id = "abc123def456789";
    assert.strictEqual(parseGistId(id), id);
  });

  test("full gist URL extracts ID", () => {
    const url = "https://gist.github.com/username/abc123def456";
    assert.strictEqual(parseGistId(url), "abc123def456");
  });

  test("URL with file fragment extracts ID", () => {
    const url =
      "https://gist.github.com/username/abc123def456#file-readme-md";
    assert.strictEqual(parseGistId(url), "abc123def456");
  });

  test("URL-encoded input decodes and extracts ID", () => {
    const encoded =
      "https%3A%2F%2Fgist.github.com%2Fuser%2Fabc123def456";
    assert.strictEqual(parseGistId(encoded), "abc123def456");
  });

  test("raw ID with hash fragment strips fragment", () => {
    const input = "abc123def456#file-test-md";
    assert.strictEqual(parseGistId(input), "abc123def456");
  });

  test("whitespace is trimmed", () => {
    const input = "  abc123def456  ";
    assert.strictEqual(parseGistId(input), "abc123def456");
  });

  test("case-insensitive regex extracts ID from mixed-case path", () => {
    // The initial check uses .includes() which is case-sensitive for the domain,
    // but the regex itself is case-insensitive for the path portion
    const url = "https://gist.github.com/User/ABC123DEF456";
    assert.strictEqual(parseGistId(url), "ABC123DEF456");
  });

  test("empty string returns empty", () => {
    assert.strictEqual(parseGistId(""), "");
  });
});
