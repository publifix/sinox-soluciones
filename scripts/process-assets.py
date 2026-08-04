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


if __name__ == "__main__":
    process_logo()
    process_hero()
    process_clients()
    process_favicon()
