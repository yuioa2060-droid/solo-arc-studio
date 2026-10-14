"""Tile review stills into one contact sheet. python tools/stills_sheet.py <dir> <out.png> [cols] [width]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(glob.glob(os.path.join(d, '*.png')), key=lambda f: int(os.path.basename(f).split('-')[1]))
h = w * 9 // 16
rows = (len(files) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 22)), (30, 30, 30)); dr = ImageDraw.Draw(S)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    S.paste(im, (x, y + 22)); dr.text((x + 6, y + 5), os.path.basename(f).split('-', 2)[2][:-4], fill=(230, 230, 200))
S.save(out); print(out, S.size)
