import os
from PIL import Image, ImageDraw, ImageFilter

def draw_pro_icon(size=512):
    # Create RGBA image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Padding
    pad = int(size * 0.06)
    
    # 1. Background Rounded Rectangle (Dark slate #0f172a with subtle cyan border)
    corner_radius = int(size * 0.22)
    
    # Draw subtle glow/shadow
    bg_box = [pad, pad, size - pad, size - pad]
    draw.rounded_rectangle(bg_box, radius=corner_radius, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=max(2, int(size * 0.02)))

    # 2. Document / Report Card Sheet (Centered white/light slate sheet)
    doc_w = int(size * 0.54)
    doc_h = int(size * 0.64)
    doc_x = (size - doc_w) // 2
    doc_y = (size - doc_h) // 2 + int(size * 0.02)
    
    doc_radius = int(size * 0.05)
    doc_box = [doc_x, doc_y, doc_x + doc_w, doc_y + doc_h]
    draw.rounded_rectangle(doc_box, radius=doc_radius, fill=(30, 41, 59, 255), outline=(148, 163, 184, 200), width=max(1, int(size * 0.012)))

    # 3. Report Header Bar inside Document
    head_h = int(doc_h * 0.20)
    head_box = [doc_x, doc_y, doc_x + doc_w, doc_y + head_h]
    # Header rounded top
    draw.rounded_rectangle([doc_x, doc_y, doc_x + doc_w, doc_y + head_h + 10], radius=doc_radius, fill=(56, 189, 248, 255))

    # Header Title Dots (Window controls)
    dot_y = doc_y + head_h // 2
    dot_r = max(2, int(size * 0.012))
    for i, color in enumerate([(239, 68, 68), (245, 158, 11), (34, 197, 94)]):
        dot_x = doc_x + int(size * 0.04) + i * int(size * 0.035)
        draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=color)

    # 4. Text / Report Code Lines inside Document
    line_x = doc_x + int(doc_w * 0.12)
    max_line_w = int(doc_w * 0.76)
    start_y = doc_y + head_h + int(doc_h * 0.12)
    line_gap = int(doc_h * 0.09)
    line_h = max(2, int(size * 0.016))

    line_widths = [0.85, 0.65, 0.90, 0.45, 0.75, 0.55]
    line_colors = [
        (248, 250, 252, 240), # Text white
        (56, 189, 248, 240),  # Cyan URL
        (248, 113, 113, 240), # Red console error line
        (148, 163, 184, 200), # Muted text
        (34, 197, 94, 240),   # Green request line
        (148, 163, 184, 200)
    ]

    for idx, (lw_pct, col) in enumerate(zip(line_widths, line_colors)):
        curr_y = start_y + idx * line_gap
        if curr_y + line_h > doc_y + doc_h - int(doc_h * 0.08):
            break
        w_px = int(max_line_w * lw_pct)
        draw.rounded_rectangle([line_x, curr_y, line_x + w_px, curr_y + line_h], radius=line_h // 2, fill=col)

    # 5. Diagnostic Checkmark Badge at Bottom Right
    badge_r = int(size * 0.12)
    badge_cx = doc_x + doc_w - int(size * 0.02)
    badge_cy = doc_y + doc_h - int(size * 0.02)
    
    draw.ellipse([badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r], fill=(34, 197, 94, 255), outline=(15, 23, 42, 255), width=max(2, int(size * 0.02)))
    
    # White checkmark in badge
    ck_w = max(2, int(size * 0.025))
    p1 = (badge_cx - int(badge_r * 0.4), badge_cy)
    p2 = (badge_cx - int(badge_r * 0.1), badge_cy + int(badge_r * 0.35))
    p3 = (badge_cx + int(badge_r * 0.45), badge_cy - int(badge_r * 0.35))
    draw.line([p1, p2, p3], fill=(255, 255, 255, 255), width=ck_w, joint='round')

    return img

os.makedirs('icons', exist_ok=True)
os.makedirs('store-assets', exist_ok=True)

# Generate master 512px icon
master_img = draw_pro_icon(512)

# Save icons in all required sizes
for sz in [16, 32, 48, 128]:
    resized = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(f'icons/icon{sz}.png')
    print(f'Generated icons/icon{sz}.png ({sz}x{sz})')

# Save RGB 24-bit no alpha 128x128 store icon
rgb_store_icon = Image.new('RGB', (128, 128), (15, 23, 42))
resized_128 = master_img.resize((128, 128), Image.Resampling.LANCZOS)
rgb_store_icon.paste(resized_128, (0, 0), resized_128)
rgb_store_icon.save('store-assets/store-icon-128.png')
print('Generated store-assets/store-icon-128.png')

print('All professional report-styled icons generated successfully!')
