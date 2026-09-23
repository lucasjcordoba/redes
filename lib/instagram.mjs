/**
 * Cliente mínimo de la API de Instagram ("Instagram API with Instagram Login").
 *
 * Se usa la variante con login de Instagram y no la de Facebook porque no
 * necesita página de Facebook vinculada: alcanza con que la cuenta sea
 * profesional (Business o Creator). Todo va contra graph.instagram.com.
 *
 * Publicar es siempre en dos pasos: se crea un "contenedor" con la URL de la
 * imagen y el caption, Instagram descarga la imagen, y recién cuando el
 * contenedor está FINISHED se publica. La imagen tiene que estar en una URL
 * pública: Instagram la baja desde sus servidores, no se sube desde acá.
 */

const VERSION = process.env.IG_API_VERSION ?? "v23.0";
const BASE = `https://graph.instagram.com/${VERSION}`;

export class ErrorInstagram extends Error {}

export function cliente(token) {
  if (!token) throw new ErrorInstagram("Falta el token de acceso");

  async function llamar(metodo, ruta, params = {}) {
    const url = new URL(`${BASE}${ruta}`);
    const cuerpo = new URLSearchParams({ ...params, access_token: token });
    let res;
    if (metodo === "GET") {
      url.search = cuerpo.toString();
      res = await fetch(url);
    } else {
      res = await fetch(url, { method: metodo, body: cuerpo });
    }
    const datos = await res.json().catch(() => ({}));
    if (!res.ok || datos.error) {
      const e = datos.error ?? {};
      // Nunca incluir la URL completa en el error: lleva el token.
      throw new ErrorInstagram(
        `${metodo} ${ruta} → ${res.status} ${e.type ?? ""} ${e.code ?? ""}: ${e.error_user_msg ?? e.message ?? "sin detalle"}`,
      );
    }
    return datos;
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Espera a que Instagram termine de procesar un contenedor. */
  async function listo(contenedor) {
    for (let intento = 0; intento < 20; intento++) {
      const { status_code } = await llamar("GET", `/${contenedor}`, { fields: "status_code" });
      if (status_code === "FINISHED") return;
      if (status_code === "ERROR" || status_code === "EXPIRED") {
        throw new ErrorInstagram(`El contenedor ${contenedor} quedó en ${status_code}`);
      }
      await esperar(3000);
    }
    throw new ErrorInstagram(`El contenedor ${contenedor} no terminó de procesarse a tiempo`);
  }

  return {
    /** { user_id, username } de la cuenta dueña del token. */
    cuenta: () => llamar("GET", "/me", { fields: "user_id,username" }),

    /** Las últimas publicaciones, para no repetir una que ya salió. */
    recientes: (userId, limite = 30) =>
      llamar("GET", `/${userId}/media`, { fields: "id,caption,timestamp,permalink", limit: limite })
        .then((r) => r.data ?? []),

    /** Publica una imagen o un carrusel. Devuelve { id, permalink }. */
    async publicar(userId, { urls, caption }) {
      let contenedor;
      if (urls.length === 1) {
        ({ id: contenedor } = await llamar("POST", `/${userId}/media`, { image_url: urls[0], caption }));
      } else {
        const hijos = [];
        for (const image_url of urls) {
          const { id } = await llamar("POST", `/${userId}/media`, { image_url, is_carousel_item: "true" });
          hijos.push(id);
        }
        for (const h of hijos) await listo(h);
        ({ id: contenedor } = await llamar("POST", `/${userId}/media`, {
          media_type: "CAROUSEL",
          children: hijos.join(","),
          caption,
        }));
      }
      await listo(contenedor);
      const { id } = await llamar("POST", `/${userId}/media_publish`, { creation_id: contenedor });
      const { permalink } = await llamar("GET", `/${id}`, { fields: "permalink" });
      return { id, permalink };
    },
  };
}

/**
 * Extiende un token de larga duración otros 60 días.
 *
 * Los tokens vencen a los 60 días si no se refrescan, y sólo se pueden
 * refrescar si tienen más de 24 horas. Refrescarlos una vez por semana deja
 * margen de sobra.
 */
export async function refrescarToken(token) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: token });
  const res = await fetch(url);
  const datos = await res.json().catch(() => ({}));
  if (!res.ok || !datos.access_token) {
    throw new ErrorInstagram(`No se pudo refrescar el token: ${datos.error?.message ?? res.status}`);
  }
  return { token: datos.access_token, venceEnDias: Math.round(datos.expires_in / 86400) };
}
