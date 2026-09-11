import os
import struct
import zlib

def crc32(data):
    return zlib.crc32(data) & 0xffffffff

def make_chunk(chunk_type, data):
    length = struct.pack('>I', len(data))
    type_bytes = chunk_type.encode('ascii')
    crc = struct.pack('>I', crc32(type_bytes + data))
    return length + type_bytes + data + crc

def create_rgb_png(width, height, draw_func):
    sig = b'\x89PNG\r\n\x1a\n'
    # IHDR: width, height, bit_depth=8, color_type=2 (RGB), compression=0, filter=0, interlace=0
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = make_chunk('IHDR', ihdr_data)

    raw_lines = []
    for y in range(height):
        line = bytearray([0]) # filter none
        for x in range(width):
            r, g, b = draw_func(x, y, width, height)
            line.extend([r, g, b])
        raw_lines.append(bytes(line))

    raw_buffer = b''.join(raw_lines)
    compressed = zlib.compress(raw_buffer, level=6)
    idat_chunk = make_chunk('IDAT', compressed)
    iend_chunk = make_chunk('IEND', b'')

    return sig + ihdr_chunk + idat_chunk + iend_chunk

# 1. Screenshot Draw Function (1280x800) - Developer Dark UI Mockup
def draw_screenshot(x, y, w, h):
    # Background gradient (#0f172a to #1e293b)
    bg_r = int(15 + (x / w) * 10)
    bg_g = int(23 + (y / h) * 15)
    bg_b = int(42 + (y / h) * 20)

    # Central Card Modal Bounds (w: 520, h: 620 centered)
    cx_min, cx_max = (w - 520) // 2, (w + 520) // 2
    cy_min, cy_max = (h - 620) // 2, (h + 620) // 2

    if cx_min <= x < cx_max and cy_min <= y < cy_max:
        rel_x = x - cx_min
        rel_y = y - cy_min

        # Card header (rel_y < 60)
        if rel_y < 60:
            return (30, 41, 59) # #1e293b
        # Privacy banner (rel_y < 110)
        elif 65 <= rel_y < 105 and 15 <= rel_x < 505:
            return (51, 65, 85) # #334155
        # Code textarea container (rel_y 120 to 550)
        elif 120 <= rel_y < 550 and 15 <= rel_x < 505:
            # Border
            if rel_y == 120 or rel_y == 549 or rel_x == 15 or rel_x == 504:
                return (56, 189, 248) # cyan accent border
            return (9, 13, 22) # #090d16 code background
        # Copy button (rel_y 565 to 600)
        elif 565 <= rel_y < 600 and 350 <= rel_x < 505:
            return (34, 197, 94) # #22c55e success green
        else:
            return (30, 41, 59)

    return (bg_r, bg_g, bg_b)

# 2. Small Promo Draw Function (440x280)
def draw_small_promo(x, y, w, h):
    # Cyan gradient with dark tech accents
    t = y / h
    r = int(15 * (1 - t) + 30 * t)
    g = int(23 * (1 - t) + 41 * t)
    b = int(42 * (1 - t) + 59 * t)

    # Accent icon box in center
    cx, cy = w // 2, h // 2
    if abs(x - cx) < 50 and abs(y - cy) < 50:
        return (56, 189, 248) # Cyan primary icon

    return (r, g, b)

os.makedirs('store-assets', exist_ok=True)

# Generate 1280x800 Screenshot (RGB 24-bit no alpha)
print("Generating 1280x800 Screenshot PNG...")
scr_png = create_rgb_png(1280, 800, draw_screenshot)
with open('store-assets/screenshot1.png', 'wb') as f:
    f.write(scr_png)
print(f"Created store-assets/screenshot1.png ({len(scr_png)} bytes)")

# Generate 440x280 Small Promo Tile (RGB 24-bit no alpha)
print("Generating 440x280 Small Promo Tile PNG...")
promo_png = create_rgb_png(440, 280, draw_small_promo)
with open('store-assets/small-promo.png', 'wb') as f:
    f.write(promo_png)
print(f"Created store-assets/small-promo.png ({len(promo_png)} bytes)")

# Ensure 128x128 Store Icon is RGB 24-bit no alpha
def draw_icon(x, y, w, h):
    margin = int(w * 0.15)
    if margin <= x < w - margin and margin <= y < h - margin:
        return (56, 189, 248)
    return (15, 23, 42)

icon_png = create_rgb_png(128, 128, draw_icon)
with open('store-assets/store-icon-128.png', 'wb') as f:
    f.write(icon_png)
print(f"Created store-assets/store-icon-128.png ({len(icon_png)} bytes)")

print("All store graphic assets created successfully!")
