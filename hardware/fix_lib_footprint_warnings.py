"""Replace stripped/cloned FPs with library-matching clones; keep pos/nets/value."""
from __future__ import annotations

import pcbnew

BOARD = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb"


def find_fp(board, ref: str):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    raise KeyError(ref)


def replace_with_donor(board, ref: str, donor_ref: str):
    old = find_fp(board, ref)
    donor = find_fp(board, donor_ref)
    nets = {p.GetNumber(): p.GetNet() for p in old.Pads()}
    value = old.GetValue()
    pos = old.GetPosition()
    ori = old.GetOrientation()
    layer = old.GetLayer()

    new = pcbnew.FOOTPRINT(donor)
    board.Add(new)
    new.SetReference(ref)
    new.SetValue(value)
    new.SetPosition(pos)
    new.SetOrientation(ori)
    new.SetLayer(layer)
    for p in new.Pads():
        n = nets.get(p.GetNumber())
        if n is not None:
            p.SetNet(n)
    board.Delete(old)
    print("refreshed", ref, "from", donor_ref)


def main():
    board = pcbnew.LoadBoard(BOARD)
    for i in range(8):
        replace_with_donor(board, f"D{15+i}", "D1")
    replace_with_donor(board, "R13", "R3")
    replace_with_donor(board, "C4", "C3")
    # R12 already has courtyard; refresh anyway for consistency
    replace_with_donor(board, "R12", "R3")

    # nudge diodes north if courtyard would hit U2 (top ~93.97)
    u2 = find_fp(board, "U2")
    u2_top = pcbnew.ToMM(u2.GetBoundingBox(False, False).GetTop())
    for i in range(8):
        d = find_fp(board, f"D{15+i}")
        # move up until courtyard bottom clears U2 top with 0.05 mm margin
        for _ in range(20):
            bb = d.GetBoundingBox(True, True)  # include courtyard
            bottom = pcbnew.ToMM(bb.GetBottom())
            if bottom <= u2_top - 0.05:
                break
            x = pcbnew.ToMM(d.GetX())
            y = pcbnew.ToMM(d.GetY())
            d.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(x), pcbnew.FromMM(y - 0.25)))
        print(
            f"D{15+i}",
            "y",
            round(pcbnew.ToMM(d.GetY()), 2),
            "crtyd_bottom",
            round(pcbnew.ToMM(d.GetBoundingBox(True, True).GetBottom()), 2),
        )

    board.BuildConnectivity()
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    board.Save(BOARD)
    print("Saved")


if __name__ == "__main__":
    main()
