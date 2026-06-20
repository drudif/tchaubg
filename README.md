# RECORTAR RETRATOS

Aplicação web que remove o fundo de retratos e exporta cada pessoa em **PNG
transparente**. Arraste as fotos, baixe os recortes — individualmente ou tudo
num `.zip`.

Usa [`rembg`](https://github.com/danielgatis/rembg) com o modelo
**birefnet-portrait** (bordas de cabelo bem limpas). Frontend em
HTML/CSS/JS puro, estética vaporwave Y2K (fontes Michroma + Martian Mono).

## Rodar localmente

```bash
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

Abra <http://localhost:8000>. No primeiro start ele baixa o modelo (~1 GB,
uma vez).

## Rodar com Docker

```bash
docker build -t recortar-retratos .
docker run -p 8000:8000 recortar-retratos
```

O `Dockerfile` já embute o modelo na imagem, então não há download no primeiro
acesso.

## Publicar online

Qualquer host que rode contêiner Docker serve. O modelo precisa de RAM:

- **Render** / **Railway** / **Fly.io**: subir via `Dockerfile`. Use uma
  instância com **≥ 2 GB de RAM** (o birefnet + onnxruntime consomem ~1–1.5 GB).
- A porta é lida de `$PORT` automaticamente.

> Observação: tiers gratuitos com pouca RAM podem derrubar o processo ao
> carregar o modelo. Para uso real, escolha um plano com 2 GB+.

## Estrutura

```
server.py            API FastAPI (POST /api/remove) + serve o frontend
static/index.html    interface
static/style.css     estética vaporwave Y2K
static/app.js        upload, fila, download (.zip via JSZip)
Dockerfile           imagem com o modelo embutido
requirements.txt
```

## Privacidade

As imagens são processadas no servidor e **não são armazenadas** — ficam só em
memória durante o recorte.
