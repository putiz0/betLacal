import json
import time
import requests
import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from concurrent.futures import ThreadPoolExecutor, as_completed

WIKI_API = "https://pt.wikipedia.org/w/api.php"
HEADERS = {
    "User-Agent": "ProjetoBet/1.0 (football app; contato@projetobet.com)"
}
LOGO_FILE = os.path.join(os.path.dirname(__file__), "..", "api", "team-logos-thesportsdb.json")
WORKERS = 3
DELAY = 0.25
BATCH_SAVE = 25

def fetch_logo(name):
    try:
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": name,
            "gsrlimit": 1,
            "prop": "pageimages",
            "pithumbsize": 200,
            "format": "json"
        }
        r = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=15)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        for pid, info in pages.items():
            if pid != "-1" and "thumbnail" in info:
                return name, info["thumbnail"]["source"]
        return name, None
    except Exception as e:
        return name, None

with open(LOGO_FILE, "r", encoding="utf-8") as f:
    logos = json.load(f)

# Normalize keys (remove leading whitespace)
normalized = {}
for k, v in logos.items():
    normalized[k.strip()] = v
logos = normalized

missing = [name for name, data in logos.items() if not data or not isinstance(data, dict) or not data.get("url")]
have = sum(1 for v in logos.values() if isinstance(v, dict) and v.get("url"))
print(f"Total: {len(logos)}, Already have: {have}, Missing: {len(missing)}")

found = 0
completed = 0
processed = 0

executor = ThreadPoolExecutor(max_workers=WORKERS)
futures = {}
for name in missing:
    time.sleep(DELAY)  # Throttle submissions
    futures[executor.submit(fetch_logo, name)] = name

for future in as_completed(futures):
    name, url = future.result()
    completed += 1
    if url:
        logos[name] = {"source": "wikipediaPT", "url": url}
        found += 1
        status = "OK"
    else:
        logos[name] = None
        status = "--"
    processed += 1
    print(f"[{status}] ({completed}/{len(missing)}) {name}")
    if processed >= BATCH_SAVE:
        with open(LOGO_FILE, "w", encoding="utf-8") as f:
            json.dump(logos, f, ensure_ascii=False, indent=2)
        processed = 0

with open(LOGO_FILE, "w", encoding="utf-8") as f:
    json.dump(logos, f, ensure_ascii=False, indent=2)

have = sum(1 for v in logos.values() if isinstance(v, dict) and v.get("url"))
print(f"\nFinal: {have}/{len(logos)} teams with logos (+{found} new from Wikipedia)")
