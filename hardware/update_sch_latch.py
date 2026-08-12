"""Update schematic for latch cold-start (labels + Q4/R9/R10/D13)."""
from pathlib import Path
import re
import uuid

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.kicad_sch")
text = SCH.read_text(encoding="utf-8")

text, n1 = re.subn(
    r'\(label "LATCH_SET"\n\t\t\(at 125\.73 ([0-9.]+) ([0-9]+)\)',
    r'(label "BTN_OR"\n\t\t(at 125.73 \1 \2)',
    text,
)
print("BTN_OR renames", n1)

text, n2 = re.subn(
    r'\(label "LATCH_GATE"\n\t\t\(at 162\.56 55\.88 90\)',
    r'(label "LATCH_SET"\n\t\t(at 162.56 55.88 90)',
    text,
    count=1,
)
print("Q3 drain label", n2)


def U():
    return str(uuid.uuid4())


block = f'''
	(text "Latch Kaltstart: BTN_OR + Q4 + D13 — Taster→GND setzt Latch auch ohne 5V"
		(exclude_from_sim no)
		(at 175.26 48.26 0)
		(effects
			(font
				(size 1.27 1.27)
			)
			(justify left)
		)
		(uuid "{U()}")
	)
	(symbol
		(lib_id "Device:R")
		(at 185.42 50.8 0)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-0000000000r9")
		(property "Reference" "R9"
			(at 187.96 50.8 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "10k"
			(at 187.96 53.34 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "Resistor_SMD:R_0402_1005Metric"
			(at 185.42 50.8 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "R9")
					(unit 1)
				)
			)
		)
	)
	(symbol
		(lib_id "Device:R")
		(at 195.58 50.8 0)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-000000000r10")
		(property "Reference" "R10"
			(at 198.12 50.8 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "47k"
			(at 198.12 53.34 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "Resistor_SMD:R_0402_1005Metric"
			(at 195.58 50.8 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "R10")
					(unit 1)
				)
			)
		)
	)
	(symbol
		(lib_id "Transistor_FET:2N7002")
		(at 185.42 60.96 0)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-0000000000q4")
		(property "Reference" "Q4"
			(at 190.5 60.96 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "2N7002"
			(at 190.5 63.5 0)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "Package_TO_SOT_SMD:SOT-23"
			(at 185.42 60.96 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(pin "3" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "Q4")
					(unit 1)
				)
			)
		)
	)
	(symbol
		(lib_id "Device:D")
		(at 195.58 60.96 90)
		(unit 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(dnp no)
		(uuid "b0000001-0001-4000-8000-000000000d13")
		(property "Reference" "D13"
			(at 190.5 60.96 90)
			(effects (font (size 1.27 1.27)))
		)
		(property "Value" "1N4148WS"
			(at 188.0 60.96 90)
			(effects (font (size 1.27 1.27)))
		)
		(property "Footprint" "Diode_SMD:D_SOD-323"
			(at 195.58 60.96 0)
			(hide yes)
			(effects (font (size 1.27 1.27)))
		)
		(pin "1" (uuid "{U()}"))
		(pin "2" (uuid "{U()}"))
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "D13")
					(unit 1)
				)
			)
		)
	)
	(label "12V_PROT"
		(at 185.42 46.99 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "BTN_OR"
		(at 185.42 54.61 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "12V_PROT"
		(at 195.58 46.99 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "SET_PULSE"
		(at 195.58 54.61 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "BTN_OR"
		(at 180.34 60.96 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "GND"
		(at 185.42 66.04 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "SET_PULSE"
		(at 185.42 55.88 90)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "SET_PULSE"
		(at 195.58 64.77 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
	(label "LATCH_SET"
		(at 195.58 57.15 0)
		(effects (font (size 1.27 1.27)))
		(uuid "{U()}")
	)
'''

if "b0000001-0001-4000-8000-0000000000q4" in text:
    print("Q4 already in sch, skip append")
else:
    if not text.rstrip().endswith(")"):
        raise SystemExit("unexpected sch ending")
    text = text.rstrip()[:-1] + block + "\n)\n"
    print("appended parts")

SCH.write_text(text, encoding="utf-8")
print("saved", SCH)
