import json
import time
import os
import re
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────────────────────────────────────
#  JS HELPERS
# ─────────────────────────────────────────────────────────────────────────────

_FIND_SCROLL_CONTAINER_JS = """
return document.getElementById('plpContainer') ||
       document.querySelector('[class*="BffPlpFeedContainer__ItemsContainer"]');
"""

_EXTRACT_CARDS_JS = """
var c = arguments[0];
var cards = c.querySelectorAll('[role="button"][id]');
var results = [];
var seen = {};

for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var prid = card.id;
    if (!prid || isNaN(prid) || seen[prid]) continue;
    seen[prid] = true;

    var name = '', price = '', mrp = '', imgUrl = '', slug = '';

    // Extract from React fiber (most reliable)
    var fiberKey = Object.keys(card).find(function(k) {
        return k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$');
    });

    if (fiberKey) {
        var current = card[fiberKey];
        for (var j = 0; j < 15; j++) {
            if (!current) break;
            try {
                var p = current.memoizedProps;
                if (p && p.data && p.data.identity && p.data.identity.id) {
                    var d = p.data;
                    name = (d.name && d.name.text) || '';
                    imgUrl = (d.image && d.image.url) || '';
                    // Walk the sections for pricing
                    if (d.section_count) {
                        var secs = p.data;
                        for (var sk in secs) {
                            var sv = secs[sk];
                            if (sv && typeof sv === 'object') {
                                if (sv.normal_price) price = sv.normal_price.text || '';
                                if (sv.mrp) mrp = sv.mrp.text || '';
                                if (sv.selling_price) price = price || sv.selling_price.text || '';
                            }
                        }
                    }
                    break;
                }
            } catch(e) {}
            current = current.return;
        }
    }

    // Fallback: parse from DOM
    if (!name) {
        var textParts = card.textContent.replace(/\\s+/g, ' ').trim();
        var nameMatch = textParts.match(/\\d+\\s*mins?\\s*(.+?)(?:\\d+\\s*[gkmlL]+|\\d+\\s*pack|$)/i);
        if (nameMatch) name = nameMatch[1].trim();
    }

    if (!imgUrl) {
        var img = card.querySelector('img[src*="cdn"]');
        if (img) imgUrl = img.src;
    }

    if (!price) {
        var priceMatch = card.textContent.match(/₹(\\d[\\d,]*)/);
        if (priceMatch) price = '₹' + priceMatch[1];
    }

    // Build slug from name
    if (name) {
        slug = name.toLowerCase()
            .replace(/[&]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    results.push({
        prid: prid,
        name: name,
        price: price,
        mrp: mrp,
        image: imgUrl,
        slug: slug
    });
}
return results;
"""

# ─────────────────────────────────────────────────────────────────────────────
#  HELPER: parse PRELOADED_STATE (for individual product pages)
# ─────────────────────────────────────────────────────────────────────────────

def _get_preloaded_state(soup):
    for script in soup.find_all("script"):
        text = script.string or ""
        if "PRELOADED_STATE" in text:
            match = re.search(r"PRELOADED_STATE\s*=\s*(\{.\});?\s$", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
    return None

def _get_snippets(preloaded):
    try:
        return preloaded["ui"]["pdp"]["bffPdp"]["bffData"]["snippets"]
    except (KeyError, TypeError):
        return []

# ─────────────────────────────────────────────────────────────────────────────
#  SCROLL THE CONTAINER TO LOAD ALL PRODUCT CARDS
# ─────────────────────────────────────────────────────────────────────────────

def scroll_and_collect_cards(driver, container_el, num_to_scrape=50, pause=3.0):
    """
    Scrolls the inner plpContainer to trigger lazy-loading,
    then extracts product data from the React-rendered card elements.
    Product cards are <div role="button" id="{prid}"> with NO <a> tags.
    """
    print(f"   ⬇️ Scrolling container to load cards (Target: {num_to_scrape})...")

    last_card_count = 0
    no_growth_rounds = 0

    while True:
        # Scroll to bottom of the container
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight;", container_el)
        time.sleep(pause)

        card_count = driver.execute_script("""
            var c = arguments[0];
            var cards = c.querySelectorAll('[role="button"][id]');
            var count = 0;
            for (var i = 0; i < cards.length; i++) {
                if (!isNaN(cards[i].id)) count++;
            }
            return count;
        """, container_el)

        print(f"   📦 {card_count} product cards loaded...")

        if card_count >= num_to_scrape:
            break

        if card_count > last_card_count:
            last_card_count = card_count
            no_growth_rounds = 0
        else:
            no_growth_rounds += 1
            # Nudge scroll to trigger intersection observers
            driver.execute_script("arguments[0].scrollTop -= 20;", container_el)
            time.sleep(0.3)
            driver.execute_script(
                "arguments[0].scrollTop = arguments[0].scrollHeight;", container_el
            )
            time.sleep(1)

        if no_growth_rounds >= 6:
            print("   🏁 No more products loading. All cards collected.")
            break

    # Extract product data from all loaded cards via JS
    print("   🔍 Extracting product data from cards...")
    products = driver.execute_script(_EXTRACT_CARDS_JS, container_el)
    print(f"   ✅ Extracted {len(products)} products from cards")

    return products[:num_to_scrape]

# ─────────────────────────────────────────────────────────────────────────────
#  DETAILED PRODUCT EXTRACTION (individual product page)
# ─────────────────────────────────────────────────────────────────────────────

def extract_product_data(page_source, url):
    soup      = BeautifulSoup(page_source, "html.parser")
    preloaded = _get_preloaded_state(soup)
    snippets  = _get_snippets(preloaded) if preloaded else []

    ld_product = None
    for script in soup.find_all("script", {"type": "application/ld+json"}):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict) and data.get("@type") == "Product":
                ld_product = data
                break
        except Exception:
            pass

    # NAME
    name = "Name Not Found"
    if ld_product:
        name = ld_product.get("name", name)
    else:
        og = soup.find("meta", {"property": "og:title"})
        if og:
            name = og.get("content", "").split(" Price -")[0].split(" - Buy")[0].strip()

    # PRICE / MRP
    price = "Price Not Found"
    mrp   = "MRP Not Found"

    if ld_product:
        offer = ld_product.get("offers", {})
        raw   = offer.get("price")
        if raw is not None:
            price = f"₹{raw}"

    for snip in snippets:
        if snip.get("widget_type") == "product_atc_strip":
            d     = snip["data"]
            p_txt = d.get("normal_price", {}).get("text", "")
            if p_txt: price = p_txt
            mrp_raw = d.get("mrp", {}).get("text", "")
            m = re.search(r"₹[\d,]+", mrp_raw)
            if m: mrp = m.group()
            break

    # DETAILS
    details = {}
    if ld_product:
        details["description"] = ld_product.get("description", "").strip()
        details["brand"]       = ld_product.get("brand", "")

    expanded_details = {}
    for snip in snippets:
        wtype = snip.get("widget_type", "")
        data  = snip.get("data", {})
        if wtype == "b_key_value_list_type_1":
            for row in data.get("item_list", []):
                key = row.get("key", {}).get("text", "").strip()
                val = row.get("value", {}).get("text", "").strip()
                if key and val: expanded_details[key] = val
        elif wtype == "b_expandable_text_type_1":
            title = data.get("header", {}).get("text", "").strip()
            body  = data.get("body",   {}).get("text", "").strip()
            if title: expanded_details[title] = body or title

    if expanded_details:
        details["expanded"] = expanded_details

    # IMAGES
    images = []
    seen_imgs = set()
    def _add(u):
        if not u: return
        clean = re.sub(r"/cdn-cgi/image/[^/]+/", "/", u)
        clean = re.sub(r"[?&]tr=[^&]+", "", clean)
        if clean not in seen_imgs:
            images.append(clean)
            seen_imgs.add(clean)

    og_img = soup.find("meta", {"property": "og:image"})
    if og_img: _add(og_img.get("content", ""))

    for img_tag in soup.find_all("img"):
        src = img_tag.get("src", "")
        if "cdn.grofers.com" in src: _add(src)

    return {
        "name":    name,
        "price":   price,
        "mrp":     mrp,
        "details": details,
        "images":  images,
        "url":     url,
    }

