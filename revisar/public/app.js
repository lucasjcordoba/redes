/**
 * Redes — app de revisión de publicaciones de Raudal Dev y TecnoAid.
 *
 * Cuatro vistas sobre los mismos datos (/api/estado): Hoy, Calendario,
 * Historial y Avisos. Aprobar y cancelar van a /api/accion; los cambios se
 * piden en el chat de la tarea diaria de Claude, que es quien los aplica.
 */

const CHAT = "https://claude.ai/code/session_01K781KudNVPpkw47drWk5Zo";
const MARCA_COLOR = { raudal: "var(--raudal)", tecnoaid: "var(--tecnoaid)" };
const ESTADO = { pendiente: "Pendiente", aprobada: "Aprobada", publicada: "Publicada", cancelada: "Cancelada" };
const TITULOS = { hoy: "Hoy", calendario: "Calendario", historial: "Historial", ajustes: "Avisos" };

const $vista = document.getElementById("vista");
const $titulo = document.getElementById("titulo");
const $recargar = document.getElementById("recargar");

const app = {
  datos: null,
  vista: (() => { try { return localStorage.getItem("vista"); } catch { return null; } })() ?? "hoy",
  mes: null, // "AAAA-MM" del calendario
  diaElegido: null,
  filtroMarca: "todas",
  filtroEstado: "todos",
  abierto: null, // PR desplegado en el historial
};

// ---------- utilidades ----------

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const aFecha = (f) => new Date(`${f}T12:00:00Z`);
const fmt = (f, op) => aFecha(f).toLocaleDateString("es-AR", { timeZone: "UTC", ...op });
const fechaCorta = (f) => fmt(f, { weekday: "short", day: "numeric", month: "short" });
const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const fechaLarga = (f) => mayus(fmt(f, { weekday: "long", day: "numeric", month: "long" }));
const horaDe = (iso) => new Date(iso).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const sumarDias = (f, n) => new Date(aFecha(f).getTime() + n * 86400e3).toISOString().slice(0, 10);

function toast(texto) {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = texto;
  document.body.append(t);
  setTimeout(() => t.remove(), 3200);
}

const marca = (k) => app.datos.marcas[k];
const chip = (estado) => `<span class="chip ${estado}">${ESTADO[estado]}</span>`;
const chipEditada = (p) => (p.ediciones.length ? `<span class="chip editada">Editada ×${p.ediciones.length}</span>` : "");

// ---------- datos ----------

async function cargar({ fresco = false } = {}) {
  $recargar.classList.add("girando");
  try {
    const res = await fetch(`/api/estado${fresco ? "?fresco=1" : ""}`, { credentials: "same-origin" });
    if (res.status === 401) return mostrarEntrar();
    const r = await res.json();
    if (!r.ok) throw new Error(r.mensaje);
    app.datos = r;
    app.mes ??= r.hoy.slice(0, 7);
    app.diaElegido ??= r.hoy;
    pintar();
  } catch {
    if (!app.datos) $vista.innerHTML = `<p class="vacio">No se pudo cargar. Revisá la conexión y tocá actualizar.</p>`;
    else toast("No se pudo actualizar");
  } finally {
    $recargar.classList.remove("girando");
  }
}

function mostrarEntrar() {
  $titulo.textContent = "Redes";
  $vista.innerHTML = `
    <form class="panel entrar" method="post" action="/api/entrar">
      <h2>Revisión de publicaciones</h2>
      <p>Ingresá la contraseña. Este dispositivo la recuerda por un año.</p>
      <input type="hidden" name="volver" value="/">
      <input type="password" name="password" autocomplete="current-password" required autofocus aria-label="Contraseña">
      ${location.search.includes("error") ? `<p class="mensaje error">Contraseña incorrecta.</p>` : ""}
      <button class="btn btn-primario" type="submit">Entrar</button>
    </form>`;
}

