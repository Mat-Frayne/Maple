import aiohttp
import asyncio
import dataset
from scripts.player import Player
from scripts.websockets import Sock
from quart import Quart, jsonify, render_template, request, websocket, render_template_string
from PyLog import Log, Logger
from bs4 import BeautifulSoup
from user_agents import parse
import json
Logger.level = 5
devices = {}

database = dataset.connect(
    f"sqlite:///data.db?check_same_thread=False")

app = Quart(__name__)
socket = Sock(app)
player = Player(app)

@socket.on("test")
def test(data):
    """."""
    Log(data)

@socket.on("test1")
def test(data):
    """."""
    Log(data)

# @app.route("/search")
# @app.websocket('/search')
# def youtube_search(args=None):
#     Log(args)
#     relevence = "EgIQAQ%253D%253D"
#     views = "CAMSAhAB"
#     q = args.get("q")
#     sp = views if args.get("byviews") else relevence
#     page = args.get("token", 0) + 1
#     url = f"https://www.youtube.com/results?search_query={q}&sp={sp}&page={page}"
#     Log(url)
#     loop = asyncio.new_event_loop()

#     async def go():
#         async with aiohttp.ClientSession() as cs:
#             async with cs.get(url) as r:
#                 res = await r.text()
        
#         soup = BeautifulSoup(res, "html.parser")
#         with open("test.html", "wb") as f:
#             f.write(res.encode('utf-8','ignore'))
#         items = soup.find_all(class_="yt-uix-tile")
#         results = {"items" : {}, "nextPageToken": page}
        
#         for x in items:
#             try:
#                 id_ = x.find(class_="yt-uix-sessionlink", href=True)["href"].split('?v=')[1]
#                 bg = x.find(class_="yt-thumb-simple").find("img").get("data-thumb") or x.find(class_="yt-thumb-simple").find("img").get("src")
#                 if not bg:
#                     Log(x.find(class_="yt-thumb-simple").find("img"), level =3)
#                 item = {
#                     "bg": bg,
#                     "title": x.find(class_="yt-uix-tile-link").text,
#                     "source": x.find(class_="yt-lockup-byline").text,
#                     "views": x.find(class_="yt-lockup-meta-info").find_all('li')[1].text,
#                 }
#                 results["items"][id_] = item
#             except Exception as exc:
#                 Log(exc, level=3)
#         return results

#     res = loop.run_until_complete(go())
#     return res

# @app.websocket("/player")
# def current(_):
#     """."""
#     return player.current


    # opts = parse(str(request.user_agent))
    # devices[request.sid] = {
    #     "device" : "Desktop" if opts.is_pc else opts.device,
    #     "os": opts.os.family ,
    #     "browser": opts.browser.family
    # }
    # Log(devices)

# @app.websocket("/disconnect")
# def disconnect():
#     """."""
#     devices.pop(request.sid)

@app.route("/")
async def index():
    """."""
    try:
        return await render_template("index.html")
    except Exception as exc:
        Log(exc)

# @app.route("/player")
# def player():
#     """."""
#     return jsonify(vars(player))
app.run('localhost', port=80, debug=True)


# host="0.0.0.0", port=80, debug=True, use_reloader=True