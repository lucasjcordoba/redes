/**
 * Publica en Instagram lo que ya tiene la hora cumplida.
 *
 *   npm run publicar                     todas las marcas
 *   npm run publicar -- --marca tecnoaid
 *   npm run publicar -- --dry-run        muestra qué haría, sin publicar
 *
 * Lo corre GitHub Actions una vez por hora. En cada corrida y por marca:
 *
 *   1. Busca los posts aprobados (sin `borrador`) cuya hora ya pasó, dentro de
 *      una ventana de VENTANA_HORAS. Lo más viejo no se publica: si algo quedó
 *      sin salir por días, es mejor enterarse que tirarlo al feed de golpe.
 *   2. Pide a Instagram las últimas publicaciones de la cuenta y descarta las
 *      que ya están, comparando el caption.
 *   3. Publica la más vieja de las que quedan. Una por corrida y por marca: si
 *      hay atraso, se pone al día de a una por hora en vez de en ráfaga.
 *
 * No guarda estado propio. La cuenta de Instagram es el registro de lo
 * publicado: así no hay archivo que se desincronice, y convive con cualquier
 * otro publicador (Make, o alguien a mano) mientras use el mismo caption.
 *
 * Las imágenes se sirven desde el repo (raw.githubusercontent.com) en el
 * commit exacto que se está corriendo. Instagram las descarga desde ahí.
 */
import { appendFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { MARCAS } from "../lib/rutas.mjs";
import { cargarMarca, instante, imagenesDe } from "../lib/cola.mjs";
import { cliente } from "../lib/instagram.mjs";

const { values } = parseArgs({
  options: {
    marca: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    ahora: { type: "string" }, // para probar: --ahora 2026-10-02T19:00-03:00
  },
});

const ensayo = values["dry-run"];
const ahora = values.ahora ? new Date(values.ahora) : new Date();
const VENTANA_HORAS = Number(process.env.VENTANA_HORAS ?? 48);

const base = process.env.IMAGENES_BASE ??
  (process.env.GITHUB_REPOSITORY && process.env.GITHUB_SHA
    ? `https://raw.githubusercontent.com/${process.env.GITHUB_REPOSITORY}/${process.env.GITHUB_SHA}`
    : null);

const normalizar = (s) => (s ?? "").replace(/\r\n/g, "\n").normalize("NFC").trim();
const resumen = [];
let fallas = 0;

for (const id of values.marca ? [values.marca] : MARCAS) {
  const m = await cargarMarca(id);
  const desde = new Date(ahora.getTime() - VENTANA_HORAS * 3600e3);

  const pendientes = m.posts
    .filter((p) => !p.borrador)
    .filter((p) => instante(p) <= ahora && instante(p) >= desde)
    .sort((a, b) => instante(a) - instante(b));

  if (!pendientes.length) {
    log(m, "nada para publicar ahora");
    continue;
  }

  const token = process.env[m.token];
  if (!token) {
    // Una marca sin token no frena a la otra: se puede configurar de a una.
    log(m, `hay ${pendientes.length} pendiente(s) pero falta ${m.token}; no se publica`);
    if (!ensayo) fallas++;
    continue;
  }

  try {
    const ig = cliente(token);
    const { user_id, username } = await ig.cuenta();
    const publicados = new Set((await ig.recientes(user_id)).map((r) => normalizar(r.caption)));

    const post = pendientes.find((p) => !publicados.has(normalizar(p.caption)));
    const yaEstaban = pendientes.filter((p) => publicados.has(normalizar(p.caption)));
    for (const p of yaEstaban) log(m, `${p.id} ya está en @${username}`);
    if (!post) continue;

    if (!base) throw new Error("No sé de dónde servir las imágenes: falta IMAGENES_BASE");
    const urls = imagenesDe(post).map((f) => `${base}/marcas/${id}/imagenes/${f}`);

    if (ensayo) {
      log(m, `publicaría ${post.id} (${post.fecha} ${post.hora}) en @${username}:\n    ${urls.join("\n    ")}`);
      continue;
    }

    await comprobarImagenes(urls);
    const { permalink } = await ig.publicar(user_id, { urls, caption: post.caption });
    log(m, `✓ ${post.id} publicado en @${username}: ${permalink}`);
    await registrarPublicacion(id, post, permalink).catch((e) => log(m, `(no se pudo registrar en el PR: ${e.message})`));
    await avisar({
      titulo: `Publicado en @${username}`,
      cuerpo: post.caption.split("\n").find(Boolean).slice(0, 120),
      url: "/",
      etiqueta: `publicado-${id}-${post.id}`,
    }).catch((e) => log(m, `(no se pudo avisar: ${e.message})`));
  } catch (e) {
    fallas++;
    log(m, `✗ ${e.message}`);
  }
}

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Publicación ${ahora.toISOString()}\n\n${resumen.join("\n")}\n`);
}
process.exit(fallas ? 1 : 0);

function log(m, texto) {
  console.log(`[${m.nombre}] ${texto}`);
  resumen.push(`- **${m.nombre}**: ${texto}`);
}

/**
 * Deja constancia de la publicación en el PR del post, con el link. La app de
 * revisión lee ese comentario para mostrar el post como "publicado". Los posts
 * viejos de posts.mjs no tienen PR: para ellos no hay nada que registrar.
 */
async function registrarPublicacion(marca, post, permalink) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return;
  const gh = (ruta, opciones = {}) =>
    fetch(`https://api.github.com/repos/${repo}${ruta}`, {
      ...opciones,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`GitHub ${r.status}`))));

  const rama = `post/${marca}/${post.id}`;
  const prs = await gh(`/pulls?state=closed&per_page=100&sort=updated&direction=desc`);
  const pr = prs.find((p) => p.head.ref === rama && p.merged_at);
  if (!pr) return;
  const datos = JSON.stringify({ permalink, fecha: new Date().toISOString() });
  await gh(`/issues/${pr.number}/comments`, {
    method: "POST",
    body: JSON.stringify({ body: `<!-- publicado: ${datos} -->\n✅ Publicado en Instagram: ${permalink}` }),
  });
}

/** Aviso push por la app de revisión (revisar/api/avisar.js). */
async function avisar(aviso) {
  const url = process.env.AVISAR_URL;
  const clave = process.env.AVISAR_CLAVE;
  if (!url || !clave) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-avisar-clave": clave },
    body: JSON.stringify(aviso),
  });
  if (!res.ok) throw new Error(`aviso ${res.status}`);
}

/**
 * Instagram falla con un error genérico si no puede bajar la imagen. Probarla
 * antes da un mensaje claro: casi siempre es que el repo es privado o que la
 * imagen no se commiteó.
 */
async function comprobarImagenes(urls) {
  for (const url of urls) {
    const res = await fetch(url, { method: "HEAD" });
    const tipo = res.headers.get("content-type") ?? "";
    if (!res.ok || !tipo.startsWith("image/jpeg")) {
      throw new Error(`La imagen no está accesible como JPEG (${res.status} ${tipo}): ${url}`);
    }
  }
}
