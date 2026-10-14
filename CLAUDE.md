# Rendo — Claude entry point

Read [START_CLAUDE_RU.md](START_CLAUDE_RU.md), [AGENTS.md](AGENTS.md), `context/USER_FEEDBACK_RU.md`, `skills/solo-arc-motion/SKILL.md`, and the complete `skills/solo-arc-motion/references/current-rules-ru.md` before project work. Project skill entry points are in `.claude/skills/`; implementations and resources are under `skills/`.

Two current films are included: EP1 v11 (fully editable Remotion) and EP2 **How I Lost Fat Without Starving Myself**, final 6:27.2. EP2 has separated audio, an editable ending, and a working final rebuild; its original main-scene layers/alignment/31 PNGs were not available in the supplied files. Read `context/SOURCE_SCOPE_RU.md`. Never present the earlier 4:15 local episode as this final's source. Use EP1 as the full editable scaffold for a new original episode.

Conversation: Russian. Video/public copy: English. Preserve our original white-haired manga character, emerald #0B8371 shorts, clean dark background, useful coherent illustrations and Jost in the film. All new image generation and edits use A6API only. Jonathan `oyxaSt75JW8l04MCJaSo`, eleven_v3, stability 0.5. For EP2: a little more energy, varied scenes, organic ambient with no beats/drums/bass line, smooth purposeful motion, sparse quiet SFX and clean layout. Do not copy the previous film's section timing or reintroduce DepthStack/dimAt.

EP2's owner-selected title is in `episodes/ep2-hunger/upload-metadata.json`. Its public description uses a short opening, actual chapter timestamps and relevant hashtags; **no Research mentioned block or research links**. Two latest title-matched thumbnail proposals and their A6API art/prompts/editable layouts are in `episodes/ep2-hunger/thumbnail/`; owner selection is pending. Banner work is stopped unless requested.

Keys exist only in runtime environment/ignored `.env` or encrypted GitHub Actions Secrets. `A6API_KEY` is the working key used for the latest thumbnails. A clone cannot read Secret values. Paid API helpers default to dry-run; ordinary installation, checks and publishing this repository do not authorize paid generations. New owner requests define production scope.

Pull the required Git LFS media before inspecting/rebuilding. Root scripts: `npm run doctor`, `npm run render:preview`, `npm run render:ep1`, `npm run check:ep2`, `npm run render:ep2-ending`, `npm run rebuild:ep2 -- --out outputs/ep2-rebuilt.mp4`. Technical tests are not creative acceptance or a full listening review. Prefer current files; exclude historical MP4 revisions, caches and private credentials.
