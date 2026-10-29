"""Local preview with byte ranges, required for seeking background audio."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os, re

class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.remaining = None
        path = self.translate_path(self.path)
        header = self.headers.get('Range')
        if not header or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        if not match or not any(match.groups()):
            self.send_error(416)
            return None
        first, last = match.groups()
        start = int(first) if first else max(0, size-int(last))
        end = min(int(last),size-1) if first and last else size-1
        if start >= size or start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return None
        source = open(path, 'rb')
        source.seek(start)
        self.remaining = end-start+1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length',str(self.remaining))
        self.end_headers()
        return source

    def copyfile(self, source, outputfile):
        if self.remaining is None:
            return super().copyfile(source,outputfile)
        while self.remaining > 0:
            chunk=source.read(min(65536,self.remaining))
            if not chunk: break
            outputfile.write(chunk)
            self.remaining-=len(chunk)

if __name__=='__main__':
    os.chdir(Path(__file__).resolve().parent.parent)
    print('Para Reni: http://127.0.0.1:4174',flush=True)
    ThreadingHTTPServer(('127.0.0.1',4174),Handler).serve_forever()
