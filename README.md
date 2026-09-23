# redes

Publicación automática en Instagram para **Raudal Dev** y **TecnoAid**.

```
Claude escribe borradores ──► PR ──► revisás y aprobás ──► main ──► GitHub Actions publica a su hora
```

- Cada marca tiene su carpeta en `marcas/` con su voz, sus plantillas y su cola
  de posts (`posts.mjs`).
- Las placas se dibujan en SVG con las tipografías de cada marca, que están
  guardadas en `fuentes/`, y se commitean como JPG. Lo que revisás en el PR es
  exactamente lo que sale.
- Un workflow corre una vez por hora y publica lo aprobado que ya tiene la hora
  cumplida. Funciona aunque la Mac esté apagada.
- **Nada con `borrador: true` se publica.**

## Uso diario

```bash
npm run agenda                  # qué sale y cuándo, y qué días están vacíos
npm run render                  # redibuja las placas después de editar posts.mjs
node scripts/verificar.mjs      # chequea colas e imágenes antes de commitear
```

Para aprobar un post, borrá su línea `borrador: true` y mergealo a `main`. O
pedíselo a Claude: "aprobá el 03 y el 05 de TecnoAid".

Para publicar algo ya mismo sin esperar la hora, cambiale `fecha` y `hora` a
algo ya pasado. Después, en GitHub: Actions → Publicar → Run workflow,
destildando "Sólo mostrar qué publicaría".

## Cómo decide qué publicar

Ver el comentario de `scripts/publicar.mjs`. En resumen:

- Toma los posts aprobados cuya hora pasó en las últimas 48 horas.
- Descarta los que ya están en la cuenta, comparando el caption.
- Publica el más viejo: uno por marca en cada corrida.

No guarda estado propio: la cuenta de Instagram es el registro. Por eso puede
convivir con Make, que también publica la cola de Raudal, sin duplicar posts.
Eso vale mientras los captions sean idénticos. Una vez que esto esté andando,
Make se puede apagar.

## Conectar las cuentas

Esto se hace una sola vez por cuenta. Se usa la **API de Instagram con login
de Instagram**, que **no necesita página de Facebook**.

> Meta cambia seguido los nombres de los menús. Si algo no coincide, buscá la
> opción equivalente: los conceptos son siempre los mismos.

1. **Cuenta profesional.** En la app de Instagram: Configuración → Tipo de
   cuenta y herramientas → Cambiar a cuenta profesional (Empresa o Creador).
   Hacelo en @tecno.aid y en la cuenta de Raudal.
2. **App de Meta.** En [developers.facebook.com](https://developers.facebook.com/apps):
   Crear app → caso de uso *"Administrar mensajes y contenido en Instagram"*.
   Con una sola app alcanza para las dos cuentas.
3. **Dar rol a las cuentas.** En la app: Roles de la app → Roles → Agregar
   personas → *Evaluador de Instagram*, con el usuario de cada cuenta. Después,
   desde cada cuenta de Instagram, aceptá la invitación: Configuración → Apps y
   sitios web → Invitaciones de evaluador.

   Mientras la app esté en modo desarrollo, sólo puede publicar en cuentas con
   rol. Es justo lo que hace falta, y así no pasás por la revisión de Meta.
4. **Generar los tokens.** En la app: Instagram → Configuración de la API con
   inicio de sesión de Instagram → Generar tokens de acceso → Agregar cuenta.
   Iniciá sesión con cada cuenta y aceptá los permisos
   `instagram_business_basic` e `instagram_business_content_publish`. Copiá el
   token que te da: es de larga duración (60 días) y el workflow lo renueva
   solo cada semana.
5. **Probarlos en la Mac.** `cp .env.example .env`, pegá los tokens y corré
   `npm run probar-cuenta`. Tiene que decir "conectado como @…" para cada
   cuenta.
6. **Cargarlos en GitHub.** En el repo: Settings → Secrets and variables →
   Actions, creá `IG_TOKEN_RAUDAL` e `IG_TOKEN_TECNOAID`. O desde la terminal
   (te pide el valor):
   ```bash
   gh secret set IG_TOKEN_RAUDAL
   ```
7. **Renovación automática.** Creá un token de GitHub *fine-grained* en
   Settings → Developer settings → Personal access tokens, sólo para este
   repo y con permiso *Secrets: Read and write*. Guardalo como el secret
   `GH_PAT_SECRETS`. Si falta, los tokens de Instagram vencen a los 60 días.

## Detalles que conviene saber

- **El repo tiene que ser público.** Instagram descarga las imágenes desde una
  URL pública (`raw.githubusercontent.com`). Los tokens están en secrets y no
  se ven; lo que sí queda visible es el contenido, incluidos los borradores.
  De paso, en repos públicos las Actions son gratis e ilimitadas.
- **Cron y actividad:** GitHub desactiva los workflows programados de un repo
  público después de 60 días sin commits. La rutina semanal de contenido lo
  mantiene activo. Si la pausás mucho tiempo, revisá la pestaña Actions.
- **Horarios:** siempre de Argentina. El workflow corre al minuto 7 de cada
  hora, así que un post de las 19:00 sale alrededor de las 19:07 (GitHub a
  veces se atrasa algunos minutos más).
- **Tipografías:** Geist y JetBrains Mono (Raudal), Archivo, Inter y Roboto
  Mono (TecnoAid), todas con licencia OFL de Google Fonts.
