# Optional tips (reference only)

These [claude-code-tips](https://github.com/ykdojo/claude-code-tips) are **not**
adopted as project practice. They are listed here for optional reference. When
the team agrees to adopt one, add it to [usage.md](usage.md) or to
[store.md](../store.md) as appropriate.

---

## Tip 2: Talk to Claude Code with your voice

Use a local voice transcription system (e.g. superwhisper, MacWhisper, or
open-source alternatives) to speak instead of typing. Claude can interpret minor
transcription errors. Whispering with earphones works in shared spaces and even
on a plane. Faster input for many users.

---

## Tip 12: Invest in your own workflow

Spend some time on the tools you use: keep CLAUDE.md (or project context)
concise and goal-oriented, learn a few key tips and features, and tune your
environment. You don’t need to build everything from scratch—small investments
(aliases, one or two scripts) pay off.

---

## Tip 13: Search through your conversation history

Conversations are stored under `~/.claude/projects/` (folder names derived from
project path). You can search with `grep`/`find`/`jq` on the `.jsonl` files, or
ask Claude to search for you (e.g. “What did we discuss about X?”). Useful for
recalling past decisions or context.

---

## Tip 14: Multitasking with terminal tabs

When running multiple sessions, stay organized: e.g. at most three or four
tasks, open new tabs on the right, and sweep left-to-right from oldest to
newest. A simple “cascade” helps more than any specific technical setup.

---

## Tip 18: Claude Code as a writing assistant

Use it for drafts: give context and instructions (voice works well), get a first
draft, then revise line-by-line with the agent. Terminal on one side and editor
on the other works well for this back-and-forth.

---

## Tip 22: The best way to get better is by using it

Like “get better at rock climbing by rock climbing.” Use the tool regularly;
tips and docs help, but practice builds intuition. Think of it as a “billion
token rule”: more usage (within your budget) improves feel for how the system
behaves.

---

## Tip 25: CLAUDE.md vs Skills vs Slash Commands vs Plugins

- **CLAUDE.md**: Loaded at the start of every conversation; simple, always
  present.
- **Skills**: Structured instructions loaded when relevant or when invoked (e.g.
  `/my-skill`); more token-efficient than putting everything in CLAUDE.md.
- **Slash commands**: User- or agent-invoked; good for precise, on-demand
  actions. (Skills and slash commands have merged in recent Claude Code.)
- **Plugins**: Bundle skills, commands, agents, hooks, MCP servers; easier to
  install and share (e.g. dx plugin).

---

## Tip 27: Claude Code as a research tool

Use it for deep research: CI failures (e.g. via `gh`), Reddit/sentiment analysis
(e.g. Gemini CLI fallback), codebase exploration, or public info. Give it the
right access (gh, MCP, Cmd+A paste, Playwright, etc.) and clear instructions on
how to get the data.

---

## Tip 31: Claude Code as the universal interface

Treat the CLI as the first place for many digital tasks: quick edits,
video/audio (e.g. ffmpeg, Whisper), CSV analysis, storage cleanup, Docker/cache
pruning. It can suggest and run the right commands; you stay in one
conversational interface.

---

## Tip 35: Be braver in the unknown; iterative problem solving

You can tackle domains you don’t know well by iterating with the agent: ask
questions, try suggested solutions, hit dead ends and pivot, and control pace
and abstraction (sometimes “what does this line do?” sometimes “explore the
codebase”). Slowing down when the first answer isn’t good often leads to better
solutions.

---

## Tip 37: The era of personalized software is here

Build small tools for yourself or small projects: custom transcription, status
lines, one-off CLIs (e.g. Slack SDK instead of fighting Docker MCP), slide
decks, data viz. If it’s small, you can often build it in an hour or two with
the agent.

---

## Tip 38: Navigating and editing your input box

The input box supports readline-style shortcuts: `Ctrl+A`/`Ctrl+E` (line
start/end), `Option+Left/Right` (by word), `Ctrl+W`/`Ctrl+U`/`Ctrl+K` (delete
word/to start/to end), `Ctrl+G` (open in `$EDITOR` for long text). Type `\` then
Enter for a newline. `Ctrl+V` (Mac/Linux) pastes images. Familiar if you use
bash/zsh.

---

## Tip 41: Automation of automation

When you repeat the same task or command often, automate it: put repeated
instructions in CLAUDE.md (or context), use skills or slash commands, or have
the agent write a script. The goal is to reduce repetition and make the process
more sustainable and fun.

---

## Tip 42: Share your knowledge and contribute where you can

Share what you learn (posts, internal sessions, docs); you often get useful
feedback and new ideas in return. Contributing (e.g. issues or feedback to the
tool’s repo) can lead to real improvements and reinforces your own
understanding.

---

## Tip 43: Keep learning

Ask the tool itself about its features; use `/release-notes` (or equivalent) for
what’s new; follow community (e.g. r/ClaudeAI) and maintainers (e.g. Ado’s tips)
for workflows and updates.

---

When the team decides to adopt any of these, add the chosen practice to
[usage.md](usage.md) or [store.md](../store.md) and, if needed, remove or
shorten the entry here.
