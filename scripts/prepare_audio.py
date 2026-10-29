"""Create the playback excerpt so startup never depends on HTTP seeking."""
from pathlib import Path
import subprocess

root=Path(__file__).resolve().parent.parent
subprocess.run([
    'ffmpeg','-hide_banner','-loglevel','error',
    '-ss','57','-i',str(root/'assets/Neo Romeo.mp3'),
    '-map','0:a:0','-vn','-map_metadata','-1',
    '-c:a','libmp3lame','-q:a','2','-y',str(root/'assets/Neo Romeo desde 0057.mp3')
],check=True)
