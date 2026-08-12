"""Fix VGS net-labels: place exactly on pin tips + split Q5/Q1 gate nets."""
from pathlib import Path
import re

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.kicad_sch")
text = SCH.read_text(encoding="utf-8")

# (uuid, new_name, x, y)
FIXES = [
    # D11: K=BAT+, A=Q5_GATE  (ERC pin coords)
    ("946247fc-9453-4d4d-bee9-dc1d85dbadef", "BAT+", 40.64, 72.39),
    ("78334881-fc2a-4315-82d7-89dcfd0bf936", "Q5_GATE", 40.64, 64.77),
    # R7: gate side / pull-down side
    ("00dc8bd1-99a6-4014-b9ac-e05fac2323c6", "Q5_GATE", 48.26, 69.85),
    ("5f576549-f8cf-4fb2-aff7-754457bf4cb4", "Q5_G_PD", 48.26, 77.47),
    # D12: K=12V_PROT, A=Q1_GATE
    ("7825f255-ff7e-4042-92f4-5b4722459162", "12V_PROT", 127.0, 72.39),
    ("ab68709a-6b47-4405-8435-12ced2c48b9d", "Q1_GATE", 127.0, 64.77),
    # R8: gate / latch drive
    ("a60924ba-c8be-4b9a-a50b-16a1c7b98b20", "Q1_GATE", 137.16, 69.85),
    ("089fe24d-1c84-482c-93ad-371038f4841f", "LATCH_GATE", 137.16, 77.47),
    # Main circuit: split old RPP_GATE / LATCH_GATE
    ("c1000000-0000-4000-8000-00000000001d", "Q5_GATE", 50.8, 40.64),  # Q5.G
    ("c1000000-0000-4000-8000-00000000001e", "Q5_G_PD", 50.8, 46.99),  # R6↑
    ("c1000000-0000-4000-8000-000000000028", "Q1_GATE", 134.62, 40.64),  # Q1.G
    ("c1000000-0000-4000-8000-000000000027", "Q1_GATE", 132.08, 36.83),  # R1↓
]

for uuid, name, x, y in FIXES:
    pat = re.compile(
        rf'\(label "[^"]+"\s*\n\s*\(at [0-9.]+ [0-9.]+ [0-9]+\)\s*\n'
        rf'\s*\(effects\s*\n\s*\(font\s*\n\s*\(size 1\.27 1\.27\)\s*\n\s*\)\s*\n\s*\)\s*\n'
        rf'\s*\(uuid "{uuid}"\)\s*\n\s*\)',
        re.MULTILINE,
    )
    repl = (
        f'(label "{name}"\n'
        f'\t\t(at {x} {y} 0)\n'
        f'\t\t(effects\n'
        f'\t\t\t(font\n'
        f'\t\t\t\t(size 1.27 1.27)\n'
        f'\t\t\t)\n'
        f'\t\t)\n'
        f'\t\t(uuid "{uuid}")\n'
        f'\t)'
    )
    new_text, n = pat.subn(repl, text, count=1)
    if n != 1:
        # try with rotation on at-line
        pat2 = re.compile(
            rf'\(label "[^"]+"\s*\n\s*\(at [0-9.]+ [0-9.]+ [0-9]+\)\s*\n'
            rf'\s*\(effects\s*\n\s*\(font\s*\n\s*\(size 1\.27 1\.27\)\s*\n\s*\)\s*\n\s*\)\s*\n'
            rf'\s*\(uuid "{uuid}"\)\s*\n\s*\)',
            re.MULTILINE,
        )
        new_text, n = pat2.subn(repl, text, count=1)
    if n != 1:
        raise SystemExit(f"FAILED uuid={uuid} name={name} matches={n}")
    text = new_text
    print(f"OK {name} @ ({x},{y}) {uuid[:8]}")

SCH.write_text(text, encoding="utf-8")
print("saved", SCH)
