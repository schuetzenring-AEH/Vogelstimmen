import sys
import re
from collections import defaultdict

sys.path.insert(0, r"C:\Users\Schue\Projects\Vogelstimmen\.tmp_pymupdf")
import fitz

doc = fitz.open(r"C:\Users\Schue\Projects\Vogelstimmen\docs\datasheets\Kuebler_K04-K07_AK07.pdf")
p = doc[5]
svg = open(r"C:\Users\Schue\Projects\Vogelstimmen\docs\datasheets\page5.svg", encoding="utf-8").read()

# Find all path 'd' that look like small circles (closed curves)
paths = re.findall(r"<path[^>]*\sd=\"([^\"]+)\"", svg)
print("paths", len(paths))

# Also analyze drawings items with curves
drawings = p.get_drawings()
curve_pts = []
for d in drawings:
    col = d.get("color")
    fill = d.get("fill")
    for item in d.get("items", []):
        if item[0] == "c":
            # cubic bezier: start? actually (c, p1, p2, p3)
            pts = item[1:]
            xs = [pt.x for pt in pts]
            ys = [pt.y for pt in pts]
            cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
            span = max(xs) - min(xs)
            if 0.5 < span < 8:
                curve_pts.append((cx, cy, span, col, fill))
        elif item[0] == "l":
            pass

# Cluster curve centers
print("small curve clusters:")
bins = defaultdict(list)
for cx, cy, span, col, fill in curve_pts:
    key = (round(cx, 1), round(cy, 1))
    bins[key].append(span)

# In punching region roughly x 430-530, y 160-300
cands = []
for (x, y), spans in sorted(bins.items()):
    if 420 < x < 540 and 160 < y < 310:
        cands.append((x, y, len(spans), sum(spans) / len(spans)))
print("in punch region", len(cands))
for c in cands:
    print(c)

# Print ALL curve clusters with multiple segments (circles often 4 beziers)
print("\nmulti-seg small curves on page:")
for (x, y), spans in sorted(bins.items(), key=lambda kv: (kv[0][1], kv[0][0])):
    if len(spans) >= 3 and 0.8 < (sum(spans) / len(spans)) < 6:
        print(f"  ({x},{y}) n={len(spans)} span≈{sum(spans)/len(spans):.2f}")
