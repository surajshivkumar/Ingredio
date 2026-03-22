"""
Stage 2: Download images for each product from india_products.jsonl.

Uses a thread pool to download multiple products in parallel.

Folder structure:
  raw_data/
    {sanitized_product_name}_{barcode}/
      product.jpg
      ingredients.jpg
      nutrition.jpg
      packaging.jpg

Run after fetch_products.py.
"""

import json
import re
import time
import logging
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

JSONL_FILE = Path(__file__).parent / "india_products.jsonl"
IMAGES_DIR = Path(__file__).parent / "raw_data"
OFF_IMAGES_BASE = "https://images.openfoodfacts.org/images/products"
RETRY_LIMIT = 3
WORKERS = 25  # parallel product downloads

IMAGE_TYPES = {
    "product.jpg":     "front",
    "ingredients.jpg": "ingredients",
    "nutrition.jpg":   "nutrition",
    "packaging.jpg":   "packaging",
}


def sanitize(name: str) -> str:
    name = name.strip().lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"\s+", "_", name)
    return name[:80]


def barcode_to_path(code: str) -> str:
    code = code.strip()
    if len(code) <= 8:
        return code
    return f"{code[:3]}/{code[3:6]}/{code[6:9]}/{code[9:]}"


def get_image_url(product: dict, image_type: str):
    code = product.get("code", "")

    if image_type == "front":
        return product.get("image_front_url")

    images = product.get("images", {})
    lang_key = None
    for key in images:
        if key.startswith(f"{image_type}_"):
            lang = key.split("_", 1)[1]
            if lang == "en":
                lang_key = key
                break
            if lang_key is None:
                lang_key = key

    if not lang_key:
        return None

    rev = images[lang_key].get("rev")
    if not rev:
        return None

    barcode_path = barcode_to_path(code)
    return f"{OFF_IMAGES_BASE}/{barcode_path}/{lang_key}.{rev}.400.jpg"


def download_image(url: str, dest: Path, session: requests.Session) -> bool:
    for attempt in range(1, RETRY_LIMIT + 1):
        try:
            resp = session.get(url, timeout=30, stream=True)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
            return True
        except Exception as e:
            log.warning(f"  Attempt {attempt} failed for {url}: {e}")
            time.sleep(2 ** attempt)
    return False


def process_product(product: dict):
    session = requests.Session()
    session.headers["User-Agent"] = "Ingredio/1.0 (github.com/ingredio; contact@ingredio.app)"

    name = product.get("product_name") or "unknown"
    code = product.get("code", "nocode")
    folder = IMAGES_DIR / f"{sanitize(name)}_{code}"
    folder.mkdir(parents=True, exist_ok=True)

    for filename, image_type in IMAGE_TYPES.items():
        dest = folder / filename
        if dest.exists():
            continue
        url = get_image_url(product, image_type)
        if not url:
            continue
        download_image(url, dest, session)

    return name, code


def main():
    if not JSONL_FILE.exists():
        log.error(f"{JSONL_FILE} not found. Run fetch_products.py first.")
        return

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    products = []
    with JSONL_FILE.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                products.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    total = len(products)
    log.info(f"Downloading images for {total} products with {WORKERS} workers ...")

    done = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(process_product, p): p for p in products}
        for future in as_completed(futures):
            done += 1
            try:
                name, code = future.result()
                if done % 100 == 0:
                    log.info(f"Progress: {done}/{total} ({name})")
            except Exception as e:
                log.error(f"Error: {e}")

    log.info(f"Done. Images saved to {IMAGES_DIR}")


if __name__ == "__main__":
    main()
