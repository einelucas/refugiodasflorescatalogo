import { clamp } from "./paths";
import { tuftTexture } from "./textures";
import type { Flower, Thread, ThreadProgress } from "./types";

export type PreparedThread = Thread & { textures: HTMLCanvasElement[] };
export function prepareThread(thread:Thread):PreparedThread {
  return {...thread,textures:Array.from({length:4},(_,i)=>tuftTexture(thread.color,thread.shadow??"#51334c",i))};
}
export function drawThread(ctx:CanvasRenderingContext2D,thread:PreparedThread,progress:ThreadProgress={}):void{
  const {points,thickness,textures}=thread,n=points.length;
  if(n<2)return;
  const start=clamp(progress.start??0),end=clamp(progress.end??1);
  if(end<=start)return;
  const from=Math.floor(start*(n-1)),to=Math.floor(end*(n-1));
  const size=thickness*2.4;
  for(let i=from;i<=to;i++){
    const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(n-1,i+1)];
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));
    ctx.drawImage(textures[((i+(thread.seed??0))%4+4)%4],-size/2,-size/2,size,size);ctx.restore();
  }
}
export function flowerSprite(flower:Flower,dpr:number):HTMLCanvasElement{
  const canvas=document.createElement("canvas"),size=144;
  canvas.width=size*dpr;canvas.height=size*dpr;
  const ctx=canvas.getContext("2d");
  if(ctx){
    ctx.scale(dpr,dpr);ctx.translate(size/2,size/2+3);
    for(const t of [...flower.stem,...flower.leaves,...flower.petals,...flower.center])drawThread(ctx,prepareThread(t));
  }
  return canvas;
}
