const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = __dirname;
const out = path.join(root, "dist", "build");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let js = fs.readFileSync(path.join(root, "game.js"), "utf8");
const cambios = [
  ["S.day === 0 && !S.noEnd", "S.day === 0"],
  [/^\s*if \(S\.noEnd\) \{ S\.queue = \[\]; return; \}\s*\r?\n/m, ""],
  ["if (!S.noEnd) setTimeout(", "setTimeout("],
  ["firstDossier && !S.noEnd", "firstDossier"],
];
for (const [de, a] of cambios) {
  const antes = js;
  js = js.replace(de, a);
  if (js === antes) throw new Error("No se encontró: " + de);
}
const ini = js.indexOf("const DEMO = ");
const fin = js.lastIndexOf("})();");
if (ini < 0 || fin < ini) throw new Error("No se encontró el bloque demo");
js = js.slice(0, ini).replace(/\s+$/, "\n") + js.slice(fin);
if (/noEnd|runDemo|__G|DEMO|demo/.test(js)) throw new Error("Quedan restos del modo demo");

fs.writeFileSync(path.join(out, "game.js"), js);
for (const f of ["index.html", "style.css", "data.js"]) fs.copyFileSync(path.join(root, f), path.join(out, f));
fs.cpSync(path.join(root, "fonts"), path.join(out, "fonts"), { recursive: true });
execFileSync(process.execPath, ["--check", path.join(out, "game.js")]);

const zip = path.join(root, "dist", "despacho-29n-itch.zip");
fs.rmSync(zip, { force: true });
execFileSync("C:\\Windows\\System32\\tar.exe", ["-a", "-c", "-f", zip, "-C", out, "index.html", "style.css", "game.js", "data.js", "fonts"]);
console.log("zip:", zip);
