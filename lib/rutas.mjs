import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Las cuentas que maneja este repo. Cada una es una carpeta en marcas/. */
export const MARCAS = ["raudal", "tecnoaid"];

export const dirMarca = (marca) => join(RAIZ, "marcas", marca);
export const dirImagenes = (marca) => join(dirMarca(marca), "imagenes");
