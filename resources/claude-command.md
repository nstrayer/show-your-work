# Show Your Work

Create a GitHub Gist containing planning context for this PR to help reviewers understand the reasoning behind your changes.

## Instructions

1. **Scan for planning documents** in these locations:
   - `thoughts/` - Planning notes and decision logs
   - `.pr-context/` - PR-specific context files
   - `docs/` - Relevant documentation
   - Any markdown files in the workspace root that look like planning docs

2. **Show the user what will be included:**
   - List all discovered files with brief summaries
   - Ask if they want to add, remove, or edit any files
   - Allow them to provide additional context or notes

3. **Create the gist:**
   - Use `gh gist create` with all selected files
   - Include a description summarizing the PR context
   - Make the gist public (or secret if user prefers)

4. **Output badge options for the PR:**

```markdown
[![Show Your Work](https://img.shields.io/badge/Show_Your_Work-View_Context-blue?logo=github)](https://gist.github.com/USERNAME/GIST_ID)
```

Replace `GIST_ID` and `USERNAME` with the actual values from the created gist.

## Example Workflow

```
Found planning documents:
- thoughts/auth-redesign.md (2.1KB) - Authentication flow redesign notes
- .pr-context/decisions.md (856B) - Key decisions made during implementation

Would you like to:
1. Include all files as-is
2. Add additional files
3. Remove some files
4. Edit file contents before creating gist

> 1

Creating gist...
Gist created: https://gist.github.com/nstrayer/abc123

Add this to your PR description:
[![Show Your Work](https://img.shields.io/badge/Show_Your_Work-View_Context-blue?logo=github)](https://gist.github.com/nstrayer/abc123)
```
