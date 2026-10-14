"""Contact sheet of raw images composited on the film background (#060606).
python tools/sheet.py <out.png> <raw-name> [<raw-name> ...] [--cols 4] [--cell 420]
Alpha preparation is done in memory with the same routine as prep_alpha.py."""
import sys, os, tempfile
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from prep_alpha import prep

args = sys.argv[1:]
cols = int(args[args.index('--cols') + 1]) if '--cols' in args else 4
cell = int(args[args.index('--cell') + 1]) if '--cell' in args else 420
for f in ('--cols', '--cell'):
    if f in args:
        i = args.index(f); del args[i:i + 2]
out, names = args[0], args[1:]
root = os.path.join(os.path.dirname(__file__), '..')
tiles = []
for n in names:
    src = os.path.join(root, 'raw', n + '.png')
    if not os.path.exists(src):
        src = os.path.join(root, 'film/public/img', n + '.png')
    tmp = os.path.join(tempfile.gettempdir(), 'sheet-' + n + '.png')
    try:
        prep(src, tmp)
        im = Image.open(tmp).convert('RGBA')
    except Exception:
        im = Image.open(src).convert('RGBA')
    tiles.append((n, im))
rows = (len(tiles) + cols - 1) // cols
S = Image.new('RGB', (cols * cell, rows * (cell + 24)), (6, 6, 6))
d = ImageDraw.Draw(S)
for i, (n, im) in enumerate(tiles):
    im = im.copy(); im.thumbnail((cell - 12, cell - 12))
    x = (i % cols) * cell + (cell - im.width) // 2
    y = (i // cols) * (cell + 24) + (cell - im.height) // 2
    S.paste(im, (x, y), im)
    d.text(((i % cols) * cell + 8, (i // cols) * (cell + 24) + cell + 4), n, fill=(210, 210, 200))
S.save(out)
print(out, S.size)
