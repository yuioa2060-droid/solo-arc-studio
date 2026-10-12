#!/bin/bash
# sequential controlled batch: one paid request per image, exact per-image billing delta
cd "$(dirname "$0")/.." || exit 1
CRED=${CRED:?set CRED to the credentials env file}
for n in o-applesauce o-applejuice o-yogurt o-soup o-bowl o-potato o-glass o-alarm o-eggs o-chicken o-fish o-beans; do
  echo "=== $n $(date +%T)"; node --env-file=$CRED tools/a6gen.mjs $n --obj --ref raw/o-apple.png --send 2>&1 | grep -E 'billedUnits|status|error' | tr -d '\n'; echo
done
for n in h-glass h-turn; do
  echo "=== $n $(date +%T)"; node --env-file=$CRED tools/a6gen.mjs $n --hero --ref raw/h-hungry.png --send 2>&1 | grep -E 'billedUnits|status|error' | tr -d '\n'; echo
done
echo DONE
