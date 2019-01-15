from collections import deque
import youtube_dl
import functools
from PyLog import Log
from flask import request
import aiohttp
import asyncio
from mutagen.id3 import APIC, ID3, TALB, TIT2, TPE1, ID3NoHeaderError, WPUB
from mutagen import File as File_
from quart import websocket


class Player(object):
    """."""

    def __init__(self, app, *args, **kwargs):
        """."""
        self.socket = app.websocket
        self.played = []
        self.queue = deque()
        self.nowplaying = None
        self.paused = True
        self.device = None
        
        @self.socket("/conndata")
        async def sockconn():
            """."""
            if self.device == None:
                self.device = request.sid
            return {"playing": self.paused, "data": self.nowplaying}

        @self.socket("/play")
        async def socketplay(data):
            """."""
            data = self.getinfo(data.get("id"))
            self.nowplaying = data
            if not self.device == request.sid:
                self.socket.emit('pauseplayer', broadcast=True)
                self.device = request.sid
            websocket.emit(
                'playplayer', {"playing": data, "device": self.device}, broadcast=True)

        @self.socket("/playerupdate")
        async def playerupdate(data1):
            """."""
            self.paused = True
            self.nowplaying = data1
            websocket.emit('playerupdate', {
                             "data": data1, "device": request.sid}, broadcast=True)

        @self.socket("/playerpause")
        async def pauseplayer():
            """."""
            websocket.emit("playerpause", {
                        "device": self.device, "from": request.sid}, broadcast=True)

        @self.socket("/save")
        async def savesong(data):
            """."""
            async def dl():
                """."""
                try:
                    info = self.getinfo(data.get("id"))
                    title = info.get('track') or info.get('alt_title') or info.get('title')
                    artist = info.get('artist') or info.get('creator') or info.get('uploader')
                    output = f"music/{artist}/{title}"
                    Log(output)
                    ydl_opts = {
                        'quiet': True,
                        "writethumbnail": True,
                        "extract-audio": True,
                        "outtmpl": output + ".%(ext)s",
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '320',
                        }],
                        "progress_hooks":[self.dlupdate]
                    }
                    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                        old = ydl.download([info.get("id")])
                        keys = ["id", "alt_title", "artist", "creator", "duration",
                                "url", "thumbnail", "title", "track", "uploader", "view_count"]
                    try:
                        id3 = ID3(
                            f"{output}.mp3")
                    except ID3NoHeaderError:
                        id3 = File_(
                            f"{output}.mp3", easy=True)

                    id3.add(TIT2(encoding=3, text=title))
                    # id3.add(TALB(encoding=3, text=album))
                    id3.add(TPE1(encoding=3, text=artist))
                    id3.add(APIC(
                        encoding=3, # 3 is for utf-8
                        mime='image/jpg', # image/jpeg or image/png
                        type=3, # 3 is for the cover image
                        desc=u'Cover',
                        data=open(f'{output}.jpg', "rb").read()
                    ))
                    id3.add(WPUB(info.get("id")))
                    id3.save()
                    Log(f"Added meta to {title}.mp3")
                    return old
                except Exception as exc:
                    raise
                    Log(exc, level=3)
            loop = asyncio.new_event_loop()
            ret = loop.run_until_complete(dl())
            Log(ret)

        @self.socket("/disconnect")
        async def disconnect():
            """."""
            if self.device == request.sid:
                self.device = None
                self.paused = True

    def dlupdate(self, b):
        """."""
        Log(str(round((b.get("downloaded_bytes") / b.get("total_bytes")) * 100)) + "%")

    @property
    def current(self):
        """."""
        if len(self.queue) > 0:
            return self.queue[0]
        else:
            return None

    def play(self, data):
        """."""
        self.socket.broadcast.emit('player', {"playing": data})

    def prependqueue(self, data):
        """."""
        self.queue.appendleft(data.get("id"))

    def appendqueue(self, data):
        """."""
        self.queue.append(data.get("id"))

    @staticmethod
    def getinfo(id):
        """."""
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'format': 'bestaudio',
            'preferredcodec': 'mp3',
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            old = ydl.extract_info(id, download=False)
            keys = ["id", "alt_title", "artist", "creator", "duration",
                    "url", "thumbnail", "title", "track", "uploader", "view_count"]
            return {key: old.get(key, "") for key in keys}
