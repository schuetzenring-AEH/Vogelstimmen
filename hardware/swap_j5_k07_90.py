"""Replace J5 with K07.90 footprint. Strip J5 fanout tracks; do NOT re-route."""
import sys
sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew

PCB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.2.kicad_pcb"
FP = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\footprints\vogelstimmen.pretty\K07.90.kicad_mod"

board = pcbnew.LoadBoard(PCB)

def mm(x):
    return pcbnew.FromMM(x)

def to_mm(v):
    return pcbnew.ToMM(v)

def near(ax, ay, bx, by, tol=0.5):
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 < tol

j5 = None
for fp in board.GetFootprints():
    if fp.GetReference() == "J5":
        j5 = fp
        break
if not j5:
    raise SystemExit("J5 not found")

old_pos = j5.GetPosition()
old_pads = []
for pad in j5.Pads():
    p = pad.GetPosition()
    old_pads.append((to_mm(p.x), to_mm(p.y), pad.GetNumber(), pad.GetNetname()))
print("old pads", old_pads)
print("old at", to_mm(old_pos.x), to_mm(old_pos.y), "rot", j5.GetOrientationDegrees())

# Remember nets on pads 1/2 before delete
net1 = net2 = None
for x, y, num, net in old_pads:
    if num == "1":
        net1 = net
    elif num == "2":
        net2 = net

# Remove tracks touching old J5 pads
kill = []
for track in list(board.GetTracks()):
    if track.GetClass() != "PCB_TRACK":
        continue
    sx, sy = to_mm(track.GetStart().x), to_mm(track.GetStart().y)
    ex, ey = to_mm(track.GetEnd().x), to_mm(track.GetEnd().y)
    for ox, oy, *_ in old_pads:
        if near(sx, sy, ox, oy) or near(ex, ey, ox, oy):
            kill.append(track)
            break
for t in kill:
    board.Remove(t)
print("removed tracks", len(kill))

# Load new footprint
new_fp = pcbnew.FootprintLoad(
    r"C:\Users\Schue\Projects\Vogelstimmen\hardware\footprints\vogelstimmen.pretty",
    "K07.90",
)
if not new_fp:
    raise SystemExit("FootprintLoad failed for K07.90")

path = j5.GetPath()
ref = j5.GetReference()
# place: keep roughly right side; rot 0 so ANZEIGE toward board top (-Y)
# Body 28.5x36 — find simple spot: center-right
place = pcbnew.VECTOR2I(mm(190.0), mm(100.0))

board.Remove(j5)
new_fp.SetReference(ref)
new_fp.SetValue("K07.90")
new_fp.SetPosition(place)
new_fp.SetOrientationDegrees(0)
new_fp.SetPath(path)
board.Add(new_fp)

# Assign nets to pads 1/2; pad 3 (MP) stays unconnected
for pad in new_fp.Pads():
    n = pad.GetNumber()
    if n == "1" and net1:
        pad.SetNet(board.FindNet(net1))
    elif n == "2" and net2:
        pad.SetNet(board.FindNet(net2))

# Zone refill (keeps pours sane; user routes later)
for zone in board.Zones():
    zone.SetLocalClearance(mm(0.2))
filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())

pcbnew.SaveBoard(PCB, board)
print("J5 -> K07.90 at", to_mm(place.x), to_mm(place.y), "rot=0")
for pad in new_fp.Pads():
    p = pad.GetPosition()
    print(f"  pad{pad.GetNumber()} ({to_mm(p.x):.2f},{to_mm(p.y):.2f}) {pad.GetNetname()}")
print("No new tracks added — route yourself.")
