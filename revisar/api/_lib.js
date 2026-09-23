/**
 * Lo que comparten la página y las acciones: sesión, GitHub y el post de un PR.
 *
 * Los archivos de api/ que empiezan con _ no se publican como endpoints.
 *
 * Variables de entorno (Vercel):
 *   GITHUB_TOKEN     token fine-grained con Contents, Pull requests e Issues
 *                    en lectura y escritura sobre el repo
 *   REVISION_CLAVE   clave con la que se firma la cookie de sesión
 *   REVISION_PASSWORD la contraseña para entrar, que elige el dueño
 *
 * Los links que llegan por mail no llevan ningún secreto: /p/<nº de PR>. Lo que
 * protege las acciones es la sesión, que se abre una vez con la contraseña y
 * dura un año en ese navegador.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const REPO = "lucasjcordoba/redes";

export const MARCAS = {
  // `hora`: la de su calendario (marcas/<marca>/marca.mjs), para las ideas nuevas.
  raudal: { nombre: "Raudal Dev", usuario: "raudaldev", avatar: "/avatar-raudal.jpg", hora: "19:00" },
  tecnoaid: { nombre: "TecnoAid", usuario: "tecno.aid", avatar: "/avatar-tecnoaid.jpg", hora: "18:30" },
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

/**
 * El valor de la cookie depende de la contraseña: si se cambia
 * REVISION_PASSWORD, todas las sesiones abiertas dejan de valer.
 */
function tokenSesion() {
  return createHmac("sha256", process.env.REVISION_CLAVE)
    .update(`sesion:${process.env.REVISION_PASSWORD}`)
    .digest("hex");
}

export function passwordCorrecta(intento) {
  const real = process.env.REVISION_PASSWORD;
  return Boolean(real && process.env.REVISION_CLAVE && typeof intento === "string" && iguales(intento, real));
}

export function cookieSesion() {
  return `${COOKIE}=${tokenSesion()}; Path=/; Max-Age=${DURACION_SESION}; HttpOnly; Secure; SameSite=Lax`;
}

export function sesionValida(req) {
  if (!process.env.REVISION_CLAVE || !process.env.REVISION_PASSWORD) return false;
  const valor = (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === COOKIE)?.[1];
  return Boolean(valor) && iguales(valor, tokenSesion());
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
    const ultimo = comentarios.filter((c) => c.body?.includes(MARCA_CAMBIOS)).at(-1);
    if (ultimo && new Date(ultimo.created_at) > new Date(commit.commit.committer.date)) {
      cambiosPendientes = ultimo.created_at;
    }
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
