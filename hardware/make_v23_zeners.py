"""Copy v2.2 → v2.3; place D11/D12 (BZX84C6V2) + R7/R8 (4k7) near Q5/Q1. No routing."""
import shutil
import sys

sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew

SRC = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.2.kicad_pcb"
DST = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.3.kicad_pcb"
FP_LIB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\footprints\vogelstimmen.pretty"
R_LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Resistor_SMD.pretty"

shutil.copy2(SRC, DST)
board = pcbnew.LoadBoard(DST)

def mm(x):
    return pcbnew.FromMM(x)

def to_mm(v):
    return pcbnew.ToMM(v)

def find(ref):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    return None

for ref in ("D11", "D12", "R7", "R8"):
    fp = find(ref)
    if fp:
        board.Remove(fp)

q5, q1 = find("Q5"), find("Q1")
qx5, qy5 = to_mm(q5.GetPosition().x), to_mm(q5.GetPosition().y)
qx1, qy1 = to_mm(q1.GetPosition().x), to_mm(q1.GetPosition().y)
q5_nets = {p.GetNumber(): p.GetNetname() for p in q5.Pads()}
q1_nets = {p.GetNumber(): p.GetNetname() for p in q1.Pads()}
# SOT-23 FET: 1=G 2=S 3=D
q5_g, q5_s = q5_nets["1"], q5_nets["2"]
q1_g, q1_s = q1_nets["1"], q1_nets["2"]
print("Q5", qx5, qy5, "G", q5_g, "S", q5_s)
print("Q1", qx1, qy1, "G", q1_g, "S", q1_s)

def add_zener(ref, x, y, rot, net_k, net_a):
    fp = pcbnew.FootprintLoad(FP_LIB, "BZX84C6V2")
    if not fp:
        raise RuntimeError("BZX84C6V2 footprint missing")
    fp.SetReference(ref)
    fp.SetValue("BZX84C6V2")
    fp.SetFPID(pcbnew.LIB_ID("vogelstimmen", "BZX84C6V2"))
    fp.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    fp.SetOrientationDegrees(rot)
    for pad in fp.Pads():
        n = pad.GetNumber()
        if n == "1" and net_k:  # K
            pad.SetNet(board.FindNet(net_k))
        elif n == "2" and net_a:  # A
            pad.SetNet(board.FindNet(net_a))
        # pad 3 NC
    board.Add(fp)
    print(f"  {ref} @ ({x:.2f},{y:.2f}) rot={rot} K={net_k} A={net_a}")

def add_res(ref, x, y, rot, net_a, net_b):
    fp = pcbnew.FootprintLoad(R_LIB, "R_0402_1005Metric")
    if not fp:
        raise RuntimeError("R_0402 missing")
    fp.SetReference(ref)
    fp.SetValue("4.7k")
    fp.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    fp.SetOrientationDegrees(rot)
    for pad in fp.Pads():
        if pad.GetNumber() == "1" and net_a:
            pad.SetNet(board.FindNet(net_a))
        elif pad.GetNumber() == "2" and net_b:
            pad.SetNet(board.FindNet(net_b))
    board.Add(fp)
    print(f"  {ref} @ ({x:.2f},{y:.2f}) rot={rot}")

# Near Q5 (160.5, 117.5): D11 clamp G-S, R7 toward R6 (156, 116.5)
add_zener("D11", qx5 - 3.2, qy5 + 2.8, 270, q5_s, q5_g)
add_res("R7", qx5 - 4.2, qy5 - 0.5, 90, q5_g, q5_g)  # both gate until user splits R6 path

# Near Q1 (167, 105.5): D12 clamp, R8 toward Q2 (~173, 103.5)
add_zener("D12", qx1 - 3.2, qy1 - 2.8, 90, q1_s, q1_g)
add_res("R8", qx1 + 2.8, qy1 + 2.2, 0, q1_g, q1_g)

for zone in board.Zones():
    zone.SetLocalClearance(mm(0.2))
pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(DST, board)
print("saved", DST)
