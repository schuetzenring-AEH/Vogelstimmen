#!/usr/bin/env python3
"""Insert D11/D12 (BZX84C6V2) and R7/R8 (4k7) into vogelstimmen_v2.kicad_sch.
Does not remove old wires — user reconnects per docs/kicad_anleitung.md.
PCB is not touched.
"""
from pathlib import Path
import uuid

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.kicad_sch")

def uid():
    return str(uuid.uuid4())

def resistor(ref, value, x, y, uuid_sym, lcsc=""):
    lcsc_prop = ""
    if lcsc:
        lcsc_prop = f'''
		(property "LCSC" "{lcsc}"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)'''
    return f'''	(symbol
		(lib_id "Device:R")
		(at {x} {y} 0)
		(unit 1)
		(body_style 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(in_pos_files yes)
		(dnp no)
		(uuid "{uuid_sym}")
		(property "Reference" "{ref}"
			(at {x + 2.54} {y} 0)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Value" "{value}"
			(at {x + 2.54} {y + 2.54} 0)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Footprint" "Resistor_SMD:R_0402_1005Metric"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Datasheet" ""
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Description" "Gate series resistor for VGS zener clamp"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		){lcsc_prop}
		(pin "1"
			(uuid "{uid()}")
		)
		(pin "2"
			(uuid "{uid()}")
		)
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "{ref}")
					(unit 1)
				)
			)
		)
	)
'''

def zener(ref, x, y, uuid_sym):
    # Device:D — zener as diode symbol; value marks BZX84C6V2
    # Pin1=K, Pin2=A in KiCad Device:D (Sim.Pins 1=K 2=A)
    return f'''	(symbol
		(lib_id "Device:D")
		(at {x} {y} 90)
		(unit 1)
		(body_style 1)
		(exclude_from_sim no)
		(in_bom yes)
		(on_board yes)
		(in_pos_files yes)
		(dnp no)
		(uuid "{uuid_sym}")
		(property "Reference" "{ref}"
			(at {x - 5.08} {y} 90)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Value" "BZX84C6V2"
			(at {x - 7.62} {y} 90)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Footprint" "Diode_SMD:D_SOT-23"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Datasheet" "https://www.lcsc.com/product-detail/C179522.html"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Description" "Zener 6.2V VGS clamp for SI2301; K=Source A=Gate"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "LCSC" "C179522"
			(at {x} {y} 0)
			(hide yes)
			(show_name no)
			(do_not_autoplace no)
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(pin "2"
			(uuid "{uid()}")
		)
		(pin "1"
			(uuid "{uid()}")
		)
		(instances
			(project "vogelstimmen_v2"
				(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
					(reference "{ref}")
					(unit 1)
				)
			)
		)
	)
'''

def label(name, x, y, angle=0):
    return f'''	(label "{name}"
		(at {x} {y} {angle})
		(effects
			(font
				(size 1.27 1.27)
			)
		)
		(uuid "{uid()}")
	)
'''

def text_note(x, y, msg):
    return f'''	(text "{msg}"
		(exclude_from_sim no)
		(at {x} {y} 0)
		(effects
			(font
				(size 1.27 1.27)
			)
			(justify left)
		)
		(uuid "{uid()}")
	)
'''

text = SCH.read_text(encoding="utf-8")
if 'Reference" "D11"' in text:
    print("D11 already present — skip insert")
else:
    block = []
    block.append(text_note(25.4, 76.2, "VGS-Schutz SI2301: D11/D12 = BZX84C6V2 (K=Source, A=Gate); R7/R8 = 4k7 Serie — verdrahten laut docs/digitaler_zwilling.md"))
    # Q5 group
    block.append(zener("D11", 40.64, 68.58, "b0000001-0001-4000-8000-0000000000d1"))
    block.append(resistor("R7", "4.7k", 48.26, 73.66, "b0000001-0001-4000-8000-0000000000r7"))
    block.append(label("BAT+", 40.64, 63.5))
    block.append(label("Q5_GATE", 40.64, 73.66))
    block.append(label("Q5_GATE", 48.26, 71.12))
    block.append(label("Q5_G_PD", 48.26, 76.2))  # to connect toward R6/GND
    # Q1 group
    block.append(zener("D12", 127.0, 68.58, "b0000001-0001-4000-8000-0000000000d2"))
    block.append(resistor("R8", "4.7k", 137.16, 73.66, "b0000001-0001-4000-8000-0000000000r8"))
    block.append(label("12V_PROT", 127.0, 63.5))
    block.append(label("Q1_GATE", 127.0, 73.66))
    block.append(label("Q1_GATE", 137.16, 71.12))
    block.append(label("LATCH_GATE", 137.16, 76.2))  # Q2 side of R8
    insert = "\n".join(block) + "\n"
    # Insert before last closing paren of sheet — find last "(symbol" area end: before final ")\n"
    # Place before the embedded lib or at end of sheet items: search for last TP or end
    marker = '\t(symbol\n\t\t(lib_id "Connector_Generic:Conn_01x08"'
    if marker in text:
        text = text.replace(marker, insert + marker, 1)
    else:
        # fallback: before final sheet close
        idx = text.rfind("\n)")
        text = text[:idx] + "\n" + insert + text[idx:]
    SCH.write_text(text, encoding="utf-8")
    print("Inserted D11 D12 R7 R8 + labels + note")
