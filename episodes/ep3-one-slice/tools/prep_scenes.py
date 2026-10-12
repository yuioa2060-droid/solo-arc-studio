"""Raw A6API images -> film plates.
  scenes  : upscaled (min 2560x1440 cover) high-quality JPG in film/public/img, with optional frozen (grey + colour pop) and sepia variants
  cutouts : raw on black -> RGBA PNG (prep_alpha)
Registry film/src/imgs.json maps file name -> [width, height]. Raw files are never modified.
python tools/prep_scenes.py [name ...]   (no names = everything available)"""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from prep_alpha import prep

ROOT = os.path.join(os.path.dirname(__file__), '..'); RAW = os.path.join(ROOT, 'raw'); OUT = os.path.join(ROOT, 'film/public/img')
os.makedirs(OUT, exist_ok=True)
SCENES = ['m-alarm', 'm-prep', 'm-shoes', 'm-scale', 'o-clockface', 's-office', 's-cake', 's-slice', 's-eyes', 'sp-phone', 'sp-pizza', 'sp-couch', 'sp-bag', 'sp-scale',
          'rc-dinner', 'rc-walk', 'rc-morning', 'mv-phone', 'l-lab', 'l-shake', 'l-bowls', 'd-lab']
SEPIA = {'l-lab', 'l-shake', 'l-bowls'}
# frozen variants: (normalised cx, cy, rx, ry) colour-pop ellipses
FREEZE = {'s-cake': [(0.50, 0.60, 0.26, 0.42)], 's-slice': [(0.49, 0.50, 0.17, 0.36)], 's-office': [(0.727, 0.43, 0.05, 0.075)], 's-eyes': []}
CUTS = {'h-stop': 'h-stop-a', 'h-point': 'h-point-a', 'h-phone': 'h-phone-a', 'o-gavel': 'o-gavel', 'o-match': 'o-match', 'd-bowls': 'd-bowls'}

def load(n):
    p = os.path.join(RAW, n + '.png'); return Image.open(p).convert('RGB') if os.path.exists(p) else None

def upscale(im):
    ar = im.width / im.height
    size = (round(1440 * ar), 1440) if ar >= 16 / 9 else (2560, round(2560 / ar))
    if im.width >= size[0]: size = im.size
    big = im.resize(size, Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))

def frozen(im, pops):
    a = np.asarray(im).astype(np.float32) / 255.0
    g = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])
    g = np.clip((g - 0.5) * 1.12 + 0.5 - 0.03, 0, 1)
    gray = np.stack([g * 0.90, g * 0.97, g * 1.07], -1)
    mask = Image.new('L', im.size, 0); d = ImageDraw.Draw(mask)
    for cx, cy, rx, ry in pops:
        d.ellipse([(cx - rx) * im.width, (cy - ry) * im.height, (cx + rx) * im.width, (cy + ry) * im.height], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(im.width * 0.022)); m = (np.asarray(mask).astype(np.float32) / 255.0)[..., None]
    pop = np.asarray(ImageEnhance.Color(im).enhance(1.15)).astype(np.float32) / 255.0
    out = gray * (1 - m) + pop * m
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

def sepia(im):
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1)
    return ImageOps.colorize(g, black=(26, 17, 11), mid=(148, 110, 72), white=(246, 226, 190))

reg = {}
rp = os.path.join(ROOT, 'film/src/imgs.json')
if os.path.exists(rp): reg = json.load(open(rp))
only = set(sys.argv[1:])
for n in SCENES:
    if only and n not in only: continue
    im = load(n)
    if im is None: continue
    big = upscale(im)
    if n in SEPIA: big = sepia(big)
    big.save(os.path.join(OUT, n + '.jpg'), quality=93, subsampling=0); reg[n + '.jpg'] = list(big.size)
    if n in FREEZE:
        fz = frozen(big, FREEZE[n]); fz.save(os.path.join(OUT, n + '-fz.jpg'), quality=93, subsampling=0); reg[n + '-fz.jpg'] = list(fz.size)
    print('scene', n, im.size, '->', big.size)
for name, rawn in CUTS.items():
    if only and name not in only: continue
    src = os.path.join(RAW, rawn + '.png')
    if not os.path.exists(src): continue
    w, h, box, tr = prep(src, os.path.join(OUT, name + '.png')); reg[name + '.png'] = [w, h]; print('cut', name, w, h)
for f in os.listdir(OUT):
    if f.endswith('.png') and f not in reg: reg[f] = list(Image.open(os.path.join(OUT, f)).size)
json.dump(reg, open(rp, 'w'), indent=0)
print(len(reg), 'registered')
