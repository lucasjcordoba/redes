/**
 * Cola de publicaciones del Instagram de Raudal Dev.
 *
 * La voz, los pilares y el calendario están en marca.mjs; el formato de cada
 * post, en lib/cola.mjs. Los que tienen fecha pasada quedan como referencia
 * de tono y de temas ya tratados para lo que se escriba después.
 *
 * Cerrado: desde el 24/09/2026 cada post de Raudal vive en
 * posts/<id>.json y llega en su propio PR (ver CLAUDE.md).
 *
 * Migrado de raudal-dev/content/instagram.mjs el 2026-09-23. Los captions se
 * copiaron sin tocar una coma: mientras Make siga activo, el publicador
 * reconoce como ya publicado todo post cuyo caption aparezca en la cuenta.
 */

export const posts = [
  {
    id: "01-presentacion",
    fecha: "2026-08-22",
    hora: "15:00",
    pilar: "presentacion",
    plantilla: "declaracion",
    visual: {
      eyebrow: "RAUDAL DEV",
      titulo: ["Soluciones", "digitales para", "personas", "y empresas"],
      destacar: 3,
      bajada: "Sitios web, sistemas de gestión y aplicaciones a medida.",
    },
    caption: `Raudal Dev desarrolla sitios web, sistemas de gestión y aplicaciones a medida.

El trabajo empieza siempre por un problema concreto: una presencia online que todavía no existe, una operación que se maneja entre planillas dispersas, un proceso manual que consume horas todas las semanas.

Cómo trabajamos:

📄 Presupuesto cerrado. Qué incluye el trabajo y cuánto cuesta, por escrito antes de comenzar. No cambia durante el desarrollo.
💬 Comunicación sin tecnicismos en cada etapa del proyecto.
🤝 Trato directo con el equipo que desarrolla, sin intermediarios comerciales.

La primera reunión y el presupuesto no tienen costo.

raudaldev.com

#desarrolloweb #software #sistemasdegestion #pymes #vicentelopez`,
  },

  {
    id: "02-privado",
    fecha: "2026-08-25",
    hora: "19:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ EL COSTO DE NO TENER WEB",
      titulo: ["El precio", "por privado", "cuesta ventas"],
      destacar: 2,
      bajada: "Quienes no preguntan, tampoco compran.",
    },
    caption: `"Mandame un privado y te paso el precio."

Es una práctica extendida y tiene su lógica: quien se toma el trabajo de preguntar suele terminar comprando.

El problema está en los demás. Las personas que entran al perfil, no encuentran el precio y no tienen intención de escribir para averiguarlo. Siguen de largo hacia la cuenta siguiente.

Esas visitas no dejan rastro. No comentan, no consultan, no aparecen en ninguna estadística. Son ventas que se pierden sin que nadie se entere.

Una página con productos, precios visibles y un canal de contacto directo trabaja de forma permanente. Quien quiere consultar, consulta igual. Quien no, compra igual.

raudaldev.com

#emprendedores #ventas #paginasweb #negocios #vicentelopez`,
  },

  {
    id: "03-google",
    fecha: "2026-08-27",
    hora: "19:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ LA VENTA INVISIBLE",
      titulo: ["Buscaron", "el negocio", "y no apareció"],
      destacar: 1,
      bajada: "La única venta que no se puede medir.",
    },
    caption: `Alguien escuchó hablar del negocio. Le interesó. Buscó el nombre en Google.

No encontró nada. O encontró una ficha de un directorio de hace seis años, con un teléfono que ya no existe.

Esa persona no comentó, no escribió, no dejó ninguna señal. Siguió con otra cosa. Es la única venta que no se puede medir, porque nunca llegó a existir.

Instagram no resuelve esto: las publicaciones no se indexan en los buscadores y un perfil rara vez aparece cuando alguien busca "panadería en Munro" o "veterinaria en Olivos".

Un sitio propio es lo que hace que quien te busque, te encuentre. Y funciona a las tres de la mañana, cuando no hay nadie contestando mensajes.

raudaldev.com

#negocios #google #seo #comercios #vicentelopez`,
  },

  {
    id: "04-proceso",
    fecha: "2026-08-29",
    hora: "12:00",
    pilar: "proceso",
    plantilla: "pasos",
    visual: {
      eyebrow: "/ CÓMO TRABAJAMOS",
      titulo: "Cuatro etapas",
      bajada: "Sin sorpresas en el medio ni al final.",
      pasos: [
        { titulo: "Relevamiento", texto: "Entender el problema. Sin costo." },
        { titulo: "Propuesta", texto: "Qué incluye y cuánto cuesta, por escrito." },
        { titulo: "Desarrollo", texto: "Entregas parciales, con revisión en cada etapa." },
        { titulo: "Lanzamiento", texto: "Puesta en producción y acompañamiento." },
      ],
    },
    caption: `El miedo más común antes de contratar desarrollo no es el precio. Es no saber en qué va a terminar.

Por eso el proceso es siempre el mismo y está a la vista:

01 · RELEVAMIENTO
Una reunión para entender el problema, el contexto y los objetivos. Sin costo y sin compromiso.

02 · PROPUESTA
Todo lo que incluye el trabajo, los plazos y el precio final, por escrito. Antes de escribir la primera línea de código.

03 · DESARROLLO
Entregas parciales durante todo el proceso. Nada de desaparecer dos meses y reaparecer con algo que no era.

04 · LANZAMIENTO
Puesta en producción y acompañamiento posterior. El proyecto no termina el día de la entrega.

raudaldev.com

#desarrolloweb #procesos #pymes #vicentelopez`,
  },

  {
    id: "05-mejoras",
    fecha: "2026-09-01",
    hora: "19:00",
    pilar: "servicio",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ NO SIEMPRE ES DESDE CERO",
      titulo: ["Arreglar", "lo que ya", "existe"],
      destacar: 1,
      bajada: "Mejoras sobre sitios y sistemas en funcionamiento.",
    },
    caption: `No todo proyecto empieza de cero. Muchas veces ya existe algo y el problema es otro:

🐢 Carga lento y la gente se va antes de que abra.
🎨 El diseño quedó viejo y no representa lo que el negocio es hoy.
🧩 Falta una función concreta: turnos, catálogo, cobros online.
📱 Se ve bien en la computadora y roto en el celular.

Ninguno de esos casos requiere tirar todo abajo y volver a empezar. Se interviene sobre lo que ya está funcionando, que además es más rápido y más barato.

Si hay un sitio o un sistema andando y algo no termina de cerrar, se puede revisar y decir qué conviene hacer.

raudaldev.com

#desarrolloweb #rediseño #mantenimiento #pymes #vicentelopez`,
  },

  {
    id: "06-plataforma",
    fecha: "2026-09-03",
    hora: "19:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ LO QUE NO SE CONTROLA",
      titulo: ["Si mañana", "cierran", "la cuenta"],
      destacar: 1,
      bajada: "Años de trabajo en una plataforma prestada.",
    },
    caption: `Los contactos, el catálogo, las conversaciones con clientes, las fotos de cada producto. Años de trabajo dentro de una aplicación que pertenece a otra empresa.

Una cuenta bloqueada por error, un cambio de reglas, un algoritmo que decide mostrar menos: son cosas que pasan y sobre las que no hay ningún control ni a quién reclamar.

No se trata de abandonar las redes. Funcionan, y para muchos negocios son el mejor canal que tienen.

Se trata de que exista algo propio debajo. Un sitio con dominio propio es la única parte de la presencia online que no se puede perder de un día para el otro.

raudaldev.com

#negocios #emprendedores #paginasweb #vicentelopez`,
  },

  {
    id: "07-plazos",
    fecha: "2026-09-05",
    hora: "12:00",
    pilar: "claridad",
    plantilla: "pasos",
    visual: {
      eyebrow: "/ CUÁNTO TARDA",
      titulo: "Plazos reales",
      bajada: "Desde la aprobación del presupuesto.",
      pasos: [
        { titulo: "Landing de una página", texto: "1 a 2 semanas." },
        { titulo: "Sitio institucional", texto: "3 a 4 semanas." },
        { titulo: "Tienda online", texto: "4 a 6 semanas." },
        { titulo: "Sistema de gestión", texto: "Desde 8 semanas." },
      ],
    },
    caption: `"¿Y cuánto tarda?" es la segunda pregunta que hace todo el mundo, y casi nadie la contesta antes de la reunión.

Los plazos reales, contados desde que se aprueba el presupuesto:

⏱️ LANDING DE UNA PÁGINA — 1 a 2 semanas
Una sola página con la información del negocio y un canal de contacto.

⏱️ SITIO INSTITUCIONAL — 3 a 4 semanas
Varias secciones, catálogo o servicios, formulario y optimización para buscadores.

⏱️ TIENDA ONLINE — 4 a 6 semanas
Lo anterior más carrito, medios de pago y gestión de productos.

⏱️ SISTEMA DE GESTIÓN — desde 8 semanas
Depende de cuántos procesos abarque. Se define en el relevamiento.

El plazo se fija por escrito junto con el precio, antes de empezar.

raudaldev.com

#vicentelopez #zonanorte #paginasweb #emprendedores #pymes`,
  },

  {
    id: "08-caro",
    fecha: "2026-09-08",
    hora: "19:00",
    pilar: "claridad",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ QUÉ ENCARECE UN SITIO",
      titulo: ["No es el", "diseño", "lo que sale caro"],
      destacar: 1,
      bajada: "Es todo lo que se decide sobre la marcha.",
    },
    caption: `Dos sitios que se ven parecidos pueden costar muy distinto. Lo que mueve el precio casi nunca es el diseño.

Lo que encarece de verdad:

🔁 Cambiar de idea a mitad del desarrollo. Rehacer algo terminado cuesta más que hacerlo bien la primera vez.
🧩 Funciones que parecen chicas y no lo son: reservas con disponibilidad real, pagos, cuentas de usuario.
📝 Contenido que no está listo. Sin textos ni fotos, el proyecto queda frenado y ese tiempo se paga.
🔌 Integrarse con sistemas que ya existen y no fueron pensados para conectarse.

Lo que no lo encarece: que quede lindo, que ande rápido, que se vea bien en el celular. Eso es el piso, no un extra.

Por eso el relevamiento es sin costo: ahí se detecta cuál de estas cosas aplica, antes de poner un número.

raudaldev.com

#vicentelopez #zonanorte #paginasweb #presupuesto #pymes`,
  },

  {
    id: "09-menu-pdf",
    fecha: "2026-09-10",
    hora: "19:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ GASTRONOMÍA",
      titulo: ["El menú", "en PDF", "no se lee"],
      destacar: 1,
      bajada: "Nadie hace zoom para elegir qué comer.",
    },
    caption: `La escena se repite: alguien busca el restaurante, encuentra el menú y es un PDF escaneado.

En el celular abre una imagen diminuta. Hay que hacer zoom, mover con dos dedos, perder la fila que estaba leyendo. Después de veinte segundos, cierra y elige otro lugar.

Y hay un problema mayor: 🔍 el texto de un PDF escaneado no lo lee Google. Alguien que busca "milanesas en Olivos" nunca va a llegar a ese menú, aunque esté ahí.

Un menú web se lee de una, se actualiza cuando cambia un precio sin volver a diseñar nada, y aparece en las búsquedas por plato.

📌 Un dato que sorprende: los cambios de precio son el motivo por el que la mayoría de las cartas en PDF están desactualizadas. Rehacer el diseño cada vez cansa. Editar un número, no.

raudaldev.com

#gastronomia #restaurantes #vicentelopez #olivos #menu`,
  },

  {
    id: "10-turnos",
    fecha: "2026-09-12",
    hora: "12:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ SALUD",
      titulo: ["Los turnos", "por WhatsApp", "cuestan horas"],
      destacar: 1,
      bajada: "Y se pierden los que llegan fuera de horario.",
    },
    caption: `Un consultorio que coordina turnos por mensaje pierde tiempo dos veces.

La primera, en la ida y vuelta: 📱 "¿tenés el martes?", "no, ese día está completo", "¿y el jueves?". Multiplicado por cada paciente, son horas por semana que alguien tiene que estar mirando el teléfono.

La segunda es peor y no se ve: quien escribe un domingo a la noche no recibe respuesta hasta el lunes. Una parte de esos ya sacó turno en otro lado.

Un sistema de turnos muestra la disponibilidad real, deja reservar a cualquier hora y manda el recordatorio solo. El ausentismo baja, que para un consultorio es plata directa.

⚕️ No reemplaza al WhatsApp: convive. Quien prefiere escribir, escribe igual. Quien quiere resolverlo a las once de la noche, también puede.

raudaldev.com

#salud #consultorio #turnos #vicentelopez #olivos`,
  },

  {
    id: "11-destacadas",
    fecha: "2026-09-15",
    hora: "19:00",
    pilar: "dolor",
    plantilla: "declaracion",
    visual: {
      eyebrow: "/ EL CATÁLOGO ESCONDIDO",
      titulo: ["Tres historias", "destacadas", "no son un catálogo"],
      destacar: 2,
      bajada: "Los productos quedan enterrados en el feed.",
    },
    caption: `El catálogo en historias destacadas parece una solución y funciona un tiempo. Después se llena.

Lo que pasa cuando hay más de treinta productos:

🔎 No se puede buscar. Quien quiere una cosa puntual tiene que mirar todo.
🏷️ No se puede filtrar por precio, talle, categoría ni nada.
📅 Los precios quedan viejos en historias de hace ocho meses.
🚫 Google no lo indexa: para un buscador, ese catálogo no existe.

Ninguna de esas cosas se arregla subiendo más historias. Son límites del formato, no del esfuerzo.

Una tienda con buscador y filtros hace ese trabajo sola, las veinticuatro horas, y sigue apareciendo cuando alguien busca el producto por nombre.

raudaldev.com

#comercios #tiendaonline #catalogo #vicentelopez #zonanorte`,
  },

  {
    id: "12-preguntas",
    fecha: "2026-09-17",
    hora: "19:00",
    pilar: "claridad",
    plantilla: "pasos",
    visual: {
      eyebrow: "/ ANTES DE CONTRATAR",
      titulo: "Cuatro preguntas",
      bajada: "Sirven con cualquier desarrollador, no sólo con nosotros.",
      pasos: [
        { titulo: "¿De quién es el dominio?", texto: "Tiene que quedar a nombre del negocio." },
        { titulo: "¿Qué pasa si me voy?", texto: "El sitio debe poder migrarse." },
        { titulo: "¿Puedo editarlo yo?", texto: "Cambiar un precio no debería costar." },
        { titulo: "¿Qué incluye el soporte?", texto: "Y qué se cobra aparte." },
      ],
    },
    caption: `Cuatro preguntas para hacerle a cualquiera que ofrezca desarrollarte un sitio. Sirven con nosotros y con cualquier otro.

1️⃣ ¿A nombre de quién queda el dominio?
Tiene que quedar a nombre del negocio. Si queda a nombre del que lo hizo, el día que se corte la relación se pierde la dirección y todo lo que se construyó con ella.

2️⃣ ¿Qué pasa si dejo de trabajar con vos?
El sitio tiene que poder mudarse a otro proveedor. Si está atado a una plataforma cerrada, no hay salida sin rehacerlo.

3️⃣ ¿Puedo cambiar textos y precios sin depender de nadie?
Actualizar un precio no debería requerir un presupuesto.

4️⃣ ¿Qué incluye el soporte y qué se cobra aparte?
Por escrito. Es la fuente número uno de discusiones después de la entrega.

Si alguna respuesta es confusa, conviene insistir hasta que deje de serlo.

raudaldev.com

#vicentelopez #zonanorte #emprendedores #pymes #paginasweb`,
  },
];
