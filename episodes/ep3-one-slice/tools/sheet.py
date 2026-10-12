"""Contact sheet of raw images. python tools/sheet.py <out.png> [--scene|--cut] [--cols 3] [--cell 640] name [name...]
--scene : plain downscale (full-bleed plates). --cut : alpha-prepare objects/heroes on #060606."""
import sys, os, tempfile
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from prep_alpha import prep
a = sys.argv[1:]
def opt(f, d):
    if f in a: i = a.index(f); v = a[i + 1]; del a[i:i + 2]; return type(d)(v)
    return d
cols = opt('--cols', 3); cell = opt('--cell', 640)
cut = '--cut' in a; a = [x for x in a if x not in ('--cut', '--scene')]
out, names = a[0], a[1:]
root = os.path.join(os.path.dirname(__file__), '..')
tiles = []
for n in names:
    src = next((p for p in (os.path.join(root, 'raw', n + '.png'), os.path.join(root, 'film/public/img', n + '.png'), os.path.join(root, 'film/public/img', n + '.jpg')) if os.path.exists(p)), None)
    if not src: print('missing', n); continue
    if cut:
        tmp = os.path.join(tempfile.gettempdir(), 'sh-' + n + '.png'); prep(src, tmp); im = Image.open(tmp).convert('RGBA')
    else:
        im = Image.open(src).convert('RGBA')
    tiles.append((n, im))
ch = cell * 9 // 16 if not cut else cell
rows = (len(tiles) + cols - 1) // cols
S = Image.new('RGB', (cols * cell, rows * (ch + 24)), (6, 6, 6)); d = ImageDraw.Draw(S)
for i, (n, im) in enumerate(tiles):
    im = im.copy(); im.thumbnail((cell - 8, ch - 8))
    x = (i % cols) * cell + (cell - im.width) // 2; y = (i // cols) * (ch + 24) + (ch - im.height) // 2
    S.paste(im, (x, y), im); d.text(((i % cols) * cell + 6, (i // cols) * (ch + 24) + ch + 5), n, fill=(210, 210, 200))
S.save(out); print(out, S.size)
