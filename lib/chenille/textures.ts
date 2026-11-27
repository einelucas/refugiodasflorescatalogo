import { seeded } from "./paths";

const cache=new Map<string,HTMLCanvasElement>();
const SIZE=96;
function tint(hex:string,amount:number):string{
  if(!/^#[0-9a-f]{6}$/i.test(hex))return hex;
  const n=parseInt(hex.slice(1),16),target=amount>0?255:0,a=Math.abs(amount);
  const channel=(shift:number)=>Math.round(((n>>shift)&255)*(1-a)+target*a).toString(16).padStart(2,"0");
  return "#"+channel(16)+channel(8)+channel(0);
}
// Dense directional pile, irregular tiny loops and fine fibres. All noise is baked.
export function tuftTexture(color:string,shadow:string,variant:number):HTMLCanvasElement{
  const key=color+"|"+shadow+"|"+variant,existing=cache.get(key);
  if(existing)return existing;
  const canvas=document.createElement("canvas");canvas.width=SIZE;canvas.height=SIZE;
  const ctx=canvas.getContext("2d");
  if(ctx){
    const rnd=seeded(9173+variant*137);
    const dark=tint(color,-.45),mid=tint(color,-.16),light=tint(color,.36),glint=tint(color,.65);
    const body=ctx.createRadialGradient(42,34,3,48,48,37);
    body.addColorStop(0,light);body.addColorStop(.42,color);body.addColorStop(.78,mid);body.addColorStop(1,dark);
    ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(48,48,24,34,0,0,Math.PI*2);ctx.fill();
    ctx.lineCap="round";ctx.lineJoin="round";
    // The tiny irregular U-shaped tufts recreate the dense ribbed pile of the material.
    for(let i=0;i<130;i++){
      const a=rnd()*Math.PI*2,rad=Math.sqrt(rnd()),x=48+Math.cos(a)*21*rad,y=48+Math.sin(a)*31*rad;
      const side=y<48?-1:1,dx=(rnd()-.5)*8,dy=side*(2+rnd()*8);
      ctx.globalAlpha=.3+rnd()*.6;ctx.lineWidth=1.1+rnd()*2.2;
      ctx.strokeStyle=i%7===0?shadow:i%4===0?dark:i%3===0?light:color;
      ctx.beginPath();ctx.moveTo(x-2,y);ctx.quadraticCurveTo(x+dx,y+dy,x+2.5,y+dy*.4);ctx.stroke();
      if(i%3===0){ctx.globalAlpha=.38;ctx.strokeStyle=light;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-1,y-1);ctx.quadraticCurveTo(x+dx,y+dy*.8-1,x+2,y+dy*.4-1);ctx.stroke();}
    }
    // Short, outward fibres break the silhouette rather than creating long wispy hairs.
    for(let i=0;i<88;i++){
      const a=rnd()*Math.PI*2,x=48+Math.cos(a)*22,y=48+Math.sin(a)*32;
      const length=3+rnd()*8;
      ctx.globalAlpha=.35+rnd()*.55;ctx.strokeStyle=i%6===0?glint:i%3===0?mid:color;
      ctx.lineWidth=.75+rnd()*1.2;ctx.beginPath();ctx.moveTo(x,y);
      ctx.quadraticCurveTo(x+Math.cos(a)*length*.6+2,y+Math.sin(a)*length*.6,x+Math.cos(a)*length,y+Math.sin(a)*length);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(cache.size>=128){const first=cache.keys().next().value;if(first!==undefined)cache.delete(first);}
  cache.set(key,canvas);return canvas;
}
