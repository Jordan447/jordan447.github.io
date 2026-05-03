import csv
import json
import os
import sys
from pathlib import Path
from http.cookiejar import CookieJar
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPCookieProcessor, Request, build_opener


BASE_URL = "https://banking.gta.world"
ENDPOINT = f"{BASE_URL}/transactions/populate"
OUT_DIR = Path(__file__).resolve().parent
OUT_JSON = OUT_DIR / "transactions_response.json"
OUT_CSV = OUT_DIR / "transactions.csv"
COOKIE_NAMES = ("XSRF-TOKEN", "gta_world_banking_session", "cf_clearance")


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"Missing required environment variable: {name}", file=sys.stderr)
        sys.exit(2)
    return value


class SimpleResponse:
    def __init__(self, status: int, headers, url: str, body: bytes):
        self.status_code = status
        self.headers = headers
        self.url = url
        self.text = body.decode("utf-8", errors="replace")

    def json(self):
        return json.loads(self.text)


def parse_cookie_header(cookie_header: str) -> dict[str, str]:
    cookies = {}
    if cookie_header.lower().startswith("cookie:"):
        cookie_header = cookie_header.split(":", 1)[1].strip()

    for part in cookie_header.split(";"):
        if "=" not in part:
            continue
        name, value = part.strip().split("=", 1)
        cookies[name] = value

    return cookies


def build_cookie_header() -> str:
    full_cookie = os.environ.get("GTA_BANK_COOKIE", "").strip()

    if full_cookie:
        cookies = parse_cookie_header(full_cookie)
    else:
        cookies = {
            "XSRF-TOKEN": require_env("GTA_BANK_XSRF_TOKEN"),
            "gta_world_banking_session": require_env("GTA_WORLD_BANKING_SESSION"),
        }

        cf_clearance = os.environ.get("GTA_CF_CLEARANCE", "").strip()
        if cf_clearance:
            cookies["cf_clearance"] = cf_clearance

    required = ("XSRF-TOKEN", "gta_world_banking_session")
    missing = [name for name in required if not cookies.get(name)]
    if missing:
        print(f"Missing required cookie(s): {', '.join(missing)}", file=sys.stderr)
        sys.exit(2)

    return "; ".join(f"{name}={cookies[name]}" for name in COOKIE_NAMES if cookies.get(name))


def fetch_page(start: int = 0, length: int = 500) -> SimpleResponse:
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": f"{BASE_URL}/personal",
        "Cookie": build_cookie_header(),
    }

    params = {
        "draw": 1,
        "start": start,
        "length": length,
        "search[value]": "",
        "search[regex]": "false",
        "order[0][column]": 1,
        "order[0][dir]": "desc",
        "Type": "Personal",
        "fetch": "43100",
        "routing": "",
        "reason": "",
        "playerName": "",
        "amount": "",
        "startDate": "",
        "endDate": "",
        "excludeFurniture": 0,
        "excludeDelivery": 0,
        "excludeServer": 0,
    }

    columns = [
        ("Id", "Id"),
        ("From", "From"),
        ("Routing", "Routing"),
        ("Reason", "Reason"),
        ("Amount", "Amount"),
        ("Balance", "Balance"),
        ("Date", "Date"),
    ]
    for index, (data, name) in enumerate(columns):
        params[f"columns[{index}][data]"] = data
        params[f"columns[{index}][name]"] = name
        params[f"columns[{index}][searchable]"] = "true"
        params[f"columns[{index}][orderable]"] = "true"
        params[f"columns[{index}][search][value]"] = ""
        params[f"columns[{index}][search][regex]"] = "false"

    url = f"{ENDPOINT}?{urlencode(params)}"
    request = Request(url, headers=headers, method="GET")
    opener = build_opener(HTTPCookieProcessor(CookieJar()))

    try:
        with opener.open(request, timeout=30) as response:
            return SimpleResponse(response.status, response.headers, response.url, response.read())
    except HTTPError as error:
        return SimpleResponse(error.code, error.headers, error.url, error.read())
    except URLError as error:
        print(f"Request failed: {error}", file=sys.stderr)
        sys.exit(1)


def write_csv(rows: list[dict]) -> None:
    if not rows:
        return

    fieldnames = ["Id", "From", "Routing", "Reason", "Amount", "Balance", "Date"]
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    all_rows = []
    start = 0
    length = 500
    total = None

    response = fetch_page(start=start, length=length)
    print(f"HTTP {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type', '')}")
    print(f"Final URL: {response.url}")
    if "/login" in response.url:
        print("The site redirected to login. The session cookie is missing or expired.")

    text = response.text
    print(f"Response length: {len(text)}")

    try:
        payload = response.json()
    except ValueError:
        OUT_JSON.write_text(text[:5000], encoding="utf-8")
        print(f"Response was not JSON. First 5000 chars written to {OUT_JSON}")
        print(text[:500])
        return 1

    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    rows = payload.get("data", [])
    all_rows.extend(rows)
    total = payload.get("recordsFiltered", len(rows))

    print(f"recordsTotal: {payload.get('recordsTotal')}")
    print(f"recordsFiltered: {payload.get('recordsFiltered')}")
    print(f"rows returned: {len(rows)}")

    while rows and len(all_rows) < total:
        start += length
        response = fetch_page(start=start, length=length)
        payload = response.json()
        rows = payload.get("data", [])
        all_rows.extend(rows)
        print(f"Fetched {len(all_rows)} / {total}")

    OUT_JSON.write_text(json.dumps({"data": all_rows, "recordsFiltered": total}, indent=2), encoding="utf-8")
    write_csv(all_rows)

    print(f"JSON written to {OUT_JSON}")
    if all_rows:
        print(f"CSV written to {OUT_CSV}")
        print("First row keys:", ", ".join(all_rows[0].keys()))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
