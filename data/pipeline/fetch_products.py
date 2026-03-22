"""
Stage 1: Fetch all India products from Open Food Facts API and save as JSONL.

Output: data/pipeline/india_products.jsonl  (one JSON object per line)
"""

import json
import time
import logging
import requests
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

OFF_SEARCH_URL = "https://world.openfoodfacts.org/api/v2/search"
PAGE_SIZE = 100
OUT_FILE = Path(__file__).parent / "india_products.jsonl"


def fetch_page(page: int, session: requests.Session) -> dict:
    params = {
        "countries_tags_en": "india",
        "page_size": PAGE_SIZE,
        "page": page,
    }
    for attempt in range(1, 6):
        try:
            resp = session.get(OFF_SEARCH_URL, params=params, timeout=60)
            resp.raise_for_status()
            return resp.json()
        except (requests.Timeout, requests.ConnectionError) as e:
            wait = 10 * attempt
            log.warning(f"  Attempt {attempt} timed out. Retrying in {wait}s ...")
            time.sleep(wait)
    raise RuntimeError(f"Failed to fetch page {page} after 5 attempts")


def main():
    session = requests.Session()
    session.headers["User-Agent"] = "Ingredio/1.0 (github.com/ingredio; contact@ingredio.app)"

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    total_written = OUT_FILE.read_text().count("\n") if OUT_FILE.exists() else 0
    page = (total_written // PAGE_SIZE) + 1
    if total_written:
        log.info(f"Resuming from page {page} ({total_written} products already saved)")

    with OUT_FILE.open("a" if total_written else "w", encoding="utf-8") as f:
        while True:
            log.info(f"Fetching page {page} ...")
            try:
                data = fetch_page(page, session)
            except (requests.HTTPError, RuntimeError) as e:
                log.error(f"Stopping on page {page}: {e}")
                break

            products = data.get("products", [])
            if not products:
                log.info("No more products — done.")
                break

            for product in products:
                f.write(json.dumps(product, ensure_ascii=False) + "\n")

            total_written += len(products)
            log.info(f"  -> {len(products)} products written (total: {total_written})")

            total_count = data.get("count", 0)
            log.info(f"  Progress: {total_written}/{total_count}")
            if total_written >= total_count:
                log.info("Fetched all products.")
                break

            page += 1
            time.sleep(1)  # be polite to OFF servers

    log.info(f"Done. {total_written} products saved to {OUT_FILE}")


if __name__ == "__main__":
    main()
