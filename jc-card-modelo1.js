(function () {
  const CONFIG = {
    selectors: { title: ".article-title", excerpt: ".featured-image figcaption" },
    card: {
      width: 1200,
      heightByAspect: { "1:1": 1200, "4:5": 1500 },
      defaultAspect: "4:5",
      bgBlurPx: 28,       // intensidade do blur no fundo
      bgDim: 0.85,        // brilho (0.0–1.0)
      backgroundColor: "#000000",
    },
    brand: {
      iconUrl: "https://imagens.ne10.uol.com.br/veiculos/_midias/png/2024/07/27/logo_jc-27530572.png",
      text: " ",
      textColor: "#fff",
      iconSize: 130,
      iconMargin: "2rem 0 0 2rem" // topo/esquerda
    },
    headerBox: {
      background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
      textColor: "#fff",
      padding: "10rem 5rem 5rem",
    },
    ui: { panelBg: "#0b0b2a", panelText: "#fff", panelWidth: 350 },
    html2canvasUrl: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
    proxy: "https://spring-river-efc5.nlakedeveloper.workers.dev/",
    proxyReferer: "https://jc.com.br",
    // ✅ seu CSS externo
    CSS_URL: "https://moisesfalcao.github.io/bookmarks/jc-card-modelo1.css"
  };

  // evita duplicar
  if (window.__OBR_CARD_ACTIVE__) {
    const ov = document.getElementById("ig-card-overlay");
    if (ov) ov.style.display = ov.style.display === "none" ? "block" : "none";
    return;
  }
  window.__OBR_CARD_ACTIVE__ = true;

  // =========== Helpers ===========
  const $ = (sel, root = document) => root.querySelector(sel);

  const proxify = (url) => {
    try {
      const u = new URL(CONFIG.proxy);
      u.searchParams.set("url", new URL(url, location.href).href);
      if (CONFIG.proxyReferer) u.searchParams.set("referer", CONFIG.proxyReferer);
      return u.toString();
    } catch { return url; }
  };

  const blobToDataURL = (b) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b);
  });

  // sempre retorna dataURL (evita canvas “preto” por CORS)
  async function fetchAsDataURL(url) {
    const abs = new URL(url, location.href).href;
    try {
      const r1 = await fetch(abs, { mode: "cors", credentials: "omit" });
      if (r1.ok) return blobToDataURL(await r1.blob());
    } catch {}
    try {
      const r2 = await fetch(proxify(abs), { mode: "cors", credentials: "omit" });
      if (r2.ok) return blobToDataURL(await r2.blob());
    } catch {}
    // último recurso
    try {
      const r3 = await fetch(abs);
      if (r3.ok) return blobToDataURL(await r3.blob());
    } catch {}
    throw new Error("Não foi possível carregar a imagem (CORS).");
  }

  function getOgImage() {
    const m = document.querySelector('meta[property="og:image"], meta[name="og:image"], meta[property="og:image:url"], meta[name="og:image:url"]');
    const c = m && (m.content || m.getAttribute("content")); if (!c) return null;
    try { return new URL(c, location.href).href; } catch { return c; }
  }

  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      if (!/^data:/.test(src)) im.crossOrigin = "anonymous";
      im.src = src;
    });
  }

  // gera bitmap borrado + brilho em canvas (preview e export idênticos)
  async function makeBlurBgDataURL(srcDataURL, targetW, targetH, { blurPx = 28, brightness = 0.85, extraScale = 1.06 } = {}) {
    const img = await loadImg(srcDataURL);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    // cover mantendo proporção
    const ir = img.width / img.height;
    const cr = targetW / targetH;
    let dw, dh;
    if (ir > cr) { // mais larga
      dh = targetH * extraScale;
      dw = dh * ir;
    } else {       // mais alta
      dw = targetW * extraScale;
      dh = dw / ir;
    }
    const dx = (targetW - dw) / 2;
    const dy = (targetH - dh) / 2;

    const brightnessPct = Math.round(brightness * 100);
    ctx.filter = `blur(${blurPx}px) brightness(${brightnessPct}%)`;
    ctx.drawImage(img, dx, dy, dw, dh);

    return canvas.toDataURL("image/png");
  }

  function waitFor(img) {
    if (!img || img.complete) return Promise.resolve();
    return new Promise((res, rej) => { img.addEventListener("load", res, { once: true }); img.addEventListener("error", rej, { once: true }); });
  }

  // =========== Coleta de dados ===========
  const pageTitleText = ($(CONFIG.selectors.title)?.textContent || document.title || "").trim();
  const pageExcerptText = ($(CONFIG.selectors.excerpt)?.textContent || "").trim();
  const ogUrl = getOgImage();

  // =========== Overlay/DOM ===========
  const overlay = document.createElement("div");
  overlay.id = "ig-card-overlay";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "2147483647", background: "#0b0b2a",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
  });
  document.body.appendChild(overlay);

  // CSS externo principal
  const linkCss = document.createElement("link");
  linkCss.rel = "stylesheet";
  linkCss.href = CONFIG.CSS_URL;
  overlay.appendChild(linkCss);

  // CSS auxiliar para o <img> do fundo
  const extraCss = document.createElement("style");
  extraCss.textContent = `
    #ig-bg-blur { position:absolute; inset:0; z-index:1; overflow:hidden; }
    #ig-bg-blur-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    /* garantir edição/seleção */
    #ig-header, #ig-header * { pointer-events:auto; user-select:text; }
    [contenteditable="true"]:focus { outline:2px dashed rgba(255,255,255,.5); outline-offset:4px; caret-color:#fff; }
  `;
  overlay.appendChild(extraCss);

  // Fonte
  const linkFont = document.createElement("link");
  linkFont.rel = "stylesheet";
  linkFont.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
  overlay.appendChild(linkFont);

  // Estrutura do card
  const wrap = document.createElement("div"); wrap.className = "ig-wrap";
  const card = document.createElement("div"); card.id = "ig-card";

  // Fundo como <img> já borrado
  const bgBlur = document.createElement("div"); bgBlur.id = "ig-bg-blur";
  const bgBlurImg = document.createElement("img"); bgBlurImg.id = "ig-bg-blur-img";
  bgBlur.appendChild(bgBlurImg);

  // Imagem principal (contain) com zoom/offset
  const fgWrap = document.createElement("div"); fgWrap.id = "ig-fg-wrap";
  const fgImg = document.createElement("img"); fgImg.id = "ig-fg-img";
  fgWrap.appendChild(fgImg);

  // Conteúdo
  const stack = document.createElement("div"); stack.id = "ig-stack";
  const brand = document.createElement("div"); brand.id = "ig-brand";
  const brandImg = document.createElement("img");
  const brandText = document.createElement("span"); brandText.textContent = CONFIG.brand.text;
  brand.append(brandImg, brandText);

  const header = document.createElement("div"); header.id = "ig-header";
  const hTitle = document.createElement("h1"); hTitle.className = "title"; hTitle.textContent = pageTitleText;
  const pExcerpt = document.createElement("p"); pExcerpt.className = "excerpt"; pExcerpt.textContent = pageExcerptText;
  header.append(hTitle, pExcerpt);

  stack.append(brand, header);
  card.append(bgBlur, fgWrap, stack);
  wrap.appendChild(card);

  // Painel
  const panel = document.createElement("div");
  panel.id = "ig-panel";
  panel.innerHTML = `
    <div style="text-align:center;font-weight:700">Tamanho do texto</div>
    <div class="row">
      <button id="ig-btn-dec">–</button>
      <span id="ig-txt-scale" style="flex:1;text-align:center;font-variant-numeric:tabular-nums">100%</span>
      <button id="ig-btn-inc">+</button>
    </div>
    <button id="ig-btn-reset">Reset geral</button>
    <hr>
    <div style="text-align:center;font-weight:700">Imagem (principal)</div>
    <div class="row"><div class="grid2">
      <input id="ig-fg-zoom" type="range" min="0.5" max="3.0" step="0.01" value="1">
      <span id="ig-fg-zoom-out">100%</span>
    </div></div>
    <div class="row"><div class="grid2">
      <input id="ig-fg-posx" type="range" min="-50" max="50" step="1" value="0">
      <span id="ig-fg-posx-out">0%</span>
    </div></div>
    <div class="row"><div class="grid2">
      <input id="ig-fg-posy" type="range" min="-50" max="50" step="1" value="0">
      <span id="ig-fg-posy-out">0%</span>
    </div></div>
    <button id="ig-btn-toggle-excerpt">🪄 Ocultar resumo</button>
    <hr>
    <div style="text-align:center;font-weight:700">Proporção</div>
    <div class="row">
      <button id="ig-btn-11">1:1</button>
      <button id="ig-btn-45">4:5</button>
    </div>
    <hr>
    <button id="ig-btn-save">💾 Salvar PNG</button>
  `;
  const btnClose = document.createElement("button");
  btnClose.id = "ig-close"; btnClose.textContent = "Fechar";
  btnClose.onclick = () => { overlay.remove(); };

  overlay.append(wrap, panel, btnClose);

  // =========== Edição inline ===========
  function handlePastePlain(e) {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, txt);
  }
  function handleEnterToBr(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  }
  function makeEditableOnClick(el){
    el.setAttribute("spellcheck","false");
    el.addEventListener("click", () => {
      if (el.contentEditable !== "true") {
        el.contentEditable = "true";
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }
    });
    el.addEventListener("paste", handlePastePlain);
    el.addEventListener("keydown", handleEnterToBr);
    el.addEventListener("blur", () => { el.contentEditable = "false"; });
  }
  makeEditableOnClick(hTitle);
  makeEditableOnClick(pExcerpt);

  // =========== Lógica ===========
  (async function init() {
    // brand (como dataURL pra evitar CORS)
    try {
      const iconDataURL = await fetchAsDataURL(CONFIG.brand.iconUrl);
      brandImg.src = iconDataURL;
    } catch {
      brandImg.src = proxify(CONFIG.brand.iconUrl);
    }

    // imagem principal + fundo borrado (bitmap)
    let masterDataURL = null;
    if (ogUrl) {
      try {
        masterDataURL = await fetchAsDataURL(ogUrl);
        fgImg.src = masterDataURL;

        const aspect = CONFIG.card.defaultAspect;
        const blurred = await makeBlurBgDataURL(
          masterDataURL,
          CONFIG.card.width,
          CONFIG.card.heightByAspect[aspect],
          { blurPx: CONFIG.card.bgBlurPx, brightness: CONFIG.card.bgDim, extraScale: 1.06 }
        );
        bgBlurImg.src = blurred;
      } catch (e) {
        console.warn("Falha ao processar bg blur; usando fallback simples.", e);
        if (masterDataURL) bgBlurImg.src = masterDataURL;
      }
    } else {
      console.warn("Sem og:image na página.");
    }

    // estados
    let scale = 1.0;
    const step = 0.05, minScale = 0.7, maxScale = 2.6;
    let fgZoom = 1.0, fgOffsetX = 0, fgOffsetY = 0;
    let excerptsHidden = false;
    let currentAspect = CONFIG.card.defaultAspect;

    // aplicadores
    const txtScaleOut = document.getElementById("ig-txt-scale");
    function applyScale() {
      const baseTitle = 32, baseLineTitle = 40;
      const baseExcerpt = 18, baseLineExcerpt = 26;
      hTitle.style.fontSize = (baseTitle * scale) + "px";
      hTitle.style.lineHeight = (baseLineTitle * scale) + "px";
      pExcerpt.style.fontSize = (baseExcerpt * scale) + "px";
      pExcerpt.style.lineHeight = (baseLineExcerpt * scale) + "px";
      txtScaleOut.textContent = Math.round(scale * 100) + "%";
    }
    function applyFgTransform() {
      fgImg.style.transform = `translate(${fgOffsetX}%, ${fgOffsetY}%) scale(${fgZoom})`;
      document.getElementById("ig-fg-zoom-out").textContent = `${Math.round(fgZoom * 100)}%`;
      document.getElementById("ig-fg-posx-out").textContent = `${fgOffsetX}%`;
      document.getElementById("ig-fg-posy-out").textContent = `${fgOffsetY}%`;
    }
    async function setAspect(aspect) {
      currentAspect = aspect;
      card.style.height = (CONFIG.card.heightByAspect[aspect]) + "px";
      document.getElementById("ig-btn-11").style.opacity = aspect === "1:1" ? "1" : "0.8";
      document.getElementById("ig-btn-45").style.opacity = aspect === "4:5" ? "1" : "0.8";
      if (masterDataURL) {
        try {
          const blurred = await makeBlurBgDataURL(
            masterDataURL,
            CONFIG.card.width,
            CONFIG.card.heightByAspect[aspect],
            { blurPx: CONFIG.card.bgBlurPx, brightness: CONFIG.card.bgDim, extraScale: 1.06 }
          );
          bgBlurImg.src = blurred;
        } catch (e) {
          console.warn("Falha ao reprocessar bg blur no setAspect.", e);
          bgBlurImg.src = masterDataURL; // fallback sem blur
        }
      }
    }

    // eventos
    document.getElementById("ig-btn-dec").onclick = () => { scale = Math.max(minScale, Math.round((scale - step) * 100) / 100); applyScale(); };
    document.getElementById("ig-btn-inc").onclick = () => { scale = Math.min(maxScale, Math.round((scale + step) * 100) / 100); applyScale(); };
    document.getElementById("ig-btn-reset").onclick = () => {
      scale = 1.0; fgZoom = 1.0; fgOffsetX = 0; fgOffsetY = 0;
      document.getElementById("ig-fg-zoom").value = "1";
      document.getElementById("ig-fg-posx").value = "0";
      document.getElementById("ig-fg-posy").value = "0";
      applyScale(); applyFgTransform();
      if (excerptsHidden) document.getElementById("ig-btn-toggle-excerpt").click();
      setAspect(CONFIG.card.defaultAspect);
    };
    document.getElementById("ig-fg-zoom").oninput = (e) => { fgZoom = parseFloat(e.target.value || "1"); applyFgTransform(); };
    document.getElementById("ig-fg-posx").oninput = (e) => { fgOffsetX = parseInt(e.target.value || "0", 10); applyFgTransform(); };
    document.getElementById("ig-fg-posy").oninput = (e) => { fgOffsetY = parseInt(e.target.value || "0", 10); applyFgTransform(); };
    document.getElementById("ig-btn-toggle-excerpt").onclick = () => {
      const willReplace = !excerptsHidden;
      if (willReplace) { if (!pExcerpt.dataset.igOriginal) pExcerpt.dataset.igOriginal = pExcerpt.innerHTML; pExcerpt.innerHTML = "<img style='width:16px; margin:0 6px 0 0;' src='world-globe-white-icon.webp' /> jc.com.br"; }
      else { if (pExcerpt.dataset.igOriginal != null) pExcerpt.innerHTML = pExcerpt.dataset.igOriginal; }
      excerptsHidden = !excerptsHidden;
      document.getElementById("ig-btn-toggle-excerpt").textContent = excerptsHidden ? "🪄 Mostrar resumo" : "🪄 Ocultar resumo";
    };
    document.getElementById("ig-btn-11").onclick = () => setAspect("1:1");
    document.getElementById("ig-btn-45").onclick = () => setAspect("4:5");

    // inicial
    applyScale(); applyFgTransform(); await setAspect(CONFIG.card.defaultAspect);

    // ===== Salvar PNG =====
    function ensureHtml2Canvas(cb) {
      if (window.html2canvas) return cb();
      const s = document.createElement("script"); s.src = CONFIG.html2canvasUrl; s.onload = cb; document.body.appendChild(s);
    }
    document.getElementById("ig-btn-save").onclick = () => {
      ensureHtml2Canvas(async () => {
        try {
          await Promise.all([
            waitFor(bgBlurImg),
            waitFor(fgImg),
            (document.fonts?.ready || Promise.resolve())
          ]);
        } catch (e) {
          console.warn("Alguma imagem não carregou a tempo, tentando mesmo assim.", e);
        }
        // desativa foco de edição antes de capturar
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

        const prevZoom = document.documentElement.style.zoom;
        document.documentElement.style.zoom = ""; // 100% durante a captura

        window.html2canvas(card, {
          useCORS: true,
          allowTaint: true, // estamos em dataURL
          backgroundColor: CONFIG.card.backgroundColor,
          scale: 2,
          imageTimeout: 0,
          proxy: CONFIG.proxy
        }).then((canvas) => {
          const now = new Date(); const pad = (n) => String(n).padStart(2,"0");
          const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
          const safeTitle = (document.title || "post-thumbnail").replace(/[\\\/:*?"<>|]/g, "").trim();
          const a = document.createElement("a");
          a.download = `${safeTitle}_${ts}.png`;
          a.href = canvas.toDataURL("image/png");
          a.click();
          document.documentElement.style.zoom = prevZoom; // restaura zoom visual da página
        }).catch((e) => {
          document.documentElement.style.zoom = prevZoom;
          alert("Falha ao capturar a imagem. Veja o console para detalhes.");
          console.error(e);
        });
      });
    };
  })();
})();
