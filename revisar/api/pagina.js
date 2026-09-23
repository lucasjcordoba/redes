/**
 * GET /p/<pr>  — la publicación como se vería en Instagram, con los botones
 * para aprobarla, descartarla o pedir cambios. Sin sesión, pide la contraseña.
 *
 * Esta página no cambia nada por sí sola: los clientes de mail abren los links
 * para generar la vista previa, y un GET que aprobara publicaría sin que nadie
 * lo decidiera. Todo lo que modifica pasa por POST /api/accion.
 */
import { MARCAS, cargar, sesionValida } from "./_lib.js";
import { cuando } from "./accion.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const { pr, error } = req.query;
  if (!/^\d+$/.test(String(pr))) return res.status(404).send(pagina("No encontrada", aviso("No encontré esta publicación.")));
  if (!sesionValida(req)) return res.status(401).send(pagina("Entrar", entrar(pr, error)));

  let d;
  try {
    d = await cargar(pr);
  } catch (e) {
    console.error(e);
    return res.status(404).send(pagina("No encontrada", aviso("No encontré esta publicación.")));
  }

  const m = MARCAS[d.marca];
  const datos = { pr: d.pr, sha: d.sha };
  return res.send(pagina(`${m.nombre} · ${d.post.fecha}`, `
    <p class="programado">${estadoTexto(d)}</p>
    ${publicacion(m, d)}
    ${d.estado === "abierto" ? formulario(d) : ""}
    <p class="pie">${esc(m.nombre)} · ${esc(d.id)} · ${esc(d.post.pilar)} · PR #${d.pr}</p>
    <script>window.REVISION = ${JSON.stringify(datos)};</script>
    <script>${cliente}</script>`));
}

function estadoTexto(d) {
  if (d.estado === "aprobado") return `<span class="chip ok">Aprobada</span> sale el ${cuando(d.post)}`;
  if (d.estado === "descartado") return `<span class="chip no">Descartada</span> no se va a publicar`;
  if (d.cambiosPendientes) return `<span class="chip espera">Cambios en curso</span> Claude está aplicando tu pedido`;
  return `Se publica el ${cuando(d.post)}`;
}

function publicacion(m, d) {
  const n = d.imagenes.length;
  const imgs = d.imagenes
    .map((src, i) => `<img src="${esc(src)}" alt="Imagen ${i + 1} de ${n}" ${i ? 'loading="lazy"' : ""}>`)
    .join("");
  const puntos = n > 1 ? `<div class="puntos">${d.imagenes.map((_, i) => `<i${i ? "" : ' class="activo"'}></i>`).join("")}</div>` : "";
  const contador = n > 1 ? `<span class="contador">1/${n}</span>` : "";

  return `
  <article class="ig">
    <header class="ig-cabecera">
      <img class="avatar" src="${m.avatar}" alt="">
      <b>${esc(m.usuario)}</b>
      <svg class="mas" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
    </header>
    <div class="ig-media">
      <div class="carrusel">${imgs}</div>
      ${contador}
    </div>
    <div class="ig-acciones">
      ${icono("M16.8 3.5c-1.9 0-3.5 1-4.8 2.8C10.7 4.5 9.1 3.5 7.2 3.5 4.3 3.5 2 5.9 2 8.9c0 5.5 7.8 10.8 10 11.9 2.2-1.1 10-6.4 10-11.9 0-3-2.3-5.4-5.2-5.4z")}
      ${icono("M20.7 16.8A9.5 9.5 0 1 0 17 20.3L21.5 21.5z")}
      ${icono("M22 3 9.2 10.1M22 3l-7 18-3.8-8.3L2 9.9z")}
      ${puntos}
      <span class="flex"></span>
      ${icono("M19 21l-7-5.5L5 21V3h14z")}
    </div>
    <div class="ig-caption"><b>${esc(m.usuario)}</b> ${caption(d.post.caption)}</div>
    <div class="ig-fecha">${esc(fechaLarga(d.post.fecha))}</div>
  </article>`;
}

