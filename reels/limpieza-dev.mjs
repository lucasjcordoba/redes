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
