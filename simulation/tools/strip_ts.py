"""Minimal TypeScript → ESM JS stripper for this project's .ts sources."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
OUT = Path(__file__).resolve().parents[1] / "js"


def strip_interfaces(text: str) -> str:
    text = re.sub(r"export\s+type\s+\w+\s*=[\s\S]*?;\n", "\n", text)
    # remove interface blocks (non-nested)
    while True:
        m = re.search(r"export\s+interface\s+\w+\s*\{", text)
        if not m:
            break
        start = m.start()
        i = m.end() - 1
        depth = 0
        while i < len(text):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    i += 1
                    break
            i += 1
        text = text[:start] + text[i:]
    return text


def strip_ts(text: str) -> str:
    text = strip_interfaces(text)
    text = re.sub(r"\btype\s+(\w+)\s*,", r"\1,", text)
    text = re.sub(r",\s*type\s+(\w+)", r", \1", text)
    text = re.sub(r"\{\s*type\s+(\w+)\s*\}", r"{ \1 }", text)
    text = re.sub(r"from\s+\"\./parts\.js\"", 'from "./parts.js"', text)
    text = re.sub(r"from\s+\"\./parts\"", 'from "./parts.js"', text)
    # casts
    text = re.sub(r"\s+as\s+[A-Za-z_][\w|<>\s,&]*", "", text)
    # simple annotations
    for _ in range(8):
        text = re.sub(
            r"(\(|,|:\s*|const\s+\w+|let\s+\w+|var\s+\w+)\s*:\s*"
            r"(?:readonly\s+)?"
            r"(?:number|string|boolean|void|Phase|NetVoltages|PartReading|SimState|PartSpec|PartKind|"
            r"Record<[^>]+>|Array<[^>]+>|\w+\s*\|\s*null|\w+\s*\|\s*undefined)(?=\s*[=,)\n;{])",
            r"\1",
            text,
        )
    text = re.sub(r"(\w+)\?:", r"\1:", text)
    text = re.sub(r":\s*PartKind\b", "", text)
    text = re.sub(r":\s*PartSpec\b", "", text)
    # method return types
    text = re.sub(r"\)\s*:\s*[A-Za-z_][\w|<>\s]*\s*\{", ") {", text)
    text = re.sub(r"\)\s*:\s*void\s*\{", ") {", text)
    # field types in class
    text = re.sub(
        r"^(\s+\w+)\s*:\s*(?:boolean|number|string|Phase|NetVoltages|null)(\s*=)",
        r"\1\2",
        text,
        flags=re.M,
    )
    text = re.sub(r"Array\((\d+)\)\.fill\((\w+)\) as boolean\[]", r"Array(\1).fill(\2)", text)
    text = re.sub(r" as boolean\[]", "", text)
    # object type literals in params
    text = re.sub(r"x:\s*Record<[^>]+>", "x", text)
    text = re.sub(r"p\?:", "p:", text)
    return text


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name in ("parts.ts", "model.ts"):
        raw = (SRC / name).read_text(encoding="utf-8")
        js = strip_ts(raw)
        (OUT / name.replace(".ts", ".js")).write_text(js, encoding="utf-8")
        print(f"wrote {name} -> js/{name.replace('.ts', '.js')} ({len(js)} chars)")


if __name__ == "__main__":
    main()
