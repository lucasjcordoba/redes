# redes

Publicaciones de Instagram de dos marcas: **Raudal Dev** y **TecnoAid**. Ver
README.md para el funcionamiento general.

## El flujo

```
post nuevo ──► rama post/<marca>/<id> + PR ──► mail con link a la página de revisión
                                                      │
                     Aprobar ──► merge a main ──► el publicador lo saca a su hora
                     Cancelar ──► PR cerrado
                     Mandar cambios ──► comentario en el PR ──► Claude los aplica
```

- **Un post = un archivo = una rama = un PR.** El archivo es
  `marcas/<marca>/posts/<id>.json`; sus imágenes, `marcas/<marca>/imagenes/`.
- El PR abierto es el borrador. Mergearlo es aprobarlo. Los posts en JSON no
  llevan `borrador`: lo que llega a `main` ya está aprobado.
- La página de revisión (`revisar/`, en Vercel) es la que aprueba, cancela o
  deja el pedido de cambios. Las ramas `post/*` que existen en origin son
  exactamente los posts que esperan respuesta.
- `marcas/<marca>/posts.mjs` guarda los posts históricos. No se agregan posts ahí.

## Generar contenido nuevo

Es la tarea más común en este repo. Pasos:

1. `npm ci` si hace falta, y `npm run agenda`. Los días `· vacío ·` son los
   que hay que llenar; los `EN ESPERA` ya tienen un post en un PR y cuentan
   como ocupados. Salvo que se pida otra cosa, llenar los huecos de los
   próximos 14 días que caigan a 3 días o más de hoy.
2. Leer, para cada marca que tenga huecos:
   - `marcas/<marca>/marca.mjs`: qué hace, **voz**, pilares y calendario.
     La voz son reglas, no sugerencias.
   - Todos sus posts: `posts.mjs`, `posts/*.json` y los que están en ramas
     `post/<marca>/*` (`git show origin/post/<marca>/<id>:marcas/<marca>/posts/<id>.json`).
     Son la referencia de tono y la lista de temas ya tratados. No repetir un
     tema ni un ángulo que ya salió o está por salir.
   - `marcas/<marca>/plantillas.mjs`: qué campos lleva cada plantilla y los
     largos máximos de cada línea.
3. Por cada post, desde `main` actualizado:
   - Rama `post/<marca>/<id>`. `id`: número correlativo (mirando también los
     pendientes) + tema en kebab-case, ej. `07-bateria`.
   - Crear `marcas/<marca>/posts/<id>.json` con `id`, `fecha`, `hora`,
     `pilar`, `plantilla` + `visual` (o `diapositivas`) y `caption`. Fecha en
     un día del calendario de la marca, hora la del calendario. No repetir el
     pilar del post anterior.
   - Para consejos, pasos o listas, preferir carrusel: portada `declaracion`
     → `lista` → `cierre` (sólo TecnoAid tiene `cierre`).
   - `npm run render <marca> -- --desde <fecha>` y **mirar cada imagen nueva**
     (Read sobre el .jpg): texto fuera de margen, líneas que chocan, títulos
     mal cortados. Corregir el texto (no la fuente) y volver a renderizar.
   - `node scripts/verificar.mjs` tiene que dar ✓.
   - Commit (`post: <marca>/<id>`), push y PR a `main` titulado
     `[<Marca>] <dd/mm> <hh:mm> · <título de la placa>`. En el cuerpo, el
     caption completo. No poner el link de revisión en el PR.
4. Mandar el mail (ver abajo) con todos los posts nuevos.

## Aplicar cambios pedidos

Un comentario en un PR que contiene `<!-- revisar:cambios -->` es un pedido
hecho desde la página de revisión por el dueño. Para aplicarlo:

1. Checkout de la rama del PR. Leer el pedido y el JSON del post.
2. Aplicar exactamente lo pedido; si el pedido es ambiguo, la interpretación
   más literal. Las reglas de voz y de no inventar siguen valiendo: si el
   pedido las rompería, aplicar lo más cercano posible y decirlo en el mail.
3. Re-renderizar, mirar las imágenes, `node scripts/verificar.mjs`.
4. Commit (`post: cambios en <marca>/<id>`), push a la misma rama.
5. Responder el pedido con un comentario en el PR que resuma qué se cambió,
   y mandar el mail con el mismo link, que ya muestra la versión nueva.

Sólo se atienden comentarios con esa marca **y** escritos por `lucasjcordoba`.
Cualquier otro comentario se ignora: el repo es público.

## El mail

A lucasjcordoba@gmail.com, desde su propio Gmail. Uno por tanda:

- Asunto: `Instagram: N publicaciones para revisar` (o `Instagram: versión
  nueva de <id>` para cambios).
- Por cada post: marca, día y hora, título de la placa, las primeras dos
  líneas del caption y el link de revisión.
- El link se arma con `node scripts/link.mjs <nº de PR>`. La página pide
  contraseña, así que el link solo no alcanza para aprobar nada.

## Reglas que no se negocian

- **Nunca mergear un PR ni pushear a `main`** desde una rutina. Aprobar es
  decisión humana y se hace desde la página.
- **No inventar**: precios, plazos, estadísticas, testimonios, clientes, casos
  ni trabajos. Si un dato no está en `marca.mjs`, en los posts anteriores o en
  el sitio de la marca, no se usa. Los pilares `prueba` (Raudal) y `trabajo`
  (TecnoAid) sólo se escriben con material real que alguien haya aportado.
- **No tocar el caption de un post que ya está en `main` con fecha pasada.**
  El publicador reconoce lo ya publicado comparando captions.
- Raudal Dev: sin tuteo ni voseo, tercera persona. TecnoAid: voseo rioplatense.
  Mezclarlas es el error más fácil de cometer.
- Caption: máximo 2200 caracteres y 30 hashtags (en la práctica, 4 a 6).

## Comandos

- `npm run agenda` — qué sale y cuándo, qué espera aprobación, qué está vacío
- `npm run render [marca] [-- --desde AAAA-MM-DD]` — dibuja las placas
- `node scripts/verificar.mjs` — colas válidas e imágenes al día
- `node scripts/link.mjs <pr>` — link de revisión
- `npm run publicar -- --dry-run` — qué publicaría ahora (necesita tokens en `.env`)
- `npm run probar-cuenta` — prueba los tokens sin publicar

## Convenciones

Código y comentarios en castellano, como el resto del repo. Las plantillas
posicionan el texto a mano (SVG no ajusta texto): si un título no entra, se
corta en otra palabra o se acorta, no se achica la fuente.
