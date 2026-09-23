/**
 * Link a la página de revisión de un PR de publicación.
 *
 *   node scripts/link.mjs 12
 *
 * El link no lleva secretos: la página pide contraseña. Aun así no se pone en
 * GitHub, para no invitar a nadie a probar.
 */
export const REVISION_URL = "https://redes-revisar.vercel.app";

const pr = process.argv[2];
if (!/^\d+$/.test(pr ?? "")) {
  console.error("Uso: node scripts/link.mjs <número de PR>");
  process.exit(2);
}
console.log(`${REVISION_URL}/p/${pr}`);
