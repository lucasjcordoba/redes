/**
 * Lo que comparten la página y las acciones: sesión, GitHub y el post de un PR.
 *
 * Los archivos de api/ que empiezan con _ no se publican como endpoints.
 *
 * Variables de entorno (Vercel):
 *   GITHUB_TOKEN     token fine-grained con Contents, Pull requests e Issues
 *                    en lectura y escritura sobre el repo
 *   REVISION_CLAVE   clave con la que se firma la cookie de sesión
 *   REVISION_PASSWORD la contraseña del dueño: ve y aprueba todas las marcas
 *   REVISION_PASSWORD_<MARCA>  opcional, la de un moderador de esa marca
 *                    (ej. REVISION_PASSWORD_TECNOAID): ve, aprueba, cancela y
 *                    pide cambios sólo en los posts de esa marca
 *
 * Los links que llegan por mail no llevan ningún secreto: /p/<nº de PR>. Lo que
 * protege las acciones es la sesión, que se abre una vez con la contraseña y
 * dura un año en ese navegador. La sesión lleva su alcance ("todo" o una
 * marca) y cada endpoint filtra por él: un moderador no ve ni toca las otras.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const REPO = "lucasjcordoba/redes";
const DUENO = REPO.split("/")[0];

export const MARCAS = {
  // `hora`: la de su calendario (marcas/<marca>/marca.mjs), para las ideas nuevas.
  raudal: { nombre: "Raudal Dev", usuario: "raudaldev", avatar: "/avatar-raudal.jpg", hora: "19:00" },
  tecnoaid: { nombre: "TecnoAid", usuario: "tecno.aid", avatar: "/avatar-tecnoaid.jpg", hora: "19:00" },
};

/** Marca que deja en el PR un pedido de cambios hecho desde la página. */
export const MARCA_CAMBIOS = "<!-- revisar:cambios -->";

/** Marca de los issues de ideas para publicaciones nuevas. */
export const MARCA_IDEA = "<!-- revisar:idea -->";

/** Hoy en Argentina, AAAA-MM-DD. */
export const hoyAR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

const COOKIE = "revision";
export const DURACION_SESION = 365 * 86400; // segundos

const iguales = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

/** La contraseña de cada alcance: "todo" es el dueño, si no, una marca. */
function passwordDe(alcance) {
  const p = alcance === "todo" ? process.env.REVISION_PASSWORD : process.env[`REVISION_PASSWORD_${alcance.toUpperCase()}`];
  return p && p.length >= 8 ? p : null;
}

/**
 * El valor de la cookie depende de la contraseña: si se cambia la de un
 * alcance, sus sesiones abiertas dejan de valer (las demás siguen). La del
 * dueño no lleva prefijo, como antes de que hubiera moderadores.
 */
function tokenSesion(alcance) {
  const base = alcance === "todo" ? `sesion:${passwordDe("todo")}` : `sesion:${alcance}:${passwordDe(alcance)}`;
  return createHmac("sha256", process.env.REVISION_CLAVE).update(base).digest("hex");
}

/** A qué alcance corresponde la contraseña ingresada: "todo", una marca o null. */
export function alcanceDe(intento) {
  if (!process.env.REVISION_CLAVE || typeof intento !== "string") return null;
  return ["todo", ...Object.keys(MARCAS)].find((a) => passwordDe(a) && iguales(intento, passwordDe(a))) ?? null;
}

export function cookieSesion(alcance) {
  const valor = alcance === "todo" ? tokenSesion("todo") : `${alcance}.${tokenSesion(alcance)}`;
  return `${COOKIE}=${valor}; Path=/; Max-Age=${DURACION_SESION}; HttpOnly; Secure; SameSite=Lax`;
}

