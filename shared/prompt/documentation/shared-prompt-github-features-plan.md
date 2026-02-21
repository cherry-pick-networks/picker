# GitHub features adoption plan (picker)

Planning document for adopting free or low-cost GitHub features in this
open-source project. Single source for CI/CD, automation, and community tooling
decisions.

**Project**: picker (Deno / Fresh 2, AGPL-3.0).\
**Scope doc**: [shared-prompt-boundary.md](shared-prompt-boundary.md) — update
infrastructure section when adding Pages, Packages, or deploy workflows.

---

## 1. Current state

| Area             | Status                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **CI**           | `.github/workflows/ci.yml` — on push/PR: test, scope-check, type-check-policy, deno audit; plus lint, format-check, cache (Phase 1). |
| **PR**           | `.github/PULL_REQUEST_TEMPLATE.md` in use.                                                                                           |
| **Contribution** | CONTRIBUTING.md points to Issues, Discussions, PRs.                                                                                  |
| **Other**        | CODE_OF_CONDUCT, SECURITY.md, LICENSE (AGPL-3.0).                                                                                    |

---

## 2. Features and phases

### 2.1 GitHub Actions (CI) — Phase 1 done

- **Lint**: `deno lint` in CI.
- **Format**: `deno fmt --check` in CI.
- **Cache**: Deno cache via `actions/cache` to speed up CI.
- **Future (optional)**: Preview deploy workflow; add to scope doc first.

### 2.2 Dependabot — Phase 1 done

- **Config**: `.github/dependabot.yml`.
- **Scope**: `deno` ecosystem (deno.json), weekly schedule.
- **Policy**: Prefer scope/version rules in CONTRIBUTING or this doc if needed.

### 2.3 GitHub Discussions — Phase 2

- **Goal**: Q&A and ideas separate from Issues.
- **Actions**: Enable in repo Settings → Features; define categories; optionally
  add short note in CONTRIBUTING (link already present).

**Runbook: enable Discussions and set categories**

1. **Enable Discussions**
   - In the repo: **Settings** → **General** → **Features** → check **Discussions**.
   - Or, where GitHub CLI is available: `gh repo edit --enable-discussions`.

2. **Create categories** (web only; no API for creating categories)
   - Open the repo **Discussions** tab → left sidebar, click the pencil next to
     **Categories** → **New category** for each below.
   - Recommended categories:

     | Emoji | Name       | Description (short)              | Format        |
     | ----- | ---------- | -------------------------------- | ------------- |
     | 💬    | General    | General discussion about the project | Open-ended   |
     | ❓    | Q&A        | Ask questions and get answers    | Q&A (optional) |
     | 💡    | Ideas      | Propose ideas and feature requests | Open-ended   |
     | 🎉    | Show and tell | Share what you built or learned | Open-ended   |

   - You can start with fewer (e.g. General + Q&A) and add more later.
   - Ref: [Managing categories for discussions](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions).

### 2.4 GitHub Pages — Phase 3 (optional)

- **Goal**: Static docs or project landing.
- **Options**: Export from Fresh build, or separate doc generator; publish to
  `gh-pages` or `docs/` via Actions.
- **Scope**: When adding, list in
  [shared-prompt-boundary.md](shared-prompt-boundary.md) under Infrastructure.

### 2.5 GitHub Packages — Low priority

- **Use when**: Publishing a public package (e.g. npm, container).
- **Scope**: Add to boundary doc when adopted.

### 2.6 GitHub Sponsors — Optional

- **Goal**: Funding path for maintainers.
- **Actions**: Enable Sponsors, add link/badge in README; no code changes.

### 2.7 Security and operations

- **SECURITY.md**: Exists; review periodically.
- **CODEOWNERS**: Optional `.github/CODEOWNERS` for auto-review assignment.
- **Issue templates**: Optional `.github/ISSUE_TEMPLATE/` for bug vs feature.

---

## 3. Roadmap summary

| Phase | Content                                          | Artifacts                          |
| ----- | ------------------------------------------------ | ---------------------------------- |
| **1** | Dependabot; CI with lint, format-check, cache    | `.github/dependabot.yml`, `ci.yml` |
| **2** | Discussions categories; CONTRIBUTING note        | Repo settings, CONTRIBUTING.md     |
| **3** | (Optional) GitHub Pages                          | Pages config, boundary update      |
| **4** | (Optional) Sponsors, CODEOWNERS, issue templates | README, `.github/`                 |

---

## 4. Doc and scope alignment

- **Scope** ([shared-prompt-boundary.md](shared-prompt-boundary.md)): CI =
  GitHub Actions. Add entries for Pages, Packages, or deploy when introduced.
- **Store** ([shared-prompt-store.md](../store/shared-prompt-store.md)): Keep
  “Frequently used commands” in sync (e.g. `gh run view`); add deploy-related
  commands if workflows are added.
- **Handoff** ([shared-prompt-handoff.md](shared-prompt-handoff.md)): Mention
  current CI/CD and GitHub feature set so sessions stay aligned with this plan.
