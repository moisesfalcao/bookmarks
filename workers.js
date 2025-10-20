export default {
  async fetch(request, env, ctx) {
    const urlObj = new URL(request.url);
    const target = urlObj.searchParams.get("url");
    const referer = urlObj.searchParams.get("referer") || "https://jc.com.br";

    if (!target) {
      return new Response("Missing ?url=", { status: 400 });
    }

    // Baixa a imagem no servidor
    const resp = await fetch(target, {
      // Deixa o servidor de origem ver um referer "amigável" (alguns CDNs exigem)
      headers: { "Referer": referer, "User-Agent": "Mozilla/5.0" },
      cf: { cacheTtl: 3600, cacheEverything: true },
    });

    if (!resp.ok) {
      return new Response("Upstream fetch failed: " + resp.status, { status: 502 });
    }

    // Mantém o content-type original
    const contentType = resp.headers.get("content-type") || "application/octet-stream";
    const body = await resp.arrayBuffer();

    // Libera CORS para o navegador poder usar no canvas
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        // Alguns libs checam isso:
        "Timing-Allow-Origin": "*",
        // Permite ser carregado como imagem por html2canvas
        "Cross-Origin-Resource-Policy": "cross-origin"
      },
    });
  },
};
