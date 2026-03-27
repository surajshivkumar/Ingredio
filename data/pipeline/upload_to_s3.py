twha"""
Stage 3: Upload downloaded product images to AWS S3.

Uploads all images from:
  raw_data/{product_name}_{barcode}/{filename}

To S3 path:
  {product_name}_{barcode}/{filename}

Run after download_images.py.
"""

import logging
import boto3
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

IMAGES_DIR = Path(__file__).parent / "raw_data"
BUCKET = "ingredio-open-food-facts"
WORKERS = 20

CONTENT_TYPES = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
}


def upload_file(s3, local_path: Path, s3_key: str):
    content_type = CONTENT_TYPES.get(local_path.suffix.lower(), "application/octet-stream")
    try:
        s3.upload_file(
            str(local_path),
            BUCKET,
            s3_key,
            ExtraArgs={"ContentType": content_type},
        )
        return True
    except Exception as e:
        log.error(f"Failed to upload {s3_key}: {e}")
        return False


def main():
    s3 = boto3.client("s3")

    if not IMAGES_DIR.exists():
        log.error(f"{IMAGES_DIR} not found. Run download_images.py first.")
        return

    # Collect all files to upload
    all_files = []
    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue
        for image_file in sorted(folder.iterdir()):
            if image_file.is_file():
                s3_key = f"{folder.name}/{image_file.name}"
                all_files.append((image_file, s3_key))

    total = len(all_files)
    log.info(f"Uploading {total} files to s3://{BUCKET} with {WORKERS} workers ...")

    done = 0
    failed = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(upload_file, s3, path, key): key for path, key in all_files}
        for future in as_completed(futures):
            done += 1
            if not future.result():
                failed += 1
            if done % 500 == 0:
                log.info(f"Progress: {done}/{total} ({failed} failed)")

    log.info(f"Done. {done - failed}/{total} files uploaded to s3://{BUCKET}")


if __name__ == "__main__":
    main()
