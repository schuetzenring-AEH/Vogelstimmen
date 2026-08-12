"""v2.3 → v2.4: replace Q4/R10 inverter with P-FET SET (≈0 µA standby)."""
import shutil
from collections import defaultdict
from pathlib import Path

import pcbnew

SRC = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.3.kicad_pcb")
DST = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb")
R_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Resistor_SMD.pretty"
D_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Diode_SMD.pretty"
Q_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Package_TO_SOT_SMD.pretty"
Z_LIB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\footprints\vogelstimmen.pretty"

if DST.exists():
    DST.unlink()
shutil.copy2(SRC, DST)
board = pcbnew.LoadBoard(str(DST))


def mm(x):
    return pcbnew.FromMM(x)


def ensure_net(name):
    n = board.FindNet(name)
    if n and n.GetNetCode() > 0:
        return n
    board.Add(pcbnew.NETINFO_ITEM(board, name))
    return board.FindNet(name)


def all_fps():
    return list(board.GetFootprints())


def fp(ref):
    for f in all_fps():
        if f.GetReference() == ref:
            return f
    return None


# Collect then remove (avoid iterator invalidation)
to_remove = []
for f in all_fps():
    if f.GetReference() in ("Q4", "R10", "Q6", "R11", "D14", "D13"):
        to_remove.append(f)
for f in to_remove:
    ref = f.GetReference()
    board.Remove(f)
    print("removed", ref)

for name in ("/BTN_OR", "/SET_DRV", "/SET_PULSE", "/Q6_GATE", "/LATCH_SET", "/12V_PROT"):
    ensure_net(name)


def add_r(ref, value, x, y, rot, n1, n2):
    f = pcbnew.FootprintLoad(R_LIB, "R_0402_1005Metric")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        p.SetNet(ensure_net(n1 if p.GetNumber() == "1" else n2))
    board.Add(f)
    print(f"add {ref} @ ({x},{y})")


def add_q_pfet(ref, value, x, y, rot, g, s, d):
    f = pcbnew.FootprintLoad(Q_LIB, "SOT-23")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        p.SetNet(ensure_net({"1": g, "2": s, "3": d}[p.GetNumber()]))
    board.Add(f)
    print(f"add {ref} @ ({x},{y})")


def add_z(ref, x, y, rot, k, a):
    f = pcbnew.FootprintLoad(Z_LIB, "BZX84C6V2")
    if not f:
        raise RuntimeError("BZX84C6V2 missing")
    f.SetReference(ref)
    f.SetValue("BZX84C6V2")
    f.SetFPID(pcbnew.LIB_ID("vogelstimmen", "BZX84C6V2"))
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        if p.GetNumber() == "1":
            p.SetNet(ensure_net(k))
        elif p.GetNumber() == "2":
            p.SetNet(ensure_net(a))
    board.Add(f)
    print(f"add {ref} @ ({x},{y})")


def add_d(ref, value, x, y, rot, k, a):
    f = pcbnew.FootprintLoad(D_LIB, "D_SOD-323")
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    f.SetOrientationDegrees(rot)
    for p in f.Pads():
        p.SetNet(ensure_net(k if p.GetNumber() == "1" else a))
    board.Add(f)
    print(f"add {ref} @ ({x},{y})")


r9 = fp("R9")
if r9:
    for p in r9.Pads():
        if p.GetNumber() == "1":
            p.SetNet(ensure_net("/12V_PROT"))
        elif p.GetNumber() == "2":
            p.SetNet(ensure_net("/BTN_OR"))
    print("R9 nets ok")
else:
    add_r("R9", "10k", 176.5, 100.5, 0, "/12V_PROT", "/BTN_OR")

for i in range(1, 9):
    d = fp(f"D{i}")
    if not d:
        continue
    for p in d.Pads():
        if p.GetNumber() == "1":
            p.SetNet(ensure_net(f"/IO{i-1}"))
        elif p.GetNumber() == "2":
            p.SetNet(ensure_net("/BTN_OR"))

q3 = fp("Q3")
for p in q3.Pads():
    if p.GetNumber() == "3":
        p.SetNet(ensure_net("/LATCH_SET"))
        print("Q3.3 -> LATCH_SET")

add_q_pfet("Q6", "SI2301", 178.5, 103.5, 0, "/Q6_GATE", "/12V_PROT", "/SET_DRV")
add_r("R11", "4.7k", 176.5, 103.5, 90, "/BTN_OR", "/Q6_GATE")
add_z("D14", 180.5, 106.0, 90, "/12V_PROT", "/Q6_GATE")
add_r("R10", "1k", 178.5, 100.5, 0, "/SET_DRV", "/SET_PULSE")
add_d("D13", "1N4148WS", 176.0, 106.5, 90, "/LATCH_SET", "/SET_PULSE")


def is_power(n):
    if any(x in n for x in ["GATE", "SET", "BUSY", "IO", "VOS", "V33", "BTN", "PULSE", "DRV"]):
        return False
    return any(k in n for k in ["BAT+", "12V_PROT", "12V_SW", "RPP_OUT", "SPK+", "SPK-"]) or n in (
        "/5V",
        "/SW",
        "/GND",
    )


for t in board.GetTracks():
    if t.Type() != pcbnew.PCB_TRACE_T:
        continue
    t.SetWidth(pcbnew.FromMM(0.5 if is_power(t.GetNetname()) else 0.3))

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(str(DST), board)

pads = defaultdict(list)
for f in all_fps():
    for p in f.Pads():
        n = p.GetNetname()
        if any(k in n for k in ["BTN", "SET", "LATCH", "Q6"]):
            pads[n].append(f"{f.GetReference()}.{p.GetNumber()}")
print("--- critical nets ---")
for n in sorted(pads):
    print(n, sorted(pads[n]))
print("saved", DST, "fps", len(all_fps()))
