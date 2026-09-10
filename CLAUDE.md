# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git workflow

This project is tracked in Git and pushed to GitHub (`christosmylonas82/Dodsboguiden`, public, remote `origin`, branch `master`). Use Git/GitHub as the standing version-control workflow for all work here — this is a hard requirement, not a suggestion:

- **Commit after every meaningful change, not just at the end of a session or task.** As soon as a change is in a working/reviewable state (types check, build passes), commit it — don't batch up multiple unrelated changes into one commit, and don't wait for the user to ask.
- **Push immediately after every commit.** A commit sitting only in the local working copy is not safe — GitHub is the durable copy. Never let commits accumulate locally; push right away, every time.
- **Write clean, descriptive commit messages that explain *why*, not just *what*.** A future reader (human or Claude, in a later session with no memory of this one) should understand the reasoning from the message alone.
- Treat "commit and push" as the automatic follow-up after every meaningful change, without needing to be asked each time — unless work is explicitly WIP/experimental and shouldn't be pushed yet.
- The point of this cadence is continuity: regular commits + pushes mean the current state of the project is never sitting only in an uncommitted working directory. If a session ends unexpectedly (crash, interruption, context loss), the worst-case loss is the small increment since the last commit and push — never the whole session's work, and never the ability to know what state the project is in.

### Repo layout used this project

Two local checkouts of the same repo are typically kept side by side:
- `C:\Dodsboguiden` — working branch (e.g. `design/notion-v2`), where day-to-day edits happen.
- `C:\Dodsboguiden-master` — a separate worktree on `master`, used only to fast-forward-merge the working branch in and push `master` (which Railway watches for server auto-deploys).

Standard sequence for a change: commit on the working branch → push the working branch → `git fetch` + `git merge --ff-only` the working branch into the `master` worktree → push `master`. If `master` has diverged (e.g. someone pushed directly to it), merge it back into the working branch too before continuing, so the two branches don't drift apart.

## 🏢 Dödsboguiden - Multi-Agent Team

You are the Project Manager coordinating 5 specialized agents.

### 👥 Your Team

- 🔒 **Security Chief** (/security-chief) - Cybersecurity & compliance
- 💻 **Dev Lead** (/dev-lead) - Architecture & backend
- 🎨 **UX Lead** (/ux-lead) - Design & user experience
- 🧪 **QA Engineer** (/qa-engineer) - Testing & quality
- 🚀 **DevOps** (/devops) - Infrastructure & deployment

### How to Use

/security-chief - Ask for security advice
/dev-lead - Ask for architecture advice
/ux-lead - Ask for design advice
/qa-engineer - Ask for testing advice
/devops - Ask for infrastructure advice

---

Start by asking: /dev-lead "Hello, are you ready?"
