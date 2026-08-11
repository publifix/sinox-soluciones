#!/usr/bin/env python3
"""One-off asset pipeline for the SINOX Hero + client ticker.
Not part of the site runtime -- run manually when source assets change.
"""
import os
import numpy as np
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def out(*parts):
    p = os.path.join(ROOT, "public", "assets", "img", *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


# ---------------------------------------------------------------------------
# 1. SINOX wordmark (white + turquoise) -> tight-cropped, web-sized PNG
# ---------------------------------------------------------------------------
def process_logo():
    src = os.path.join(ROOT, "SINOX LOGO - ACENTO TURQUESA - BLANCO.png")
    im = Image.open(src).convert("RGBA")
    bbox = im.split()[-1].getbbox()
    pad = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.03)
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    im = im.crop((l, t, r, b))

    target_w = 1200
    ratio = target_w / im.width
    im = im.resize((target_w, round(im.height * ratio)), Image.LANCZOS)
    dest = out("brand", "sinox-logo-white.png")
    im.save(dest, optimize=True)
    print("logo ->", dest, im.size, os.path.getsize(dest), "bytes")


# ---------------------------------------------------------------------------
# 2. Hero photography -> responsive WebP srcset + single JPEG fallback
# ---------------------------------------------------------------------------
HERO_WIDTHS = [640, 1080, 1600, 2200]

HERO_SOURCES = {
    "hero-1": "hero 1.jpg",
    "hero-2": "hero-2.jpg",
    "hero-3": "hero-3.jpg",
}


def process_hero():
    for slug, filename in HERO_SOURCES.items():
        src = os.path.join(ROOT, filename)
        im = Image.open(src)
        im = ImageOps.exif_transpose(im).convert("RGB")

        for w in HERO_WIDTHS:
            if w >= im.width:
                resized = im.copy()
            else:
                ratio = w / im.width
                resized = im.resize((w, round(im.height * ratio)), Image.LANCZOS)
            dest = out("hero", f"{slug}-{w}.webp")
            resized.save(dest, "WEBP", quality=76, method=6)
            print("hero ->", dest, resized.size, os.path.getsize(dest), "bytes")

        # single JPEG fallback for browsers without WebP support
        fb_w = 1600
        ratio = fb_w / im.width
        fallback = im.resize((fb_w, round(im.height * ratio)), Image.LANCZOS)
        dest = out("hero", f"{slug}-{fb_w}.jpg")
        fallback.save(dest, "JPEG", quality=78, optimize=True, progressive=True)
        print("hero fallback ->", dest, fallback.size, os.path.getsize(dest), "bytes")


# ---------------------------------------------------------------------------
# 3. Client logos -> white background keyed to alpha, autocropped, normalized
# ---------------------------------------------------------------------------
CLIENT_SOURCES = {
    "airbus-helicopters": "Airbus-Helicopters-Logo byn.jpg",
    "bombardier": "BOMBARDIER LOGO byn.jpg",
    "equinix": "Equinix_logo byn.jpg",
    "gerresheimer": "Gerresheimer-logo byn.jpg",
    "amway": "AMWAY.png",
    "odata": "odata-logo.png",
}

# luminance ramp: <=OPAQUE_AT stays fully opaque, >=CLEAR_AT becomes fully transparent
OPAQUE_AT = 235.0
CLEAR_AT = 250.0
TARGET_HEIGHT = 320  # px, source size for a ~160px display slot at 2x


def _keyed_alpha(im_rgb):
    arr = np.asarray(im_rgb.convert("RGB")).astype(np.float32)
    lum = arr.mean(axis=2)
    span = CLEAR_AT - OPAQUE_AT
    alpha = 1.0 - (lum - OPAQUE_AT) / span
    alpha = np.clip(alpha, 0.0, 1.0) * 255.0
    rgba = np.dstack([arr, alpha]).astype(np.uint8)
    return Image.fromarray(rgba, mode="RGBA")


def process_clients():
    for slug, filename in CLIENT_SOURCES.items():
        src = os.path.join(ROOT, filename)
        im = Image.open(src)
        im = ImageOps.exif_transpose(im)

        keyed = _keyed_alpha(im)
        bbox = keyed.split()[-1].getbbox()
        if bbox:
            pad_x = int((bbox[2] - bbox[0]) * 0.04)
            pad_y = int((bbox[3] - bbox[1]) * 0.04)
            l = max(0, bbox[0] - pad_x)
            t = max(0, bbox[1] - pad_y)
            r = min(keyed.width, bbox[2] + pad_x)
            b = min(keyed.height, bbox[3] + pad_y)
            keyed = keyed.crop((l, t, r, b))

        ratio = TARGET_HEIGHT / keyed.height
        new_w = max(1, round(keyed.width * ratio))
        keyed = keyed.resize((new_w, TARGET_HEIGHT), Image.LANCZOS)

        dest = out("clients", f"{slug}.png")
        keyed.save(dest, optimize=True)
        print("client ->", dest, keyed.size, os.path.getsize(dest), "bytes")


