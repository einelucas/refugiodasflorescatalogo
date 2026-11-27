import { seeded } from "./paths";

const cache = new Map<string,HTMLCanvasElement>();
const SIZE=48;
// Cached, deterministic directional fibre stamp; generated only on a cache miss.
export function tuftTexture(color:string,shadow:string,variant:number):HTMLCanvasElement {
  const key=color+"|"+shadow+"|"+variant;
  const existing=cache.get(key);if(existing) return existing;
  const canvas=document.createElement("canvas");canvas.width=SIZE;canvas.height=SIZE;
  const ctx=canvas.getContext("2d");
  if(ctx){
    const random=seeded(1709+variant*31);
    ctx.lineCap="round";
    const gradient=ctx.createRadialGradient(21,19,1,24,24,15);
    gradient.addColorStop(0,color);gradient.addColorStop(.67,color);gradient.addColorStop(1,shadow);
    ctx.fillStyle=gradient;ctx.beginPath();ctx.ellipse(24,24,11,15,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<48;i++){
      const x=18+random()*12,y=13+random()*22,side=random()>.5?1:-1;
      const dx=(random()-.5)*10,dy=side*(5+random()*8);
      ctx.globalAlpha=.25+random()*.6;ctx.strokeStyle=i%5===0?"#ffffff":i%3===0?shadow:color;
      ctx.lineWidth=.65+random()*1.15;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.4,y+dy*.55,x+dx,y+dy);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(cache.size>=96) cache.delete(cache.keys().next().value!);
  cache.set(key,canvas);return canvas;
}
