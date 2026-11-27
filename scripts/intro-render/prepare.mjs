import { createHash } from "node:crypto";
import { existsSync,readFileSync,writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const inputs=["public/imagens/logo-refugio.svg","lib/chenille/logoIntro.ts","lib/chenille/logoIntroMaterial.ts","lib/chenille/paths.ts","lib/chenille/sunflower.ts","lib/chenille3d/chenilleMaterial.ts","scripts/intro-render/render.mts","scripts/intro-render/package.json"];
const digest=createHash("sha256");
for(const file of inputs)digest.update(readFileSync(file));
const key=digest.digest("hex"), stamp="public/imagens/chenille-intro.sha256";
if(existsSync(stamp)&&readFileSync(stamp,"utf8")===key&&existsSync("public/imagens/chenille-intro.mp4")&&existsSync("public/imagens/chenille-intro-poster.png")){
  console.log("Intro video is up to date.");
  process.exit(0);
}
const npm=process.platform==="win32"?"npm.cmd":"npm";
function run(command,args){
  const result=spawnSync(command,args,{stdio:"inherit",shell:process.platform==="win32"&&command===npm});
  if(result.status!==0)throw result.error??new Error(command+" failed: "+result.status);
}
run(npm,["install","--prefix","scripts/intro-render","--no-audit","--no-fund","--package-lock=false"]);
run(process.execPath,["--import","tsx","scripts/intro-render/render.mts"]);
writeFileSync(stamp,key);
