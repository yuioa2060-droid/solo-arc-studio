---
name: a6-image
description: Generate or edit images through A6API with Nano Banana 2.1 or GPT Image 2.5, preserving explicit model choice and using private runtime credentials. Use for this channel's new image prompts, reference edits, thumbnails and illustrations.
---

# A6API images

Read [the dated profile](references/profile.json) and [current API status](../../context/API_STATUS_20261015_RU.md). Default: `nano-banana-2.1` (`nano`), verified on 2026-10-14. `gpt-image-2.5` (`gpt`) is integrated but tested routes were unavailable on 2026-10-15; verify a working route before presenting it as ready. A model listing or marketplace success rate is insufficient. Preserve an explicitly chosen model.

Use existing art when it already satisfies the shot. For edits inspect references first and pass the actual images. Follow `solo-arc-motion` for character identity, style and QA. SVG text/arrows/brush lines are editable code and do not require image generation.

Credentials: `A6API_KEY` environment variable, ignored repo `.env`, explicitly provided `--env-file`, or the user's existing private local env. Never print a key or include it in prompts, source, Git, logs or ZIP. A clone cannot read GitHub Actions Secret values. Missing credentials do not block rendering existing EP3 media.

## Portable Node helper

Node 22.4+, no extra packages. Write the prompt to a UTF-8 file. Commands are local dry-runs unless `--send` is present:

```sh
node skills/a6-image/scripts/generate.mjs --model nano --prompt-file outputs/prompt.txt --out outputs/image.png
node skills/a6-image/scripts/generate.mjs --model nano --prompt-file outputs/prompt.txt --reference path/to/reference.png --out outputs/image.png --send
```

For GPT select `--model gpt` after checking a live route. `--size` defaults to `1536x1024`; verify the returned dimensions. Repeat `--reference` for multiple sources. Windows also has `scripts/generate.ps1` with `-Model`, `-PromptFile`, `-OutputFile`, `-ReferenceFiles`, `-Send`.

Nano uses OpenAI-style `chat/completions` with text/image content. GPT uses `images/generations` or multipart `images/edits`; A6API rejects chat/completions for that model. Model names here are provider IDs, not a claim to independently verify upstream model weights.

One POST per requested image; no automatic paid retries or silent model/supplier fallback. A direct production request authorizes the corresponding necessary call, while packaging/setup/checking the repository does not authorize paid generations. After any timeout/error inspect audit and billing before a repeat. Some merchants returned an HTTP200 error body and charged; the helper treats it as failure.

The helper saves native PNG/JPEG/WebP and a sanitized audit, reconciling new ledger rows by stable billing request ID. Use the returned actual filename. Successful raw responses are cached privately for recovery if parsing/download fails; recover the existing image rather than paying again. Do not print cached payloads/signed URLs.

Inspect and display the actual saved image using an absolute local path. Report defects and actual dimensions. One observed generation time/cost is not a guarantee, and a 4096×4096 return does not prove native upstream 4K generation.