async function accion(p, tipo, $msg) {
  const preguntas = {
    aprobar: `¿Aprobar "${p.titulo}"? Sale el ${fechaCorta(p.fecha)} a las ${p.hora}.`,
    cancelar: `¿Cancelar "${p.titulo}"? No se va a publicar.`,
  };
  if (!confirm(preguntas[tipo])) return;
  $msg.className = "mensaje";
  $msg.textContent = "Un momento…";
  try {
    const res = await fetch("/api/accion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pr: p.pr, sha: p.sha, accion: tipo }),
    });
    const r = await res.json();
    $msg.className = `mensaje ${r.ok ? "ok" : "error"}`;
    $msg.textContent = r.mensaje;
    if (r.ok) setTimeout(() => cargar({ fresco: true }), 800);
  } catch {
    $msg.className = "mensaje error";
    $msg.textContent = "No hubo conexión. Probá de nuevo.";
  }
}

async function pedirCambios(p) {
  const texto = `Cambios para ${marca(p.marca).nombre} "${p.titulo}" (#${p.pr}): `;
  try {
    await navigator.clipboard.writeText(texto);
    toast("Copiado: pegalo en el chat y escribí el cambio");
  } catch {
    toast(`Escribí en el chat: ${texto}`);
  }
  setTimeout(() => window.open(CHAT, "_blank", "noopener"), 400);
}

// ---------- vistas ----------

