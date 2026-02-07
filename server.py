#!/usr/bin/env python3
"""Lokalni server za frontend aplikaciju.

- Uvek servira fajlove iz direktorijuma repozitorijuma (nezavisno od trenutnog cwd).
- Za nepostojeće putanje vraća index.html (SPA fallback) umesto 404 "Not Found".
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class FrontendHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = self.translate_path(self.path)
        if Path(path).exists() and Path(path).is_file():
            return super().send_head()

        self.path = "/index.html"
        return super().send_head()


def main() -> None:
    host = "0.0.0.0"
    port = 8000
    server = ThreadingHTTPServer((host, port), FrontendHandler)
    print(f"Frontend server running on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
