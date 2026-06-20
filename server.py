"""
Recortar Retratos — backend.

API mínima que remove o fundo de retratos usando rembg (modelo birefnet-portrait)
e serve o frontend estático.

Rodar localmente:
    uvicorn server:app --host 0.0.0.0 --port 8000
"""
import io
import os

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

# Suporte a HEIC/HEIF (fotos de iPhone), multiplataforma.
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

from rembg import new_session, remove

MODEL = os.environ.get("RR_MODEL", "birefnet-portrait")
MAX_BYTES = int(os.environ.get("RR_MAX_BYTES", str(25 * 1024 * 1024)))  # 25 MB por imagem

app = FastAPI(title="Recortar Retratos", docs_url=None, redoc_url=None)

# Carrega o modelo uma única vez (custa ~1 GB de RAM; reaproveitado entre requisições).
_session = None


def get_session():
    global _session
    if _session is None:
        _session = new_session(MODEL)
    return _session


@app.on_event("startup")
def _warmup():
    get_session()


@app.get("/api/health")
def health():
    return {"ok": True, "model": MODEL}


@app.post("/api/remove")
async def remove_bg(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Imagem muito grande (máx. 25 MB).")
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
        if img.mode != "RGBA":
            img = img.convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Não foi possível ler a imagem.")

    out = remove(img, session=get_session())
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/png")


# --- frontend estático (montado por último para não capturar /api) ---
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


app.mount("/", StaticFiles(directory=STATIC_DIR), name="static")
