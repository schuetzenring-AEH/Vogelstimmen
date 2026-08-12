"""Place J5 in free right-side slot, restore TP2, route pads, refill zones."""
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

def pos(fp):
    p = fp.GetPosition()
    return to_mm(p.x), to_mm(p.y)

def near(ax, ay, bx, by, tol=0.6):
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 < tol

# --- restore TP2 ---
tp2 = find("TP2")
tp2.SetPosition(pcbnew.VECTOR2I(mm(180.0), mm(99.5)))

# Retarget any track endpoints left at old TP2 (168, 99.5) back to 180,99.5
for track in board.GetTracks():
    if track.GetClass() != "PCB_TRACK":
        continue
    for getter, setter in (
        (track.GetStart, track.SetStart),
        (track.GetEnd, track.SetEnd),
    ):
        p = getter()
        if near(to_mm(p.x), to_mm(p.y), 168.0, 99.5):
            setter(pcbnew.VECTOR2I(mm(180.0), mm(99.5)))

# --- place J5 ---
j5 = find("J5")
NEW = (200.0, 97.0)
j5.SetPosition(pcbnew.VECTOR2I(mm(NEW[0]), mm(NEW[1])))
j5.SetOrientationDegrees(90)

# Read actual pad positions after rotation
pads = {}
for pad in j5.Pads():
    p = pad.GetPosition()
    pads[pad.GetNumber()] = (to_mm(p.x), to_mm(p.y), pad.GetNetname())
print("J5 pads:", pads)

# Remove track segments that still end on previous J5 pad locations
OLD_LOCS = [
    (186.92, 112.0), (197.08, 112.0),
    (186.92, 92.0), (197.08, 92.0),
    (180.42, 84.725), (190.58, 84.725),
    (185.5 - 5.08, 84.725), (185.5 + 5.08, 84.725),
]
removed = 0
to_delete = []
for track in board.GetTracks():
    if track.GetClass() != "PCB_TRACK":
        continue
    sx, sy = to_mm(track.GetStart().x), to_mm(track.GetStart().y)
    ex, ey = to_mm(track.GetEnd().x), to_mm(track.GetEnd().y)
    for ox, oy in OLD_LOCS:
        if near(sx, sy, ox, oy) or near(ex, ey, ox, oy):
            # only remove short stubs that were J5 fanouts
            length = ((sx - ex) ** 2 + (sy - ey) ** 2) ** 0.5
            if length < 25:
                to_delete.append(track)
                break

for tr in to_delete:
    board.Remove(tr)
    removed += 1

# Add simple routes from nearby same-net copper to J5 pads
# Prefer connect to nearest existing track endpoint / pad of same net

def netcode(name):
    n = board.FindNet(name)
    return n.GetNetCode() if n else 0

def add_track(x1, y1, x2, y2, net_name, width=0.3, layer=pcbnew.F_Cu):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(mm(x1), mm(y1)))
    t.SetEnd(pcbnew.VECTOR2I(mm(x2), mm(y2)))
    t.SetWidth(mm(width))
    t.SetLayer(layer)
    t.SetNetCode(netcode(net_name))
    board.Add(t)

# Find nearest point on same net to each pad
def nearest_same_net(px, py, net_name, exclude_refs=("J5",)):
    best = None
    best_d = 1e9
    for fp in board.GetFootprints():
        if fp.GetReference() in exclude_refs:
            continue
        for pad in fp.Pads():
            if pad.GetNetname() != net_name:
                continue
            p = pad.GetPosition()
            x, y = to_mm(p.x), to_mm(p.y)
            d = ((x - px) ** 2 + (y - py) ** 2) ** 0.5
            if d < best_d:
                best_d = d
                best = (x, y, f"pad {fp.GetReference()}")
    for track in board.GetTracks():
        if track.GetClass() != "PCB_TRACK":
            continue
        if track.GetNetname() != net_name:
            continue
        for p in (track.GetStart(), track.GetEnd()):
            x, y = to_mm(p.x), to_mm(p.y)
            d = ((x - px) ** 2 + (y - py) ** 2) ** 0.5
            if d < best_d:
                best_d = d
                best = (x, y, "track")
    return best, best_d

added = 0
for num, (px, py, net) in pads.items():
    tgt, dist = nearest_same_net(px, py, net)
    print(f"  pad{num} {net} -> {tgt} d={dist:.2f}")
    if tgt and dist > 0.2:
        # L-route: horizontal then vertical to avoid long diagonals through parts
        tx, ty, _ = tgt
        if abs(tx - px) > 0.2 and abs(ty - py) > 0.2:
            # corner at (px, ty) — stay near right edge for 5V/GND
            add_track(px, py, px, ty, net)
            add_track(px, ty, tx, ty, net)
            added += 2
        else:
            add_track(px, py, tx, ty, net)
            added += 1

# Zone clearance + refill
for zone in board.Zones():
    zone.SetLocalClearance(mm(0.2))
    zone.SetThermalReliefGap(mm(0.25))
    zone.SetThermalReliefSpokeWidth(mm(0.25))

filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())

pcbnew.SaveBoard(PCB, board)
print(f"J5 -> {pos(j5)} rot={j5.GetOrientationDegrees()}")
print(f"TP2 -> {pos(tp2)}")
print(f"removed stubs={removed}, added tracks={added}")
print("zones refilled, saved")
