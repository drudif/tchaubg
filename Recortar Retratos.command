#!/bin/bash
#
# Recortar Retratos — remove o fundo e deixa a pessoa em PNG transparente.
# Basta dar dois cliques. Na primeira vez baixa o motor (precisa de internet).
#
clear
echo "============================================="
echo "        RECORTAR RETRATOS"
echo "  (remove o fundo -> PNG transparente)"
echo "============================================="
echo ""

# --- pastas ---
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
IN="$APP_DIR/fotos"
OUT="$APP_DIR/recortados"
ENGINE="$HOME/.recortarretratos"     # motor fica escondido na pasta do usuario
VENV="$ENGINE/env"
UVBIN="$ENGINE/uv/uv"
REMBG="$VENV/bin/rembg"
mkdir -p "$IN" "$OUT" "$ENGINE"

# --- 1) instala o gerenciador (uv), so na 1a vez ---
if [ ! -x "$UVBIN" ]; then
  echo ">> Primeira vez: instalando o motor. Isso precisa de internet."
  echo "   (so acontece uma vez, pode demorar um pouco)"
  echo ""
  mkdir -p "$ENGINE/uv"
  curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="$ENGINE/uv" INSTALLER_NO_MODIFY_PATH=1 sh
fi
if [ ! -x "$UVBIN" ]; then
  echo ""
  echo "!! Nao consegui instalar o motor. Verifique a conexao com a internet e tente de novo."
  echo ""
  read -n 1 -s -r -p "Pressione qualquer tecla para fechar."
  exit 1
fi

# --- 2) instala o recortador (rembg), so na 1a vez ---
if [ ! -x "$REMBG" ]; then
  echo ""
  echo ">> Instalando o recortador (uns minutos na primeira vez)..."
  "$UVBIN" venv "$VENV" --python 3.11
  "$UVBIN" pip install --python "$VENV/bin/python" "rembg[cpu,cli]"
fi
if [ ! -x "$REMBG" ]; then
  echo ""
  echo "!! Falha ao instalar o recortador. Tente rodar de novo com internet."
  echo ""
  read -n 1 -s -r -p "Pressione qualquer tecla para fechar."
  exit 1
fi

# --- 3) processa as fotos ---
echo ""
echo ">> Procurando fotos em: $IN"
shopt -s nullglob nocaseglob
total=0; feitas=0; puladas=0
for f in "$IN"/*.{jpg,jpeg,png,heic,heif,webp,tif,tiff}; do
  [ -f "$f" ] || continue
  total=$((total+1))
  base="$(basename "$f")"; stem="${base%.*}"
  if [ -f "$OUT/$stem.png" ]; then puladas=$((puladas+1)); continue; fi

  # converte HEIC/HEIF do iPhone para PNG antes (usa o sips, ja vem no Mac)
  ext="$(echo "${base##*.}" | tr '[:upper:]' '[:lower:]')"
  src="$f"; tmp=""
  if [ "$ext" = "heic" ] || [ "$ext" = "heif" ]; then
    tmp="$ENGINE/_tmp.png"
    sips -s format png "$f" --out "$tmp" >/dev/null 2>&1
    src="$tmp"
  fi

  echo "   recortando: $base"
  "$REMBG" i -m birefnet-portrait "$src" "$OUT/$stem.png" 2>/dev/null
  [ -n "$tmp" ] && rm -f "$tmp"
  feitas=$((feitas+1))
done

echo ""
echo "---------------------------------------------"
if [ "$total" -eq 0 ]; then
  echo "Nenhuma foto encontrada."
  echo "Coloque as fotos dentro da pasta 'fotos' e clique de novo."
else
  echo "Concluido!  Recortadas agora: $feitas  |  Ja estavam prontas: $puladas"
  echo "Os PNGs transparentes estao na pasta 'recortados'."
  open "$OUT"
fi
echo "---------------------------------------------"
echo ""
read -n 1 -s -r -p "Pressione qualquer tecla para fechar."
echo ""