/** La sesión del pedido: { alcance } o null si no hay una válida. */
export function sesion(req) {
  if (!process.env.REVISION_CLAVE) return null;
  const valor = (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === COOKIE)?.[1];
  if (!valor) return null;
  const [alcance, token] = valor.includes(".") ? valor.split(".") : ["todo", valor];
  if (alcance !== "todo" && !MARCAS[alcance]) return null;
  if (!passwordDe(alcance) || !iguales(token, tokenSesion(alcance))) return null;
  return { alcance };
}

/** Si la sesión puede ver y actuar sobre los posts de una marca. */
export const puedeVer = (s, marca) => s.alcance === "todo" || s.alcance === marca;

/**
 * El último pedido de cambios de un PR que todavía no se aplicó (es posterior
 * al último commit), o null. Sólo cuentan los comentarios de la app, que
 * comenta con el token del dueño del repo: el repo es público y cualquiera
 * podría escribir un comentario con la marca.
 *   → { fecha, texto, de }
 */
export function pedidoPendiente(comentarios, fechaCommit) {
  const ultimo = comentarios.filter((c) => c.body?.includes(MARCA_CAMBIOS) && c.user?.login === DUENO).at(-1);
  if (!ultimo || new Date(ultimo.created_at) <= new Date(fechaCommit)) return null;
  const texto = ultimo.body.split("\n").filter((l) => l.startsWith(">")).map((l) => l.replace(/^> ?/, "")).join("\n");
  const de = ultimo.body.match(/<!-- de: ([a-z]+) -->/)?.[1] ?? "todo";
  return { fecha: ultimo.created_at, texto, de };
}

export async function gh(metodo, ruta, cuerpo) {
  const res = await fetch(`https://api.github.com${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "redes-revisar",
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(`GitHub ${metodo} ${ruta} → ${res.status}: ${datos?.message ?? ""}`);
  return datos;
}

/**
 * Todo lo que hace falta para mostrar o actuar sobre un PR de post:
 * { pr, estado, marca, id, rama, sha, post, imagenes, cambiosPendientes }
 * (cambiosPendientes: ver pedidoPendiente)
 *
 * estado: "abierto" | "aprobado" | "descartado". Sólo se aceptan ramas
 * post/<marca>/<id>: cualquier otro PR del repo queda fuera de alcance.
 */
export async function cargar(pr) {
  const p = await gh("GET", `/repos/${REPO}/pulls/${pr}`);
  const m = p.head.ref.match(/^post\/([a-z]+)\/([\w-]+)$/);
  if (!m || !MARCAS[m[1]]) throw new Error("Este PR no es una publicación");
  const [, marca, id] = m;
  const sha = p.head.sha;

  const raw = (ruta) => `https://raw.githubusercontent.com/${REPO}/${sha}/${ruta}`;
  const res = await fetch(raw(`marcas/${marca}/posts/${id}.json`));
  if (!res.ok) throw new Error(`No encontré marcas/${marca}/posts/${id}.json en el PR`);
  const post = await res.json();

  const archivos = post.imagen
    ? [post.imagen]
    : post.diapositivas
      ? post.diapositivas.map((_, i) => `${id}-${String(i + 1).padStart(2, "0")}.jpg`)
      : [`${id}.jpg`];

  // Hay cambios pendientes si el último pedido es posterior al último commit:
  // Claude todavía no subió la versión nueva.
  let cambiosPendientes = null;
  if (p.state === "open") {
    const [comentarios, commit] = await Promise.all([
      gh("GET", `/repos/${REPO}/issues/${pr}/comments?per_page=100`),
      gh("GET", `/repos/${REPO}/commits/${sha}`),
    ]);
    cambiosPendientes = pedidoPendiente(comentarios, commit.commit.committer.date);
  }

  return {
    pr: Number(pr),
    estado: p.merged ? "aprobado" : p.state === "open" ? "abierto" : "descartado",
    marca,
    id,
    rama: p.head.ref,
    sha,
    post,
    imagenes: archivos.map((f) => raw(`marcas/${marca}/imagenes/${f}`)),
    cambiosPendientes,
  };
}
