/**
 * Posts esperando aprobación: los que viven en ramas post/<marca>/<id> de
 * origin. Cada rama es un PR abierto; cuando se aprueba o se descarta desde la
 * página de revisión, la rama se borra. Por eso "rama remota post/*" equivale
 * a "pendiente".
 */
import { execFileSync } from "node:child_process";
import { RAIZ } from "./rutas.mjs";

const git = (...args) => execFileSync("git", args, { cwd: RAIZ, encoding: "utf8" });

export function pendientes(marca, { actualizar = true } = {}) {
  if (actualizar) git("fetch", "--quiet", "--prune", "origin", "+refs/heads/post/*:refs/remotes/origin/post/*");
  const ramas = git("for-each-ref", "--format=%(refname:short)", `refs/remotes/origin/post/${marca}/`)
    .split("\n")
    .filter(Boolean);

  return ramas.flatMap((rama) => {
    const id = rama.split("/").pop();
    try {
      const post = JSON.parse(git("show", `${rama}:marcas/${marca}/posts/${id}.json`));
      return [{ ...post, rama }];
    } catch {
      return []; // rama sin su archivo: no es un post bien formado
    }
  });
}
