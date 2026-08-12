"""Fix latch: Q3→LATCH_SET; active-low cold-start via BTN_OR + Q4 inverter + D13."""
import pcbnew
from collections import defaultdict

PCB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.3.kicad_pcb"
R_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Resistor_SMD.pretty"
D_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Diode_SMD.pretty"
Q_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Package_TO_SOT_SMD.pretty"

board = pcbnew.LoadBoard(PCB)

def mm(x):
    return pcbnew.FromMM(x)

def ensure_net(name):
    n = board.FindNet(name)
    if n and n.GetNetCode() > 0:
        return n
    item = pcbnew.NETINFO_ITEM(board, name)
    board.Add(item)
    return board.FindNet(name)

def fp(ref):
    for f in board.GetFootprints():
        if f.GetReference() == ref:
            return f
    return None

def set_pad_net(ref, padnum, netname):
    f = fp(ref)
    net = ensure_net(netname) if netname else board.FindNet("")
    for p in f.Pads():
        if p.GetNumber() == str(padnum):
            p.SetNet(net)
            print(f"  {ref}.{padnum} -> {netname!r}")
            return
    raise KeyError(f"{ref}.{padnum}")

# --- nets ---
ensure_net("/BTN_OR")
ensure_net("/SET_PULSE")
ensure_net("/LATCH_SET")
ensure_net("/LATCH_GATE")

# 1) Q3 release must pull Q2 gate (LATCH_SET), not LATCH_GATE
print("Q3 drain -> LATCH_SET")
set_pad_net("Q3", "3", "/LATCH_SET")

# Remove copper that still ties Q3 pad3 area wrongly: any track endpoint very near old Q3 drain
# Safer: delete tracks whose BOTH ends are only on LATCH_GATE between Q2-Q3 short path — skip auto-delete;
# just fix pads; user may need to re-route Q3.D. Remove tracks connected to Q3 pad 3 by net mismatch after refill.

# 2) Flip D1-D8: K=IOx (pad1), A=BTN_OR (pad2)  [SOD-323 pad1=K, pad2=A]
print("Flip D1-D8 for active-low wired-OR")
for i in range(1, 9):
    set_pad_net(f"D{i}", "1", f"/IO{i-1}")   # K
    set_pad_net(f"D{i}", "2", "/BTN_OR")      # A

# 3) Remove old footprints if re-running
for ref in ("Q4", "R9", "R10", "D13"):
    old = fp(ref)
    if old:
        board.Remove(old)
        print("removed", ref)

# Place near Q2 (173, 103.5) / Q3 (160, 105)
def add_r(ref, value, x, y, rot, n1, n2):
    f = pcbnew.FootprintLoad(R_LIB, "R_0402_1005Metric")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        if p.GetNumber() == "1":
            p.SetNet(ensure_net(n1))
        elif p.GetNumber() == "2":
            p.SetNet(ensure_net(n2))
    board.Add(f)
    print(f"  add {ref} @ ({x},{y})")

def add_q(ref, value, x, y, rot, g, s, d):
    f = pcbnew.FootprintLoad(Q_LIB, "SOT-23")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        n = p.GetNumber()
        if n == "1":
            p.SetNet(ensure_net(g))
        elif n == "2":
            p.SetNet(ensure_net(s))
        elif n == "3":
            p.SetNet(ensure_net(d))
    board.Add(f)
    print(f"  add {ref} @ ({x},{y})")

def add_d(ref, value, x, y, rot, k, a):
    f = pcbnew.FootprintLoad(D_LIB, "D_SOD-323")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        if p.GetNumber() == "1":
            p.SetNet(ensure_net(k))
        elif p.GetNumber() == "2":
            p.SetNet(ensure_net(a))
    board.Add(f)
    print(f"  add {ref} @ ({x},{y})")

# R9: 10k 12V_PROT → BTN_OR
add_r("R9", "10k", 176.5, 100.5, 0, "/12V_PROT", "/BTN_OR")
# Q4: 2N7002 Gate=BTN_OR, S=GND, D=SET_PULSE
add_q("Q4", "2N7002", 178.5, 103.5, 0, "/BTN_OR", "/GND", "/SET_PULSE")
# R10: 47k 12V_PROT → SET_PULSE
add_r("R10", "47k", 178.5, 100.5, 0, "/12V_PROT", "/SET_PULSE")
# D13: A=SET_PULSE → K=LATCH_SET  (steer: only pull SET high, never low)
add_d("D13", "1N4148WS", 176.0, 106.5, 90, "/LATCH_SET", "/SET_PULSE")

# Delete tracks that short Q3.D into LATCH_GATE: tracks on LATCH_GATE touching Q3 drain pad
q3 = fp("Q3")
q3d = None
for p in q3.Pads():
    if p.GetNumber() == "3":
        q3d = p.GetPosition()
        break

removed = 0
for t in list(board.GetTracks()):
    if t.Type() != pcbnew.PCB_TRACE_T:
        continue
    if t.GetNetname() != "/LATCH_GATE":
        continue
    # remove segments close to former Q3 drain (within 1.5mm)
    for end in (t.GetStart(), t.GetEnd()):
        dx = pcbnew.ToMM(end.x - q3d.x)
        dy = pcbnew.ToMM(end.y - q3d.y)
        if dx * dx + dy * dy < 1.5 * 1.5:
            board.Remove(t)
            removed += 1
            break
print(f"removed {removed} LATCH_GATE segments near Q3.D")

# Also remove diode copper that assumed old nets — tracks on LATCH_SET near D1-D8 cathodes formerly
# Leave most routing; ratsnest will show BTN_OR / SET_PULSE / Q3.D

filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)

print("\nMembership check:")
pads = defaultdict(list)
for f in board.GetFootprints():
    for p in f.Pads():
        if p.GetNetname() in ("/BTN_OR", "/SET_PULSE", "/LATCH_SET", "/LATCH_GATE"):
            pads[p.GetNetname()].append(f"{f.GetReference()}.{p.GetNumber()}")
for n in sorted(pads):
    print(n, sorted(pads[n]))
print("saved", PCB)
