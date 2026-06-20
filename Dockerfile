FROM python:3.11-slim

# libs de sistema p/ onnxruntime / pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
      libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pré-baixa o modelo para dentro da imagem (evita download no 1º request).
ENV U2NET_HOME=/app/.models
RUN python -c "from rembg import new_session; new_session('birefnet-portrait')"

EXPOSE 8000
# Render/Railway injetam a porta em $PORT; cai pra 8000 localmente.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
