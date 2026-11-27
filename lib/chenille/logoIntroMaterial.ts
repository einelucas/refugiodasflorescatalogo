import { seeded } from "./paths";
import { chenilleReliefPixels } from "../chenille3d/chenilleMaterial";

// Dedicated intro material: other chenille animations keep their original renderer.
const colors=["#9d7baa","#baa0c8","#dac3e5","#ead9f1","#f8eefb","#fff9ff"];
const relief=chenilleReliefPixels();
function noise(x:number,y:number){
  return (relief[((Math.floor(y)%32+32)%32)*32+((Math.floor(x)%32+32)%32)]??128)/255;
}
export function makeIntroFibre(variant:number){
  const canvas=document.createElement("canvas");canvas.width=canvas.height=160;
  const ctx=canvas.getContext("2d");if(!ctx)return canvas;
  const rnd=seeded(1741+variant*211);
  const core=ctx.createRadialGradient(73,65,3,80,80,50);
  core.addColorStop(0,"#fff8ff");core.addColorStop(.48,"#ead8f1");core.addColorStop(.8,"#c9aed6");core.addColorStop(1,"#a080b0");
  ctx.fillStyle=core;ctx.beginPath();ctx.ellipse(80,80,42,48,0,0,Math.PI*2);ctx.fill();
  ctx.lineCap="round";
  // Layer compact loops over the core, then scatter shorter individual hairs.
  for(let i=0;i<620;i++){
    const a=rnd()*Math.PI*2,r=Math.sqrt(rnd()),x=80+Math.cos(a)*40*r,y=80+Math.sin(a)*47*r;
    const side=y<80?-1:1,l=4+rnd()*11,dx=(rnd()-.5)*9;
    const c=Math.min(5,Math.floor((noise(x*.6,y*.6)*.55+rnd()*.45)*6));
    ctx.strokeStyle=colors[c];ctx.globalAlpha=.46+rnd()*.48;ctx.lineWidth=.8+rnd()*2.7;
    ctx.beginPath();ctx.moveTo(x-2,y);ctx.quadraticCurveTo(x+dx,y+side*l,x+2.5,y+side*l*.42);ctx.stroke();
  }
  for(let i=0;i<260;i++){
    const a=rnd()*Math.PI*2,x=80+Math.cos(a)*39,y=80+Math.sin(a)*44,l=5+rnd()*15;
    const dx=Math.cos(a)*l,dy=Math.sin(a)*l;
    ctx.strokeStyle=colors[2+Math.floor(rnd()*4)];ctx.globalAlpha=.25+rnd()*.62;ctx.lineWidth=.65+rnd()*1.5;
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.55+(rnd()-.5)*5,y+dy*.6,x+dx,y+dy);ctx.stroke();
  }
  ctx.globalAlpha=1;return canvas;
}
export function createIntroMaterial(){
  const fibres=Array.from({length:8},(_,i)=>makeIntroFibre(i));
  return {fibres};
}
