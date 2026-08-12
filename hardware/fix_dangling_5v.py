"""Delete the dangling /5V stub (177.45,96.95)->(177.45,88.55)."""
import sys
sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew

PCB = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.2.kicad_pcb"
board = pcbnew.LoadBoard(PCB)

def to_mm(v):
    return pcbnew.ToMM(v)

def near(ax, ay, bx, by, tol=0.05):
    return abs(ax - bx) < tol and abs(ay - by) < tol

removed = 0
for track in list(board.GetTracks()):
    if track.GetClass() != "PCB_TRACK":
        continue
    if track.GetNetname() != "/5V":
        continue
    sx, sy = to_mm(track.GetStart().x), to_mm(track.GetStart().y)
    ex, ey = to_mm(track.GetEnd().x), to_mm(track.GetEnd().y)
    a = near(sx, sy, 177.45, 96.95) and near(ex, ey, 177.45, 88.55)
    b = near(sx, sy, 177.45, 88.55) and near(ex, ey, 177.45, 96.95)
    if a or b:
        board.Remove(track)
        removed += 1
        print("removed stub", sx, sy, ex, ey)

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)
print("removed", removed)