function pintar() {
  $titulo.textContent = TITULOS[app.vista];
  document.querySelectorAll(".pestanas button").forEach((b) => {
    if (b.dataset.vista === app.vista) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  ({ hoy: vistaHoy, calendario: vistaCalendario, historial: vistaHistorial, ajustes: vistaAjustes })[app.vista]();
}

function tarjeta(p) {
  const m = marca(p.marca);
  const pendiente = p.estado === "pendiente";
  const el = document.createElement("article");
  el.className = "tarjeta";
  el.style.setProperty("--marca", MARCA_COLOR[p.marca]);
  el.innerHTML = `
    <div class="tarjeta-cab">
      <img class="avatar" src="${m.avatar}" alt="">
      <div class="quien"><b>${esc(m.usuario)}</b><small>${esc(fechaCorta(p.fecha))} · ${esc(p.hora)}</small></div>
      <div class="chips">${chip(p.estado)}${chipEditada(p)}</div>
    </div>
    <a href="/p/${p.pr}"><img class="tarjeta-img" src="${esc(p.imagen)}" alt="${esc(p.titulo)}" loading="lazy"></a>
    <div class="tarjeta-cuerpo">
      <h3>${esc(p.titulo)}</h3>
      <p>${esc(p.resumen)}</p>
      <div class="acciones">
        ${pendiente ? `
          <button class="btn btn-secundario" data-a="cambios">Pedir cambios</button>
          <button class="btn btn-primario" data-a="aprobar">Aprobar</button>
          <a class="btn btn-secundario ancho" href="/p/${p.pr}">Ver como en Instagram</a>
          <button class="btn btn-peligro ancho" data-a="cancelar">Cancelar publicación</button>`
        : p.permalink ? `<a class="btn btn-secundario ancho" href="${esc(p.permalink)}" target="_blank" rel="noopener">Ver en Instagram</a>`
        : `<a class="btn btn-secundario ancho" href="/p/${p.pr}">Ver como en Instagram</a>`}
      </div>
      <p class="mensaje" role="status"></p>
    </div>`;
  const $msg = el.querySelector(".mensaje");
  el.querySelector('[data-a="aprobar"]')?.addEventListener("click", () => accion(p, "aprobar", $msg));
  el.querySelector('[data-a="cancelar"]')?.addEventListener("click", () => accion(p, "cancelar", $msg));
  el.querySelector('[data-a="cambios"]')?.addEventListener("click", () => pedirCambios(p));
  return el;
}

function sinPost(k) {
  const m = marca(k);
  const el = document.createElement("article");
  el.className = "tarjeta";
  el.style.setProperty("--marca", MARCA_COLOR[k]);
  el.innerHTML = `
    <div class="tarjeta-cab"><img class="avatar" src="${m.avatar}" alt=""><div class="quien"><b>${esc(m.usuario)}</b></div></div>
    <div class="sin-post">
      <span>Hoy no hay nada programado.</span>
      <a class="btn btn-secundario" href="${CHAT}" target="_blank" rel="noopener">Proponer una idea en el chat</a>
    </div>`;
  return el;
}

function vistaHoy() {
  const { hoy, posts } = app.datos;
  $vista.innerHTML = `<p class="fecha-grande">${esc(fechaLarga(hoy))}</p>`;
  for (const k of Object.keys(app.datos.marcas)) {
    const suyos = posts.filter((p) => p.marca === k && p.fecha === hoy && p.estado !== "cancelada");
    if (suyos.length) suyos.forEach((p) => $vista.append(tarjeta(p)));
    else $vista.append(sinPost(k));
  }
  // Lo que quedó de días anteriores sin respuesta: ya no sale solo, conviene verlo.
  const atrasados = posts.filter((p) => p.estado === "pendiente" && p.fecha < hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (atrasados.length) {
    $vista.insertAdjacentHTML("beforeend", `<h2 class="seccion">Quedaron sin respuesta</h2>`);
    atrasados.forEach((p) => $vista.append(tarjeta(p)));
  }
  const manana = sumarDias(hoy, 1);
  const deManana = posts.filter((p) => p.fecha === manana && p.estado !== "cancelada");
  if (deManana.length) {
    $vista.insertAdjacentHTML("beforeend", `<h2 class="seccion">Mañana</h2>`);
    deManana.forEach((p) => $vista.append(fila(p)));
  }
}

function fila(p, alTocar) {
  const m = marca(p.marca);
  const b = document.createElement("button");
  b.className = "fila";
  b.style.setProperty("--marca", MARCA_COLOR[p.marca]);
  b.innerHTML = `
    <img src="${esc(p.imagen)}" alt="" loading="lazy">
    <div class="info">
      <span class="marca-tag">${esc(m.nombre)}</span>
      <b>${esc(p.titulo)}</b>
      <small>${esc(fechaCorta(p.fecha))} · ${esc(p.hora)}</small>
    </div>
    <div class="chips">${chip(p.estado)}</div>`;
  b.addEventListener("click", alTocar ?? (() => { location.href = `/p/${p.pr}`; }));
  return b;
}

function vistaCalendario() {
  const { hoy, posts } = app.datos;
  const [a, m] = app.mes.split("-").map(Number);
  const primero = new Date(Date.UTC(a, m - 1, 1, 12));
  const diasMes = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const offset = (primero.getUTCDay() + 6) % 7; // semana arranca el lunes
  const nombreMes = mayus(primero.toLocaleDateString("es-AR", { timeZone: "UTC", month: "long" })) + " " + a;
  const porDia = Object.groupBy(posts, (p) => p.fecha);

  let celdas = "";
  for (let i = 0; i < offset; i++) celdas += `<div class="celda fuera"></div>`;
  for (let d = 1; d <= diasMes; d++) {
    const f = `${app.mes}-${String(d).padStart(2, "0")}`;
    const puntos = (porDia[f] ?? [])
      .map((p) => `<i class="punto ${p.estado}" style="--marca:${MARCA_COLOR[p.marca]}"></i>`)
      .join("");
    const clases = ["celda", f === hoy && "hoy", f === app.diaElegido && "elegida", f < hoy && "pasado"].filter(Boolean).join(" ");
    celdas += `<button class="${clases}" data-f="${f}"><span>${d}</span><span class="puntos">${puntos}</span></button>`;
  }

  $vista.innerHTML = `
    <div class="mes-cab">
      <button data-mes="-1" aria-label="Mes anterior">‹</button>
      <h2>${esc(nombreMes)}</h2>
      <button data-mes="1" aria-label="Mes siguiente">›</button>
    </div>
    <div class="grilla">
      ${["L", "M", "M", "J", "V", "S", "D"].map((d) => `<div class="dia-sem">${d}</div>`).join("")}
      ${celdas}
    </div>
    <div class="leyenda">
      <span><i class="punto" style="--marca:var(--raudal)"></i>Raudal</span>
      <span><i class="punto" style="--marca:var(--tecnoaid)"></i>TecnoAid</span>
      <span><i class="punto pendiente" style="--marca:var(--tenue)"></i>Pendiente</span>
    </div>
    <h2 class="seccion">${esc(fechaLarga(app.diaElegido))}</h2>
    <div id="del-dia"></div>`;

  const $dia = document.getElementById("del-dia");
  const delDia = porDia[app.diaElegido] ?? [];
  if (delDia.length) delDia.forEach((p) => $dia.append(p.estado === "pendiente" ? tarjeta(p) : fila(p)));
  else $dia.innerHTML = `<p class="vacio">Nada programado para este día.</p>`;

  $vista.querySelectorAll("[data-mes]").forEach((b) => b.addEventListener("click", () => {
    const d = new Date(Date.UTC(a, m - 1 + Number(b.dataset.mes), 1));
    app.mes = d.toISOString().slice(0, 7);
    pintar();
  }));
  $vista.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => {
    app.diaElegido = b.dataset.f;
    pintar();
  }));
}

function detalle(p) {
  const eventos = [{ cuando: p.creada, c: "var(--pendiente)", texto: "Creada, esperando revisión" }];
  for (const e of p.ediciones) {
    const cambios = e.cambios.map((c) => {
      if (c.campo === "texto") {
        return `<div class="cambio"><span class="campo">Texto:</span>
          ${c.sacado.map((l) => `<span class="sacado">${esc(l)}</span>`).join("")}
          ${c.agregado.map((l) => `<span class="agregado">${esc(l)}</span>`).join("")}</div>`;
      }
      if (c.campo === "placa") return `<div class="cambio"><span class="campo">Placa:</span> ${esc(c.despues)}</div>`;
      return `<div class="cambio"><span class="campo">${esc(c.campo[0].toUpperCase() + c.campo.slice(1))}:</span> <span class="sacado" style="display:inline">${esc(c.antes)}</span> → <span class="agregado" style="display:inline">${esc(c.despues)}</span></div>`;
    }).join("");
    eventos.push({ cuando: e.fecha, c: "var(--editada)", texto: "Editada", extra: `${e.mensaje ? `<div>${esc(e.mensaje)}</div>` : ""}${cambios}` });
  }
  if (p.estado === "aprobada" || p.estado === "publicada") eventos.push({ cuando: p.resuelta, c: "var(--aprobada)", texto: "Aprobada" });
  if (p.estado === "cancelada") eventos.push({ cuando: p.resuelta, c: "var(--cancelada)", texto: "Cancelada" });
  if (p.estado === "publicada") {
    eventos.push({ cuando: null, c: "var(--publicada)", texto: `Publicada${p.permalink ? ` · <a href="${esc(p.permalink)}" target="_blank" rel="noopener">ver en Instagram</a>` : ""}` });
  }

  const el = document.createElement("div");
  el.className = "detalle";
  el.innerHTML = `
    <div class="linea-tiempo">
      ${eventos.map((e) => `<div class="evento" style="--c:${e.c}">${e.texto}<small>${e.cuando ? esc(horaDe(e.cuando)) : ""}</small>${e.extra ?? ""}</div>`).join("")}
    </div>
    <a class="btn btn-secundario" href="/p/${p.pr}">Ver como en Instagram</a>`;
  return el;
}

function vistaHistorial() {
  const { posts } = app.datos;
  const filtrosMarca = [["todas", "Todas"], ...Object.entries(app.datos.marcas).map(([k, m]) => [k, m.nombre])];
  const filtrosEstado = [["todos", "Todos"], ...Object.entries(ESTADO), ["editada", "Editadas"]];

  const lista = posts
    .filter((p) => app.filtroMarca === "todas" || p.marca === app.filtroMarca)
    .filter((p) => app.filtroEstado === "todos" || (app.filtroEstado === "editada" ? p.ediciones.length : p.estado === app.filtroEstado))
    .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`));

  $vista.innerHTML = `
    <div class="filtros">${filtrosMarca.map(([k, n]) => `<button class="filtro" data-marca="${k}" aria-pressed="${app.filtroMarca === k}">${esc(n)}</button>`).join("")}</div>
    <div class="filtros">${filtrosEstado.map(([k, n]) => `<button class="filtro" data-estado="${k}" aria-pressed="${app.filtroEstado === k}">${esc(n)}</button>`).join("")}</div>
    <div id="lista"></div>`;

  const $lista = document.getElementById("lista");
  if (!lista.length) $lista.innerHTML = `<p class="vacio">No hay publicaciones con ese filtro.</p>`;
  for (const p of lista) {
    const f = fila(p, () => {
      app.abierto = app.abierto === p.pr ? null : p.pr;
      pintar();
    });
    if (p.ediciones.length) f.querySelector(".chips").insertAdjacentHTML("beforeend", chipEditada(p));
    $lista.append(f);
    if (app.abierto === p.pr) $lista.append(detalle(p));
  }

  $vista.querySelectorAll("[data-marca]").forEach((b) => b.addEventListener("click", () => { app.filtroMarca = b.dataset.marca; pintar(); }));
  $vista.querySelectorAll("[data-estado]").forEach((b) => b.addEventListener("click", () => { app.filtroEstado = b.dataset.estado; pintar(); }));
}

// ---------- avisos push ----------

const soportaPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone;

function base64aBytes(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function suscripcionActual() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function activarAvisos() {
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return toast("Sin permiso para notificaciones");
  const { clavePublica } = await (await fetch("/api/suscripcion")).json();
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64aBytes(clavePublica) });
  const r = await (await fetch("/api/suscripcion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) })).json();
  toast(r.mensaje);
  pintar();
}

async function desactivarAvisos() {
  const sub = await suscripcionActual();
  if (sub) {
    await fetch("/api/suscripcion", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
    await sub.unsubscribe();
  }
  toast("Avisos desactivados en este dispositivo");
  pintar();
}

async function vistaAjustes() {
  let estadoPush = "";
  if (!soportaPush) {
    estadoPush = esIOS && !instalada
      ? `<p>En iPhone, primero agregá la app a la pantalla de inicio: tocá <b>Compartir</b> → <b>Agregar a inicio</b>, y abrila desde el ícono. Después vas a poder activar los avisos acá.</p>`
      : `<p>Este navegador no soporta notificaciones push.</p>`;
  } else {
    const sub = await suscripcionActual().catch(() => null);
    estadoPush = sub
      ? `<p>✅ Los avisos están activados en este dispositivo.</p><button class="btn btn-secundario" id="push-off">Desactivar en este dispositivo</button>`
      : `<p>Recibí un aviso a las 9:00 con las publicaciones del día, cuando haya algo nuevo para revisar y cuando se publique algo, de las dos marcas.</p><button class="btn btn-primario" id="push-on">Activar avisos</button>`;
  }
  $vista.innerHTML = `
    <section class="panel"><h2>Notificaciones</h2>${estadoPush}</section>
    ${!instalada ? `<section class="panel"><h2>Instalar la app</h2><p>${esIOS
      ? "Compartir → Agregar a inicio."
      : "En el menú del navegador, elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>."}</p></section>` : ""}
    <section class="panel">
      <h2>Chat con Claude</h2>
      <p>Para pedir cambios o proponer una publicación nueva. Claude la arma y te avisa cuando está lista para revisar.</p>
      <a class="btn btn-secundario" href="${CHAT}" target="_blank" rel="noopener">Abrir el chat</a>
    </section>`;
  document.getElementById("push-on")?.addEventListener("click", () => activarAvisos().catch(() => toast("No se pudo activar")));
  document.getElementById("push-off")?.addEventListener("click", () => desactivarAvisos().catch(() => toast("No se pudo desactivar")));
}

// ---------- arranque ----------

document.querySelectorAll(".pestanas button").forEach((b) => b.addEventListener("click", () => {
  app.vista = b.dataset.vista;
  try { localStorage.setItem("vista", app.vista); } catch {}
  if (app.datos) pintar();
}));
$recargar.addEventListener("click", () => cargar({ fresco: true }));
document.addEventListener("visibilitychange", () => { if (!document.hidden && app.datos) cargar(); });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
cargar();
