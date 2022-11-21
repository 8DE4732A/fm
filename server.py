import sys
import qtfm
from sanic import Sanic
from sanic.response import html, json, text

app = Sanic(__name__)

@app.get("/")
async def index(request):
    with open(sys.path[0] + '/index.html', 'r', encoding='utf-8') as f:
        return html(f.read())

@app.get("/regions")
async def regions(request):
    return json(qtfm.get_regions())

@app.get('/radios/<cid>')
async def radios(request, cid):
    return json(qtfm.get_radios(cid))

@app.get('/mp3/<id>')
async def mp3(request, id):
    return text(qtfm.get_mp3_url(id))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)





