/**
 * Datos inventados para grabar el reel de Argentecnica contra el proyecto
 * de Supabase "argentecnica-demo" (nunca contra la base del cliente).
 * Clientes, proveedores, OTs, piezas, pedidos y compras son ficticios.
 *
 *   node reels/demo/argentecnica-seed.mjs   (lee la conexión de ~/dev/argentecnica-gestion/.env.demo)
 *
 * Idempotente: vacía las tablas de datos y las vuelve a llenar.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const env = Object.fromEntries(readFileSync(`${process.env.HOME}/dev/argentecnica-gestion/.env.demo`, "utf8").trim().split("\n").map((l) => l.split("=")));
const q = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const hoy = new Date();
const dia = (n) => new Date(hoy.getTime() + n * 864e5).toISOString().slice(0, 10);

const clientes = [["Ceibo Envases", "Argentina"], ["Arandú Alimentos", "Paraguay"], ["Laboratorio Tumbaya", "Argentina"], ["Cosmética Iruya", "Uruguay"], ["Bodegas Payogasta", "Argentina"], ["Química Calingasta", "Chile"]];
const proveedores = ["Metalúrgica Ñandú", "Aceros Famatina", "Rulemanes Cachi", "Aluminios Tafí", "Tornillería Humahuaca", "Neumática Uspallata", "Bronces Aconquija"];
// [numero, cliente, descripcion, estado, diseno, anticipo, plazoDias, diasDesdeOc]
const ots = [
  [7101, 0, "Estuchadora horizontal EH-60", "en_curso", "aprobado", "recibido", 90, -40],
  [7102, 1, "Formato para envasadora de sachets", "en_curso", "aprobado", "recibido", 45, -25],
  [7103, 2, "Matriz de corte para blister", "pendiente", "pendiente", "pendiente", 60, -6],
  [7104, 3, "Cabezal sellador doble", "en_curso", "aprobado", "no_aplica", 30, -18],
  [7105, 4, "Guías de transporte para etiquetadora", "terminada", "aprobado", "recibido", 20, -35],
  [7106, 5, "Repuestos para dosificadora volumétrica", "stand_by", "aprobado", "pendiente", 30, -28],
  [7107, 0, "Alimentador de cartulinas", "en_curso", "aprobado", "recibido", 60, -15],
  [7108, 2, "Tolva de acero inoxidable", "entregada", "aprobado", "recibido", 25, -70],
  [7109, 1, "Mesa de acumulación giratoria", "pendiente", "aprobado", "pendiente", 50, -3],
  [7110, 3, "Juego de cuchillas de corte", "en_curso", "aprobado", "no_aplica", 15, -9],
  [7111, 4, "Estrella de transferencia de botellas", "en_curso", "no_aplica", "no_aplica", 20, -12],
  [7112, 5, "Bomba de engranajes, reacondicionado", "terminada", "aprobado", "recibido", 30, -40],
];
const piezas = [
  ["Bastidor lateral", "AISI 304"], ["Eje de mando", "SAE 1045"], ["Buje", "Bronce SAE 64"], ["Leva de apertura", "SAE 4140"],
  ["Placa base", "Aluminio 6061"], ["Guía de cadena", "Delrin"], ["Soporte de motor", "SAE 1010"], ["Rodillo tensor", "AISI 304"],
  ["Pinza de transferencia", "Aluminio 7075"], ["Tapa de cabezal", "AISI 316"],
];
const fab = { munro: ["COM", "ING", "ESP", "MEC", "MEC", "REC", "SEG", "TER", "ENT"], bragado: ["ESP", "COR", "TOR", "FRE", "MEC", "ELE", "ENS", "TER"] };

let sql = `begin; set local app.origen = 'importacion';
truncate tarea_comentario, aviso, tarea, notificacion, evento, compra_item, ot_item, pedido_ot, compra, pedido, ot, proveedor, cliente, estado_entrega restart identity cascade;
delete from perfil where email like '%@argentecnica.demo';
`;
sql += `insert into cliente (nombre, pais) values ${clientes.map(([n, p]) => `(${q(n)}, ${q(p)})`).join(", ")};\n`;
sql += `insert into proveedor (nombre) values ${proveedores.map((n) => `(${q(n)})`).join(", ")};\n`;
sql += `insert into estado_entrega (nombre, color, orden) values ('Entregado', '92D050', 1), ('Retira el cliente', 'FFD966', 2), ('En viaje', '9BC2E6', 3);\n`;
for (const [n, c, d, est, dis, ant, plazo, desde] of ots) {
  const aprob = dis === "aprobado" ? dia(desde + 4) : null;
  sql += `insert into ot (numero, cliente_id, pais, oc_cliente, fecha_oc, fecha_ot, presupuesto, descripcion, diseno_estado, diseno_aprobado_en, plazo_dias, plazo_entrega, fecha_entrega_prometida, anticipo, fecha_anticipo, estado, fecha_terminacion, fecha_entrega, carpeta)
  values (${n}, ${c + 1}, ${q(clientes[c][1])}, ${q(`OC-${4500 + n % 100}`)}, ${q(dia(desde))}, ${q(dia(desde + 2))}, ${q(`P-26-${n - 6900}`)}, ${q(d)}, ${q(dis)}, ${q(aprob)}, ${plazo}, ${q(`${plazo} días`)}, ${q(dia(desde + 4 + plazo))}, ${q(ant)}, ${q(ant === "recibido" ? dia(desde + 3) : null)}, ${q(est)}, ${q(["terminada", "entregada"].includes(est) ? dia(-4) : null)}, ${q(est === "entregada" ? dia(-2) : null)}, ${q(`\\\\servidor\\ots\\${n}`)});\n`;
}
// Piezas: 4 a 7 por OT, repartidas entre plantas y compras.
let id = 0;
ots.forEach(([n, , , est], i) => {
  const cant = 4 + (i % 4);
  for (let k = 0; k < cant; k++) {
    const [desc, mat] = piezas[(i * 3 + k) % piezas.length];
    const origen = k === cant - 1 ? "compras" : (i + k) % 3 === 0 ? "bragado" : "munro";
    const planta = origen === "compras" ? null : origen;
    const lista = planta ? fab[planta] : null;
    const codigo = planta ? (est === "terminada" || est === "entregada" ? "TER" : est === "pendiente" ? lista[0] : lista[(i + k * 2) % lista.length]) : null;
    id++;
    sql += `insert into ot_item (ot_id, orden, plano, descripcion, cantidad, unidad, origen, material, material_en_stock, estado_fabricacion_id, estado_fabricacion_desde, ubicacion)
    values (${i + 1}, ${k + 1}, ${q(k === 2 && i % 5 === 2 ? null : `${n}-${String(k + 1).padStart(2, "0")}`)}, ${q(origen === "compras" ? ["Rodamiento 6204 2RS", "Cilindro neumático Ø40", "Motorreductor 0,75 kW", "Correa dentada HTD 8M"][i % 4] : desc)}, ${1 + ((i + k) % 4) * 2}, 'u', ${q(origen)}, ${q(origen === "compras" ? null : mat)}, ${(i + k) % 4 === 0}, ${codigo ? `(select id from estado_fabricacion where planta = ${q(planta)} and codigo = ${q(codigo)})` : "null"}, ${q(dia(-((i + k) % 9)))}, ${q(planta ?? "munro")});\n`;
  }
});
// Pedidos de material y compras a proveedores.
const pedidos = [["munro", "151", 1, -20], ["munro", "152", 2, -14], ["bragado", "11234", 4, -10], ["munro", "153", 7, -8], ["bragado", "11235", 10, -5], ["munro", "154", 11, -2]];
const estadosCompra = ["cumplido", "listo_retirar", "oc_emitida", "pago_pendiente", "presupuesto", "pedido_cargado"];
pedidos.forEach(([planta, num, ot, desde], i) => {
  sql += `insert into pedido (planta, numero, fecha) values (${q(planta)}, ${q(num)}, ${q(dia(desde))});\n`;
  sql += `insert into pedido_ot (pedido_id, ot_id) values (${i + 1}, ${ot});\n`;
  for (let k = 0; k < 2; k++) {
    const estado = estadosCompra[(i + k * 2) % estadosCompra.length];
    const emitida = !["presupuesto", "pedido_cargado"].includes(estado);
    const importe = emitida ? 180000 + ((i * 7 + k * 3) % 11) * 95000 : null;
    sql += `insert into compra (pedido_id, proveedor_id, numero_compra, estado, fecha, importe, subtotal, plazo_entrega, condicion_pago, planta_recepcion, retiro_autorizado, fecha_cumplido)
    values (${i + 1}, ${((i * 2 + k) % proveedores.length) + 1}, ${q(emitida ? `OC-${17300 + i * 2 + k}` : null)}, ${q(estado)}, ${q(emitida ? dia(desde + 2) : null)}, ${importe ?? "null"}, ${importe ? (importe / 1.21).toFixed(2) : "null"}, ${q(["Inmediato", "7 días", "URGENTE", "15 días"][(i + k) % 4])}, ${q(emitida ? "30 días fecha factura" : null)}, ${q(estado === "cumplido" ? planta : null)}, ${["listo_retirar", "cumplido"].includes(estado)}, ${q(estado === "cumplido" ? dia(desde + 6) : null)});\n`;
    const c = i * 2 + k + 1;
    sql += `insert into compra_item (compra_id, orden, codigo, cantidad, unidad, descripcion, precio_unitario, total) values
      (${c}, 1, ${q(`${7100 + ot}-0${k + 1}`)}, ${2 + k}, 'u', ${q(["Barra redonda SAE 1045 Ø50", "Planchuela AISI 304 3/8\"", "Barra de bronce SAE 64 Ø40", "Placa de aluminio 6061 20 mm"][(i + k) % 4])}, ${importe ? (importe / 1.21 / (2 + k)).toFixed(2) : "null"}, ${importe ? (importe / 1.21).toFixed(2) : "null"});\n`;
  }
});
// Las piezas de compras quedan ligadas a la primera compra de su OT, si hay.
sql += `update ot_item i set compra_id = c.id from compra c join pedido_ot po on po.pedido_id = c.pedido_id where po.ot_id = i.ot_id and i.origen = 'compras' and c.id = (select min(c2.id) from compra c2 join pedido_ot p2 on p2.pedido_id = c2.pedido_id where p2.ot_id = i.ot_id);\n`;
// Equipo ficticio (solo perfiles: no son cuentas, nadie puede entrar con ellos).
const equipo = [["Marina", "Costa", "compras", "Jefa de compras"], ["Diego", "Ferrán", "planta_munro", "Jefe de planta Munro"], ["Lucía", "Benítez", "planta_bragado", "Jefa de planta Bragado"], ["Tomás", "Ibarra", "ingenieria", "Ingeniería de producto"]];
equipo.forEach(([n, a, rol, cargo], i) => {
  sql += `insert into perfil (id, email, nombre, apellido, rol, permiso, activo, cargo) values (gen_random_uuid(), ${q(`${n.toLowerCase()}@argentecnica.demo`)}, ${q(n)}, ${q(a)}, ${q(rol)}, 'edicion', true, ${q(cargo)});\n`;
});
sql += "commit;\n";

const conexion = `host=aws-1-sa-east-1.pooler.supabase.com port=5432 user=reels_demo.ufsoblglnbhybnlzvbei dbname=postgres sslmode=require`;
execFileSync("psql", [conexion, "-v", "ON_ERROR_STOP=1", "-q"], { input: sql, env: { ...process.env, PGPASSWORD: env.REELS_DEMO_DB_PASS }, stdio: ["pipe", "inherit", "inherit"] });
console.log(`✓ ${ots.length} OTs, ${id} piezas, ${pedidos.length} pedidos, ${pedidos.length * 2} compras, ${equipo.length} integrantes`);
