"""."""
from PyLog import Log
import json
from quart import websocket, request


class Sock():
    """."""
    def __init__(self, app, *args, **kwargs):
        """."""
        self.socks = {}
        self.clients = []
        @app.websocket("/ws")
        async def connect():
            """."""
            while True:
                conn = websocket._get_current_object()
                if conn not in self.clients:
                    self.clients.append(conn)
                    await self.emit(websocket.host)
                data = await websocket.receive()
                Log(data)
                try:
                    js = json.loads(data)
                    for key in js.keys():
                        if key in self.socks:
                            self.socks.get(key)(js.get(key))
                except Exception as exc:
                    Log(exc, level=5)
                Log(self.socks)
    
    def on(self, string):
        def decorate(func):
            self.socks[string] = func
        return decorate

    async def emit(self, data):
        """."""
        for x in self.clients:
            try:
                await x.send(data)
            except:
                self.clients.remove(websocket._get_current_object())