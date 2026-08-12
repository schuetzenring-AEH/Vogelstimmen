"""Export JLCPCB fabrication package for Vogelstimmen V3.0."""
from __future__ import annotations

import csv
import pathlib
import shutil
import subprocess
import zipfile

ROOT = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0")
PCB = ROOT / "vogelstimmen_v3.0.kicad_pcb"
SCH = ROOT / "vogelstimmen_v3.0.kicad_sch"
KICAD_CLI = pathlib.Path(r"C:\Program Files\KiCad\10.0\bin\kicad-cli.exe")
GERBER = ROOT / "Gerber"

# Hand / DNP — not for JLCPCB SMT assembly
HAND_REFS = {
    "U2", "J1", "J2", "J3", "J4", "J5", "J6",
    "H1", "H2", "H3", "H4",
    "TP1", "TP2", "TP3", "TP4", "TP5",
}


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.check_call(cmd)


def export_gerbers() -> None:
    if GERBER.exists():
        shutil.rmtree(GERBER)
    GERBER.mkdir(parents=True)
    layers = ",".join(
        [
            "F.Cu",
            "B.Cu",
            "F.Paste",
            "B.Paste",
            "F.Silkscreen",
            "B.Silkscreen",
            "F.Mask",
            "B.Mask",
            "Edge.Cuts",
        ]
    )
    run(
        [
            str(KICAD_CLI),
            "pcb",
            "export",
            "gerbers",
            "--output",
            str(GERBER),
            "--layers",
            layers,
            "--subtract-soldermask",
            "--use-drill-file-origin",
            "--check-zones",
            str(PCB),
        ]
    )
    run(
        [
            str(KICAD_CLI),
            "pcb",
            "export",
            "drill",
            "--output",
            str(GERBER),
            "--format",
            "excellon",
            "--excellon-units",
            "mm",
            "--excellon-zeros-format",
            "decimal",
            "--generate-map",
            "--map-format",
            "gerberx2",
            "--excellon-separate-th",
            str(PCB),
        ]
    )


def export_pdfs() -> None:
    # Schematic PDF can fail if project is open/locked — continue without it.
    try:
        run(
            [
                str(KICAD_CLI),
                "sch",
                "export",
                "pdf",
                "--output",
                str(ROOT / "vogelstimmen_v3.0-schematic.pdf"),
                str(SCH),
            ]
        )
    except subprocess.CalledProcessError as e:
        print(f"WARN: schematic PDF failed ({e.returncode}) — close KiCad and re-run if needed")
    run(
        [
            str(KICAD_CLI),
            "pcb",
            "export",
            "pdf",
            "--output",
            str(ROOT / "vogelstimmen_v3.0-pcb.pdf"),
            "--layers",
            "F.Cu,B.Cu,F.Silkscreen,B.Silkscreen,Edge.Cuts,F.Mask,B.Mask",
            str(PCB),
        ]
    )


def export_pos_raw() -> pathlib.Path:
    out = ROOT / "vogelstimmen_v3.0-all-pos.csv"
    run(
        [
            str(KICAD_CLI),
            "pcb",
            "export",
            "pos",
            "--output",
            str(out),
            "--side",
            "both",
            "--format",
            "csv",
            "--units",
            "mm",
            "--use-drill-file-origin",
            "--exclude-dnp",
            str(PCB),
        ]
    )
    return out


def write_jlc_cpl(pos_path: pathlib.Path) -> tuple[int, int]:
    """Convert KiCad pos CSV → JLCPCB CPL (full + minimal)."""
    with pos_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    # KiCad 10 headers typically: Ref,Val,Package,PosX,PosY,Rot,Side
    def get(row: dict, *keys: str) -> str:
        for k in keys:
            if k in row and row[k] is not None:
                return row[k]
            for rk in row:
                if rk.lower() == k.lower():
                    return row[rk]
        raise KeyError(keys)

    smt = []
    for row in rows:
        ref = get(row, "Ref", "Designator")
        if ref in HAND_REFS:
            continue
        val = get(row, "Val", "Value", "Comment")
        pkg = get(row, "Package", "Footprint")
        x = float(get(row, "PosX", "Mid X", "X"))
        y = float(get(row, "PosY", "Mid Y", "Y"))
        rot = float(get(row, "Rot", "Rotation"))
        side = get(row, "Side", "Layer").lower()
        layer = "top" if side in ("top", "front") else "bottom"
        # JLCPCB often expects Y negated when using drill origin (match V2.5 style)
        smt.append(
            {
                "Designator": ref,
                "Val": val,
                "Package": pkg.split(":")[-1],
                "Mid X": f"{x:.6f}",
                "Mid Y": f"{y:.6f}",
                "Rotation": f"{rot:.6f}",
                "Layer": layer,
            }
        )

    smt.sort(key=lambda r: r["Designator"])

    full = ROOT / "JLCPCB_CPL.csv"
    with full.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["Designator", "Val", "Package", "Mid X", "Mid Y", "Rotation", "Layer"],
        )
        w.writeheader()
        w.writerows(smt)

    minimal = ROOT / "JLCPCB_CPL_minimal.csv"
    with minimal.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f, fieldnames=["Designator", "Mid X", "Mid Y", "Layer", "Rotation"]
        )
        w.writeheader()
        for r in smt:
            w.writerow(
                {
                    "Designator": r["Designator"],
                    "Mid X": r["Mid X"],
                    "Mid Y": r["Mid Y"],
                    "Layer": r["Layer"],
                    "Rotation": r["Rotation"],
                }
            )

    # also keep kicad raw name for reference
    shutil.copy(pos_path, ROOT / "vogelstimmen_v3.0-cpl.csv")
    return len(rows), len(smt)


def zip_gerbers() -> pathlib.Path:
    zip_path = ROOT / "vogelstimmen_v3.0-Gerber.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(GERBER.iterdir()):
            if p.is_file():
                zf.write(p, arcname=p.name)
    return zip_path


def main() -> None:
    print("=== V3.0 fabrication export ===")
    export_gerbers()
    export_pdfs()
    pos = export_pos_raw()
    n_all, n_smt = write_jlc_cpl(pos)
    z = zip_gerbers()
    print(f"POS rows: {n_all} total, {n_smt} SMT (JLCPCB)")
    print(f"Gerber zip: {z} ({z.stat().st_size} bytes)")
    print("Done.")


if __name__ == "__main__":
    main()
