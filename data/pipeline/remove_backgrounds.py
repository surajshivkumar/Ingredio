"""
Remove backgrounds from all product.jpg images in raw_data/ and upload
cleaned versions directly to S3 as {folder}/product_cleaned.png

Skips if product_cleaned.png already exists in S3 (resumable).
"""

import logging
import boto3
import io
from pathlib import Path
from PIL import Image
from rembg import remove, new_session
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

RAW_DATA = Path(__file__).parent / "raw_data"
BUCKET   = "ingredio-ylk-bucket"
WORKERS  = 8
TARGET_IMAGES = ["product.jpg", "ingredients.jpg", "nutrition.jpg", "packaging.jpg"]

s3 = boto3.client("s3")


def already_uploaded(s3_key: str) -> bool:
    try:
        s3.head_object(Bucket=BUCKET, Key=s3_key)
        return True
    except:
        return False


def process_folder(folder: Path, session):
    uploaded = []
    for filename in TARGET_IMAGES:
        src = folder / filename
        if not src.exists():
            continue

        cleaned_name = filename.replace(".jpg", "_cleaned.png")
        s3_key = f"{folder.name}/{cleaned_name}"

        if already_uploaded(s3_key):
            continue

        try:
            inp = Image.open(src)
            out = remove(inp, session=session)
            buf = io.BytesIO()
            out.save(buf, format="PNG")
            buf.seek(0)
            s3.upload_fileobj(buf, BUCKET, s3_key, ExtraArgs={"ContentType": "image/png"})
            uploaded.append(s3_key)
        except Exception as e:
            log.warning(f"Failed {s3_key}: {e}")

    return uploaded


def main():
    session = new_session("u2net")
    folders = [f for f in sorted(RAW_DATA.iterdir()) if f.is_dir()]
    total = len(folders)
    log.info(f"Processing {total} folders with {WORKERS} workers ...")

    done = uploaded = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(process_folder, f, session): f for f in folders}
        for future in as_completed(futures):
            done += 1
            result = future.result()
            uploaded += len(result) if result else 0
            if done % 100 == 0:
                log.info(f"Progress: {done}/{total} folders | {uploaded} images uploaded")

    log.info(f"Done. {uploaded} images uploaded.")


if __name__ == "__main__":
    main()
