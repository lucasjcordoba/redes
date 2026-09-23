/**
 * Qué sale y cuándo, para revisar de un vistazo.
 *
 *   npm run agenda              próximos 21 días, todas las marcas
 *   npm run agenda -- --dias 7
 *
 * Marca los borradores (no salen hasta aprobarlos) y los días del calendario
 * de cada marca que no tienen nada asignado.
 */
import { parseArgs } from "node:util";
import { MARCAS } from "../lib/rutas.mjs";
import { cargarMarca, instante, imagenesDe } from "../lib/cola.mjs";

const { values } = parseArgs({ options: { dias: { type: "string", default: "21" } } });
const dias = Number(values.dias);

const NOMBRES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const hoyAR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const ahora = new Date();

for (const id of MARCAS) {
  const m = await cargarMarca(id);
  const porFecha = Object.groupBy(m.posts, (p) => p.fecha);
  console.log(`\n${m.nombre}  ·  ${m.calendario.dias.join(", ")} ${m.calendario.hora}`);

  const inicio = new Date(`${hoyAR()}T12:00:00Z`);
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicio.getTime() + i * 86400e3);
    const fecha = d.toISOString().slice(0, 10);
    const dia = NOMBRES[d.getUTCDay()];
    const posts = porFecha[fecha] ?? [];

    for (const p of posts) {
      const estado = p.borrador ? "BORRADOR " : instante(p) < ahora ? "pasado   " : "aprobado ";
      const n = imagenesDe(p).length;
      console.log(`  ${fecha} ${dia.padEnd(9)} ${p.hora}  ${estado} ${p.id}  [${p.pilar}${n > 1 ? `, carrusel ${n}` : ""}]`);
    }
    if (!posts.length && m.calendario.dias.includes(dia)) {
      console.log(`  ${fecha} ${dia.padEnd(9)}        · vacío ·`);
    }
  }
}
