/**
 * POST /api/accion  { pr, f, accion, sha, cambios? }
 *
 *   aprobar   mergea el PR (squash) y borra la rama. Desde ese momento el post
 *             está en main y el publicador lo saca a su hora.
 *   cancelar  cierra el PR sin mergear y borra la rama.
 *   cambios   deja el pedido como comentario en el PR. Ese comentario dispara
 *             la rutina de Claude que aplica los cambios y avisa por mail.
 *
 * `sha` es el commit que se estaba viendo en la página. Al aprobar se le pasa
 * a GitHub, que rechaza el merge si el PR cambió mientras tanto: nunca se
 * aprueba una versión distinta de la que se revisó.
 */
import { REPO, MARCA_CAMBIOS, cargar, firmaValida, gh } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, mensaje: "Método no permitido" });

  const { pr, f, accion, sha, cambios } = req.body ?? {};
  if (!firmaValida(pr, f)) return res.status(403).json({ ok: false, mensaje: "Link inválido" });

  try {
    const d = await cargar(pr);
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
      await gh("POST", `/repos/${REPO}/issues/${pr}/comments`, {
        body: `${MARCA_CAMBIOS}\n**Cambios pedidos desde la página de revisión:**\n\n${citado}`,
      });
      return res.json({
        ok: true,
        estado: "cambios",
        mensaje: "Pedido enviado. Claude aplica los cambios y te manda la versión nueva por mail.",
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
