"""Lay out editable headlines/arrows over coherent A6API artwork; export YouTube files.

No image generation, inpainting, retouching, or character reconstruction happens here.
Only uniform framing, typography, vector pointers, and export resizing are applied.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
from xml.sax.saxutils import escape
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
W, H, S = 1280, 720, 2
FONT_ROOT = ROOT.parents[2] / "branding" / "fonts"
WHITE, RED, EMERALD = "#FFFFFF", "#F42535", "#0B8371"

def font(name, size):
    return ImageFont.truetype(str(FONT_ROOT / name), round(size * S))

def cubic(points, count=160):
    p0,p1,p2,p3 = points
    result=[]
    for i in range(count+1):
        t=i/count; a=1-t
        result.append(tuple(a**3*p0[k]+3*a*a*t*p1[k]+3*a*t*t*p2[k]+t**3*p3[k] for k in (0,1)))
    return result

def pointer(draw, data):
    pts=cubic(data["points"])
    width=data.get("width",11); color=data.get("color",RED)
    draw.line([(round(x*S),round(y*S)) for x,y in pts],fill=color,width=round(width*S),joint="curve")
    ax,ay=pts[0]
    draw.ellipse(((ax-width/2)*S,(ay-width/2)*S,(ax+width/2)*S,(ay+width/2)*S),fill=color)
    ex,ey=pts[-1]; qx,qy=pts[-8]
    angle=math.atan2(ey-qy,ex-qx)
    length=data.get("head_length",35); spread=data.get("head_width",31)/2
    bx,by=ex-length*math.cos(angle),ey-length*math.sin(angle)
    tri=[(ex,ey),(bx+spread*math.sin(angle),by-spread*math.cos(angle)),(bx-spread*math.sin(angle),by+spread*math.cos(angle))]
    draw.polygon([(round(x*S),round(y*S)) for x,y in tri],fill=color)
    return tri

def export(name):
    spec=json.loads((ROOT/"layouts"/f"{name}.json").read_text(encoding="utf-8"))
    raw=ROOT/"raw"/f"{name}.png"
    art=Image.open(raw).convert("RGB")
    # Maintain all body proportions. A tiny aspect difference is cropped, never stretched.
    framed=ImageOps.fit(art,(W*S,H*S),method=Image.Resampling.LANCZOS)
    scale=spec.get("art_scale",1)
    canvas=Image.new("RGB",(W*S,H*S),"black")
    if scale!=1:
        framed=framed.resize((round(W*S*scale),round(H*S*scale)),Image.Resampling.LANCZOS)
    art_x=spec.get("art_x",0); art_y=H*(1-scale)
    canvas.paste(framed,(round(art_x*S),round(art_y*S)))
    draw=ImageDraw.Draw(canvas)
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
         '<defs><style>@font-face{font-family:Anton;src:url(../../../../branding/fonts/Anton-Regular.ttf)}@font-face{font-family:BebasNeue;src:url(../../../../branding/fonts/BebasNeue-Regular.ttf)}</style></defs>',
         '<rect width="1280" height="720" fill="black"/>',
         f'<image href="../raw/{name}.png" x="{art_x}" y="{art_y}" width="{W*scale}" height="{H*scale}" preserveAspectRatio="xMidYMid slice"/>']
    boxes=[]
    for text in spec.get("texts",[]):
        x,y=text["at"]; color=text.get("color",WHITE)
        tf=font(text.get("font","Anton-Regular.ttf"),text["size"])
        label=text["text"]
        anchor=text.get("anchor","lt")
        box=draw.textbbox((x*S,y*S),label,font=tf,anchor=anchor)
        if box[0]<0 or box[1]<0 or box[2]>W*S or box[3]>H*S:
            raise ValueError(f"Text outside canvas: {name}: {label} {box}")
        draw.text((x*S,y*S),label,font=tf,fill=color,anchor=anchor)
        boxes.append({"text":label,"box":[round(v/S,2) for v in box]})
        css_font=Path(text.get("font","Anton-Regular.ttf")).stem.split("-")[0]
        svg_anchor="middle" if anchor.startswith("m") else "start"
        # Visible bbox top is explicit in JSON; SVG uses the same font's ascent metrics.
        ascent,_=tf.getmetrics(); glyph_top=tf.getbbox(label)[1]
        svg.append(f'<text x="{x}" y="{y+(ascent-glyph_top)/S}" font-family="{css_font}" font-size="{text["size"]}" text-anchor="{svg_anchor}" fill="{color}">{escape(label)}</text>')
    for arrow in spec.get("arrows",[]):
        tri=pointer(draw,arrow); p=arrow["points"]
        path=f'M {p[0][0]} {p[0][1]} C {p[1][0]} {p[1][1]} {p[2][0]} {p[2][1]} {p[3][0]} {p[3][1]}'
        svg.append(f'<path d="{path}" fill="none" stroke="{arrow.get("color",RED)}" stroke-width="{arrow.get("width",11)}" stroke-linecap="round"/>')
        svg.append(f'<polygon points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in tri)}" fill="{arrow.get("color",RED)}"/>')
    svg.append('</svg>')
    final=canvas.resize((W,H),Image.Resampling.LANCZOS)
    output=ROOT/"deliver"; output.mkdir(exist_ok=True)
    png=output/f"{name}.png"; jpg=output/f"{name}.jpg"
    final.save(png,optimize=True)
    final.save(jpg,quality=95,subsampling=0,optimize=True)
    final.resize((320,180),Image.Resampling.LANCZOS).save(ROOT/"review"/f"{name}-mobile.png")
    (ROOT/"layouts"/f"{name}.svg").write_text("\n".join(svg),encoding="utf-8")
    record={"variant":name,"headline":spec["headline"],"illustration_source":"A6API gpt-image-2.5","raw_dimensions":list(art.size),"export_dimensions":[W,H],"text_boxes":boxes,"png_bytes":png.stat().st_size,"jpg_bytes":jpg.stat().st_size,"sha256_png":hashlib.sha256(png.read_bytes()).hexdigest(),"phone_preview":f"review/{name}-mobile.png","manual_visual_review":False}
    (ROOT/"review"/f"{name}-export.json").write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(record,ensure_ascii=False))

def sheet(names, sheet_name="variants-overview"):
    gap, header, tw, th=24,52,640,360
    rows=math.ceil(len(names)/2)
    board=Image.new("RGB",(tw*2+gap*3,(th+header)*rows+gap*(rows+1)),"#15171A")
    d=ImageDraw.Draw(board)
    label_font=ImageFont.truetype(str(FONT_ROOT/"BebasNeue-Regular.ttf"),30)
    for idx,name in enumerate(names):
        x=gap+(idx%2)*(tw+gap); y=gap+(idx//2)*(th+header+gap)
        spec=json.loads((ROOT/"layouts"/f"{name}.json").read_text(encoding="utf-8"))
        d.text((x,y+5),f'{idx+1}. {spec["headline"]}',font=label_font,fill="white")
        frame=Image.open(ROOT/"deliver"/f"{name}.png").convert("RGB").resize((tw,th),Image.Resampling.LANCZOS)
        board.paste(frame,(x,y+header))
    board.save(ROOT/"deliver"/f"{sheet_name}.jpg",quality=95,subsampling=0,optimize=True)
    phone=Image.new("RGB",(688,222*rows+16),"#15171A"); pd=ImageDraw.Draw(phone)
    for idx,name in enumerate(names):
        x=16+(idx%2)*336; y=16+(idx//2)*222
        pd.text((x,y),str(idx+1),font=label_font,fill="white")
        phone.paste(Image.open(ROOT/"review"/f"{name}-mobile.png"),(x,y+32))
    phone.save(ROOT/"review"/f"{sheet_name}-mobile.png")

if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("names",nargs="+");parser.add_argument("--sheet",action="store_true");parser.add_argument("--sheet-name",default="variants-overview")
    args=parser.parse_args()
    for name in args.names: export(name)
    if args.sheet: sheet(args.names,args.sheet_name)
