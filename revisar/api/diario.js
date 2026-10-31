/**
 * GET /api/diario — el aviso de las 9:00 con lo del día: al dueño, de todas
 * las marcas; a cada moderador, sólo de la suya.
 *
 * Lo llama el cron de Vercel (vercel.json), que manda
 * `Authorization: Bearer <CRON_SECRET>`.
 */
import { MARCAS, hoyAR } from "./_lib.js";
import { estado } from "./_datos.js";
import { avisar } from "./_push.js";

const ETIQUETA = { pendiente: "para revisar", aprobada: "aprobada", publicada: "publicada" };

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }
  const hoy = hoyAR();
  const { posts } = await estado({ fresco: true });
  const deHoy = posts.filter((p) => p.fecha === hoy && p.estado !== "cancelada");
  const linea = (k) => {
    const m = MARCAS[k];
    const suyos = deHoy.filter((p) => p.marca === k);
    if (!suyos.length) return `${m.nombre}: nada programado`;
    return suyos.map((p) => `${m.nombre}: ${p.titulo} (${ETIQUETA[p.estado]}, ${p.hora})`).join(" · ");
  };
  const resumen = (marcas) => {
    const pendientes = deHoy.filter((p) => marcas.includes(p.marca) && p.estado === "pendiente").length;
    return {
      titulo: pendientes ? `Instagram hoy: ${pendientes} para revisar` : "Instagram hoy",
      cuerpo: marcas.map(linea).join("\n"),
      url: "/",
      etiqueta: `diario-${hoy}`,
    };
  };

  const r = await avisar(resumen(Object.keys(MARCAS)));
  for (const k of Object.keys(MARCAS)) {
    const m = await avisar(resumen([k]), { marca: k, soloModeradores: true });
    r.enviados += m.enviados;
    r.dispositivos += m.dispositivos;
  }
  return res.json({ ok: true, ...r });
}
