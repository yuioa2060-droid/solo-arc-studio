> ARCHIVE / HISTORICAL REFERENCE. Действующие правила после v10 находятся в [current-rules-ru.md](current-rules-ru.md). Старые красные/оливковые шорты, винтажные обёртки, обязательная музыка и жёсткие promo defaults отменены. Примеры алгоритмов использовать только после сверки текущего смысла/ассета.

# Six focus variants — separate executable components

Use these when the original narration needs a change of attention. Research and exact demonstration limits are in [ryoga-focus-variants.md](ryoga-focus-variants.md). This extends the vocabulary; it does not replace the 17 prior production patterns.

## Reproduce the study

```powershell
node C:/Users/Кирилл/.codex/skills/solo-arc-motion/scripts/scaffold.mjs --out D:/AI/Automated-Video-Generator/workspace/production/my-focus-study --elements
node D:/AI/Automated-Video-Generator/workspace/production/my-focus-study/render-elements.mjs --stills
node D:/AI/Automated-Video-Generator/workspace/production/my-focus-study/render-elements.mjs
```

The existing repo needs React, Remotion and sharp. No dependency installation, art generation or paid request is performed. `--elements` is separate from `--demo`; output folder must be new. Entry: `ElementsFilm.tsx`; data: `element-plan.json`; six individually rendered MP4s: `clips/`. Composition IDs: `focus-lift`, `depth-stack`, `pulse-region`, `anatomy-focus`, `chapter-map`, `chapter-reset`.

## Shared units

All time is seconds. Remotion passes `t = frame / fps` in the chosen scene's local clock. Layout is authored for 1920×1080; uniformly scale the entire canvas for other resolutions. Paths/anchors inside AnatomyFocus are **source PNG pixels**, not output pixels. Every component accepts changing time explicitly: no CSS transitions, timers or random state. The small arrival curve peaks about 1.5% above its settled progress then reaches exactly one with zero velocity. Color/blur/opacity use monotonic smoothstep; only arrival uses overshoot. Keep settled holds.

PNG paths are relative to Remotion's `public/` and resolved by `staticFile`. Fonts are loaded with `delayRender` in the demonstration entry; load these fonts or your own before rendering text. Do not import `ElementsFilm.tsx` into another registered root: import the individual component files instead.

| File / export | Meaningful inputs | Use / vary |
|---|---|---|
| `FocusLift.tsx` / `FocusLift` | `t`, background React node, `items:[{id,src,at,x,y,size,pixelated}]`, `dimAt`, `dimDuration`, `darkness`, `releaseAt`, `end`, `rise`, `entry` | Background → separate black layer → bright foreground. One object or staggered row; hidden teaser or open illustration. Default entry .62s, dim .5s, darkness .72. Transparent image padding is necessary for the purple circle to remain round. |
| `DepthStack.tsx` / `DepthStack` | `items:[{id,src,at,x,y,w,width,height}]`, `blur`, `oldOpacity`, `recedeScale`, `focusDuration`, `entry`, `end` | Latest picture gets focus. Each new authored width should increase when illustrating increasing importance. Default blur12px, prior opacity .43, recede .94, refocus .48s. Earlier layers remain legible enough for context. Clear the stack on a new thought. |
| `PulseRegion.tsx` / `PulseRegion` | `t`, `path`, `at`, `period`, `min`, `max`, `color`, optional `glow` | Render INSIDE the same SVG wrapper as base PNG. Default period1.25s, .03–.56 opacity. Fixed path, smooth intensity; no hard blink or expanding anatomy. Glow default0; no bloom needed for the demonstrated version. |
| `AnatomyFocus.tsx` / `AnatomyFocus` | `src`, original `width,height`, uniform rendered `w`, `x,y`, `regions:[{id,label,color,path,anchor,labelPoint,at}]`, `selectAt`, `selected`, `end` | Exactly one PNG, editable masks/leader/text per region. Each line progressively grows, then text appears. Non-selected groups fade together over .55s. Initial all-parts explanation → selected-part focus. Change `selected` to any region id; verify its boundaries on the actual illustration. |
| `ChapterPassage.tsx` / `ChapterPassage` | `src`, `title`, `nodes:[{n,at,x,y,points}]`, `end` | Figure returns, past chapter nodes survive, new node settles then its curved dashed path grows. `points` is 2 linear or 3 quadratic control points. For an existing node use a negative `at`; for the new node use e.g. .8. Reuse the SAME coordinates across entrances of one episode. |
| `ChapterPassage.tsx` / `ChapterReset` | `src`, `thought`, `end` | Short central thought on black → brief breathing gap → return of presenter. Useful when the explanation turns into effort/consequence; not a numbered map every time. |

The chapter demonstration uses the study's back cutout geometry. To change character/pose, adapt its whole-image placement and all leader endpoints; its fixed reference layout is not a universal body coordinate system. AnatomyFocus exposes geometry directly and is the preferable local anatomy mechanism.

## Alignment and boundaries

For a narrated episode, use your own alignment to set `at`, selection and exits. The rounded auto-transcript research timestamps only explain why a visual happens; they cannot time your new voice. Numbers, labels and emphasis must express the same thought as the narration. Do not bake extra narration into the images or silently change words to fit a template.

The v2 map was rejected for arbitrary muscle boundaries. Use the revised anatomy map and read [anatomy-and-instruction.md](anatomy-and-instruction.md) before adapting it. `anatomy-check.mjs` verifies source identity, named included/excluded landmarks and leader endpoints. Full-opacity source-based visual contour review remains required; tests of points and body alpha cannot establish anatomical correctness. These are surface projections on specific stylized images, not an automatic segmentation model. No X/Y stretching and no extrapolating a mask to another pose.

## Demonstration timeline

Updated combined reel preserves the earlier 0–32s study. New variants:

- 32–39s: focus lift and background dim.
- 39–47s: depth stack and refocus.
- 47–54s: fixed muscle pulse.
- 54–64s: three anatomy masks → one selected.
- 64–76s: accumulating chapter map.
- 76–82s: thought pause and presenter reset.

These demos are silent. They demonstrate visual speed and hierarchy, not a newly narrated episode or an exact soundtrack match. A real episode needs its own speech/music and listening review. New rendered frame coverage and encoded samples are recorded in the validation reference.
