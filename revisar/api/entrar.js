/**
 * POST /api/entrar  (formulario: password, pr)
 *
 * Abre la sesión y vuelve a la publicación. Con contraseña incorrecta espera
 * un segundo antes de responder, para que probar contraseñas a mano sea lento.
 */
import { cookieSesion, passwordCorrecta } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password, pr } = req.body ?? {};
  const volver = /^\d+$/.test(String(pr)) ? `/p/${pr}` : "/";

  if (!passwordCorrecta(password)) {
    await new Promise((r) => setTimeout(r, 1000));
    res.setHeader("Location", `${volver}?error=1`);
    return res.status(303).end();
  }
  res.setHeader("Set-Cookie", cookieSesion());
  res.setHeader("Location", volver);
  return res.status(303).end();
}
