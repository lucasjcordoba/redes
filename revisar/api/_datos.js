/**
 * El estado de todas las publicaciones, armado a partir de GitHub.
 *
 * Cada publicación es un PR de una rama post/<marca>/<id> (ver CLAUDE.md), así
 * que el estado sale del PR mismo:
 *
 *   abierto              → pendiente
 *   mergeado             → aprobada
 *   mergeado + registro  → publicada (el publicador deja un comentario con el
 *                          link de Instagram, ver scripts/publicar.mjs)
 *   cerrado sin merge    → cancelada
 *
 * Cada commit después del primero es una edición. Para mostrar qué cambió se
 * compara el JSON del post antes y después de ese commit.
 */
import { REPO, MARCAS, gh } from "./_lib.js";

/** El historial arranca con el calendario del 24/09/2026; lo anterior fueron pruebas. */
const DESDE_PR = 15;

export const MARCA_PUBLICADO = "<!-- publicado:";

const raw = (sha, ruta) => `https://raw.githubusercontent.com/${REPO}/${sha}/${ruta}`;

async function leerPost(sha, marca, id) {
  const res = await fetch(raw(sha, `marcas/${marca}/posts/${id}.json`));
  return res.ok ? res.json() : null;
}

export function imagenesDe(post, sha, marca) {
  const archivos = post.imagen
    ? [post.imagen]
    : post.diapositivas
      ? post.diapositivas.map((_, i) => `${post.id}-${String(i + 1).padStart(2, "0")}.jpg`)
      : [`${post.id}.jpg`];
  return archivos.map((f) => raw(sha, `marcas/${marca}/imagenes/${f}`));
}

export function tituloDe(post) {
  const visual = (post.diapositivas?.[0] ?? post).visual;
  if (visual?.titulo) return [].concat(visual.titulo).join(" ");
  return post.caption.split("\n")[0];
}

/** Qué cambió entre dos versiones de un post, en términos legibles. */
function diferencias(antes, despues) {
  if (!antes || !despues) return [];
  const cambios = [];
  for (const campo of ["fecha", "hora"]) {
    if (antes[campo] !== despues[campo]) cambios.push({ campo, antes: antes[campo], despues: despues[campo] });
  }
  const tA = tituloDe(antes);
  const tD = tituloDe(despues);
  if (tA !== tD) cambios.push({ campo: "título", antes: tA, despues: tD });

  const visualA = JSON.stringify(antes.diapositivas ?? antes.visual ?? antes.imagen);
  const visualD = JSON.stringify(despues.diapositivas ?? despues.visual ?? despues.imagen);
  if (visualA !== visualD && tA === tD) cambios.push({ campo: "placa", antes: "", despues: "cambió el texto de la imagen" });

  if (antes.caption !== despues.caption) {
    const lA = antes.caption.split("\n").filter(Boolean);
    const lD = despues.caption.split("\n").filter(Boolean);
    const sacadas = lA.filter((l) => !lD.includes(l));
    const agregadas = lD.filter((l) => !lA.includes(l));
    cambios.push({ campo: "texto", sacado: sacadas, agregado: agregadas });
  }
  return cambios;
}

async function armar(pr) {
  const [, marca, id] = pr.head.ref.split("/");
  const estadoBase = pr.merged_at ? "aprobada" : pr.state === "open" ? "pendiente" : "cancelada";

  const [commits, comentarios] = await Promise.all([
    gh("GET", `/repos/${REPO}/pulls/${pr.number}/commits?per_page=100`),
    pr.merged_at ? gh("GET", `/repos/${REPO}/issues/${pr.number}/comments?per_page=100`) : [],
  ]);

  const sha = pr.head.sha;
  const post = await leerPost(sha, marca, id);
  if (!post) return null;

  // Cada commit después del primero es una edición: se compara con el anterior.
  const versiones = await Promise.all(commits.map((c) => leerPost(c.sha, marca, id)));
  const ediciones = commits.slice(1).map((c, i) => ({
    fecha: c.commit.committer.date,
    mensaje: c.commit.message.split("\n").filter((l) => l && !/^Co-Authored-By|^Claude-Session/i.test(l)).join("\n"),
    cambios: diferencias(versiones[i], versiones[i + 1]),
  })).filter((e) => e.cambios.length || e.mensaje);

  const registro = comentarios.find((c) => c.body?.includes(MARCA_PUBLICADO));
  let publicado = null;
  if (registro) {
    try {
      publicado = JSON.parse(registro.body.split(MARCA_PUBLICADO)[1].split("-->")[0]);
    } catch {
      publicado = {};
    }
  }

  return {
    marca,
    id,
    pr: pr.number,
    sha,
    estado: publicado ? "publicada" : estadoBase,
    fecha: post.fecha,
    hora: post.hora,
    pilar: post.pilar,
    titulo: tituloDe(post),
    resumen: post.caption.split("\n").find(Boolean),
    imagen: imagenesDe(post, sha, marca)[0],
    ediciones,
    permalink: publicado?.permalink ?? null,
    creada: pr.created_at,
    resuelta: pr.merged_at ?? pr.closed_at,
  };
}

let cache = null;

/** Todas las publicaciones del sistema. Se cachea un minuto por instancia. */
export async function estado({ fresco = false } = {}) {
  if (!fresco && cache && Date.now() - cache.en < 60_000) return cache.datos;

  const prs = await gh("GET", `/repos/${REPO}/pulls?state=all&per_page=100&sort=created&direction=desc`);
  const deposts = prs.filter((p) => p.number >= DESDE_PR && p.head.ref.startsWith("post/") && MARCAS[p.head.ref.split("/")[1]]);
  const posts = (await Promise.all(deposts.map(armar))).filter(Boolean);

  const datos = {
    generado: new Date().toISOString(),
    marcas: Object.fromEntries(Object.entries(MARCAS).map(([k, m]) => [k, { nombre: m.nombre, usuario: m.usuario, avatar: m.avatar }])),
    posts,
  };
  cache = { en: Date.now(), datos };
  return datos;
}
