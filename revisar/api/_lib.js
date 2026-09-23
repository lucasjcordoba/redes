/**
 * Lo que comparten la página y las acciones: firmas, GitHub y el post de un PR.
 *
 * Los archivos de api/ que empiezan con _ no se publican como endpoints.
 *
 * Variables de entorno (Vercel):
 *   GITHUB_TOKEN     token fine-grained con Contents, Pull requests e Issues
 *                    en lectura y escritura sobre el repo
 *   REVISION_CLAVE   clave con la que se firman los links (la misma que usa
 *                    scripts/link.mjs para armarlos)
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const REPO = "lucasjcordoba/redes";

export const MARCAS = {
  raudal: { nombre: "Raudal Dev", usuario: "raudaldev", avatar: "/avatar-raudal.jpg" },
  tecnoaid: { nombre: "TecnoAid", usuario: "tecno.aid", avatar: "/avatar-tecnoaid.jpg" },
};

/** Marca que deja en el PR un pedido de cambios hecho desde la página. */
export const MARCA_CAMBIOS = "<!-- revisar:cambios -->";

/**
 * Cada link vale para un solo PR: filtrar uno no permite aprobar otros. Es la
 * misma cuenta que scripts/link.mjs.
 */
export function firmar(pr) {
  return createHmac("sha256", process.env.REVISION_CLAVE).update(`pr:${pr}`).digest("hex").slice(0, 32);
}

export function firmaValida(pr, firma) {
  if (!process.env.REVISION_CLAVE || typeof firma !== "string" || !/^\d+$/.test(String(pr))) return false;
  const a = Buffer.from(firmar(pr));
  const b = Buffer.from(firma);
  return a.length === b.length && timingSafeEqual(a, b);
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
