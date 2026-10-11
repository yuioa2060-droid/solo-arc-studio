# Fitness channel — Claude entry point

The working name is Rendo; the handle is unverified. Avatar layout 02 / DRY BRUSH is approved, with a small emerald V on black. Its regenerated close portrait remains for quality review. Banners must have a flat white or black background, no V, and a substantial integrated #0B8371 accent; scenic backgrounds and tiny green underlines were rejected. The owner liked composition 04 / portrait and ink, rejected its Jost Medium lettering, and asked to try white. Three replacement fonts on both backgrounds are in branding/README_RU.md; the final font and background are unselected. Banner font feedback does not change Jost in videos. SOLO ARC was rejected; solo-arc paths remain technical identifiers.

Before project work, read [START_CLAUDE_RU.md](START_CLAUDE_RU.md). It covers context intake, references, LFS downloads, dependencies, skills, API setup, production and the first prompt.

Read `AGENTS.md`, `context/START_HERE_RU.md`, `context/USER_FEEDBACK_RU.md`, `skills/solo-arc-motion/SKILL.md` and the complete `skills/solo-arc-motion/references/current-rules-ru.md`. Read mode-specific references as the task needs them.

Project skills are registered in `.claude/skills/`; their entry points route to the canonical files under `skills/`. Run helpers from those canonical folders. No global installation is required for this repository. If this client does not discover project skills, open their canonical SKILL.md directly.

The repository contains the current production kit and EP1 v11. The user's latest direction takes priority, then SOLO ARC current-rules, then specialized references and generic skills. Do not import historical builds or restore the excluded new episode draft.

Discussion is Russian; scripts and narration are English. Preserve the approved white-haired hero, #0B8371 shorts, meaningful whole PNGs, Jost, clean background, word-aligned motion and sparse quiet SFX. Jonathan: `oyxaSt75JW8l04MCJaSo`, `eleven_v3`, stability 0.5, native tempo. Use A6API for new images; show new key images as small tests first.

Keys come only from environment variables or encrypted GitHub Secrets. A clone does not receive secret values. Paid API helpers default to dry-run. Technical render/decode checks do not constitute full creative playback or listening.

For an existing-film runtime: pull `episodes/ep1-v11/film/public/**` via Git LFS, run `npm ci`, `npm run browser:ensure`, `npm run doctor`, then `npm run render:preview` or `npm run studio`. For a new independent copy, use `node skills/solo-arc-motion/scripts/new-episode.mjs --out episodes/new-video` after fetching the required media. Replace the script, voice/marks, timeline, assets, scenes and mix for a new topic.
