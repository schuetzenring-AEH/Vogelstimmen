"""Orient J5 so ANZEIGE faces board-top (-Y), place in free slot, route 5V, refill."""
import sys
sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew

PCB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.2.kicad_pcb"
board = pcbnew.LoadBoard(PCB)

def mm(x):
    return pcbnew.FromMM(x)

def to_mm(v):
    return pcbnew.ToMM(v)

def find(ref):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    raise KeyError(ref)

def near(ax, ay, bx, by, tol=0.4):
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 < tol

BOARD = (123.5, 69.5, 210.0, 130.0)
MARGIN = 0.8

def cy_box(cx, cy, rot):
    # courtyard local: (-17,-9.5)-(17,8.5); ANZEIGE at y=-8.2 (toward -Y at rot=0)
    if abs(rot % 180) < 1:
        return (cx - 17, cy - 9.5, cx + 17, cy + 8.5)
    return (cx - 9.5, cy - 17, cx + 8.5, cy + 17)

def overlaps(a, b, pad=0.25):
    return not (a[2] + pad <= b[0] or b[2] + pad <= a[0] or a[3] + pad <= b[1] or b[3] + pad <= a[1])

others = []
for fp in board.GetFootprints():
    if fp.GetReference() == "J5":
        continue
    bb = fp.GetBoundingBox(False, False)
    others.append((
        to_mm(bb.GetLeft()), to_mm(bb.GetTop()),
        to_mm(bb.GetRight()), to_mm(bb.GetBottom()),
    ))

# Prefer rot=0: ANZEIGE toward top of board (readable looking from top edge / from above)
# Also try 180 if needed. Score: prefer right side (housing) and readable orientation.
candidates = []
for rot in (0, 180):
    if rot % 180 == 0:
        xs = range(int(BOARD[0] + 17 + MARGIN), int(BOARD[2] - 17 - MARGIN) + 1)
        ys = range(int(BOARD[1] + 9.5 + MARGIN), int(BOARD[3] - 8.5 - MARGIN) + 1)
    for x in xs:
        for y in ys:
            box = cy_box(x, y, rot)
            if box[0] < BOARD[0] + MARGIN or box[1] < BOARD[1] + MARGIN:
                continue
            if box[2] > BOARD[2] - MARGIN or box[3] > BOARD[3] - MARGIN:
                continue
            if any(overlaps(box, o) for o in others):
                continue
            # prefer right, slightly lower; rot=0 preferred
            score = x + y * 0.15 + (100 if rot == 0 else 0)
            candidates.append((score, x, y, rot, box))

candidates.sort(reverse=True)
print(f"candidates: {len(candidates)}")
for c in candidates[:10]:
    print(f"  {c[1]},{c[2]} rot={c[3]} score={c[0]:.1f}")

if not candidates:
    raise SystemExit("no free slot for ANZEIGE-up orientation")

_, x, y, rot, box = candidates[0]
j5 = find("J5")

# collect old pad positions before move
old_pads = []
for pad in j5.Pads():
    p = pad.GetPosition()
    old_pads.append((to_mm(p.x), to_mm(p.y), pad.GetNumber(), pad.GetNetname()))

j5.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
j5.SetOrientationDegrees(rot)

new_pads = {}
for pad in j5.Pads():
    p = pad.GetPosition()
    new_pads[pad.GetNumber()] = (to_mm(p.x), to_mm(p.y), pad.GetNetname())
print(f"J5 -> ({x},{y}) rot={rot}")
print("pads", new_pads)
print("courtyard", box)

# Remove tracks touching old or new J5 pads / old corridor fanouts
kill = []
watch = [(op[0], op[1]) for op in old_pads] + [(v[0], v[1]) for v in new_pads.values()]
# also previous known fanout points
watch += [(200.0, 102.08), (200.0, 91.92), (200.0, 104.9), (183.0, 104.9)]

for track in list(board.GetTracks()):
    if track.GetClass() != "PCB_TRACK":
        continue
    sx, sy = to_mm(track.GetStart().x), to_mm(track.GetStart().y)
    ex, ey = to_mm(track.GetEnd().x), to_mm(track.GetEnd().y)
    for wx, wy in watch:
        if near(sx, sy, wx, wy) or near(ex, ey, wx, wy):
            kill.append(track)
            break

uniq = []
for t in kill:
    if t not in uniq:
        uniq.append(t)
print("remove tracks", len(uniq))
for t in uniq:
    board.Remove(t)

def netcode(name):
    return board.FindNet(name).GetNetCode()

def add_track(x1, y1, x2, y2, net_name, width=0.3):
    if abs(x1 - x2) < 0.01 and abs(y1 - y2) < 0.01:
        return
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(mm(x1), mm(y1)))
    t.SetEnd(pcbnew.VECTOR2I(mm(x2), mm(y2)))
    t.SetWidth(mm(width))
    t.SetLayer(pcbnew.F_Cu)
    t.SetNetCode(netcode(net_name))
    board.Add(t)

def nearest_pad(px, py, net_name):
    best, best_d = None, 1e9
    for fp in board.GetFootprints():
        if fp.GetReference() == "J5":
            continue
        for pad in fp.Pads():
            if pad.GetNetname() != net_name:
                continue
            p = pad.GetPosition()
            qx, qy = to_mm(p.x), to_mm(p.y)
            d = ((qx - px) ** 2 + (qy - py) ** 2) ** 0.5
            if d < best_d:
                best_d = d
                best = (qx, qy, fp.GetReference())
    return best, best_d

# Route 5V only; GND via PTH + zone
p5x, p5y, _ = new_pads["1"]
t5, d5 = nearest_pad(p5x, p5y, "/5V")
print("5V target", t5, d5)

# Orthogonal path that stays outside body as much as possible:
# leave pad south/north then toward target
# For rot=0 pads are left/right of center at same Y
if t5:
    tx, ty, _ = t5
    # go vertically first away from body display (-Y), i.e. toward +Y (body south)
    mid_y = p5y + 6.0  # below pads
    # keep mid_y on board
    mid_y = min(mid_y, BOARD[3] - 2)
    add_track(p5x, p5y, p5x, mid_y, "/5V")
    add_track(p5x, mid_y, tx, mid_y, "/5V")
    add_track(tx, mid_y, tx, ty, "/5V")

for zone in board.Zones():
    zone.SetLocalClearance(mm(0.2))
    zone.SetThermalReliefGap(mm(0.25))
    zone.SetThermalReliefSpokeWidth(mm(0.25))

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)
print("saved")
