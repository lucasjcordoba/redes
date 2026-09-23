/**
 * Verifica que los tokens funcionan, sin publicar nada.
 *
 *   npm run probar-cuenta
 *
 * Lee los tokens del entorno o de un .env en la raíz (ver .env.example).
 */
import { MARCAS } from "../lib/rutas.mjs";
import { cargarMarca } from "../lib/cola.mjs";
import { cliente } from "../lib/instagram.mjs";

let fallas = 0;
for (const id of MARCAS) {
  const m = await cargarMarca(id);
  const token = process.env[m.token];
  if (!token) {
    console.log(`○ ${m.nombre}: falta ${m.token}`);
    continue;
  }
  try {
    const ig = cliente(token);
    const { user_id, username } = await ig.cuenta();
    const [ultima] = await ig.recientes(user_id, 1);
    console.log(`✓ ${m.nombre}: conectado como @${username}`);
    if (ultima) console.log(`  última publicación: ${ultima.timestamp}  ${ultima.permalink}`);
  } catch (e) {
    fallas++;
    console.log(`✗ ${m.nombre}: ${e.message}`);
  }
}
process.exit(fallas ? 1 : 0);
