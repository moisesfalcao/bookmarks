(function () {
  // =========================
  // 🔧 CONFIG
  // =========================
  const CONFIG = {
    selectors: {
      cardContainer: ".featured-image",
      cardImage: ".featured-image img",
      articleHeader: ".article-header-jc-new",
      title: ".article-title",
      excerpt: ".article-subtitle",
      postWrapper: "#single",
      captureTarget: null,
    },
    hide: [
      "#header",
      ".hat",
      "#barrauol",
      ".author-signature",
      "#load-unified-ad-1",
      ".content-news",
      "figcaption",
      ".latest-news-jc-new",
      ".post-caption",
      ".post-content",
      "footer",
      "#div-gpt-ad-1757003575651-0",
      "#banner-anchor-area",
      ".share-news-jc-new",
    ],
    card: {
      width: 1200,
      height: 1200,
      backgroundColor: "#000000",
      aspectHeights: { "1:1": 1200, "4:5": 1500 },
    },
    brand: {
      iconUrl: "https://imagens.ne10.uol.com.br/template-unificado/images/jc-new/favicon/ms-icon-144x144.png",
      text: " ",
      textColor: "#fff",
      iconSize: 130,
      iconPadding: "4rem 3rem",
    },
    headerBox: {
      background: "#000",
      radius: 0,
      padding: "3rem",
      textColor: "#fff",
    },
    ui: {
      pageZoomInitial: 0.63,
      panelBg: "#0b0b2a",
      panelText: "#fff",
      panelWidth: 260,
    },
    removeBodyBefore: true,
    html2canvasUrl: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",

    // >>>>> ADICIONE A URL DO SEU WORKER AQUI <<<<<
    proxy: "https://spring-river-efc5.nlakedeveloper.workers.dev/",
    // (opcional) Referer que o Worker enviará ao CDN
    proxyReferer: "https://jc.com.br",
  };

  // =========================
  // Guard against duplicates
  // =========================
  if (window.__OBR_CARD_ACTIVE__) {
    const panel = document.getElementById("ig-font-controls");
    if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
    return;
  }
  window.__OBR_CARD_ACTIVE__ = true;

  // =========================
  // Helpers
  // =========================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const hideAll = (selector) => $$(selector).forEach((el) => (el.style.display = "none"));
  const pxToNumber = (px) => (px ? parseFloat(px) : null);

  // --- NOVOS HELPERS: proxy + fetch seguro ---
  function proxify(url) {
    try {
      const u = new URL(CONFIG.proxy);
      u.searchParams.set("url", new URL(url, location.href).href);
      if (CONFIG.proxyReferer) u.searchParams.set("referer", CONFIG.proxyReferer);
      return u.toString();
    } catch {
      return url;
    }
  }

  async function blobToDataURL(blob) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  async function tryFetch(url) {
    const abs = new URL(url, location.href).href;

    // 1ª tentativa: direto (se CORS permitir)
    try {
      const r1 = await fetch(abs, { mode: "cors", credentials: "omit" });
      if (r1.ok) return await blobToDataURL(await r1.blob());
    } catch {}

    // 2ª tentativa: via proxy
    try {
      const r2 = await fetch(proxify(abs), { mode: "cors", credentials: "omit" });
      if (r2.ok) return await blobToDataURL(await r2.blob());
    } catch {}

    throw new Error("CORS block for " + abs);
  }

  async function fetchAsDataURL(url) {
    // preserva assinatura antiga; agora usa tryFetch por baixo
    return await tryFetch(url);
  }

  async function setBgFromUrl(bgDiv, url) {
    try {
      const dataUrl = await tryFetch(url);
      bgDiv.style.backgroundImage = `url('${dataUrl}')`;
    } catch {
      // fallback: tenta direto (pode falhar no save se CORS bloquear)
      bgDiv.style.backgroundImage = `url('${url}')`;
    }
  }

  function getOgImage() {
    const m =
      document.querySelector('meta[property="og:image"], meta[name="og:image"]') ||
      document.querySelector('meta[property="og:image:url"], meta[name="og:image:url"]');
    return m && (m.content || m.getAttribute("content"));
  }

  // =========================
  // 0) Remove body::before (site masks)
  // =========================
  if (CONFIG.removeBodyBefore) {
    const st = document.createElement("style");
    st.textContent = `body::before{content:none!important;background:none!important;height:0!important;}`;
    document.head.appendChild(st);
  }

  // =========================
  // 1) Hide site chrome
  // =========================
  CONFIG.hide.forEach(hideAll);

  // =========================
  // 2) Base card & background layer
  // =========================
  $$(CONFIG.selectors.cardContainer).forEach((el) => {
    Object.assign(el.style, {
      margin: "0",
      padding: "0",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: CONFIG.card.width + "px",
      height: CONFIG.card.height + "px",
      backgroundColor: CONFIG.card.backgroundColor,
      overflow: "hidden",
    });

    const img = $(CONFIG.selectors.cardImage, el);
    let bgLayer = $("#ig-bg-layer", el);
    if (!bgLayer) {
      bgLayer = document.createElement("div");
      bgLayer.id = "ig-bg-layer";
      Object.assign(bgLayer.style, {
        position: "absolute",
        inset: "0",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
        willChange: "transform, background-position",
        transform: "scale(1)",
        transformOrigin: "50% 50%",
        zIndex: "1",
      });
      el.prepend(bgLayer);
    }

    // Image source with OG fallback and data:URL inlining (via proxy se precisar)
    (async () => {
      let src = img && (img.currentSrc || img.src);
      if (!src) src = getOgImage();
      if (src) {
        await setBgFromUrl(bgLayer, src);
        if (img) img.style.display = "none";
      }
    })();
  });

  // =========================
  // 3) Zero wrapper paddings
  // =========================
  if (CONFIG.selectors.postWrapper) {
    $$(CONFIG.selectors.postWrapper).forEach((el) => {
      el.style.padding = "0";
      el.style.margin = "0";
    });
  }

  // =========================
  // 4) Grab main nodes
  // =========================
  const thumbnail = $(CONFIG.selectors.cardContainer);
  const bgLayer = thumbnail ? $("#ig-bg-layer", thumbnail) : null;
  let articleHeader = $(CONFIG.selectors.articleHeader);

  // =========================
  // 5) Bottom stack container
  // =========================
  let bottomStack = $("#ig-bottom-stack");
  if (!bottomStack && thumbnail) {
    bottomStack = document.createElement("div");
    bottomStack.id = "ig-bottom-stack";
    Object.assign(bottomStack.style, {
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "10px",
      width: "100%",
      boxSizing: "border-box",
      zIndex: "3",
      height: "100%",
      justifyContent: "space-between",
    });
    thumbnail.appendChild(bottomStack);
  }

  // =========================
  // 6) Brand bar (icon + text) via tryFetch/proxy
  // =========================
  let brandBar = $("#ig-brand-bar");
  if (!brandBar && bottomStack) {
    brandBar = document.createElement("div");
    brandBar.id = "ig-brand-bar";
    Object.assign(brandBar.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: CONFIG.brand.textColor,
      zIndex: "3",
    });

    const brandImg = document.createElement("img");
    Object.assign(brandImg.style, {
      width: CONFIG.brand.iconSize + "px",
      height: CONFIG.brand.iconSize + "px",
      objectFit: "cover",
      borderRadius: "8px",
      display: "block",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
      padding: "4rem 3rem" ,
    });
    (async () => {
      try {
        brandImg.src = await tryFetch(CONFIG.brand.iconUrl); // data:URL
      } catch {
        brandImg.src = proxify(CONFIG.brand.iconUrl); // fallback (pode não funcionar no save)
      }
    })();

    const brandText = document.createElement("span");
    brandText.textContent = CONFIG.brand.text;
    Object.assign(brandText.style, {
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      fontSize: "20px",
      fontWeight: "600",
      color: CONFIG.brand.textColor,
      letterSpacing: "0.2px",
      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
    });

    brandBar.append(brandImg, brandText);
    bottomStack.appendChild(brandBar);
  }

  // =========================
  // 7) Article header in card
  // =========================
  if (articleHeader && bottomStack) {
    if (articleHeader.parentElement !== bottomStack) bottomStack.appendChild(articleHeader);
    Object.assign(articleHeader.style, {
      position: "static",
      display: "block",
      background: CONFIG.headerBox.background,
      width: "100%",
      maxWidth: "none",
      padding: "3rem",
      borderRadius: CONFIG.headerBox.radius + "px",
      boxSizing: "border-box",
      color: CONFIG.headerBox.textColor,
      zIndex: "3",
      margin: "0",
    });
  }

  // =========================
  // 8) Basic text colors
  // =========================
  $$(CONFIG.selectors.excerpt).forEach((el) => {
    Object.assign(el.style, { color: CONFIG.headerBox.textColor, padding: "0 0 0 1rem", margin: "0" });
  });
  $$(CONFIG.selectors.articleHeader).forEach((el) => {
    el.style.color = CONFIG.headerBox.textColor;
    el.style.margin = "0";
  });

  // =========================
  // Interactive controls
  // =========================
  if (thumbnail && articleHeader && bgLayer) {
    const titleEl = $(CONFIG.selectors.title, articleHeader);
    const excerptEls = $$(CONFIG.selectors.excerpt, articleHeader);

    // Editable
    const editableFocusCSS = `
      #ig-editable-style{}
      [data-ig-editing="true"]{outline:2px dashed rgba(255,255,255,.5);outline-offset:4px;cursor:text;}
      [contenteditable="true"]{caret-color:${CONFIG.headerBox.textColor};}
    `;
    let styleTag = $("#ig-editable-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "ig-editable-style";
      styleTag.textContent = editableFocusCSS;
      document.head.appendChild(styleTag);
    }
    const handlePastePlain = (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      document.execCommand("insertText", false, text);
    };
    const handleEnterToBr = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    };
    const makeEditable = (el) => {
      el.setAttribute("spellcheck", "false");
      el.addEventListener("click", () => {
        if (el.contentEditable !== "true") {
          el.contentEditable = "true";
          el.dataset.igEditing = "true";
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
      el.addEventListener("blur", () => {
        el.contentEditable = "false";
        el.dataset.igEditing = "false";
      });
    };
    if (titleEl) makeEditable(titleEl);
    excerptEls.forEach(makeEditable);

    // Font scale
    const base = { titleFont: null, titleLine: null, excerpt: excerptEls.map(() => ({ font: null, line: null })) };
    const captureBase = () => {
      if (titleEl) {
        const cs = window.getComputedStyle(titleEl);
        base.titleFont = pxToNumber(cs.fontSize) || 24;
        base.titleLine = pxToNumber(cs.lineHeight) || base.titleFont * 1.2;
      }
      excerptEls.forEach((el, i) => {
        const cs = window.getComputedStyle(el);
        const f = pxToNumber(cs.fontSize) || 16;
        const lh = pxToNumber(cs.lineHeight) || f * 1.4;
        base.excerpt[i].font = f;
        base.excerpt[i].line = lh;
      });
    };
    captureBase();

    let scale = 1.0;
    const step = 0.05, minScale = 0.7, maxScale = 1.6;

    const applyScale = () => {
      if (titleEl) {
        titleEl.style.fontSize = base.titleFont * scale + "px";
        titleEl.style.lineHeight = base.titleLine * scale + "px";
      }
      excerptEls.forEach((el, i) => {
        const b = base.excerpt[i];
        el.style.fontSize = b.font * scale + "px";
        el.style.lineHeight = b.line * scale + "px";
      });
      const indicator = $("#ig-scale-indicator");
      if (indicator) indicator.textContent = Math.round(scale * 100) + "%";
    };

    // Background transform
    let bgZoom = 1.0, bgPosX = 50, bgPosY = 50;
    const applyBackgroundTransform = () => {
      bgLayer.style.backgroundSize = "cover";
      bgLayer.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
      bgLayer.style.transform = `scale(${bgZoom})`;
      bgLayer.style.transformOrigin = `${bgPosX}% ${bgPosY}%`;
      const zOut = $("#ig-zoom-indicator"); if (zOut) zOut.textContent = `${Math.round(bgZoom * 100)}%`;
      const xOut = $("#ig-posx-indicator"); if (xOut) xOut.textContent = `${bgPosX}%`;
      const yOut = $("#ig-posy-indicator"); if (yOut) yOut.textContent = `${bgPosY}%`;
    };

    // Page zoom (view only)
    const Z_TARGET = CONFIG.ui.pageZoomInitial;
    function ensureWrapExists() {
      let wrap = $("#ig-scale-wrapper");
      if (!wrap && thumbnail && thumbnail.parentElement) {
        wrap = document.createElement("div");
        wrap.id = "ig-scale-wrapper";
        wrap.style.transformOrigin = "0 0";
        thumbnail.parentElement.insertBefore(wrap, thumbnail);
        wrap.appendChild(thumbnail);
      }
      return wrap || $("#ig-scale-wrapper");
    }
    function applyViewportZoom(r) {
      document.documentElement.style.zoom = r;
      if ("zoom" in document.documentElement.style) {
        const w = $("#ig-scale-wrapper");
        if (w) {
          w.style.transform = "none";
          w.style.width = "auto";
        }
        return;
      }
      const wrap = ensureWrapExists();
      if (wrap) {
        wrap.style.transform = `scale(${r})`;
        wrap.style.width = 100 / r + "%";
      }
    }
    function resetViewportZoom() {
      document.documentElement.style.zoom = "";
      const w = $("#ig-scale-wrapper");
      if (w) {
        w.style.transform = "none";
        w.style.width = "auto";
      }
    }
    applyViewportZoom(Z_TARGET);

    // Panel (UI)
    const old = $("#ig-font-controls");
    if (old && old.parentElement) old.parentElement.removeChild(old);

    const panel = document.createElement("div");
    panel.id = "ig-font-controls";
    Object.assign(panel.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "10px",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      fontSize: "14px",
      padding: "12px",
      background: CONFIG.ui.panelBg,
      color: CONFIG.ui.panelText,
      borderRadius: "10px",
      boxSizing: "border-box",
      width: CONFIG.ui.panelWidth + "px",
      zIndex: "9999",
      boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
    });

    const mkBtn = (t, small) => {
      const b = document.createElement("button");
      b.textContent = t;
      Object.assign(b.style, {
        padding: small ? "6px 10px" : "8px 10px",
        borderRadius: "8px",
        border: "1px solid #3d3d7a",
        background: "#1a1a4a",
        color: "#fff",
        cursor: "pointer",
        fontSize: small ? "14px" : "16px",
        fontWeight: "600",
      });
      return b;
    };

    const labelText = document.createElement("div");
    labelText.textContent = "Tamanho do texto";
    labelText.style.fontWeight = "600";
    labelText.style.textAlign = "center";

    const btnDec = mkBtn("–", false);
    const btnInc = mkBtn("+", false);
    const indicator = document.createElement("span");
    indicator.id = "ig-scale-indicator";
    indicator.textContent = "100%";
    Object.assign(indicator.style, { flex: "1 1 auto", textAlign: "center", fontVariantNumeric: "tabular-nums" });

    const btnResetAll = mkBtn("Reset geral", true);

    const rowTextUI = document.createElement("div");
    Object.assign(rowTextUI.style, { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" });
    rowTextUI.append(btnDec, indicator, btnInc);

    const sep1 = document.createElement("hr");
    Object.assign(sep1.style, { border: "none", borderTop: "1px solid #2a2a5a", margin: "6px 0" });

    const labelBg = document.createElement("div");
    labelBg.textContent = "Imagem de fundo";
    Object.assign(labelBg.style, { fontWeight: "600", textAlign: "center" });

    const mkGridRow = () => {
      const d = document.createElement("div");
      Object.assign(d.style, { display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "8px" });
      return d;
    };

    const zoomRow = mkGridRow();
    const zoomInput = document.createElement("input");
    zoomInput.type = "range"; zoomInput.min = "0.5"; zoomInput.max = "2.0"; zoomInput.step = "0.01"; zoomInput.value = "1";
    const zoomIndicator = document.createElement("span");
    zoomIndicator.id = "ig-zoom-indicator"; zoomIndicator.textContent = "100%";

    const posXRow = mkGridRow();
    const posXInput = document.createElement("input");
    posXInput.type = "range"; posXInput.min = "0"; posXInput.max = "100"; posXInput.step = "1"; posXInput.value = "50";
    const posXIndicator = document.createElement("span");
    posXIndicator.id = "ig-posx-indicator"; posXIndicator.textContent = "50%";

    const posYRow = mkGridRow();
    const posYInput = document.createElement("input");
    posYInput.type = "range"; posYInput.min = "0"; posYInput.max = "100"; posYInput.step = "1"; posYInput.value = "50";
    const posYIndicator = document.createElement("span");
    posYIndicator.id = "ig-posy-indicator"; posYIndicator.textContent = "50%";

    const btnResetBg = mkBtn("Reset fundo", true);

    const btnToggleExcerpt = mkBtn("🪄 Ocultar resumo", true);
    let excerptsHidden = false;

    let currentAspect = "1:1";
    const setAspect = (aspect) => {
      currentAspect = aspect;
      thumbnail.style.height = (CONFIG.card.aspectHeights[aspect] || CONFIG.card.height) + "px";
      updateAspectButtons();
    };
    const labelAspect = document.createElement("div");
    labelAspect.textContent = "Proporção do card";
    Object.assign(labelAspect.style, { fontWeight: "600", textAlign: "center" });

    const rowAspect = document.createElement("div");
    Object.assign(rowAspect.style, { display: "flex", gap: "8px", justifyContent: "space-between" });

    const btnAspect11 = mkBtn("1:1", true);
    const btnAspect45 = mkBtn("4:5", true);

    function updateAspectButtons() {
      btnAspect11.style.opacity = currentAspect === "1:1" ? "1" : "0.8";
      btnAspect45.style.opacity = currentAspect === "4:5" ? "1" : "0.8";
    }

    const sepZ = document.createElement("hr");
    Object.assign(sepZ.style, { border: "none", borderTop: "1px solid #2a2a5a", margin: "6px 0" });
    const labelView = document.createElement("div");
    labelView.textContent = "Visualização da página";
    Object.assign(labelView.style, { fontWeight: "600", textAlign: "center" });

    const btnView63 = mkBtn("63%", true);
    const btnView100 = mkBtn("100%", true);

    const sep2 = document.createElement("hr");
    Object.assign(sep2.style, { border: "none", borderTop: "1px solid #2a2a5a", margin: "6px 0" });
    const btnSave = mkBtn("💾 Salvar imagem", true);

    // Events
    btnDec.addEventListener("click", () => { scale = Math.max(minScale, Math.round((scale - step) * 100) / 100); applyScale(); });
    btnInc.addEventListener("click", () => { scale = Math.min(maxScale, Math.round((scale + step) * 100) / 100); applyScale(); });
    btnResetAll.addEventListener("click", () => {
      scale = 1.0; bgZoom = 1.0; bgPosX = 50; bgPosY = 50;
      zoomInput.value = "1"; posXInput.value = "50"; posYInput.value = "50";
      applyScale(); applyBackgroundTransform();
      if (excerptsHidden) btnToggleExcerpt.click();
      setAspect("1:1");
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.ctrlKey || ev.metaKey) return;
      const active = document.activeElement;
      if (active && active.isContentEditable) return;
      if (ev.key === "=" || ev.key === "+") { ev.preventDefault(); scale = Math.min(maxScale, Math.round((scale + step) * 100) / 100); applyScale(); }
      else if (ev.key === "-") { ev.preventDefault(); scale = Math.max(minScale, Math.round((scale - step) * 100) / 100); applyScale(); }
      else if (ev.key.toLowerCase() === "0") { ev.preventDefault(); scale = 1.0; applyScale(); }
    });

    zoomInput.addEventListener("input", () => { bgZoom = parseFloat(zoomInput.value || "1"); applyBackgroundTransform(); });
    posXInput.addEventListener("input", () => { bgPosX = parseInt(posXInput.value || "50", 10); applyBackgroundTransform(); });
    posYInput.addEventListener("input", () => { bgPosY = parseInt(posYInput.value || "50", 10); applyBackgroundTransform(); });
    btnResetBg.addEventListener("click", () => {
      bgZoom = 1.0; bgPosX = 50; bgPosY = 50;
      zoomInput.value = "1"; posXInput.value = "50"; posYInput.value = "50";
      applyBackgroundTransform();
    });

    btnToggleExcerpt.addEventListener("click", () => {
      excerptsHidden = !excerptsHidden;
      excerptEls.forEach((el) => (el.style.display = excerptsHidden ? "none" : "block"));
      btnToggleExcerpt.textContent = excerptsHidden ? "🪄 Mostrar resumo" : "🪄 Ocultar resumo";
    });

    btnAspect11.addEventListener("click", () => setAspect("1:1"));
    btnAspect45.addEventListener("click", () => setAspect("4:5"));
    btnView63.addEventListener("click", () => applyViewportZoom(CONFIG.ui.pageZoomInitial));
    btnView100.addEventListener("click", () => resetViewportZoom());

    // Assemble panel
    const zoomWrap = document.createElement("div");
    Object.assign(zoomWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const zoomLabel = document.createElement("div"); zoomLabel.textContent = "Zoom"; zoomLabel.style.marginBottom = "4px";
    zoomRow.append(zoomInput, zoomIndicator);
    zoomWrap.append(zoomLabel, zoomRow);

    const posXWrap = document.createElement("div");
    Object.assign(posXWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const posXLabel = document.createElement("div"); posXLabel.textContent = "Offset X"; posXLabel.style.marginBottom = "4px";
    posXRow.append(posXInput, posXIndicator);
    posXWrap.append(posXLabel, posXRow);

    const posYWrap = document.createElement("div");
    Object.assign(posYWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const posYLabel = document.createElement("div"); posYLabel.textContent = "Offset Y"; posYLabel.style.marginBottom = "4px";
    posYRow.append(posYInput, posYIndicator);
    posYWrap.append(posYLabel, posYRow);

    const sepAspect = document.createElement("hr");
    Object.assign(sepAspect.style, { border: "none", borderTop: "1px solid #2a2a5a", margin: "6px 0" });
    rowAspect.append(btnAspect11, btnAspect45);

    panel.append(
      labelText, rowTextUI, btnResetAll, sep1, labelBg,
      zoomWrap, posXWrap, posYWrap, btnResetBg, btnToggleExcerpt,
      sepAspect, labelAspect, rowAspect, sepZ, labelView
    );

    const zoomBtnsRow = document.createElement("div");
    Object.assign(zoomBtnsRow.style, { display: "flex", gap: "8px" });
    zoomBtnsRow.append(btnView63, btnView100);
    panel.append(zoomBtnsRow, sep2, btnSave);
    document.body.appendChild(panel);

    // Initial state
    applyScale();
    applyBackgroundTransform();
    setAspect("1:1");

    // Save
    btnSave.addEventListener("click", () => {
      [titleEl, ...excerptEls].forEach((el) => el && el.blur());
      const restore = () => applyViewportZoom(Z_TARGET);

      const doCapture = () => {
        const targetSel = CONFIG.selectors.captureTarget || CONFIG.selectors.cardContainer;
        const target = $(targetSel);
        if (!target) {
          alert(`Elemento ${targetSel} não encontrado.`);
          restore();
          return;
        }
        const run = () => snap(target);
        if (!window.html2canvas) {
          const s = document.createElement("script");
          s.src = CONFIG.html2canvasUrl;
          s.onload = run;
          document.body.appendChild(s);
        } else run();

        function snap(node) {
          html2canvas(node, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            scale: window.devicePixelRatio || 1,
            imageTimeout: 0,
            proxy: CONFIG.proxy, // << chave para baixar via Worker
          }).then((canvas) => {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, "0");
            const timestamp =
              `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
              `${pad(now.getHours())}-${pad(now.getMinutes())}`;
            const pageTitle = document.title.replace(/[\\\/:*?"<>|]/g, "").trim();
            const host = location.host.replace(/[\\\/:*?"<>|]/g, "").trim();
            const fileName = (pageTitle || host || "post-thumbnail") + "_" + timestamp + ".jpg";
            const link = document.createElement("a");
            link.download = fileName;
            link.href = canvas.toDataURL("image/jpeg", 0.95);
            link.click();
            restore();
          });
        }
      };

      // disable visual zoom, then capture
      resetViewportZoom();
      if (!window.html2canvas) {
        const s = document.createElement("script");
        s.src = CONFIG.html2canvasUrl;
        s.onload = () => doCapture();
        document.body.appendChild(s);
      } else {
        doCapture();
      }
    });
  }
})();
