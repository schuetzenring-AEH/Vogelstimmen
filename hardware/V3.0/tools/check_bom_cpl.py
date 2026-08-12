import csv
from pathlib import Path

root = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0")
bom = list(csv.DictReader((root / "JLCPCB_BOM.csv").open(encoding="utf-8")))
cpl = list(csv.DictReader((root / "JLCPCB_CPL.csv").open(encoding="utf-8")))
bom_refs = set()
for row in bom:
    for r in row["Designator"].replace('"', "").split(","):
        bom_refs.add(r.strip())
cpl_refs = {r["Designator"] for r in cpl}
print("BOM", len(bom_refs), sorted(bom_refs))
print("CPL", len(cpl_refs), sorted(cpl_refs))
print("CPL not BOM", sorted(cpl_refs - bom_refs))
print("BOM not CPL", sorted(bom_refs - cpl_refs))
