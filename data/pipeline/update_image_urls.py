"""
Replaces OFF image URLs in india_products.jsonl with S3 _cleaned.png URLs,
filters to only products with all required fields present,
and writes the first 500 matching products.

Output: india_products_cleaned.jsonl
"""

import json
import re
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

JSONL_FILE = Path(__file__).parent / "india_products.jsonl"
OUT_FILE   = Path(__file__).parent / "india_products_cleaned.jsonl"
S3_BASE    = "https://ingredio-ylk-bucket.s3.us-east-1.amazonaws.com"
LIMIT      = 500

IMAGE_MAP = {
    "image_front_url":       "product_cleaned.png",
    "image_ingredients_url": "ingredients_cleaned.png",
    "image_nutrition_url":   "nutrition_cleaned.png",
    "image_packaging_url":   "packaging_cleaned.png",
}

REQUIRED_NUTRIMENTS = [
    "energy-kcal_100g",
    "fat_100g",
    "saturated-fat_100g",
    "sugars_100g",
    "salt_100g",
    "fiber_100g",
    "proteins_100g",
]


def sanitize(name: str) -> str:
    name = name.strip().lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"\s+", "_", name)
    return name[:80]


def is_complete(product: dict) -> bool:
    """Return True only if all fields required for DB import are present."""
    if not product.get("code"):
        return False
    if not product.get("product_name"):
        return False
    if not product.get("brands"):
        return False
    if not product.get("categories_tags"):
        return False
    if not product.get("image_front_url"):
        return False
    if not product.get("ingredients_tags"):
        return False
    if not product.get("allergens_tags"):
        return False
    if not product.get("nutrition_grade_fr"):
        return False
    if not product.get("nova_group"):
        return False
    nutriments = product.get("nutriments") or {}
    for key in REQUIRED_NUTRIMENTS:
        if nutriments.get(key) is None:
            return False
    return True


def process(product: dict) -> dict:
    name = product.get("product_name") or "unknown"
    code = product.get("code", "nocode")
    folder = f"{sanitize(name)}_{code}"

    for field, filename in IMAGE_MAP.items():
        if product.get(field):
            product[field] = f"{S3_BASE}/{folder}/{filename}"
        else:
            product[field] = None

    return product


def main():
    total = written = skipped = 0
    with JSONL_FILE.open(encoding="utf-8") as fin, OUT_FILE.open("w", encoding="utf-8") as fout:
        for line in fin:
            line = line.strip()
            if not line:
                continue
            total += 1
            product = json.loads(line)
            if not is_complete(product):
                skipped += 1
                continue
            product = process(product)
            fout.write(json.dumps(product, ensure_ascii=False) + "\n")
            written += 1
            if written >= LIMIT:
                break

    log.info(f"Scanned {total} | Skipped (incomplete) {skipped} | Written {written} → {OUT_FILE}")


if __name__ == "__main__":
    main()
