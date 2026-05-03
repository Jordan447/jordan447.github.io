import json
import os
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCRIPT = ROOT / "pull_transactions.py"


class CompetitionHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path != "/api/pull-transactions":
            self.send_json(404, {"ok": False, "error": "Not found"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length).decode("utf-8")

        try:
            payload = json.loads(raw_body or "{}")
        except json.JSONDecodeError:
            self.send_json(400, {"ok": False, "error": "Invalid JSON body"})
            return

        cookie = str(payload.get("cookie", "")).strip()
        if not cookie and not os.environ.get("GTA_BANK_COOKIE"):
            self.send_json(400, {"ok": False, "error": "Paste the banking Cookie header first."})
            return

        env = os.environ.copy()
        if cookie:
            env["GTA_BANK_COOKIE"] = cookie
        for request_key, env_key in (
            ("accountType", "GTA_BANK_ACCOUNT_TYPE"),
            ("fetchId", "GTA_BANK_FETCH_ID"),
            ("referer", "GTA_BANK_REFERER"),
            ("startDate", "GTA_BANK_START_DATE"),
            ("endDate", "GTA_BANK_END_DATE"),
        ):
            value = str(payload.get(request_key, "")).strip()
            if value:
                env[env_key] = value

        completed = subprocess.run(
            [sys.executable, str(SCRIPT)],
            cwd=str(ROOT.parent),
            env=env,
            text=True,
            capture_output=True,
            timeout=120,
        )

        csv_path = ROOT / "transactions.csv"
        response_path = ROOT / "transactions_response.json"
        self.send_json(
            200 if completed.returncode == 0 else 500,
            {
                "ok": completed.returncode == 0,
                "returncode": completed.returncode,
                "stdout": completed.stdout,
                "stderr": completed.stderr,
                "csvExists": csv_path.exists(),
                "csvBytes": csv_path.stat().st_size if csv_path.exists() else 0,
                "responseExists": response_path.exists(),
                "responseBytes": response_path.stat().st_size if response_path.exists() else 0,
            },
        )


def main() -> int:
    host = "127.0.0.1"
    port = int(os.environ.get("COMPETITION_PORT", "8766"))
    server = ThreadingHTTPServer((host, port), CompetitionHandler)
    print(f"Leaderboard: http://{host}:{port}/index.html")
    print(f"Pull tool:   http://{host}:{port}/pull/")
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
