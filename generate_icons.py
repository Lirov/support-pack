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

def create_png(size, r=56, g=189, b=248):
    # PNG Signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    ihdr_chunk = make_chunk('IHDR', ihdr_data)

    # IDAT
    raw_lines = []
    margin = max(1, int(size * 0.15))
    for y in range(size):
        line = bytearray([0]) # Filter none
        for x in range(size):
            is_inside = (margin <= x < size - margin) and (margin <= y < size - margin)
            if is_inside:
                line.extend([r, g, b, 255])
            else:
                line.extend([15, 23, 42, 255])
        raw_lines.append(bytes(line))

    raw_buffer = b''.join(raw_lines)
    compressed = zlib.compress(raw_buffer)
    idat_chunk = make_chunk('IDAT', compressed)

    # IEND
    iend_chunk = make_chunk('IEND', b'')

    return sig + ihdr_chunk + idat_chunk + iend_chunk

icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(icons_dir, exist_ok=True)

for size in [16, 32, 48, 128]:
    png_buf = create_png(size)
    filepath = os.path.join(icons_dir, f'icon{size}.png')
    with open(filepath, 'wb') as f:
        f.write(png_buf)
    print(f'Created icon{size}.png ({len(png_buf)} bytes)')

print('All PNG icons generated successfully!')
