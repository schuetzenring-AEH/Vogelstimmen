"""Schematic: replace Q4 inverter Kaltstart with Q6 P-FET SET (v2.4 / ≈0 µA)."""
from pathlib import Path
import re
import uuid

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.kicad_sch")
text = SCH.read_text(encoding="utf-8")


def U():
    return str(uuid.uuid4())


# Remove previously appended Q4 block if present (from uuid marker)
# Soft approach: rename Q4 symbol reference to unused and add note — cleaner to strip by uuid
for marker in (
    "b0000001-0001-4000-8000-0000000000q4",
    "b0000001-0001-4000-8000-0000000000r9",
    "b0000001-0001-4000-8000-000000000r10",
    "b0000001-0001-4000-8000-000000000d13",
):
    if marker in text:
        print("found", marker)

# Update text note if present
text = text.replace(
    "Latch Kaltstart: BTN_OR + Q4 + D13 — Taster→GND setzt Latch auch ohne 5V",
    "Latch Kaltstart v2.4: BTN_OR + Q6(P-FET)+D14/R11 + R10/D13 — ≈0 µA Idle (kein R nach GND)",
)

# If Q4 symbol exists, change Reference/Value to Q6 SI2301 and fix footprint note via replace
if '(property "Reference" "Q4"' in text and "b0000001-0001-4000-8000-0000000000q4" in text:
    # Replace the Q4 2N7002 symbol header with Q6 as BSS84/SI2301 placeholder
    text = text.replace(
        '(uuid "b0000001-0001-4000-8000-0000000000q4")\n\t\t(property "Reference" "Q4"',
        '(uuid "b0000001-0001-4000-8000-0000000000q6")\n\t\t(property "Reference" "Q6"',
        1,
    )
    # Only the Kaltstart Q4 instance — change lib and value nearby
    text = text.replace(
        '(uuid "b0000001-0001-4000-8000-0000000000q6")\n\t\t(property "Reference" "Q6"\n\t\t\t(at 190.5 60.96 0)\n\t\t\t(effects (font (size 1.27 1.27)))\n\t\t)\n\t\t(property "Value" "2N7002"',
        '(uuid "b0000001-0001-4000-8000-0000000000q6")\n\t\t(property "Reference" "Q6"\n\t\t\t(at 190.5 60.96 0)\n\t\t\t(effects (font (size 1.27 1.27)))\n\t\t)\n\t\t(property "Value" "SI2301"',
        1,
    )
    text = text.replace(
        '(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"\n\t\t\t\t\t(reference "Q4")\n\t\t\t\t\t(unit 1)',
        '(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"\n\t\t\t\t\t(reference "Q6")\n\t\t\t\t\t(unit 1)',
        1,
    )
    # Change lib_id of that symbol from 2N7002 to BSS84 (same as other SI2301)
    # Find block - the Kaltstart one is at 185.42 60.96
    text = text.replace(
        '(lib_id "Transistor_FET:2N7002")\n\t\t(at 185.42 60.96 0)',
        '(lib_id "Transistor_FET:BSS84")\n\t\t(at 185.42 60.96 0)\n\t\t(mirror x)',
        1,
    )
    print("Q4 -> Q6 SI2301")

# R10 value 47k -> 1k (series)
text = text.replace(
    '(uuid "b0000001-0001-4000-8000-000000000r10")\n\t\t(property "Reference" "R10"\n\t\t\t(at 198.12 50.8 0)\n\t\t\t(effects (font (size 1.27 1.27)))\n\t\t)\n\t\t(property "Value" "47k"',
    '(uuid "b0000001-0001-4000-8000-000000000r10")\n\t\t(property "Reference" "R10"\n\t\t\t(at 198.12 50.8 0)\n\t\t\t(effects (font (size 1.27 1.27)))\n\t\t)\n\t\t(property "Value" "1k"',
    1,
)
print("R10 -> 1k")

# Append R11 + D14 if missing
if "b0000001-0001-4000-8000-000000000r11" not in text:
    block = f'''
	(symbol
		(lib_id "Device:R")
		(at 205.74 50.8 0)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-000000000r11")
		(property "Reference" "R11"
			(at 208.28 50.8 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "4.7k"
			(at 208.28 53.34 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "Resistor_SMD:R_0402_1005Metric"
			(at 205.74 50.8 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(property "Description" "Q6 gate series for VGS clamp"
			(at 205.74 50.8 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "R11")
					(unit 1)
				)
			)
		)
	)
	(symbol
		(lib_id "Device:D")
		(at 205.74 60.96 90)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-000000000d14")
		(property "Reference" "D14"
			(at 200.66 60.96 90)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "BZX84C6V2"
			(at 198.12 60.96 90)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "vogelstimmen:BZX84C6V2"
			(at 205.74 60.96 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(property "LCSC" "C179522"
			(at 205.74 60.96 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(property "Description" "VGS clamp Q6 SET P-FET; K=12V_PROT A=Q6_GATE"
			(at 205.74 60.96 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "D14")
					(unit 1)
				)
			)
		)
	)
	(label "BTN_OR"
		(at 205.74 46.99 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "Q6_GATE"
		(at 205.74 54.61 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "12V_PROT"
		(at 205.74 57.15 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "Q6_GATE"
		(at 205.74 64.77 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "SET_DRV"
		(at 180.34 55.88 90)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
'''
    if not text.rstrip().endswith(")"):
        raise SystemExit("bad ending")
    text = text.rstrip()[:-1] + block + "\n)\n"
    print("appended R11 D14")

# Relabel old SET_PULSE on Q4 drain area: keep SET_PULSE/SET_DRV notes in text
# Change label near 185.42 that said BTN_OR on gate — leave; user wires in Eeschema

SCH.write_text(text, encoding="utf-8")
print("saved", SCH)
