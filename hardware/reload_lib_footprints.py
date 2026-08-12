"""Reload D15-D22 / R13 / C4 / R12 from library-matching donors (keep pos/nets/value)."""
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
    nets = {old.Pads()[i].GetNumber(): old.Pads()[i].GetNet() for i in range(len(old.Pads()))}
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
    for i in range(len(new.Pads())):
        p = new.Pads()[i]
        n = nets.get(p.GetNumber())
        if n is not None:
            p.SetNet(n)
    board.Delete(old)
    # courtyard count
    cr = sum(
        1
        for g in new.GraphicalItems()
        if g.GetLayer() in (pcbnew.F_CrtYd, pcbnew.B_CrtYd)
    )
    print(f"OK {ref} <- {donor_ref}  courtyard_items={cr}")


def main():
    board = pcbnew.LoadBoard(BOARD)
    for i in range(8):
        replace_with_donor(board, f"D{15+i}", "D1")
    replace_with_donor(board, "R13", "R3")
    replace_with_donor(board, "C4", "C3")
    replace_with_donor(board, "R12", "R3")
    board.BuildConnectivity()
    board.Save(BOARD)
    print("Saved — move D15–D22 as needed, then refill zones / DRC")


if __name__ == "__main__":
    main()
