(function () {
  // Evita injetar duplicado
  if (window.__OBR_CARD_ACTIVE__) {
    const panel = document.getElementById("ig-font-controls");
    if (panel) {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
    return;
  }
  window.__OBR_CARD_ACTIVE__ = true;

  const hide = (selector) =>
    document.querySelectorAll(selector).forEach((el) => (el.style.display = "none"));
  const pxToNumber = (px) => (px ? parseFloat(px) : null);

  // Esconder coisas fora do card
  const headerEl = document.getElementById("header");
  if (headerEl) headerEl.style.display = "none";
  hide(".hat");
  hide("#barrauol");
  hide(".author-signature");
  hide("#load-unified-ad-1");
  hide(".content-news");
  hide("figcaption");
  hide(".latest-news-jc-new");
  hide(".post-caption");
  hide(".post-content");
  hide("footer");
  hide("#div-gpt-ad-1757003575651-0");
  hide("#banner-anchor-area");

  // Card 1200x1200 + camada de fundo sem distorção
  document.querySelectorAll(".featured-image").forEach((el) => {
    Object.assign(el.style, {
      margin: "0",
      padding: "0",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "1200px",
      height: "1200px",
      backgroundColor: "#030139",
      overflow: "hidden",
    });
    const img = el.querySelector("img");
    let bgLayer = el.querySelector("#ig-bg-layer");
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
    if (img && img.src) {
      bgLayer.style.backgroundImage = `url('${img.src}')`;
      img.style.display = "none";
    }
  });

  document.querySelectorAll("#single").forEach((el) => {
    el.style.padding = "0";
    el.style.margin = "0";
  });

  const thumbnail = document.querySelector(".featured-image");
  const bgLayer = thumbnail ? thumbnail.querySelector("#ig-bg-layer") : null;
  let articleHeader = document.querySelector(".article-header-jc-new");

  // Stack inferior (marca + header azul)
  let bottomStack = document.getElementById("ig-bottom-stack");
  if (!bottomStack && thumbnail) {
    bottomStack = document.createElement("div");
    bottomStack.id = "ig-bottom-stack";
    Object.assign(bottomStack.style, {
      position: "absolute",
      left: "2%",
      right: "2%",
      bottom: "2%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "10px",
      width: "96%",
      boxSizing: "border-box",
      zIndex: "3",
    });
    thumbnail.appendChild(bottomStack);
  }

  let brandBar = document.getElementById("ig-brand-bar");
  if (!brandBar && bottomStack) {
    brandBar = document.createElement("div");
    brandBar.id = "ig-brand-bar";
    Object.assign(brandBar.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#fff",
      zIndex: "3",
    });

    const brandImg = document.createElement("img");
    brandImg.src =
      "https://obrasilianista.com.br/wp-content/uploads/2025/09/cropped-brasilianista-icone-180x180.png";
    Object.assign(brandImg.style, {
      width: "48px",
      height: "48px",
      objectFit: "cover",
      borderRadius: "8px",
      display: "block",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
    });

    const brandText = document.createElement("span");
    brandText.textContent = "obrasilianista.com.br";
    Object.assign(brandText.style, {
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      fontSize: "20px",
      fontWeight: "600",
      color: "#fff",
      letterSpacing: "0.2px",
      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
    });

    brandBar.append(brandImg, brandText);
    bottomStack.appendChild(brandBar);
  }

  if (articleHeader && bottomStack) {
    if (articleHeader.parentElement !== bottomStack) bottomStack.appendChild(articleHeader);
    Object.assign(articleHeader.style, {
      position: "static",
      display: "block",
      background: "#020034f2",
      width: "100%",
      maxWidth: "none",
      padding: "1rem",
      borderRadius: "12px",
      boxSizing: "border-box",
      color: "#fff",
      zIndex: "3",
    });
  }

  document.querySelectorAll(".excerpt p").forEach((el) => {
    Object.assign(el.style, { color: "#fff", padding: "0", margin: "0" });
  });
  document.querySelectorAll(".article-header-jc-new").forEach((el) => {
    el.style.color = "#fff";
    el.style.margin = "0";
  });

  if (thumbnail && articleHeader && bgLayer) {
    const titleEl = articleHeader.querySelector(".title");
    const excerptEls = Array.from(articleHeader.querySelectorAll(".excerpt p"));

    // ===== Edição inline =====
    const editableFocusCSS = `
      #ig-editable-style {}
      [data-ig-editing="true"]{ outline:2px dashed rgba(255,255,255,.5); outline-offset:4px; cursor:text; }
      [contenteditable="true"]{ caret-color:#fff; }
    `;
    let styleTag = document.getElementById("ig-editable-style");
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

    // ===== Fonte (escala)
    const base = {
      titleFont: null,
      titleLine: null,
      excerpt: excerptEls.map(() => ({ font: null, line: null })),
    };
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
    const step = 0.05,
      minScale = 0.7,
      maxScale = 1.6;

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
      const indicator = document.getElementById("ig-scale-indicator");
      if (indicator) indicator.textContent = Math.round(scale * 100) + "%";
    };

    // ===== Fundo (sem distorção): zoom transform + offset por background-position
    let bgZoom = 1.0,
      bgPosX = 50,
      bgPosY = 50;
    const applyBackgroundTransform = () => {
      bgLayer.style.backgroundSize = "cover";
      bgLayer.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
      bgLayer.style.transform = `scale(${bgZoom})`;
      bgLayer.style.transformOrigin = `${bgPosX}% ${bgPosY}%`;
      const zOut = document.getElementById("ig-zoom-indicator");
      if (zOut) zOut.textContent = `${Math.round(bgZoom * 100)}%`;
      const xOut = document.getElementById("ig-posx-indicator");
      if (xOut) xOut.textContent = `${bgPosX}%`;
      const yOut = document.getElementById("ig-posy-indicator");
      if (yOut) yOut.textContent = `${bgPosY}%`;
    };

    // ===== Zoom de visualização (63% + fallback)
    const Z_TARGET = 0.63;
    function ensureWrapExists() {
      let wrap = document.getElementById("ig-scale-wrapper");
      if (!wrap && thumbnail && thumbnail.parentElement) {
        wrap = document.createElement("div");
        wrap.id = "ig-scale-wrapper";
        wrap.style.transformOrigin = "0 0";
        thumbnail.parentElement.insertBefore(wrap, thumbnail);
        wrap.appendChild(thumbnail);
      }
      return wrap || document.getElementById("ig-scale-wrapper");
    }
    function applyViewportZoom(r) {
      document.documentElement.style.zoom = r;
      if ("zoom" in document.documentElement.style) {
        const w = document.getElementById("ig-scale-wrapper");
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
      const w = document.getElementById("ig-scale-wrapper");
      if (w) {
        w.style.transform = "none";
        w.style.width = "auto";
      }
    }
    applyViewportZoom(Z_TARGET);

    // ===== Painel
    const old = document.getElementById("ig-font-controls");
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
      background: "#0b0b2a",
      color: "#fff",
      borderRadius: "10px",
      boxSizing: "border-box",
      width: "260px",
      zIndex: "9999",
      boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
    });

    const labelText = document.createElement("div");
    labelText.textContent = "Tamanho do texto";
    labelText.style.fontWeight = "600";
    labelText.style.textAlign = "center";

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
    const btnDec = mkBtn("–", false);
    const btnInc = mkBtn("+", false);

    const indicator = document.createElement("span");
    indicator.id = "ig-scale-indicator";
    indicator.textContent = "100%";
    Object.assign(indicator.style, {
      flex: "1 1 auto",
      textAlign: "center",
      fontVariantNumeric: "tabular-nums",
    });

    const btnResetAll = mkBtn("Reset geral", true);

    const sep1 = document.createElement("hr");
    Object.assign(sep1.style, {
      border: "none",
      borderTop: "1px solid #2a2a5a",
      margin: "6px 0",
    });
    const labelBg = document.createElement("div");
    labelBg.textContent = "Imagem de fundo";
    Object.assign(labelBg.style, { fontWeight: "600", textAlign: "center" });

    const mkGridRow = () => {
      const d = document.createElement("div");
      Object.assign(d.style, {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "8px",
      });
      return d;
    };
    const zoomRow = mkGridRow();
    const zoomInput = document.createElement("input");
    zoomInput.type = "range";
    zoomInput.min = "0.5";
    zoomInput.max = "2.0";
    zoomInput.step = "0.01";
    zoomInput.value = "1";
    const zoomIndicator = document.createElement("span");
    zoomIndicator.id = "ig-zoom-indicator";
    zoomIndicator.textContent = "100%";

    const posXRow = mkGridRow();
    const posXInput = document.createElement("input");
    posXInput.type = "range";
    posXInput.min = "0";
    posXInput.max = "100";
    posXInput.step = "1";
    posXInput.value = "50";
    const posXIndicator = document.createElement("span");
    posXIndicator.id = "ig-posx-indicator";
    posXIndicator.textContent = "50%";

    const posYRow = mkGridRow();
    const posYInput = document.createElement("input");
    posYInput.type = "range";
    posYInput.min = "0";
    posYInput.max = "100";
    posYInput.step = "1";
    posYInput.value = "50";
    const posYIndicator = document.createElement("span");
    posYIndicator.id = "ig-posy-indicator";
    posYIndicator.textContent = "50%";

    const btnResetBg = mkBtn("Reset fundo", true);

    // === Botão Ocultar/Mostrar Resumo ===
    const btnToggleExcerpt = mkBtn("🪄 Ocultar resumo", true);
    let excerptsHidden = false;
    btnToggleExcerpt.addEventListener("click", () => {
      excerptsHidden = !excerptsHidden;
      excerptEls.forEach((el) => (el.style.display = excerptsHidden ? "none" : "block"));
      btnToggleExcerpt.textContent = excerptsHidden
        ? "🪄 Mostrar resumo"
        : "🪄 Ocultar resumo";
    });

    // === Proporção 1:1 / 4:5 ===
    let currentAspect = "1:1"; // default
    const setAspect = (aspect) => {
      currentAspect = aspect;
      thumbnail.style.height = aspect === "4:5" ? "1500px" : "1200px";
      updateAspectButtons();
    };
    const labelAspect = document.createElement("div");
    labelAspect.textContent = "Proporção do card";
    Object.assign(labelAspect.style, { fontWeight: "600", textAlign: "center" });

    const rowAspect = document.createElement("div");
    Object.assign(rowAspect.style, {
      display: "flex",
      gap: "8px",
      justifyContent: "space-between",
    });

    const btnAspect11 = mkBtn("1:1", true);
    const btnAspect45 = mkBtn("4:5", true);

    function updateAspectButtons() {
      btnAspect11.style.opacity = currentAspect === "1:1" ? "1" : "0.8";
      btnAspect45.style.opacity = currentAspect === "4:5" ? "1" : "0.8";
    }
    btnAspect11.addEventListener("click", () => setAspect("1:1"));
    btnAspect45.addEventListener("click", () => setAspect("4:5"));
    updateAspectButtons();

    // Zoom de visualização
    const sepZ = document.createElement("hr");
    Object.assign(sepZ.style, {
      border: "none",
      borderTop: "1px solid #2a2a5a",
      margin: "6px 0",
    });
    const labelView = document.createElement("div");
    labelView.textContent = "Visualização da página";
    Object.assign(labelView.style, { fontWeight: "600", textAlign: "center" });

    const rowView = document.createElement("div");
    Object.assign(rowView.style, { display: "flex", gap: "8px", justifyContent: "space-between" });
    const btnView63 = mkBtn("63%", true);
    const btnView100 = mkBtn("100%", true);

    const sep2 = document.createElement("hr");
    Object.assign(sep2.style, {
      border: "none",
      borderTop: "1px solid #2a2a5a",
      margin: "6px 0",
    });
    const btnSave = mkBtn("💾 Salvar imagem", true);

    // Ligações de eventos
    btnDec.addEventListener("click", () => {
      scale = Math.max(minScale, Math.round((scale - step) * 100) / 100);
      applyScale();
    });
    btnInc.addEventListener("click", () => {
      scale = Math.min(maxScale, Math.round((scale + step) * 100) / 100);
      applyScale();
    });
    btnResetAll.addEventListener("click", () => {
      scale = 1.0;
      bgZoom = 1.0;
      bgPosX = 50;
      bgPosY = 50;
      zoomInput.value = "1";
      posXInput.value = "50";
      posYInput.value = "50";
      applyScale();
      applyBackgroundTransform();
      if (excerptsHidden) btnToggleExcerpt.click(); // volta a mostrar resumo
      setAspect("1:1"); // reseta proporção
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.ctrlKey || ev.metaKey) return;
      const active = document.activeElement;
      if (active && active.isContentEditable) return; // não trapar atalhos enquanto edita
      if (ev.key === "=" || ev.key === "+") {
        ev.preventDefault();
        scale = Math.min(maxScale, Math.round((scale + step) * 100) / 100);
        applyScale();
      } else if (ev.key === "-") {
        ev.preventDefault();
        scale = Math.max(minScale, Math.round((scale - step) * 100) / 100);
        applyScale();
      } else if (ev.key.toLowerCase() === "0") {
        ev.preventDefault();
        scale = 1.0;
        applyScale();
      }
    });

    zoomInput.addEventListener("input", () => {
      bgZoom = parseFloat(zoomInput.value || "1");
      applyBackgroundTransform();
    });
    posXInput.addEventListener("input", () => {
      bgPosX = parseInt(posXInput.value || "50", 10);
      applyBackgroundTransform();
    });
    posYInput.addEventListener("input", () => {
      bgPosY = parseInt(posYInput.value || "50", 10);
      applyBackgroundTransform();
    });
    btnResetBg.addEventListener("click", () => {
      bgZoom = 1.0;
      bgPosX = 50;
      bgPosY = 50;
      zoomInput.value = "1";
      posXInput.value = "50";
      posYInput.value = "50";
      applyBackgroundTransform();
    });

    btnView63.addEventListener("click", () => applyViewportZoom(0.63));
    btnView100.addEventListener("click", () => resetViewportZoom());

    // Montagem do painel (ordem dos elementos)
    const rowTextUI = document.createElement("div");
    Object.assign(rowTextUI.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "6px",
    });
    rowTextUI.append(btnDec, indicator, btnInc);

    const zoomWrap = document.createElement("div");
    Object.assign(zoomWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const zoomLabel = document.createElement("div");
    zoomLabel.textContent = "Zoom";
    zoomLabel.style.marginBottom = "4px";
    zoomRow.append(zoomInput, zoomIndicator);
    zoomWrap.append(zoomLabel, zoomRow);

    const posXWrap = document.createElement("div");
    Object.assign(posXWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const posXLabel = document.createElement("div");
    posXLabel.textContent = "Offset X";
    posXLabel.style.marginBottom = "4px";
    posXRow.append(posXInput, posXIndicator);
    posXWrap.append(posXLabel, posXRow);

    const posYWrap = document.createElement("div");
    Object.assign(posYWrap.style, { display: "flex", flexDirection: "column", gap: "4px" });
    const posYLabel = document.createElement("div");
    posYLabel.textContent = "Offset Y";
    posYLabel.style.marginBottom = "4px";
    posYRow.append(posYInput, posYIndicator);
    posYWrap.append(posYLabel, posYRow);

    // seção de proporção
    const sepAspect = document.createElement("hr");
    Object.assign(sepAspect.style, {
      border: "none",
      borderTop: "1px solid #2a2a5a",
      margin: "6px 0",
    });
    rowAspect.append(btnAspect11, btnAspect45);

    panel.append(
      // Texto
      labelText,
      rowTextUI,
      btnResetAll,
      // Fundo
      sep1,
      labelBg,
      zoomWrap,
      posXWrap,
      posYWrap,
      btnResetBg,
      // Ocultar/mostrar resumo
      btnToggleExcerpt,
      // Proporção
      sepAspect,
      labelAspect,
      rowAspect,
      // Zoom de visualização
      sepZ,
      labelView
    );

    const zoomBtnsRow = document.createElement("div");
    Object.assign(zoomBtnsRow.style, { display: "flex", gap: "8px" });
    zoomBtnsRow.append(btnView63, btnView100);
    panel.append(zoomBtnsRow);

    panel.append(
      // Salvar
      sep2,
      btnSave
    );

    document.body.appendChild(panel);

    // Estados iniciais
    applyScale();
    applyBackgroundTransform();
    setAspect("1:1"); // começa em 1:1

    // Salvar (desliga zoom visual temporariamente, força blur nos editáveis)
    btnSave.addEventListener("click", () => {
      [titleEl, ...excerptEls].forEach((el) => el && el.blur());
      const restore = () => applyViewportZoom(Z_TARGET);
      const doCapture = () => {
        const target = document.querySelector(".post-thumbnail");
        if (!target) {
          alert("Elemento .post-thumbnail não encontrado.");
          restore();
          return;
        }
        html2canvas(target).then((canvas) => {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, "0");
          const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
          )}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
          const pageTitle = document.title.replace(/[\\\/:*?"<>|]/g, "").trim();
          const fileName = (pageTitle || "post-thumbnail") + "_" + timestamp + ".jpg";
          const link = document.createElement("a");
          link.download = fileName;
          link.href = canvas.toDataURL("image/jpeg", 0.95);
          link.click();
          restore();
        });
      };
      // desliga zoom visual antes de capturar
      resetViewportZoom();
      if (!window.html2canvas) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        s.onload = () => doCapture();
        document.body.appendChild(s);
      } else {
        doCapture();
      }
    });
  }
})();
