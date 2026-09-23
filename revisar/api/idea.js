/**
 * GET  /idea/<marca>?fecha=AAAA-MM-DD  — formulario para proponer una publicación.
 * POST /api/idea  { marca, fecha, hora, idea }  — la registra como issue.
 *
 * El issue es el pedido para Claude: la rutina de edición lo toma, arma la
 * publicación en su propio PR y manda por mail el link de revisión. Desde ahí
 * sigue el circuito de siempre (aprobar, cancelar o pedir cambios).
 */
import { REPO, MARCAS, MARCA_IDEA, gh, hoyAR, sesionValida } from "./_lib.js";
import { aviso, entrar, esc, pagina } from "./pagina.js";

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export default async function handler(req, res) {
  if (req.method === "POST") return registrar(req, res);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const { marca, fecha: pedida, error } = req.query;
  const m = MARCAS[marca];
  if (!m) return res.status(404).send(pagina("No encontrada", aviso("Esa marca no existe.")));

  const fecha = FECHA.test(pedida ?? "") ? pedida : hoyAR();
  const volver = `/idea/${marca}?fecha=${fecha}`;
  if (!sesionValida(req)) return res.status(401).send(pagina("Entrar", entrar(volver, error)));

  return res.send(pagina(`Nueva publicación · ${m.nombre}`, `
    <div class="marca-cabecera"><img class="avatar" src="${m.avatar}" alt=""><b>${esc(m.usuario)}</b></div>
    <form class="idea" id="idea">
      <h1>¿Qué querés publicar?</h1>
      <p>Contá la idea con tus palabras: el tema, qué querés que se entienda, si va con carrusel. Claude arma la placa y el texto con la voz de ${esc(m.nombre)} y te manda el link para revisarla.</p>
      <textarea name="idea" rows="6" maxlength="2000" required placeholder="Ej.: un post sobre por qué conviene hacer backup antes de formatear, con los pasos básicos"></textarea>
      <div class="cuando">
        <input type="date" name="fecha" value="${esc(fecha)}" min="${hoyAR()}" required aria-label="Fecha">
        <input type="time" name="hora" value="${esc(m.hora)}" required aria-label="Hora">
      </div>
      <button class="primario" type="submit">Mandar idea</button>
      <p class="mensaje" id="mensaje" role="status"></p>
    </form>
    <script>
    (() => {
      const form = document.getElementById("idea");
      const mensaje = document.getElementById("mensaje");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const boton = form.querySelector("button");
        const datos = Object.fromEntries(new FormData(form));
        boton.disabled = true;
        mensaje.className = "mensaje";
        mensaje.textContent = "Un momento…";
        try {
          const res = await fetch("/api/idea", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ marca: ${JSON.stringify(marca)}, ...datos }),
          });
          const r = await res.json();
          mensaje.textContent = r.mensaje;
          mensaje.className = "mensaje " + (r.ok ? "ok" : "error");
          if (r.ok) form.querySelectorAll("textarea, input, button").forEach((el) => (el.disabled = true));
          else boton.disabled = false;
        } catch {
          mensaje.textContent = "No hubo conexión. Probá de nuevo.";
          mensaje.className = "mensaje error";
          boton.disabled = false;
        }
      });
    })();
    </script>`));
}

async function registrar(req, res) {
  if (!sesionValida(req)) return res.status(401).json({ ok: false, mensaje: "La sesión venció. Recargá la página." });
  const { marca, fecha, hora } = req.body ?? {};
  const idea = String(req.body?.idea ?? "").trim();
  const m = MARCAS[marca];

  if (!m) return res.status(400).json({ ok: false, mensaje: "Marca inválida." });
  if (!FECHA.test(fecha ?? "") || fecha < hoyAR()) return res.status(400).json({ ok: false, mensaje: "Elegí una fecha de hoy en adelante." });
  if (!HORA.test(hora ?? "")) return res.status(400).json({ ok: false, mensaje: "Elegí una hora." });
  if (!idea) return res.status(400).json({ ok: false, mensaje: "Escribí la idea." });
  if (idea.length > 2000) return res.status(400).json({ ok: false, mensaje: "La idea es demasiado larga." });

  const datos = JSON.stringify({ marca, fecha, hora });
  const citado = idea.split("\n").map((l) => `> ${l}`).join("\n");
  try {
    await gh("POST", `/repos/${REPO}/issues`, {
      title: `[Idea] ${m.nombre} · ${fecha} ${hora}`,
      body: `${MARCA_IDEA}\n**Idea para ${m.nombre}**, para el ${fecha} a las ${hora}:\n\n${citado}\n\n<!-- datos: ${datos} -->`,
    });
    return res.json({ ok: true, mensaje: "Idea enviada. Claude arma la publicación y te manda el link por mail." });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, mensaje: "No se pudo enviar. Probá de nuevo en un rato." });
  }
}
