from PIL import Image, ImageDraw
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'public' / 'icons'
for size in (16, 48, 128):
    scale = 6
    s = size * scale
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    def p(points):
        return [(round(x * s / 128), round(y * s / 128)) for x, y in points]
    d.rounded_rectangle((5*s/128, 5*s/128, 123*s/128, 123*s/128), radius=31*s/128, fill='#101b34', outline='#5369aa', width=max(1, s//64))
    d.line(p([(64, 15), (106, 39), (106, 88), (64, 113), (22, 88), (22, 39), (64, 15)]), fill='#526baf', width=max(1, s//70), joint='curve')
    # A prismatic P with a trailing diagonal, matching the vector mark.
    width = max(2, round(12*s/128))
    d.line(p([(39, 92), (39, 36), (68, 36), (78, 38), (87, 44), (93, 52), (95, 60), (93, 68), (87, 76), (78, 82), (67, 84), (55, 84)]), fill='#6e83ff', width=width, joint='curve')
    d.line(p([(65, 84), (91, 101)]), fill='#39dccc', width=max(2, round(7*s/128)), joint='curve')
    r = max(2, 4*s/128)
    d.ellipse((99*s/128-r, 34*s/128-r, 99*s/128+r, 34*s/128+r), fill='#4ae8df')
    im.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon{size}.png')
