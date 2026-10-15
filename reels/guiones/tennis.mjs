/**
 * BsAs Tennis Tour, el sistema de torneos, en escritorio y celular (~2 min).
 *
 * Se graba en producción con la cuenta de organizador del dueño (sesión
 * iniciada a mano: node reels/sesion.mjs tennis https://bsastennistour.vercel.app/login),
 * mostrando sólo el torneo DEMO, cuyos equipos y jugadores son ficticios.
 * limpiezaTennis oculta en cada cuadro los torneos reales y los inscriptos
 * que no son del demo; limpiezaDev, los mails.
 */
import { limpiezaDev, limpiezaTennis } from "../limpieza-dev.mjs";

const B = "https://bsastennistour.vercel.app";
const DEMO = `${B}/torneos/90f20a28-dcc5-47d8-b513-01458a37f5eb`;

export const guion = {
  titulo: "BsAs Tennis Tour",
  dominio: "bsastennistour.vercel.app",
  etiqueta: "/ BSAS TENNIS TOUR",
  musica: "deporte",
  diseno: "tennis",
  sesion: "tennis",
  iniciales: [limpiezaDev, limpiezaTennis],
  url: `${B}/dashboard`,
  escenas: [
    {
      titulo: "Mis torneos",
      voz: "Para Buenos Aires Tennis Tour, el circuito de torneos amateur que organiza Louys Tennis Academy, desarrollamos el sistema que maneja cada torneo. El organizador ve sus torneos, con el estado de cada uno, y sigue las inscripciones.",
    },
    {
      titulo: "Nuevo torneo",
      url: `${B}/torneos/nuevo`,
      voz: "Crear un torneo lleva un minuto: el nombre, el formato, la sede, la fecha, el cupo y el flyer. Se guarda como borrador y se publica cuando está listo.",
    },
    {
      titulo: "Categorías",
      url: `${B}/torneos/nuevo`,
      sel: 'h2:has-text("Categorías")',
      voz: "Cada categoría tiene su modalidad y su precio, por jugador o por equipo.",
    },
    {
      titulo: "El torneo",
      url: DEMO,
      voz: "Cada torneo tiene su página, con el reglamento —al mejor de tres sets, punto de oro y súper tie-break—, los puntos que reparte para el ranking y el precio de la inscripción.",
    },
    {
      titulo: "Inscriptos",
      url: DEMO,
      sel: "text=Inscriptos",
      voz: "Los inscriptos, con su estado de pago, que el organizador marca con un toque.",
    },
    {
      titulo: "Armado de cuadros",
      url: `${DEMO}/cuadros`,
      voz: "Los cuadros se arman como en una pizarra: se agregan fases, se conectan los partidos y se cargan los resultados.",
    },
    {
      titulo: "Llaves y series",
      url: `${B}/cuadros-demo`,
      voz: "Se arrastran los partidos, se conectan con la ronda siguiente, y se arman llaves o series por equipos.",
    },
    {
      titulo: "En vivo",
      url: `${DEMO}/en-vivo`,
      voz: "Mientras se juega, los cuadros y la tabla de posiciones se actualizan en vivo.",
    },
    {
      titulo: "Posiciones",
      url: `${B}/posiciones`,
      voz: "Las tablas de posiciones de cada torneo y categoría marcan quiénes pasan a la próxima fase.",
    },
    {
      titulo: "Campeones",
      url: DEMO,
      sel: "text=Resultados del Torneo",
      voz: "Al terminar, el torneo muestra su campeón y su subcampeón, y les suma los puntos del ranking.",
    },
    {
      titulo: "Historial",
      url: `${B}/solicitudes`,
      voz: "Y si alguien jugó antes de tener cuenta, pide que le sumen ese historial, y el organizador lo aprueba. Todo funciona en la compu y en el celular.",
    },
  ],
};
