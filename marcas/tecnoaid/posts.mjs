/**
 * Cola de publicaciones de @tecno.aid.
 *
 * La voz, los pilares y el calendario están en marca.mjs; el formato de cada
 * post, en lib/cola.mjs.
 *
 * `borrador: true` renderiza la imagen para poder revisarla, pero el
 * publicador la ignora. Nada llega a Instagram sin aprobación explícita.
 *
 * Primera tanda: todo sale de tecnoaid/lib/site.ts (síntomas, pasos, tips,
 * servicios). Los posts de "trabajo" esperan fotos reales del taller.
 */

const CIERRE = `💬 Escribinos por WhatsApp: 11 2655-3546
📍 Zona Norte (Vicente López y La Lucila) · a domicilio · remoto a todo el país`;

export const posts = [
  {
    id: "01-presentacion",
    fecha: "2026-09-28",
    hora: "18:30",
    pilar: "presentacion",
    borrador: true,
    plantilla: "declaracion",
    visual: {
      etiqueta: "Hola",
      titulo: ["Soporte para", "tu vida", "digital."],
      destacar: 2,
      bajada: "Reparamos notebooks y PCs, armamos equipos a medida y te explicamos todo en castellano.",
    },
    caption: `Somos TecnoAid: servicio técnico de notebooks y PCs en Zona Norte.

Si tu compu no prende, anda lentísima, se recalienta o le volcaste el café encima, casi seguro tiene arreglo. Y si necesitás un equipo nuevo, te buscamos uno reacondicionado que se banque lo que hacés, sin venderte de más.

Cómo trabajamos:

🔍 Diagnóstico sin cargo. No cobramos por mirar.
📋 Presupuesto antes de tocar nada. Si no te sirve, no se hace y listo.
🛠️ Repuestos de calidad y trabajo con garantía.

${CIERRE}

#serviciotecnico #reparaciondenotebooks #vicentelopez #lalucila #zonanorte`,
  },

  {
    id: "02-liquido",
    fecha: "2026-09-30",
    hora: "18:30",
    pilar: "tip",
    borrador: true,
    diapositivas: [
      {
        plantilla: "declaracion",
        visual: {
          etiqueta: "Emergencia",
          titulo: ["Se volcó", "líquido en", "la notebook."],
          destacar: 2,
          bajada: "Lo que hagas en los primeros minutos importa. Deslizá →",
        },
      },
      {
        plantilla: "lista",
        visual: {
          etiqueta: "Qué hacer",
          titulo: ["Los primeros", "minutos"],
          items: [
            "Apagala de inmediato y desconectala de la corriente.",
            "Si podés, quitale la batería.",
            "No intentes prenderla hasta que esté completamente seca.",
            "Llevala a revisión cuanto antes para evitar daños mayores.",
          ],
        },
      },
      {
        plantilla: "cierre",
        visual: {
          titulo: ["¿Ya te pasó?", "Escribinos."],
          bajada: "Limpiamos y reparamos teclado y placa.",
        },
      },
    ],
    caption: `Café, agua, mate. Pasa más de lo que parece, y lo que se haga en los primeros minutos hace la diferencia.

1️⃣ Apagala ya y desconectala de la corriente. No esperes a que se apague sola.
2️⃣ Si la batería se puede sacar, sacala.
3️⃣ No la prendas "para ver si anda". Aunque parezca seca por fuera, adentro puede no estarlo.
4️⃣ Traela a revisión cuanto antes. Limpiamos y reparamos teclado y placa.

Guardá este post: ojalá no lo necesites.

${CIERRE}

#serviciotecnico #notebook #reparaciondenotebooks #vicentelopez #zonanorte`,
  },

  {
    id: "03-lenta",
    fecha: "2026-10-02",
    hora: "18:30",
    pilar: "sintoma",
    borrador: true,
    plantilla: "declaracion",
    visual: {
      etiqueta: "Síntoma",
      titulo: ["¿Tarda una", "eternidad en", "arrancar?"],
      destacar: 2,
      bajada: "Con un SSD y algo más de RAM, vuelve a volar.",
    },
    caption: `La prendés, te hacés un café, volvés, y todavía está cargando. Después se cuelga con dos pestañas abiertas.

Casi nunca es que "ya está vieja". En muchos casos el problema es el disco: los rígidos de antes son lentos, y cambiarlo por un SSD es de las mejoras que más se notan. Si además le sumás algo de RAM, el equipo vuelve a responder.

Y lo mejor: migramos todo al disco nuevo sin que pierdas nada. Tus archivos, tus programas y tu sistema quedan como estaban, pero rápidos.

Antes de tocar nada, te decimos qué le conviene a tu equipo y cuánto sale.

${CIERRE}

#ssd #notebooklenta #serviciotecnico #vicentelopez #zonanorte`,
  },

  {
    id: "04-como-trabajamos",
    fecha: "2026-10-05",
    hora: "18:30",
    pilar: "confianza",
    borrador: true,
    plantilla: "lista",
    visual: {
      etiqueta: "Sin vueltas",
      titulo: ["Cómo", "trabajamos"],
      items: [
        "Nos escribís por WhatsApp. Sin turno ni formularios.",
        "Diagnóstico sin cargo: te decimos qué tiene, en castellano.",
        "Presupuesto antes de tocar nada. Si no te sirve, no se hace.",
        "Reparación con repuestos de calidad y garantía.",
      ],
    },
    caption: `Llevar la compu al técnico no tendría que ser un salto al vacío. Así es con nosotros:

1️⃣ Escribinos. Contanos qué le pasa por WhatsApp, sin turno y sin formularios.
2️⃣ Diagnóstico sin cargo. Revisamos el equipo y te decimos qué tiene, explicado en castellano.
3️⃣ Presupuesto claro. Te pasamos el precio antes de tocar nada. Si no te sirve, no se hace y listo.
4️⃣ Reparación con garantía. Repuestos de calidad y el equipo listo para usar.

Cero improvisación, cero chamuyo.

${CIERRE}

#serviciotecnico #reparaciondepc #reparaciondenotebooks #vicentelopez #lalucila`,
  },

  {
    id: "05-recalienta",
    fecha: "2026-10-07",
    hora: "18:30",
    pilar: "sintoma",
    borrador: true,
    diapositivas: [
      {
        plantilla: "declaracion",
        visual: {
          etiqueta: "Síntoma",
          titulo: ["¿Se recalienta", "o suena como", "un avión?"],
          destacar: 2,
          bajada: "Casi siempre es polvo y pasta térmica seca. Deslizá →",
        },
      },
      {
        plantilla: "lista",
        visual: {
          etiqueta: "Señales",
          titulo: ["Le falta una", "limpieza si..."],
          items: [
            "El ventilador suena fuerte aunque no estés haciendo nada pesado.",
            "La base quema al apoyarla en las piernas.",
            "Se pone lenta cuando le exigís un poco.",
            "Se apaga sola, sin aviso.",
            "No te acordás de la última vez que la limpiaron.",
          ],
        },
      },
      {
        plantilla: "cierre",
        visual: {
          titulo: ["Cada 3 a 6", "meses."],
          bajada: "Limpieza interna y cambio de pasta térmica.",
        },
      },
    ],
    caption: `Con el uso, adentro de la notebook se junta polvo y la pasta térmica que ayuda a enfriar el procesador se seca. El equipo calienta más, el ventilador trabaja el doble y, en el peor caso, se apaga solo para protegerse.

Señales de que le falta una limpieza:

🔊 El ventilador suena fuerte aunque no estés haciendo nada pesado.
🔥 La base quema al apoyarla.
🐢 Se pone lenta cuando le exigís un poco.
⚠️ Se apaga sola, sin aviso.

Recomendamos una limpieza interna cada 3 a 6 meses. Es mantenimiento, y sale mucho más barato que lo que viene después si no se hace.

${CIERRE}

#mantenimiento #notebook #serviciotecnico #vicentelopez #zonanorte`,
  },

  {
    id: "06-reacondicionados",
    fecha: "2026-10-09",
    hora: "18:30",
    pilar: "servicio",
    borrador: true,
    plantilla: "declaracion",
    visual: {
      etiqueta: "Equipos",
      titulo: ["No hace falta", "saber de", "procesadores."],
      destacar: 2,
      bajada: "Nos contás para qué la necesitás y te buscamos la que se banca eso.",
    },
    caption: `Comprar una notebook puede ser un laberinto de siglas: i5, Ryzen, GB, SSD, Hz. No hace falta que sepas nada de eso.

Nos contás para qué la vas a usar (la facu, trabajar desde casa, editar fotos, que los chicos hagan la tarea) y te buscamos un equipo reacondicionado que se banque eso. Sin venderte de más.

✅ Notebooks y PCs usadas, probadas y limpias.
✅ Listas para usar: SSD, RAM y sistema configurado.
✅ Con garantía y soporte nuestro.
✅ Si querés, la compramos por vos.

${CIERRE}

#notebooks #reacondicionados #tecnologia #vicentelopez #zonanorte`,
  },
];