function formulario(d) {
  const enCurso = Boolean(d.cambiosPendientes);
  return `
  <section class="revision" id="revision">
    ${enCurso ? `<p class="nota">Pediste cambios y Claude los está aplicando. Cuando esté la versión nueva te llega un mail con este mismo link.</p>` : ""}
    <label for="cambios">¿Algo para cambiar? <span>(opcional)</span></label>
    <textarea id="cambios" rows="3" maxlength="2000" placeholder="Ej.: sacá la línea de la señal y cambiá el título por…" ${enCurso ? "disabled" : ""}></textarea>
    <div class="botones">
      <button type="button" data-accion="cambios" class="secundario" disabled>Mandar cambios</button>
      <button type="button" data-accion="aprobar" class="primario" ${enCurso ? "disabled" : ""}>Aprobar</button>
    </div>
    <button type="button" data-accion="cancelar" class="texto">Cancelar publicación</button>
    <p class="mensaje" id="mensaje" role="status"></p>
  </section>`;
}

function icono(d) {
  return `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escapa y pinta los hashtags como Instagram. Los saltos de línea los resuelve el CSS. */
const caption = (t) => esc(t).replace(/#[\p{L}\p{N}_]+/gu, (h) => `<span class="hashtag">${h}</span>`);

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(fecha) {
  const [, m, d] = fecha.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
}

function entrar(pr, error) {
  return `
  <form class="entrar" method="post" action="/api/entrar">
    <h1>Revisión de publicaciones</h1>
    <p>Ingresá la contraseña. Este navegador la recuerda por un año.</p>
    <input type="hidden" name="pr" value="${esc(pr)}">
    <input type="password" name="password" autocomplete="current-password" required autofocus aria-label="Contraseña">
    ${error ? '<p class="mensaje error">Contraseña incorrecta.</p>' : ""}
    <button class="primario" type="submit">Entrar</button>
  </form>`;
}

function aviso(texto) {
  return `<p class="aviso">${esc(texto)}</p>`;
}

function pagina(titulo, cuerpo) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(titulo)} · Revisión</title>
<style>${estilos}</style>
</head>
<body><main>${cuerpo}</main></body>
</html>`;
}

const estilos = `
:root {
  --fondo: #fafafa; --tarjeta: #fff; --texto: #0c1014; --tenue: #737373; --borde: #dbdbdb;
  --azul: #0095f6; --azul-hover: #1877f2; --hashtag: #00376b; --rojo: #ed4956;
  --ok: #1a7f37; --ok-fondo: #dafbe1; --no-fondo: #ffebe9; --espera: #8a6100; --espera-fondo: #fff8c5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #000; --tarjeta: #0c1014; --texto: #f5f5f5; --tenue: #a8a8a8; --borde: #262626;
    --hashtag: #e0f1ff; --ok: #4ac26b; --ok-fondo: #0f2a17; --no-fondo: #3b1219; --espera: #e3b341; --espera-fondo: #2e2505;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--fondo); color: var(--texto);
  font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
main { max-width: 470px; margin: 0 auto; padding: 16px 0 40px; }
.programado { margin: 0 16px 12px; color: var(--tenue); font-size: 13px; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 999px; font-weight: 600; font-size: 12px; margin-right: 4px; }
.chip.ok { background: var(--ok-fondo); color: var(--ok); }
.chip.no { background: var(--no-fondo); color: var(--rojo); }
.chip.espera { background: var(--espera-fondo); color: var(--espera); }

.ig { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 8px; overflow: hidden; }
@media (max-width: 480px) { .ig { border-radius: 0; border-left: 0; border-right: 0; } }
.ig-cabecera { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; outline: 1px solid var(--borde); }
.mas { width: 22px; height: 22px; margin-left: auto; fill: var(--texto); }

.ig-media { position: relative; background: #000; }
.carrusel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.carrusel::-webkit-scrollbar { display: none; }
.carrusel img { flex: 0 0 100%; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; scroll-snap-align: center; display: block; }
.contador { position: absolute; top: 12px; right: 12px; background: rgb(0 0 0 / .7); color: #fff; font-size: 12px; padding: 3px 8px; border-radius: 999px; }

.ig-acciones { display: flex; align-items: center; gap: 14px; padding: 8px 12px 4px; position: relative; }
.icono { width: 24px; height: 24px; fill: none; stroke: var(--texto); stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.flex { flex: 1; }
.puntos { position: absolute; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; }
.puntos i { width: 6px; height: 6px; border-radius: 50%; background: var(--borde); }
.puntos i.activo { background: var(--azul); }
.ig-caption { padding: 4px 12px 0; white-space: pre-line; overflow-wrap: anywhere; }
.hashtag { color: var(--hashtag); }
.ig-fecha { padding: 8px 12px 14px; color: var(--tenue); font-size: 10px; letter-spacing: .2px; text-transform: uppercase; }

.revision { margin: 16px; display: grid; gap: 10px; }
.revision label { font-weight: 600; }
.revision label span { font-weight: 400; color: var(--tenue); }
textarea {
  width: 100%; font: inherit; color: inherit; background: var(--tarjeta); border: 1px solid var(--borde);
  border-radius: 8px; padding: 10px 12px; resize: vertical; min-height: 76px;
}
textarea:focus { outline: 2px solid var(--azul); outline-offset: -1px; }
.botones { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
button { font: inherit; font-weight: 600; border-radius: 8px; padding: 11px 12px; cursor: pointer; border: 0; }
button:disabled { opacity: .45; cursor: default; }
.primario { background: var(--azul); color: #fff; }
.primario:not(:disabled):hover { background: var(--azul-hover); }
.secundario { background: var(--tarjeta); color: var(--texto); border: 1px solid var(--borde); }
.texto { background: none; color: var(--rojo); padding: 6px; justify-self: center; }
.mensaje { margin: 0; min-height: 20px; text-align: center; }
.mensaje.ok { color: var(--ok); } .mensaje.error { color: var(--rojo); }
.nota { margin: 0; padding: 10px 12px; border-radius: 8px; background: var(--espera-fondo); color: var(--espera); }
.pie { margin: 20px 16px 0; color: var(--tenue); font-size: 12px; text-align: center; }
.aviso { margin: 40px 16px; text-align: center; color: var(--tenue); font-size: 16px; }
.entrar { margin: 60px 16px; display: grid; gap: 12px; }
.entrar h1 { font-size: 20px; margin: 0; }
.entrar p { margin: 0; color: var(--tenue); }
.entrar input[type=password] { font: inherit; font-size: 16px; color: inherit; background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 8px; padding: 12px; }
`;

