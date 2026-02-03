import * as assert from "assert";
import {
  parseFileReferences,
  makeFileReferencesClickable,
} from "../../utils/fileReferenceParser";

suite("parseFileReferences", () => {
  test("colon notation with line only", () => {
    const content = "See src/file.ts:45 for details";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/file.ts");
    assert.strictEqual(refs[0].line, 45);
    assert.strictEqual(refs[0].column, undefined);
    assert.strictEqual(refs[0].original, "src/file.ts:45");
  });

  test("colon notation with line and column", () => {
    const content = "Error at src/file.ts:45:10";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/file.ts");
    assert.strictEqual(refs[0].line, 45);
    assert.strictEqual(refs[0].column, 10);
    assert.strictEqual(refs[0].original, "src/file.ts:45:10");
  });

  test("leading ./ prefix is stripped from path", () => {
    const content = "See ./src/file.ts:45 for details";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/file.ts");
  });

  test("markdown links with line", () => {
    const content = "Check [the function](src/auth/login.ts#L45)";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/auth/login.ts");
    assert.strictEqual(refs[0].line, 45);
    assert.strictEqual(
      refs[0].original,
      "[the function](src/auth/login.ts#L45)"
    );
  });

  test("markdown links with line range", () => {
    const content = "See [code](src/utils.ts#L10-L20)";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/utils.ts");
    assert.strictEqual(refs[0].line, 10);
  });

  test("deduplicates identical references", () => {
    const content = "See src/file.ts:45 and src/file.ts:45 again";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
  });

  test("returns empty array when no matches", () => {
    const content = "No file references here";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 0);
  });

  test("ignores references inside backticks", () => {
    const content = "Use `src/file.ts:45` in your code";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 0);
  });

  test("multiple different references parsed", () => {
    const content = "See src/a.ts:10 and src/b.ts:20";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 2);
    assert.strictEqual(refs[0].path, "src/a.ts");
    assert.strictEqual(refs[1].path, "src/b.ts");
  });

  test("deep nested paths work", () => {
    const content = "Error in src/components/auth/forms/LoginForm.tsx:123";
    const refs = parseFileReferences(content);
    assert.strictEqual(refs.length, 1);
    assert.strictEqual(refs[0].path, "src/components/auth/forms/LoginForm.tsx");
    assert.strictEqual(refs[0].line, 123);
  });
});

suite("makeFileReferencesClickable", () => {
  test("converts to anchor with command URI", () => {
    const content = "See src/file.ts:45 for details";
    const result = makeFileReferencesClickable(content);
    assert.ok(result.includes("<a href="));
    assert.ok(result.includes("command:showYourWork.openFile"));
    assert.ok(result.includes("src/file.ts:45"));
  });

  test("includes line and column in JSON payload", () => {
    const content = "Error at src/file.ts:45:10";
    const result = makeFileReferencesClickable(content);
    // Decode the URI component to check the JSON
    const match = result.match(/command:showYourWork\.openFile\?([^"]+)/);
    assert.ok(match, "Should contain command URI");
    const payload = JSON.parse(decodeURIComponent(match![1]));
    assert.strictEqual(payload.path, "src/file.ts");
    assert.strictEqual(payload.line, 45);
    assert.strictEqual(payload.column, 10);
  });

  test("column defaults to 1 when not specified", () => {
    const content = "See src/file.ts:45";
    const result = makeFileReferencesClickable(content);
    const match = result.match(/command:showYourWork\.openFile\?([^"]+)/);
    assert.ok(match, "Should contain command URI");
    const payload = JSON.parse(decodeURIComponent(match![1]));
    assert.strictEqual(payload.column, 1);
  });

  test("multiple references become multiple anchors", () => {
    const content = "See src/a.ts:10 and src/b.ts:20";
    const result = makeFileReferencesClickable(content);
    const anchorCount = (result.match(/<a href=/g) || []).length;
    assert.strictEqual(anchorCount, 2);
  });

  test("preserves surrounding content", () => {
    const content = "Before src/file.ts:45 after";
    const result = makeFileReferencesClickable(content);
    assert.ok(result.startsWith("Before "));
    assert.ok(result.endsWith(" after"));
  });

  test("does not modify references in backticks", () => {
    const content = "Use `src/file.ts:45` in your code";
    const result = makeFileReferencesClickable(content);
    assert.strictEqual(result, content);
  });

  test("returns input unchanged when no matches", () => {
    const content = "No file references here";
    const result = makeFileReferencesClickable(content);
    assert.strictEqual(result, content);
  });
});
