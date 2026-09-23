/**
 * Link firmado a la página de revisión de un PR de publicación.
 *
 *   REVISION_CLAVE=... node scripts/link.mjs 12
 *
 * La firma es la misma cuenta que revisar/api/_lib.js: un HMAC del número de
 * PR, así cada link sirve para una sola publicación.
 */
import { createHmac } from "node:crypto";

export const REVISION_URL = "https://redes-revisar.vercel.app";

const pr = process.argv[2];
const clave = process.env.REVISION_CLAVE;
if (!/^\d+$/.test(pr ?? "") || !clave) {
  console.error("Uso: REVISION_CLAVE=... node scripts/link.mjs <número de PR>");
  process.exit(2);
}
const firma = createHmac("sha256", clave).update(`pr:${pr}`).digest("hex").slice(0, 32);
console.log(`${REVISION_URL}/p/${pr}?f=${firma}`);
