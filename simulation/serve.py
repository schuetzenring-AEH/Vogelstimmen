#!/usr/bin/env python3
"""Lokaler Server für die Platinen-Simulation (ES-Module brauchen http://)."""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = "2.5"
DEFAULT_PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def if_modified_since(self, _last_modified) -> bool:
        """Nie 304 — verhindert gemischten JS-Cache (model.js alt + parts.js neu)."""
        return False

    def end_headers(self) -> None:
        path = self.path.split("?", 1)[0]
        if path.endswith((".html", ".js", ".json")) or path in ("/", ""):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()


def parse_args() -> tuple[int, bool]:
    port = DEFAULT_PORT
    open_browser = True
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        arg = args[i]
        if arg in ("--port", "-p") and i + 1 < len(args):
            port = int(args[i + 1])
            i += 2
        elif arg == "--no-browser":
            open_browser = False
            i += 1
        else:
            i += 1
    return port, open_browser


def main() -> None:
    port, open_browser = parse_args()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        url = f"http://127.0.0.1:{port}/"
        print(f"Vogelstimmen-Simulation Rev {BUILD}: {url}", flush=True)
        if port != DEFAULT_PORT:
            print(f"(Alternativ-Adresse — Port {port}, kein Cache von :{DEFAULT_PORT})", flush=True)
        if open_browser:
            webbrowser.open(url)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