# ---------------------------------------------------------------------------
# 4. Favicon / apple-touch-icon, from the official standalone isotype
# ---------------------------------------------------------------------------
def process_favicon():
    src = os.path.join(ROOT, "SINOX ICONO - 1.png")
    im = Image.open(src).convert("RGBA")
    bbox = im.split()[-1].getbbox()
    pad = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.08)
    l = max(0, bbox[0] - pad)
    t = max(0, bbox[1] - pad)
    r = min(im.width, bbox[2] + pad)
    b = min(im.height, bbox[3] + pad)
    icon = im.crop((l, t, r, b))

    size = max(icon.size)
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    square.paste(icon, ((size - icon.width) // 2, (size - icon.height) // 2), icon)
    favicon = square.resize((512, 512), Image.LANCZOS)

    public_dir = os.path.join(ROOT, "public")
    favicon.save(os.path.join(public_dir, "favicon.png"))

    bg = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
    mark = favicon.resize((320, 320), Image.LANCZOS)
    bg.paste(mark, ((512 - 320) // 2, (512 - 320) // 2), mark)
    bg.convert("RGB").save(os.path.join(public_dir, "apple-touch-icon.png"), quality=92)

    favicon.save(os.path.join(public_dir, "favicon.ico"), sizes=[(s, s) for s in (16, 32, 48, 64)])
    print("favicon ->", public_dir, favicon.size)


# ---------------------------------------------------------------------------
# 5. Service card photography -> center-cropped to the card's 4:5 aspect,
#    responsive WebP srcset + single JPEG fallback (mirrors process_hero).
# ---------------------------------------------------------------------------
import glob

SERVICE_WIDTHS = [480, 800, 1200]
SERVICE_ASPECT = 4 / 5  # width / height, matches .service-card { aspect-ratio }

SERVICE_PREFIX_TO_SLUG = {
    "1": "servicio-limpieza-industrial",
    "2": "servicio-limpieza-data-centers",
    "3": "servicio-limpieza-aeroespacial",
    "4": "servicio-mantenimiento-industrial",
    "5": "servicio-fumigacion-control-plagas",
    "6": "servicio-jardineria-industrial-corporativa",
    "7": "servicio-mantenimiento-integral-oficinas",
    "8": "servicio-comercializadora-insumos",
    "9": "servicio-lavado-tapiceria",
}


def process_services():
    # Matched by leading digit rather than the full accented filename --
    # GitHub's web upload normalizes accents (NFD) in a way that doesn't
    # always match a hardcoded literal from an editor (NFC), so glob by
    # prefix and confirm all six were found.
    sources = {}
    for path in glob.glob(os.path.join(ROOT, "*.jpg")):
        filename = os.path.basename(path)
        prefix = filename[0]
        if prefix in SERVICE_PREFIX_TO_SLUG and prefix not in sources:
            sources[prefix] = path

    missing = set(SERVICE_PREFIX_TO_SLUG) - set(sources)
    if missing:
        print("process_services: skipping, missing source photos for:", missing)
        return

    for prefix, slug in SERVICE_PREFIX_TO_SLUG.items():
        im = Image.open(sources[prefix])
        im = ImageOps.exif_transpose(im).convert("RGB")

        w, h = im.size
        current_ratio = w / h
        if current_ratio > SERVICE_ASPECT:
            new_w = int(h * SERVICE_ASPECT)
            left = (w - new_w) // 2
            im = im.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / SERVICE_ASPECT)
            top = (h - new_h) // 2
            im = im.crop((0, top, w, top + new_h))

        for width in SERVICE_WIDTHS:
            height = round(width / SERVICE_ASPECT)
            resized = im.resize((width, height), Image.LANCZOS)
            dest = out("services", f"{slug}-{width}.webp")
            resized.save(dest, "WEBP", quality=78, method=6)
            print("service ->", dest, resized.size, os.path.getsize(dest), "bytes")

        fb_w = 800
        fb_h = round(fb_w / SERVICE_ASPECT)
        fallback = im.resize((fb_w, fb_h), Image.LANCZOS)
        dest = out("services", f"{slug}-{fb_w}.jpg")
        fallback.save(dest, "JPEG", quality=80, optimize=True, progressive=True)
        print("service fallback ->", dest, fallback.size, os.path.getsize(dest), "bytes")


# ---------------------------------------------------------------------------
# 6. Testimonials section background -> full-bleed responsive WebP srcset +
#    single JPEG fallback (mirrors process_hero).
# ---------------------------------------------------------------------------
TESTIMONIALS_WIDTHS = [640, 1080, 1600, 2200]


def process_testimonials():
    matches = glob.glob(os.path.join(ROOT, "HERO-RESE*.jpg")) + glob.glob(os.path.join(ROOT, "hero-rese*.jpg"))
    if not matches:
        print("process_testimonials: skipping, source photo not found")
        return
    src = matches[0]
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")

    for w in TESTIMONIALS_WIDTHS:
        if w >= im.width:
            resized = im.copy()
        else:
            ratio = w / im.width
            resized = im.resize((w, round(im.height * ratio)), Image.LANCZOS)
        dest = out("testimonials", f"resenas-bg-{w}.webp")
        resized.save(dest, "WEBP", quality=76, method=6)
        print("testimonials ->", dest, resized.size, os.path.getsize(dest), "bytes")

    fb_w = 1600
    ratio = fb_w / im.width
    fallback = im.resize((fb_w, round(im.height * ratio)), Image.LANCZOS)
    dest = out("testimonials", f"resenas-bg-{fb_w}.jpg")
    fallback.save(dest, "JPEG", quality=78, optimize=True, progressive=True)
    print("testimonials fallback ->", dest, fallback.size, os.path.getsize(dest), "bytes")


# ---------------------------------------------------------------------------
# 7. Narrative panel photo (service pages) -- full-bleed, no forced aspect
#    crop since the panel's on-screen aspect varies with viewport; object-fit:
#    cover in CSS handles cropping at render time. Mirrors process_hero.
# ---------------------------------------------------------------------------
NARRATIVE_WIDTHS = [480, 800, 1200]

NARRATIVE_SOURCES = {
    "servicio-limpieza-industrial-narrativa": "limpieza-industrial-inerna.jpg",
    "limpieza-data-centers-secundaria": "limpieza-data-centers-secundaria.jpg",
    "limpieza-aeroespacial-secundaria": "limpieza-aeroespacial-secundaria .jpg",
    "mantenimiento-industrial-secundaria": "mantenimiento-industrial-secundaria.jpg",
    "fumigacion-control-plagas-secundaria": "fumigaci*n-y-control-de-plagas.jpg",
    "jardineria-industrial-corporativa-secundaria": "jaridneria-industrial-corporativa-secundaria.jpg",
    "mantenimiento-integral-oficinas-secundaria": "mantenimeinto-integgral-oficinas-secundaria.jpg",
    "comercializadora-insumos-secundaria": "comercializadora-de-insumos-secundaria.jpg",
}


def process_narrative():
    for slug, filename in NARRATIVE_SOURCES.items():
        # Glob rather than a literal join -- GitHub's web upload can normalize
        # accented filenames (NFD, where an accented letter is two codepoints)
        # in a way that doesn't match a hardcoded literal from an editor (NFC,
        # one codepoint), so a "*" wildcard over the accented span sidesteps it.
        matches = glob.glob(os.path.join(ROOT, filename))
        src = matches[0] if matches else os.path.join(ROOT, filename)
        if not matches and not os.path.exists(src):
            print("process_narrative: skipping, source not found:", filename)
            continue
        im = Image.open(src)
        im = ImageOps.exif_transpose(im).convert("RGB")

        for w in NARRATIVE_WIDTHS:
            if w >= im.width:
                resized = im.copy()
            else:
                ratio = w / im.width
                resized = im.resize((w, round(im.height * ratio)), Image.LANCZOS)
            dest = out("services", f"{slug}-{w}.webp")
            resized.save(dest, "WEBP", quality=78, method=6)
            print("narrative ->", dest, resized.size, os.path.getsize(dest), "bytes")

        fb_w = 800
        ratio = fb_w / im.width
        fallback = im.resize((fb_w, round(im.height * ratio)), Image.LANCZOS)
        dest = out("services", f"{slug}-{fb_w}.jpg")
        fallback.save(dest, "JPEG", quality=80, optimize=True, progressive=True)
        print("narrative fallback ->", dest, fallback.size, os.path.getsize(dest), "bytes")


if __name__ == "__main__":
    process_logo()
    process_hero()
    process_clients()
    process_favicon()
    process_services()
    process_testimonials()
    process_narrative()
