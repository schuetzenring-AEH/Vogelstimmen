"""Delete leftover GND stubs near J5; keep clean 5V fanout; refill zones."""
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

j5 = find("J5")
pads = {}
for pad in j5.Pads():
    p = pad.GetPosition()
    pads[pad.GetNumber()] = (to_mm(p.x), to_mm(p.y), pad.GetNetname())
p5x, p5y, _ = pads["1"]
pgx, pgy, _ = pads["2"]

kill = []
for track in board.GetTracks():
    if track.GetClass() != "PCB_TRACK":
        continue
    sx, sy = to_mm(track.GetStart().x), to_mm(track.GetStart().y)
    ex, ey = to_mm(track.GetEnd().x), to_mm(track.GetEnd().y)
    net = track.GetNetname()
    # orphan fanouts from earlier attempts in right corridor
    in_band = min(sx, ex) >= 182 and max(sx, ex) <= 205 and min(sy, ey) >= 90 and max(sy, ey) <= 110
    if net == "/GND" and in_band:
        # remove ALL GND tracks we added in this band (zone handles J5 GND)
        # but keep tracks that connect real parts left of 186 if they're short power ties?
        if min(sx, ex) >= 186 or abs(sx - 188) < 0.1 or abs(ex - 188) < 0.1:
            kill.append(track)
            continue
    # any track still on J5 pad centers
    for px, py in ((p5x, p5y), (pgx, pgy)):
        if ((sx - px) ** 2 + (sy - py) ** 2) ** 0.5 < 0.4 or ((ex - px) ** 2 + (ey - py) ** 2) ** 0.5 < 0.4:
            kill.append(track)

# dedupe
uniq = []
for t in kill:
    if t not in uniq:
        uniq.append(t)
print("remove", len(uniq))
for t in uniq:
    print(
        " ",
        t.GetNetname(),
        to_mm(t.GetStart().x),
        to_mm(t.GetStart().y),
        "->",
        to_mm(t.GetEnd().x),
        to_mm(t.GetEnd().y),
    )
    board.Remove(t)

def netcode(name):
    return board.FindNet(name).GetNetCode()

def add_track(x1, y1, x2, y2, net_name, width=0.3):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(mm(x1), mm(y1)))
    t.SetEnd(pcbnew.VECTOR2I(mm(x2), mm(y2)))
    t.SetWidth(mm(width))
    t.SetLayer(pcbnew.F_Cu)
    t.SetNetCode(netcode(net_name))
    board.Add(t)

# fresh 5V only
t5 = (183.0, 104.9)
add_track(p5x, p5y, p5x, t5[1], "/5V")
add_track(p5x, t5[1], t5[0], t5[1], "/5V")

for zone in board.Zones():
    zone.SetLocalClearance(mm(0.2))
    zone.SetThermalReliefGap(mm(0.25))
    zone.SetThermalReliefSpokeWidth(mm(0.25))

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)
print("saved")