// Corre en el navegador. Sin dependencias: lo mínimo para los botones y los
// puntitos del carrusel.
const cliente = `
(() => {
  const R = window.REVISION;
  const carrusel = document.querySelector(".carrusel");
  const puntos = document.querySelectorAll(".puntos i");
  const contador = document.querySelector(".contador");
  if (carrusel && puntos.length) {
    carrusel.addEventListener("scroll", () => {
      const i = Math.round(carrusel.scrollLeft / carrusel.clientWidth);
      puntos.forEach((p, j) => p.classList.toggle("activo", i === j));
      if (contador) contador.textContent = (i + 1) + "/" + puntos.length;
    }, { passive: true });
  }

  const seccion = document.getElementById("revision");
  if (!seccion) return;
  const texto = document.getElementById("cambios");
  const mensaje = document.getElementById("mensaje");
  const botones = seccion.querySelectorAll("button");
  const btnCambios = seccion.querySelector('[data-accion="cambios"]');
  texto.addEventListener("input", () => { btnCambios.disabled = !texto.value.trim(); });

  const PREGUNTAS = {
    cancelar: "¿Cancelar esta publicación? No se va a publicar.",
    aprobar: () => texto.value.trim() ? "Escribiste cambios pero no los mandaste. ¿Aprobar igual, sin esos cambios?" : null,
  };

  seccion.addEventListener("click", async (e) => {
    const accion = e.target.closest("button")?.dataset.accion;
    if (!accion) return;
    const pregunta = typeof PREGUNTAS[accion] === "function" ? PREGUNTAS[accion]() : PREGUNTAS[accion];
    if (pregunta && !confirm(pregunta)) return;

    botones.forEach((b) => (b.disabled = true));
    mensaje.className = "mensaje";
    mensaje.textContent = "Un momento…";
    try {
      const res = await fetch("/api/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr: R.pr, sha: R.sha, accion, cambios: texto.value }),
      });
      const r = await res.json();
      mensaje.textContent = r.mensaje;
      mensaje.className = "mensaje " + (r.ok ? "ok" : "error");
      if (r.ok) {
        texto.disabled = true;
        seccion.querySelector("label").remove();
        texto.remove();
        seccion.querySelector(".botones").remove();
        seccion.querySelector(".texto").remove();
      } else {
        botones.forEach((b) => (b.disabled = false));
        btnCambios.disabled = !texto.value.trim();
      }
    } catch {
      mensaje.textContent = "No hubo conexión. Probá de nuevo.";
      mensaje.className = "mensaje error";
      botones.forEach((b) => (b.disabled = false));
      btnCambios.disabled = !texto.value.trim();
    }
  });
})();`;
