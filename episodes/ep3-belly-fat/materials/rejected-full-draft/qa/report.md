# EP3 QA — candidate delivery

## Performed
- Restored the original three Jonathan voice takes and word alignments; native speed, no atempo.
- Verified all 70 current scenes and all 32 referenced image assets exist.
- Ran Remotion text-range checks across the full 14,043-frame render: zero reported text excursions beyond the 12-pixel guard.
- Inspected representative scene stills throughout the episode, then fixed hero/text spacing, study caption spacing, and the overly small hip-hinge menu image. These are sampled-frame inspections, not a continuous full-video viewing claim.
- Replaced the legacy walking photo-card with a purposeful manga walking scene in three locations, re-rendering 93–101, 334–344, and 405–416 seconds. Re-rendered 257–263 seconds for the hip-hinge menu correction. Every patch returned zero text-layout failures.
- Visually inspected replacement stills and extracted frames from encoded walking patches. Natural object colors, emerald accents, no text/image collisions in the inspected compositions.
- Kept voice, music, and SFX stems separate. Music is a new organic instrumental request with no vocals, drum/beat grid, 8-bit sound or bass line, and a phrase-driven envelope.
- Primary study quantities checked against Vispute 2011, Brobakken 2023, and Morton 2018; source boundaries are in references.md.
- Portable export scripts passed Node syntax checks; all current art references resolved. Jost OFL supplied.

## Limits
- No honest audio-listening facility was available in this agent environment. Audio is measured, not claimed to have been listened to end-to-end. Before publishing, the owner should check the mix balance and SFX on headphones/speakers.
- Representative-frame review and complete technical decode are not full continuous artistic viewing/listening or user approval.
- Short whole-image pose dissolves are illustration transitions, not a biomechanically continuous joint animation. Do not describe them as motion capture.
- Some original generation prompts/request receipts could not be recovered. Eight original new art files and all original voice takes were recovered; protein art is the approved EP1 source; the missing music was replaced by one new generation.
- This is a candidate. No upload to YouTube and no user approval are implied.

## Final encoded-file checks
Filled from the actual delivery MP4 after assembly in final-probe.json, full-decode.log and final-aac-loudness.log.

- Delivery duration: 468.100000 s; 14,043 video frames; 1920×1080, 30 fps. Audio duration matches video at 468.100 s.
- Complete FFmpeg decode: exit 0, empty error log.
- Actual final AAC: integrated -14.04 LUFS; true peak -1.28 dBTP; LRA 2.60 LU.
- Extracted final-file frames at 0.9, 262.44, 412.213 and 467.95 s inspected: initial direct gaze, corrected exercise menu, corrected walking image, final black.
- Segment track timescales normalized to 90,000 before lossless concatenation; final frame count and duration verified.
