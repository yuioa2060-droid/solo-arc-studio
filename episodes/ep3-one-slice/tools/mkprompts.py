"""Prompt library for EP3. `python tools/mkprompts.py` writes prompts/<name>.txt and jobs-<group>.json.
All images are generated through A6API only (tools/a6queue.mjs)."""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
P = ROOT / 'prompts'; P.mkdir(exist_ok=True)

SCENE_STYLE = ("Cinematic manga illustration, full-bleed wide shot, drawn in rough fast manga brush-pen ink: thick black outlines of varying width, "
  "scratchy parallel hatching for every shadow, a few stray construction lines, clearly visible individual ink strokes. Flat muted natural colours under the ink "
  "(desaturated, slightly warm), strong cinematic composition and lighting. Copy the drawing style of the references exactly, but use the references ONLY for their line style "
  "and colour treatment: do NOT draw their characters or objects. No text, no letters, no numbers, no digits, no logos, no speech bubbles, no frame, no border, no watermark. "
  "Correct anatomy, exactly five fingers per hand.\n")
HERO_STYLE = open(ROOT.parent / 'ep2-alt-hunger-dials/prompts/h-hungry.txt').read().split('EXPRESSION AND ATTITUDE')[0]
OBJ_STYLE = ("Ink illustration with full muted natural colour under the ink (hand-drawn hatching visible, desaturated realistic colours), copy the drawing style of the reference exactly. "
  "ONE object alone, centred, on solid pure black (#000000) background. NO frame, NO container, NO ring, NO glow, NO platform, NO floor shadow, NO paper, NO tape, nothing around it. "
  "No text, no numbers, no digits, no logos. Clean and premium. A small dark emerald (#0B8371) detail is part of the object itself, only where described.\n")

IMG = {}   # name -> (mode, size, text)
def scene(name, text, size='1536x1024'): IMG[name] = ('scene', size, SCENE_STYLE + 'SCENE: ' + text + '\n')
def hero(name, text, size='1536x1024'): IMG[name] = ('hero', size, HERO_STYLE + text + '\n')
def obj(name, text, size='1024x1024'): IMG[name] = ('obj', size, OBJ_STYLE + 'OBJECT: ' + text + '\n')


EM = " A small dark emerald (#0B8371) detail appears naturally on one real object."
# ================= A. Monday-Tuesday montage (alive, warm morning)
scene('m-alarm', "Extreme close-up of a classic round analogue alarm clock with twin bells on a wooden nightstand, plain white face with simple tick marks (no numerals) and black hands, early morning light through a curtain, a glass of water and the corner of a pillow soft-focus in the background. Camera at nightstand height, the clock slightly left of centre. The two bells are painted dark emerald (#0B8371).", '2048x1152')
scene('m-prep', "Top-down view of a tidy kitchen counter: six identical glass meal-prep containers in two neat rows, each holding grilled chicken, rice and broccoli, their lids stacked at the side, a fork and a folded cloth. Bright early-morning light from the left. The lids' silicone seals are dark emerald (#0B8371).", '2048x1152')
scene('m-shoes', "Low camera on a wooden hallway floor beside a front door at sunrise: a pair of running shoes with dark emerald (#0B8371) laces, two small dumbbells and a gym bag, a long beam of warm sun across the floor, everything ready to go. Nobody in frame.", '2048x1152')
scene('m-scale', "High angle view of a bathroom scale on pale tiles, a pair of bare feet stepping onto it, the scale's display dark and blank, soft morning window light, a folded towel at the edge of the frame. The scale has a thin dark emerald (#0B8371) border strip.", '2048x1152')
scene('o-clockface', "A round office wall clock on a plain pale wall, shown front-on and large in the middle of the frame: white face, thin black tick marks only, NO numerals and NO hands at all, thin black frame, a small dark emerald (#0B8371) centre cap. Soft fluorescent light, subtle hatching on the wall, lots of calm empty wall around it.", '2048x1152')
# ================= B. Office
scene('s-cake', "Close-up of two hands carrying a round birthday cake toward the viewer: white frosting, a ring of red strawberries, three lit candles with small flames, warm candle glow on the frosting, a smiling coworker blurred behind, an office meeting room blurred further back. Shallow depth of field. The cake is the sharpest, most colourful element, centred.", '2048x1152')
scene('s-eyes', "Extreme close-up manga shot of a person's eyes and eyebrows only, wide cinematic crop: tired, hesitant, slightly lowered brows, eyes looking toward the lower right, a tiny reflection of candle flames in each pupil, heavy black hatching around the eyes. Muted natural skin tone, nothing below the nose.", '2048x1152')
# ================= D. the spiral (cold night)
scene('sp-phone', "First-person view: a hand holds a smartphone showing a food-delivery screen (a large photo of a pizza and one big round button), the hand and face of the phone lit by the screen glow, sofa cushions and a dim living room at dusk behind. Cool blue-grey shadows with warm screen light. No text on the screen.", '2048x1152')
scene('sp-pizza', "Three-quarter high view of a coffee table at night: an open pizza box with a half-eaten pizza, a tray of chicken wings, a big soda bottle, crumpled napkins, flickering TV light from the left casting blue-grey light, heavy shadows. Messy and heavy mood.", '2048x1152')
scene('sp-couch', "A person seen from behind, slumped on a sofa wrapped in a grey blanket in a dark living room, a TV glowing in front of them (we only see the glow on the wall and their silhouette), empty boxes on the coffee table. Cold blue-grey palette, heavy hatching.", '2048x1152')
scene('sp-bag', "A gym bag and untouched sneakers in the corner by the front door, a thin layer of dust on the bag, flat cold grey morning light, a coat on a hook above. Quiet, abandoned mood.", '2048x1152')
scene('sp-scale', "Bathroom scale on pale tiles at grey dawn, a pair of slippers beside it and a pair of bare feet standing next to the scale, not stepping on it; cold flat light; the feeling of avoidance.", '2048x1152')
# ================= E. the recovery (warm)
scene('rc-dinner', "A normal home dinner at a wooden table at dusk: a plate with grilled chicken, rice and mixed vegetables, a glass of water, fork and knife, warm lamp light and a window with a blue evening sky. Calm, ordinary, welcoming. The plate has a thin dark emerald (#0B8371) rim.", '2048x1152')
scene('rc-walk', "A person seen from behind in a grey hoodie and sneakers with dark emerald (#0B8371) soles, walking calmly along a tree-lined city street at golden hour, long warm shadows, a peaceful mood.", '2048x1152')
scene('rc-morning', "Bright kitchen the next morning: a table with a bowl of oatmeal with fruit, a glass of water and a dark emerald (#0B8371) mug with a curl of steam, sunlight streaming through the window. Calm and fresh.", '2048x1152')
# ================= H. objects
obj('o-gavel', "A judge's wooden gavel resting on its round sound block, seen from a low three-quarter angle, a thin dark emerald (#0B8371) band around the handle.", '1024x1024')
obj('o-match', "A single lit wooden match tilted at an angle, bright small flame, a thin curl of smoke, red-brown match head, seen close; nothing else.", '1024x1024')
# ================= G. hero cutouts (on black, alpha later)
_h = "EXPRESSION AND ATTITUDE: serious, calm, in control and focused. Brows slightly lowered, mouth closed in a flat line, eyes looking straight at the viewer. NO smile. Self-assured, not theatrical.\nPOSE: "
hero('h-stop', _h + "facing the viewer, one open hand raised palm-out toward the viewer at shoulder height as a calm 'stop' gesture, the other arm hanging relaxed.")
hero('h-point', _h.replace('looking straight at the viewer','looking toward the right of the frame') + "slight 3/4 view, one arm extended forward-right pointing with the index finger, the other hand relaxed at his side.")
hero('h-phone', _h + "facing the viewer, holding a smartphone upright in one hand in front of his chest with the dark blank screen facing the viewer, the other arm relaxed.")
scene('mv-phone', "A hand holds a modern smartphone upright, held straight-on and facing the viewer, the screen completely blank and softly glowing pale blue-white with a clean rectangular shape, thumb at the lower edge, a blurred kitchen counter behind. The phone is large and centred, flat to the camera (no perspective tilt).", '2048x1152')

