/* TCHAU.BG — frontend logic */
(() => {
  "use strict";

  const drop = document.getElementById("drop");
  const fileInput = document.getElementById("file");
  const grid = document.getElementById("grid");
  const bar = document.getElementById("bar");
  const statDone = document.getElementById("stat-done");
  const statTotal = document.getElementById("stat-total");
  const btnZip = document.getElementById("btn-zip");
  const btnClear = document.getElementById("btn-clear");
  const tpl = document.getElementById("card-tpl");

  /** @type {{name:string, blob:Blob}[]} */
  const results = [];
  let total = 0;
  let done = 0;
  let inFlight = 0;

  const MAX_CONCURRENT = 3;
  const queue = [];

  function refreshBar() {
    bar.hidden = total === 0;
    statTotal.textContent = String(total);
    statDone.textContent = String(done);
    btnZip.disabled = results.length === 0;
  }

  const baseName = (name) => {
    const i = name.lastIndexOf(".");
    return i > 0 ? name.slice(0, i) : name;
  };

  function pump() {
    while (inFlight < MAX_CONCURRENT && queue.length) {
      const job = queue.shift();
      inFlight++;
      job().finally(() => {
        inFlight--;
        pump();
      });
    }
  }

  async function processFile(file) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    const img = node.querySelector("img");
    const nameEl = node.querySelector(".card-name");
    const dlBtn = node.querySelector(".card-dl");
    const errEl = node.querySelector(".card-err");
    const outName = baseName(file.name) + ".png";
    nameEl.textContent = outName;
    grid.prepend(node);

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch("/api/remove", { method: "POST", body: fd });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      img.src = url;
      img.alt = outName;
      // decodifica antes de revelar (sem flicker)
      try { await img.decode(); } catch (_) {}

      node.classList.add("done");
      requestAnimationFrame(() => img.classList.add("ready"));

      const entry = { name: outName, blob };
      results.push(entry);
      dlBtn.disabled = false;
      dlBtn.addEventListener("click", () => downloadBlob(blob, outName));
    } catch (e) {
      node.classList.add("done");
      img.remove();
      errEl.hidden = false;
    } finally {
      done++;
      refreshBar();
    }
  }

  function addFiles(fileList) {
    const files = Array.from(fileList).filter(
      (f) => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name)
    );
    if (!files.length) return;
    total += files.length;
    refreshBar();
    for (const f of files) queue.push(() => processFile(f));
    pump();
  }

  function downloadBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function downloadZip() {
    if (!results.length || typeof JSZip === "undefined") return;
    btnZip.disabled = true;
    const prev = btnZip.innerHTML;
    btnZip.textContent = "compactando…";
    const zip = new JSZip();
    const used = {};
    for (const r of results) {
      let n = r.name;
      if (used[n] != null) n = baseName(r.name) + "-" + ++used[r.name] + ".png";
      else used[n] = 0;
      zip.file(n, r.blob);
    }
    const out = await zip.generateAsync({ type: "blob" });
    downloadBlob(out, "tchaubg.zip");
    btnZip.innerHTML = prev;
    btnZip.disabled = false;
  }

  function clearAll() {
    grid.innerHTML = "";
    results.length = 0;
    queue.length = 0;
    total = 0;
    done = 0;
    refreshBar();
  }

  // ---- eventos ----
  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", () => {
    addFiles(fileInput.files);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("is-drag");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === "dragleave" && drop.contains(e.relatedTarget)) return;
      drop.classList.remove("is-drag");
    })
  );
  drop.addEventListener("drop", (e) => {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => e.preventDefault());

  btnZip.addEventListener("click", downloadZip);
  btnClear.addEventListener("click", clearAll);

  // ---- reportar bug (lightbox -> e-mail) ----
  function openBugReport() {
    const wrap = document.createElement("div");
    wrap.className = "lightbox";
    wrap.innerHTML = `
      <div class="lb-card" role="dialog" aria-modal="true" aria-label="Reportar bug">
        <h2>Reportar bug</h2>
        <p class="sub">Conta o que aconteceu. Ao enviar, abre seu app de e-mail com a mensagem pronta pra fernando drudi.</p>
        <div class="field">
          <label for="bugEmail">Seu e-mail (opcional)</label>
          <input id="bugEmail" type="email" placeholder="voce@email.com" autocomplete="email" />
        </div>
        <div class="field">
          <label for="bugMsg">O que rolou?</label>
          <textarea id="bugMsg" placeholder="Descreva o bug, em qual etapa, o que você esperava…"></textarea>
        </div>
        <div class="lb-actions">
          <button class="btn btn-ghost" type="button" id="bugCancel">cancelar</button>
          <button class="btn btn-primary" type="button" id="bugSend">enviar</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const close = () => {
      wrap.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    wrap.querySelector("#bugCancel").addEventListener("click", close);
    wrap.querySelector("#bugMsg").focus();

    wrap.querySelector("#bugSend").addEventListener("click", () => {
      const msg = wrap.querySelector("#bugMsg").value.trim();
      const from = wrap.querySelector("#bugEmail").value.trim();
      if (!msg) { wrap.querySelector("#bugMsg").focus(); return; }
      const subject = encodeURIComponent("Bug report — TCHAU.BG");
      const body = encodeURIComponent(
        `${msg}\n\n---\nDe: ${from || "(não informado)"}\nPágina: ${location.href}\nNavegador: ${navigator.userAgent}`
      );
      window.location.href = `mailto:f.drudi@gmail.com?subject=${subject}&body=${body}`;
      close();
    });
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".report-bugs");
    if (b) { e.preventDefault(); openBugReport(); }
  });
})();
