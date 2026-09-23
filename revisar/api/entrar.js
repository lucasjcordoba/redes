/**
 * POST /api/entrar  (formulario: password, volver)
 *
 * Abre la sesión y vuelve a la publicación. Con contraseña incorrecta espera
 * un segundo antes de responder, para que probar contraseñas a mano sea lento.
 */
import { cookieSesion, passwordCorrecta } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body ?? {};
  // Sólo se vuelve a páginas propias, nunca a una URL que venga de afuera.
  const pedido = String(req.body?.volver ?? "");
  const volver = /^\/(p\/\d+|idea\/[a-z]+(\?fecha=\d{4}-\d{2}-\d{2})?)$/.test(pedido) ? pedido : "/";

  if (!passwordCorrecta(password)) {
    await new Promise((r) => setTimeout(r, 1000));
    res.setHeader("Location", `${volver}${volver.includes("?") ? "&" : "?"}error=1`);
    return res.status(303).end();
  }
  res.setHeader("Set-Cookie", cookieSesion());
  res.setHeader("Location", volver);
  return res.status(303).end();
}
