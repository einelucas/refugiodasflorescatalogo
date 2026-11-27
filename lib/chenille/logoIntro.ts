import { drawThread,prepareThread } from "./engine";
import { clamp,lerp,resample } from "./paths";
import { smooth } from "./sunflower";
import { tuftTexture } from "./textures";
import type { Point } from "./types";

const NS="http://www.w3.org/2000/svg";
export const INTRO_SIZE=320;
const center=160,scale=.32;
type Track={points:Point[];length:number};
function readTracks(svg:string):{tracks:Track[];shape:Path2D}{
  const doc=new DOMParser().parseFromString(svg,"image/svg+xml");
  const d=doc.querySelector(".logo-flower path")?.getAttribute("d");
  if(!d)throw new Error("Símbolo oficial não encontrado");
  const tracks=d.match(/M[^M]+/g)?.map(segment=>{
    const path=document.createElementNS(NS,"path");path.setAttribute("d",segment);
    const length=path.getTotalLength();
    const n=Math.max(4,Math.ceil(length*scale/1.5));
    const points=Array.from({length:n+1},(_,i)=>{
      const p=path.getPointAtLength(length*i/n);
      return {x:center+(p.x-540)*scale,y:center+(p.y-540)*scale};
    });
    return {points:resample(points,1.5),length:length*scale};
  }).filter(t=>t.length>2)??[];
  if(!tracks.length)throw new Error("Sem contornos na logo");
  const shape=new Path2D();
  shape.addPath(new Path2D(d),new DOMMatrix([scale,0,0,scale,center-540*scale,center-540*scale]));
  return {tracks,shape};
}
export function createLogoIntro(svg:string,dpr:number){
  const {tracks,shape}=readTracks(svg);
  const outer=tracks[0],others=tracks.slice(1);
  const thread=prepareThread({points:[],color:"#efe0f7",shadow:"#856292",thickness:4.2});
  const paper=document.createElement("canvas");paper.width=paper.height=Math.round(INTRO_SIZE*dpr);
  const ink=paper.getContext("2d");if(!ink)throw new Error("Canvas indisponível");
  ink.scale(dpr,dpr);
  // Bake the fluffy final mark once, clipping to the original even-odd vector.
  ink.save();ink.clip(shape,"evenodd");ink.fillStyle="#eee0f5";ink.fillRect(0,0,320,320);
  const tuft=tuftTexture("#f7e9fc","#b59bc3",1);
  for(let y=35;y<285;y+=3.5)for(let x=35;x<285;x+=3.5){
    ink.drawImage(tuft,x+Math.sin(y*.31)*1.5-3,y-3,6,6);
  }
  ink.restore();
  const outline=document.createElement("canvas");outline.width=outline.height=paper.width;
  const oc=outline.getContext("2d");if(!oc)throw new Error("Canvas indisponível");
  oc.scale(dpr,dpr);
  const trace=(ctx:CanvasRenderingContext2D,points:Point[])=>{if(points.length<2)return;thread.points=points;drawThread(ctx,thread);};
  trace(oc,outer.points);
  function draw(ctx:CanvasRenderingContext2D,p:number){
    const t=clamp(p),fold=smooth((t-.12)/.53),detail=smooth((t-.60)/.24),fill=smooth((t-.79)/.19);
    ctx.clearRect(0,0,320,320);
    if(fold<1){
      // One connected thread: the remaining straight tail follows the growing contour.
      const n=outer.points.length-1,at=fold*n,i=Math.floor(at),f=at-i;
      const a=outer.points[i],b=outer.points[Math.min(n,i+1)];
      const tip={x:lerp(a.x,b.x,f),y:lerp(a.y,b.y,f)};
      const points=[...outer.points.slice(0,i+1),tip];
      const tail=lerp(196,0,fold),angle=lerp(Math.PI,Math.atan2(b.y-a.y,b.x-a.x),Math.sin(Math.PI*fold)*.65);
      for(let j=1;j<=Math.ceil(tail/1.5);j++){
        const u=j/Math.ceil(tail/1.5);
        points.push({x:tip.x+Math.cos(angle)*tail*u,y:tip.y+Math.sin(angle)*tail*u+Math.sin(Math.PI*u)*9*fold});
      }
      // The untouched initial wire is horizontal and centered before its first fold.
      ctx.save();ctx.translate((1-fold)*(258-outer.points[0].x),(1-fold)*(160-outer.points[0].y));
      trace(ctx,resample(points,1.5));ctx.restore();
    }else{
      ctx.save();ctx.globalAlpha=1-fill;ctx.drawImage(outline,0,0,320,320);ctx.restore();
    }
    if(detail>0&&fill<1){
      ctx.save();ctx.globalAlpha=1-fill;
      for(let i=0;i<others.length;i++){
        const track=others[i],q=smooth((detail-i/others.length*.55)/.45);
        if(q>0)trace(ctx,track.points.slice(0,Math.max(2,Math.ceil(track.points.length*q))));
      }
      ctx.restore();
    }
    if(fill>0){ctx.save();ctx.globalAlpha=fill;ctx.drawImage(paper,0,0,320,320);ctx.restore();}
  }
  return {draw};
}
