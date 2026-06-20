# Recortar Retratos

Remove o fundo de retratos e exporta cada pessoa em um **PNG com fundo transparente**.
Roda **100% local** no Mac (as fotos nunca saem do computador), de graça, em lote.

Usa [`rembg`](https://github.com/danielgatis/rembg) com o modelo **birefnet-portrait**, que
preserva bem as bordas do cabelo.

## Como usar (Mac)

1. Baixe o projeto (botão verde **Code → Download ZIP**) e descompacte — ou use o
   pacote pronto `Recortar-Retratos.zip`.
2. Coloque as fotos dentro da pasta **`fotos`** (aceita JPG, PNG, HEIC do iPhone, TIFF…).
3. Abra o **`Recortar Retratos.command`**.
   - **Na primeira vez:** clique com o **botão direito** (ou Control+clique) → **Abrir** →
     **Abrir**, para passar pelo aviso de "desenvolvedor não identificado". Só uma vez.
4. Espere. Na primeira execução ele baixa o motor pela internet (~1 GB, uma única vez).
   Depois funciona offline e rápido.
5. Os PNGs transparentes aparecem na pasta **`recortados`** (que abre sozinha ao terminar).

## Detalhes

- **Idempotente:** roda quantas vezes quiser; pula as fotos que já foram feitas, então dá
  para ir adicionando fotos aos poucos.
- **HEIC do iPhone:** convertido automaticamente (via `sips`, nativo do macOS).
- **Privacidade:** todo o processamento é local; nenhuma imagem é enviada para a internet.
- O motor fica instalado em `~/.recortarretratos` (não polui o sistema; pode apagar para
  remover tudo).

## Requisitos

- macOS (Apple Silicon ou Intel).
- Internet apenas na primeira execução (para baixar o motor e o modelo).
