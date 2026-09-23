/**
 * Extiende el token de una marca otros 60 días e imprime el token nuevo.
 *
 *   node scripts/refrescar-token.mjs raudal
 *
 * Por stdout sale sólo el token, para poder encadenarlo con
 * `gh secret set`; todo lo demás va por stderr. Lo corre el workflow
 * refrescar-tokens.yml una vez por semana.
 */
import { cargarMarca } from "../lib/cola.mjs";
import { refrescarToken } from "../lib/instagram.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Uso: node scripts/refrescar-token.mjs <marca>");
  process.exit(2);
}
const m = await cargarMarca(id);
const actual = process.env[m.token];
if (!actual) {
  console.error(`Falta ${m.token}`);
  process.exit(1);
}
const { token, venceEnDias } = await refrescarToken(actual);
console.error(`✓ ${m.nombre}: token refrescado, vence en ${venceEnDias} días`);
process.stdout.write(token);
