"""Remove private text/EXIF metadata without changing PNG image data."""
from pathlib import Path
import struct

def clean_png(path):
    path = Path(path)
    data = path.read_bytes()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('Expected a PNG image')
    result = bytearray(data[:8])
    offset = 8
    removed = []
    while offset < len(data):
        length = struct.unpack('>I', data[offset:offset+4])[0]
        kind = data[offset+4:offset+8]
        end = offset+12+length
        if kind in (b'tEXt', b'zTXt', b'iTXt', b'eXIf'):
            removed.append(kind.decode('ascii'))
        else:
            result.extend(data[offset:end])
        offset = end
    path.write_bytes(result)
    return removed

if __name__ == '__main__':
    print('Removed metadata chunks:', clean_png(Path(__file__).resolve().parent.parent/'assets/corazon.png'))