# ─────────────────────────────────────────────────────────────────────────────
#  MAIN SCRAPER
# ─────────────────────────────────────────────────────────────────────────────

def scrape_blinkit_with_selenium(num_to_find=50):
    chrome_options = Options()
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,1000")
    chrome_options.add_argument("--no-sandbox")

    print("🚀 Initializing Chrome driver...")
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 20)
    products_data = []

    try:
        print("🌐 Opening Blinkit category page...")
        driver.get("https://blinkit.com/cn/munchies/popcorn/cid/1237/156")
        time.sleep(4)

        # LOCATION LOGIC
        print("📍 Setting location...")
        try:
            loc_trigger = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//*[contains(text(), 'Delivery in')]")
            ))
            loc_trigger.click()
            time.sleep(1)
            search = wait.until(EC.presence_of_element_located(
                (By.XPATH, "//input[contains(@placeholder, 'earch')]")
            ))
            search.send_keys("Yelahanka, Bangalore")
            time.sleep(2)
            suggestion = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//div[contains(., 'Yelahanka') and contains(., 'Bengaluru')]")
            ))
            suggestion.click()
            time.sleep(5)
        except Exception:
            print("⚠️  Location skip (using default).")

        # FIND SCROLL CONTAINER
        container_el = driver.execute_script(_FIND_SCROLL_CONTAINER_JS)
        if not container_el:
            print("❌ Could not find product container.")
            return

        # SCROLL + EXTRACT CARDS
        card_products = scroll_and_collect_cards(
            driver, container_el, num_to_scrape=num_to_find
        )

        print(f"\n✅ Got {len(card_products)} products from cards. Fetching full details...")

        for i, card in enumerate(card_products):
            prid = card["prid"]
            slug = card.get("slug") or "product"
            url = f"https://blinkit.com/prn/{slug}/prid/{prid}"

            try:
                print(f"🔍 [{i+1}/{len(card_products)}] {card.get('name', prid)}")
                driver.get(url)
                time.sleep(2.5)
                info = extract_product_data(driver.page_source, url)

                # Merge card data as fallback if page extraction missed something
                if info["name"] == "Name Not Found" and card.get("name"):
                    info["name"] = card["name"]
                if info["price"] == "Price Not Found" and card.get("price"):
                    info["price"] = card["price"]
                if not info["images"] and card.get("image"):
                    clean = re.sub(r"/cdn-cgi/image/[^/]+/", "/", card["image"])
                    info["images"] = [clean]

                products_data.append(info)
            except Exception as e:
                print(f"   ⚠️ Error on prid {prid}: {e}")
                # Still save what we got from the card
                products_data.append({
                    "name":    card.get("name", ""),
                    "price":   card.get("price", ""),
                    "mrp":     card.get("mrp", ""),
                    "details": {},
                    "images":  [card["image"]] if card.get("image") else [],
                    "url":     url,
                })

        # SAVE JSON
        output_path = os.path.join(SCRIPT_DIR, "blinkit_data.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(products_data, f, indent=4, ensure_ascii=False)
        print(f"\n🎉 Done! Scraped {len(products_data)} products → {output_path}")

    finally:
        driver.quit()

if __name__ == "__main__":
    scrape_blinkit_with_selenium(num_to_find=9999)