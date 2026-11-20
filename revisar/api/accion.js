/**
 * POST /api/accion  { pr, accion, sha, cambios? }  — requiere sesión
 *
 *   aprobar   mergea el PR (squash) y borra la rama. Desde ese momento el post
 *             está en main y el publicador lo saca a su hora.
 *   cancelar  cierra el PR sin mergear y borra la rama.
 *   cambios   deja el pedido como comentario en el PR y avisa al dueño. Claude
 *             lo aplica en la próxima revisión (ver CLAUDE.md); la versión
 *             nueva dispara el aviso de siempre.
 *
 * Un moderador sólo puede actuar sobre los posts de su marca.
 *
 * `sha` es el commit que se estaba viendo en la página. Al aprobar se le pasa
 * a GitHub, que rechaza el merge si el PR cambió mientras tanto: nunca se
 * aprueba una versión distinta de la que se revisó.
 */
import { REPO, MARCAS, MARCA_CAMBIOS, cargar, gh, sesion, puedeVer } from "./_lib.js";
import { avisar } from "./_push.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, mensaje: "Método no permitido" });

  const s = sesion(req);
  if (!s) return res.status(401).json({ ok: false, mensaje: "La sesión venció. Recargá la página." });
  const { pr, accion, sha, cambios } = req.body ?? {};
  if (!/^\d+$/.test(String(pr))) return res.status(400).json({ ok: false, mensaje: "Publicación inválida" });

  try {
    const d = await cargar(pr);
    if (!puedeVer(s, d.marca)) return res.status(404).json({ ok: false, mensaje: "No encontré esta publicación." });
    if (d.estado !== "abierto") {
      return res.status(409).json({ ok: false, mensaje: `Esta publicación ya fue ${d.estado}.` });
    }

    if (accion === "aprobar") {
      if (d.cambiosPendientes) {
        return res.status(409).json({ ok: false, mensaje: "Hay cambios pedidos que todavía no se aplicaron." });
      }
      if (sha !== d.sha) {
        return res.status(409).json({ ok: false, mensaje: "La publicación cambió desde que abriste la página. Recargá para ver la última versión." });
      }
      await gh("PUT", `/repos/${REPO}/pulls/${pr}/merge`, {
        sha,
        merge_method: "squash",
        commit_title: `aprobado: ${d.marca}/${d.id} (#${pr})`,
      });
      await borrarRama(d.rama);
      return res.json({ ok: true, estado: "aprobado", mensaje: `Aprobado. Sale el ${cuando(d.post)}.` });
    }

    if (accion === "cancelar") {
      await gh("PATCH", `/repos/${REPO}/pulls/${pr}`, { state: "closed" });
      await borrarRama(d.rama);
      return res.json({ ok: true, estado: "descartado", mensaje: "Descartado. No se va a publicar." });
    }

    if (accion === "cambios") {
      const texto = String(cambios ?? "").trim();
      if (!texto) return res.status(400).json({ ok: false, mensaje: "Escribí qué querés cambiar." });
      if (texto.length > 2000) return res.status(400).json({ ok: false, mensaje: "El pedido es demasiado largo." });
      const citado = texto.split("\n").map((l) => `> ${l}`).join("\n");
      const quien = s.alcance === "todo" ? "el dueño" : `el moderador de ${MARCAS[d.marca].nombre}`;
      await gh("POST", `/repos/${REPO}/issues/${pr}/comments`, {
        body: `${MARCA_CAMBIOS}<!-- de: ${s.alcance} -->\n**Cambios pedidos por ${quien} desde la app de revisión:**\n\n${citado}`,
      });
      if (s.alcance !== "todo") {
        await avisar({
          titulo: `${MARCAS[d.marca].nombre}: el moderador pidió cambios`,
          cuerpo: texto.slice(0, 200),
          url: `/p/${pr}`,
          etiqueta: `cambios-${pr}`,
        }).catch((e) => console.error(e));
      }
      return res.json({
        ok: true,
        estado: "cambios",
        mensaje: "Pedido enviado. Cuando esté la versión nueva llega un aviso para revisarla.",
      });
    }

    return res.status(400).json({ ok: false, mensaje: "Acción desconocida" });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, mensaje: "No se pudo completar. Probá de nuevo en un rato." });
  }
}

async function borrarRama(rama) {
  // Si falla no es grave: el PR ya quedó resuelto. La rama sólo marca "pendiente".
  await gh("DELETE", `/repos/${REPO}/git/refs/heads/${rama}`).catch((e) => console.error(e));
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
export function cuando({ fecha, hora }) {
  const [a, m, d] = fecha.split("-").map(Number);
  const dia = DIAS[new Date(Date.UTC(a, m - 1, d, 12)).getUTCDay()];
  return `${dia} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")} a las ${hora}`;
}
