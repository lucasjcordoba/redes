/**
 * Gesta Manager corriendo en local (modo desarrollo) monta herramientas que
 * no son parte del producto: una paleta que repinta la app de cian (el acento
 * real es ámbar), un selector de textura, burbujas flotantes y el indicador
 * de Next. Para el reel tienen que desaparecer en todos los cuadros.
 *
 * Por eso esto no se corre una vez: deja `window.__limpiar` y el grabador lo
 * llama antes de cada cuadro. React re-renderiza, la paleta reescribe :root
 * cuando quiere, y aun así ningún cuadro sale con algo de desarrollo.
 *
 * Tomado de ~/dev/tour-app/web/scripts/capture-screens-raudal.mjs.
 */
export function limpiezaGesta() {
  try {
    const lejos = Date.now() + 1e12;
    localStorage.setItem("gesta:welcome-seen-v1", "1");
    localStorage.setItem("ruta:texture", "none");
    localStorage.setItem("nomad:tutorial-step", "done");
    localStorage.setItem("nomad:pwa-prompt-dismissed-until", String(lejos));
    localStorage.setItem("ruta:install-prompt", JSON.stringify({ dismissedUntil: lejos, snoozeUntil: lejos, dismissed: true }));
  } catch {}

  const VARS = [
    "--primary", "--primary-foreground", "--sidebar-primary", "--sidebar-accent-foreground", "--ring",
    "--gradient-primary", "--card", "--card-foreground", "--popover", "--popover-foreground", "--sidebar",
    "--sidebar-foreground", "--sidebar-border", "--body-gradient-image", "--background", "--foreground",
    "--muted", "--border", "--input",
  ];
  const FLOTANTES = [
    '[aria-label="Theme picker"]', '[aria-label="Cambiar textura del fondo"]', '[aria-label="Ayuda"]',
    '[aria-label="Mensajes"]', '[aria-label*="Instalar"]',
  ];

  window.__limpiar = () => {
    const raiz = document.documentElement;
    if (!raiz) return;
    for (const v of VARS) raiz.style.removeProperty(v);
    document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
    for (const sel of FLOTANTES) {
      document.querySelectorAll(sel).forEach((el) => {
        // Se oculta el contenedor flotante más cercano, no sólo el botón: si
        // queda el wrapper fijo, queda un hueco con fondo.
        let objetivo = el;
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          if (getComputedStyle(n).position === "fixed") { objetivo = n; break; }
        }
        objetivo.style.setProperty("display", "none", "important");
      });
    }
  };
  document.addEventListener("DOMContentLoaded", () => window.__limpiar());
  setInterval(() => window.__limpiar(), 150);
}
