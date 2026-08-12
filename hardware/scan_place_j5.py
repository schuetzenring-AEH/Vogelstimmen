import sys
sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew

PCB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.2.kicad_pcb"
board = pcbnew.LoadBoard(PCB)

print("All footprints:")
fps = []
for fp in board.GetFootprints():
    p = fp.GetPosition()
    bb = fp.GetBoundingBox(False, False)
    item = {
        "ref": fp.GetReference(),
        "x": pcbnew.ToMM(p.x),
        "y": pcbnew.ToMM(p.y),
        "rot": fp.GetOrientationDegrees(),
        "bb": (
            pcbnew.ToMM(bb.GetLeft()),
            pcbnew.ToMM(bb.GetTop()),
            pcbnew.ToMM(bb.GetRight()),
            pcbnew.ToMM(bb.GetBottom()),
        ),
    }
    fps.append(item)
fps.sort(key=lambda i: i["ref"])
for i in fps:
    print(f"{i['ref']:6} {i['x']:7.2f} {i['y']:7.2f} r={i['rot']:6.1f}  bb={tuple(round(v,2) for v in i['bb'])}")

# Board edge from edge cuts
print("\nBoard bbox (all items):")
bb = board.GetBoardEdgesBoundingBox()
print(pcbnew.ToMM(bb.GetLeft()), pcbnew.ToMM(bb.GetTop()), pcbnew.ToMM(bb.GetRight()), pcbnew.ToMM(bb.GetBottom()))

# Candidate centers for J5 courtyard 34x18 (0°) or 18x34 (90°)
# Keep 0.5mm margin from board edge
BOARD = (123.5, 69.5, 210.0, 130.0)
MARGIN = 0.8

def cy_box(cx, cy, rot):
    if abs(rot) < 1 or abs(abs(rot) - 180) < 1:
        return (cx - 17, cy - 9.5, cx + 17, cy + 8.5)
    # 90 / 270
    return (cx - 9.5, cy - 17, cx + 8.5, cy + 17)

def overlaps(a, b, pad=0.2):
    return not (a[2] + pad <= b[0] or b[2] + pad <= a[0] or a[3] + pad <= b[1] or b[3] + pad <= a[1])

others = [i for i in fps if i["ref"] != "J5"]
candidates = []
for rot in (0, 90):
    if rot == 0:
        xs = range(int(BOARD[0] + 17 + MARGIN), int(BOARD[2] - 17 - MARGIN) + 1)
        ys = range(int(BOARD[1] + 9.5 + MARGIN), int(BOARD[3] - 8.5 - MARGIN) + 1)
    else:
        xs = range(int(BOARD[0] + 9.5 + MARGIN), int(BOARD[2] - 8.5 - MARGIN) + 1)
        ys = range(int(BOARD[1] + 17 + MARGIN), int(BOARD[3] - 17 - MARGIN) + 1)
    for x in xs:
        for y in ys:
            box = cy_box(x, y, rot)
            if box[0] < BOARD[0] + MARGIN or box[1] < BOARD[1] + MARGIN:
                continue
            if box[2] > BOARD[2] - MARGIN or box[3] > BOARD[3] - MARGIN:
                continue
            hit = False
            for o in others:
                # use courtyard-ish bbox from footprint bounding box
                ob = o["bb"]
                if overlaps(box, ob, 0.3):
                    hit = True
                    break
            if not hit:
                # score: prefer right side (housing window) and lower half
                score = x + y * 0.2
                candidates.append((score, x, y, rot, box))

candidates.sort(reverse=True)
print(f"\nFree candidates found: {len(candidates)}")
for c in candidates[:15]:
    print(f"  score={c[0]:.1f} at ({c[1]}, {c[2]}) rot={c[3]} box={tuple(round(v,1) for v in c[4])}")
