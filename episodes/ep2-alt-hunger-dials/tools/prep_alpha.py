"""Raw A6API image on solid black -> registered RGBA PNG for the film.

Only black that is connected to the frame border (or forms a large enclosed
black area) is treated as background; ink lines inside the drawing stay opaque.
The raw file is never modified. Usage:
  python tools/prep_alpha.py raw/<name>.png film/public/img/<name>.png [--pad 4]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

BG_MAX = 16      # channel maximum that still counts as background black
BIG_HOLE = 2500  # enclosed black areas larger than this are background too
HALO = 3         # px around background where alpha is graded


def prep(src, dst, pad=4):
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im).astype(np.int16)
    m = rgb.max(axis=2)
    dark = m <= BG_MAX
    lab, n = ndi.label(dark, structure=np.ones((3, 3)))
    sizes = ndi.sum(dark, lab, index=np.arange(1, n + 1))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    keep = [i for i in range(1, n + 1) if i in border or sizes[i - 1] >= BIG_HOLE]
    bg = np.isin(lab, keep)
    halo = ndi.binary_dilation(bg, iterations=HALO)
    soft = np.clip((m - 4) / 60.0, 0, 1) * 255
    alpha = np.full(m.shape, 255, np.uint8)
    alpha[halo] = soft[halo].astype(np.uint8)
    alpha[bg] = 0
    ys, xs = np.where(alpha > 10)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, m.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, m.shape[1])
    out = np.dstack([rgb.astype(np.uint8), alpha])[y0:y1, x0:x1]
    Image.fromarray(out, 'RGBA').save(dst, optimize=True)
    return out.shape[1], out.shape[0], (x0, y0, x1, y1), 100 * (alpha == 0).mean()


if __name__ == '__main__':
    pad = int(sys.argv[sys.argv.index('--pad') + 1]) if '--pad' in sys.argv else 4
    w, h, box, tr = prep(sys.argv[1], sys.argv[2], pad)
    print(f'{sys.argv[2]}: {w}x{h} crop={box} transparent={tr:.1f}%')