GROUPS = {
 'main1': ['m-alarm','m-prep','m-shoes','m-scale','o-clockface','s-cake','s-eyes','sp-phone','sp-pizza','sp-couch','sp-bag','sp-scale','rc-dinner','rc-walk','rc-morning','o-gavel','o-match','mv-phone'],
}
VARIANTS = {'h-stop':['a','b'],'h-point':['a','b'],'h-phone':['a','b']}

# ================= C. 1975 lab and the donut study (generated in colour, tinted in post)
scene('l-lab', "Interior of a 1970s university psychology lab: wood-panelled wall, a small formica table with a tray of three bowls of ice cream and a tall milkshake glass with a straw, a young woman with a 1970s hairstyle in a knit top sitting at the table looking at the glass, a researcher in a white coat holding a clipboard standing at the far side. Faded 1970s colour palette. Camera at table height from the side.", '2048x1152')
scene('l-shake', "Close-up of a tall milkshake glass with a striped paper straw on a pale formica table, pale pink milkshake with a little condensation, soft side light, a blurred 1970s lab behind. The glass is the only sharp object, placed left of centre.", '2048x1152')
scene('l-bowls', "Close-up of three identical glass dishes of ice cream (vanilla, chocolate, strawberry) with small spoons on a metal tray on a lab table, a clipboard and a small kitchen scale beside the tray, a 1970s lab blurred behind. Faded 1970s colour palette.", '2048x1152')
scene('d-lab', "A plain university lab room with a table: on it a plate holding one glazed donut and a bowl of colourful candies, a notepad and a pencil; a young woman sits at the table looking at the donut, soft daylight from a window. Calm, neutral mood.", '2048x1152')
obj('d-bowls', "Two identical white ceramic bowls side by side filled with colourful hard candies: the LEFT bowl is nearly full, the RIGHT bowl is only a quarter full with a few candies left. Seen straight on from the front at table height.", '1536x1024')
GROUPS['main2'] = ['l-lab','l-shake','l-bowls','d-lab','d-bowls']

if __name__ == '__main__':
    for n, (mode, size, text) in IMG.items(): (P / f'{n}.txt').write_text(text)
    for g, names in GROUPS.items():
        jobs = []
        for n in names:
            jobs.append({'name': n, 'mode': IMG[n][0], 'size': IMG[n][1]})
        for n, sfx in VARIANTS.items():
            if g == 'main1':
                for x in sfx: jobs.append({'name': n, 'mode': IMG[n][0], 'size': IMG[n][1], 'suffix': x})
        (ROOT / f'jobs-{g}.json').write_text(json.dumps(jobs, indent=1)); print(g, len(jobs), 'jobs')
    print(len(IMG), 'prompts written')
