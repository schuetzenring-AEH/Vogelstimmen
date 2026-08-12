import sys
import re
sys.path.insert(0, r"C:\Users\Schue\Projects\Vogelstimmen\.tmp_pymupdf")
import fitz

doc = fitz.open(r"C:\Users\Schue\Projects\Vogelstimmen\docs\datasheets\Kuebler_K04-K07_AK07.pdf")
p = doc[5]
svg = p.get_svg_image(matrix=fitz.Matrix(1, 1))
open(r"C:\Users\Schue\Projects\Vogelstimmen\docs\datasheets\page5.svg", "w", encoding="utf-8").write(svg)

circs = re.findall(r"<circle[^>]*>", svg)
ells = re.findall(r"<ellipse[^>]*>", svg)
print("circles", len(circs), "ellipses", len(ells))
for e in (circs + ells)[:40]:
    print(e[:220])

# Also parse drawings for 'c' curves that form small circles
paths = p.get_drawings()
pts = []
for d in paths:
    for item in d.get("items", []):
        if item[0] == "re":
            r = item[1]
            if 1.0 < r.width < 12 and 1.0 < r.height < 12 and abs(r.width - r.height) < 1.5:
                pts.append(("re", r.x0 + r.width / 2, r.y0 + r.height / 2, r.width, r.height))
print("small rects", len(pts))
for t in pts[:30]:
    print(t)

# cluster text anchors in punching region
print("\nText in punching bbox:")
for b in p.get_text("dict")["blocks"]:
    if b.get("type") != 0:
        continue
    for line in b.get("lines", []):
        for s in line.get("spans", []):
            x0, y0, x1, y1 = s["bbox"]
            if 330 < x0 < 560 and 130 < y0 < 320:
                print(f"  ({x0:.1f},{y0:.1f}) {s['text']!r}")
