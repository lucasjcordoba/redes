/**
 * Limpieza para grabar apps en modo desarrollo (Argentecnica, BsAs Tennis
 * Tour): saca el indicador de Next ("N", "Compiling") y reemplaza cualquier
 * mail real que muestre la interfaz por uno ficticio. Deja `window.__limpiar`,
 * que el grabador llama antes de cada cuadro.
 */
export function limpiezaDev() {
  const FICTICIO = "admin@demo.app";
  window.__limpiar = () => {
    document.querySelectorAll("nextjs-portal, [data-nextjs-toast], [data-next-badge-root]").forEach((e) => e.remove());
    const w = document.body && document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w?.nextNode()) {
      const n = w.currentNode;
      if (/@gmail\.com|@hotmail\.com|@yahoo\./i.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/[\w.+-]+@(gmail\.com|hotmail\.com|yahoo\.[a-z.]+)/gi, FICTICIO);
    }
  };
  const iniciar = () => { window.__limpiar(); setInterval(() => window.__limpiar(), 150); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
}

/**
 * BsAs Tennis Tour se graba con la cuenta del dueño, que también ve torneos
 * reales: se ocultan las tarjetas de todo torneo que no sea DEMO y los
 * inscriptos que no fueron cargados a mano (los del demo son ficticios).
 */
export function limpiezaTennis() {
  const antes = window.__limpiar;
  const ocultar = (e) => { if (e && e.style.display !== "none") e.style.display = "none"; };
  window.__limpiarTennis = () => {
    document.querySelectorAll('a[href^="/torneos/"]').forEach((a) => {
      const h = a.getAttribute("href");
      if (/^\/torneos\/[0-9a-f-]{36}$/.test(h) && !/DEMO/.test(a.textContent) && a.querySelector("img, h3, h2, p")) ocultar(a.closest("li") ?? a);
    });
    document.querySelectorAll("button").forEach((b) => {
      if (b.textContent.trim() !== "Marcar pagado") return;
      // La fila es el ancestro más alto que contiene un solo "Marcar pagado".
      const cuantos = (e) => [...e.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Marcar pagado").length;
      let fila = b;
      while (fila.parentElement && cuantos(fila.parentElement) === 1) fila = fila.parentElement;
      if (!/\(manual\)/.test(fila.textContent)) ocultar(fila);
    });
  };
  window.__limpiar = () => { antes?.(); window.__limpiarTennis(); };
}
