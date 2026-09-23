# redes

Publicaciones de Instagram de dos marcas: **Raudal Dev** y **TecnoAid**. Ver
README.md para el funcionamiento general.

## Generar contenido nuevo

Es la tarea más común en este repo. El pedido suele ser "completá la semana
que viene" o viene de la rutina semanal. Pasos:

1. `npm run agenda` — los días marcados `· vacío ·` son los que hay que llenar.
   Salvo que se pida otra cosa, completar los huecos de los próximos 14 días.
2. Leer, para cada marca que tenga huecos:
   - `marcas/<marca>/marca.mjs`: qué hace, **voz**, pilares y calendario.
     La voz son reglas, no sugerencias.
   - `marcas/<marca>/posts.mjs` completo: los posts anteriores son la
     referencia de tono y la lista de temas ya tratados. No repetir un tema
     ni un ángulo que ya salió.
   - `marcas/<marca>/plantillas.mjs`: qué campos lleva cada plantilla y los
     largos máximos de cada línea.
3. Agregar los posts al final de `posts.mjs`, **siempre con `borrador: true`**.
   - `id`: número correlativo + tema en kebab-case (`07-bateria`).
   - `fecha` en un día del calendario de la marca; `hora` la del calendario.
   - No repetir el mismo pilar dos veces seguidas.
   - Para consejos, pasos o listas, preferir carrusel (`diapositivas`):
     portada `declaracion` → `lista` → `cierre` (sólo TecnoAid tiene `cierre`).
4. `npm run render -- --desde <primera fecha nueva>` y **mirar cada imagen
   nueva** (Read sobre el .jpg): texto que se sale del margen, líneas que
   chocan, títulos cortados en un lugar feo. Corregir y volver a renderizar.
5. `node scripts/verificar.mjs` tiene que dar ✓.
6. Commit en una rama `contenido/AAAA-MM-DD` y PR a `main`. En el cuerpo del
   PR, una tabla por marca: fecha, id, pilar, título de la placa y la
   primera línea del caption.

### Reglas que no se negocian

- **Nunca sacar `borrador: true`** salvo que la persona lo pida explícitamente
  para posts concretos. Aprobar es decisión humana.
- **No inventar**: precios, plazos, estadísticas, testimonios, clientes, casos
  ni trabajos. Si un dato no está en `marca.mjs`, en los posts anteriores o en
  el sitio de la marca, no se usa. Los pilares `prueba` (Raudal) y `trabajo`
  (TecnoAid) sólo se escriben con material real que alguien haya aportado.
- **No tocar el caption de un post con fecha pasada.** El publicador reconoce
  lo ya publicado comparando captions: editarlo puede hacer que salga dos veces.
- Raudal Dev: sin tuteo ni voseo, tercera persona. TecnoAid: voseo rioplatense.
  Mezclarlas es el error más fácil de cometer.
- Caption: máximo 2200 caracteres y 30 hashtags (en la práctica, 4 a 6).

## Aprobar

"Aprobá el 03 y el 05 de TecnoAid" = borrar la línea `borrador: true` de esos
posts, commitear y mergear (o pushear a `main` si no hay PR abierto). Lo que
está en `main` sin `borrador` se publica solo a su hora.

## Comandos

- `npm run agenda` — qué sale y cuándo; huecos del calendario
- `npm run render [marca] [-- --desde AAAA-MM-DD]` — dibuja las placas
- `node scripts/verificar.mjs` — colas válidas e imágenes al día
- `npm run publicar -- --dry-run` — qué publicaría ahora (necesita tokens en `.env`)
- `npm run probar-cuenta` — prueba los tokens sin publicar

## Convenciones

Código y comentarios en castellano, como el resto del repo. Las plantillas
posicionan el texto a mano (SVG no ajusta texto): si un título no entra, se
corta en otra palabra o se acorta, no se achica la fuente.
