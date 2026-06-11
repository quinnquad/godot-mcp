# Branch Protection for `main`

**Repository:** `quinnquad/godot-mcp`  
**Protected branch:** `main`  
**Configuration:** Option A (recommended for a public project)

## Active Rules

- **Require a pull request before merging**: Yes
  - Required approvals: 0
  - Dismiss stale pull request approvals when new commits are pushed: Yes
  - Require conversation resolution before merging: Yes

- **Do not allow force pushes**: **Yes** (critical for history protection)

- **Do not allow deletions**: **Yes**

- **Include administrators**: Yes (rules apply to everyone, including repo owners)

## Why These Settings?

- Prevents accidental or malicious history rewrites (force pushes were a recent concern during public history cleanup).
- Moves the project toward a more sustainable contribution model now that it is public.
- 0 required approvals keeps iteration reasonably fast while still forcing changes through the PR process for visibility and review.
- Conversation resolution encourages cleaning up review threads.

## Recent Context

This protection was enabled after the major public generalization work (commit 8b68623 and follow-up hygiene commit 25e52d5) that removed Elderglow-specific references from user-facing files and docs while keeping the monorepo structure for development convenience.

## How to Change These Rules Later

1. Go to the repository → **Settings** → **Branches**
2. Find the rule for `main` and click **Edit**
3. Adjust as needed
4. Update this file with the new rationale and date.

Last updated: 2026-06-11