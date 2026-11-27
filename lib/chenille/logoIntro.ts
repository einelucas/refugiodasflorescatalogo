import { clamp,lerp,mix,resample,seeded } from "./paths";
import { smooth } from "./sunflower";
import { createIntroMaterial } from "./logoIntroMaterial";
import type { Point } from "./types";

const NS="http://www.w3.org/2000/svg";
export const INTRO_SIZE=320;
export const INTRO_DURATION=6000;
export const INTRO_EXIT=700;
const center=160,scale=.32;
type Track={points:Point[];length:number};

// Constant-speed middle section with continuous acceleration/deceleration at its ends.
// A short ease-in avoids the old long stationary plateau.
function easeFold(value:number){
  const t=clamp(value),ramp=.12;
  if(t<ramp)return t*t/(2*ramp*(1-ramp));
  if(t>1-ramp)return 1-(1-t)*(1-t)/(2*ramp*(1-ramp));
  return (t-ramp/2)/(1-ramp);
}
export function introTimeline(progress:number){
  const t=clamp(progress);
  return {
    fold:easeFold((t-.018)/.65),
    detail:easeFold((t-.54)/.34),
    fill:smooth((t-.81)/.12),
    title:t>=.79
  };
}
// Limit advancement after a dropped mobile frame rather than jumping through poses.
export function advanceIntroClock(elapsed:number,delta:number){
  return Math.min(INTRO_DURATION,elapsed+clamp(delta,0,64));
}
function readTracks(svg:string):{tracks:Track[];shape:Path2D}{
  const doc=new DOMParser().parseFromString(svg,"image/svg+xml");
  const d=doc.querySelector(".logo-flower path")?.getAttribute("d");
  if(!d)throw new Error("Símbolo oficial não encontrado");
  const tracks=d.match(/M[^M]+/g)?.map(segment=>{
    const path=document.createElementNS(NS,"path");path.setAttribute("d",segment);
    const length=path.getTotalLength();
    const n=Math.max(4,Math.ceil(length*scale/1.1));
    const points=Array.from({length:n+1},(_,i)=>{
      const p=path.getPointAtLength(length*i/n);
      return {x:center+(p.x-540)*scale,y:center+(p.y-540)*scale};
    });
    return {points:resample(points,1.2),length:length*scale};
  }).filter(t=>t.length>2)??[];
  if(!tracks.length)throw new Error("Sem contornos na logo");
  const shape=new Path2D();
  shape.addPath(new Path2D(d),new DOMMatrix([scale,0,0,scale,center-540*scale,center-540*scale]));
  return {tracks,shape};
}
function prefix(points:readonly Point[],amount:number):Point[]{
  const n=points.length-1,at=clamp(amount)*n,i=Math.floor(at);
  return [...points.slice(0,i+1),mix(points[i],points[Math.min(n,i+1)],at-i)];
}
export function foldedThread(points:readonly Point[],amount:number):Point[]{
  const p=clamp(amount);
  if(points.length<2)return points.map(q=>({...q}));
  if(p===1)return points.map(q=>({...q}));
  // Every material point starts on the same straight wire and travels to its
  // arc-length position on the official contour. No appended straight tail,
  // changing prefix or moving anchor that can snap at a tangent discontinuity.
  const envelope=4*p*(1-p);
  return points.map((target,i)=>{
    const u=i/(points.length-1);
    const start={x:256-192*u,y:160};
    // A smooth travelling wave lets one part lead without freezing either end.
    const local=p+.62*(1-2*u)*p*(1-p);
    const bow=envelope*(22*Math.sin(Math.PI*u)-12*Math.sin(2*Math.PI*u));
    const drift=envelope*9*Math.sin(2*Math.PI*u);
    return {x:lerp(start.x,target.x,local)+drift,
      y:lerp(start.y,target.y,local)+bow};
  });
}
export function createLogoIntro(svg:string,dpr:number){
  const {tracks,shape}=readTracks(svg);
  const outer=tracks[0],others=tracks.slice(1),{fibres}=createIntroMaterial();
  // Bake rotation and scale once: no per-fibre context transforms in each frame.
  const directions=16;
  const spriteSize=Math.ceil(20*dpr);
  const sprites=fibres.map(fibre=>Array.from({length:directions},(_,i)=>{
    const sprite=document.createElement("canvas");sprite.width=sprite.height=spriteSize;
    const g=sprite.getContext("2d");if(g){g.translate(spriteSize/2,spriteSize/2);g.rotate(i*Math.PI*2/directions);const side=spriteSize*.60;g.drawImage(fibre,-side/2,-side/2,side,side);}
    return sprite;
  }));
  const make=()=>{
    const c=document.createElement("canvas");c.width=c.height=Math.round(INTRO_SIZE*dpr);
    const ctx=c.getContext("2d");if(!ctx)throw new Error("Canvas indisponível");
    ctx.scale(dpr,dpr);return {c,ctx};
  };
  function trace(ctx:CanvasRenderingContext2D,points:readonly Point[],size=12){
    if(points.length<2)return;
    ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.strokeStyle="#b49bc2";ctx.lineWidth=size*.48;ctx.stroke();
    ctx.strokeStyle="#e1cce9";ctx.lineWidth=size*.34;ctx.stroke();
    for(let i=0;i<points.length;i++){
      const q=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
      const angle=Math.atan2(b.y-a.y,b.x-a.x);
      const direction=(Math.round(angle*directions/(2*Math.PI))+directions)%directions;
      const side=size/.60;
      ctx.drawImage(sprites[i%sprites.length][direction],q.x-side/2,q.y-side/2,side,side);
    }
    ctx.restore();
  }
  const paper=make(),outline=make(),detailLayers=others.map(()=>make());
  trace(outline.ctx,outer.points);
  others.forEach((track,i)=>trace(detailLayers[i].ctx,track.points,8));
  // Textured finished vector: use the same fibres, with irregular directions
  // and controlled density, clipped to the exact official silhouette.
  const ink=paper.ctx,rnd=seeded(8407);
  ink.save();ink.clip(shape,"evenodd");
  ink.fillStyle="#c5afd1";ink.fillRect(0,0,320,320);
  for(let y=30;y<290;y+=2.9)for(let x=30;x<290;x+=3.2){
    const s=7+rnd()*2.4;
    const px=x+(rnd()-.5)*2,py=y+(rnd()-.5)*2;
    const direction=Math.floor(rnd()*directions/2),side=s/.60;
    ink.drawImage(sprites[Math.floor(rnd()*sprites.length)][direction],px-side/2,py-side/2,side,side);
  }
  // A subtle directional pile along every contour retains relief in the finished mark.
  for(const track of tracks)trace(ink,track.points,8);
  ink.restore();
  const initial=make();trace(initial.ctx,resample(foldedThread(outer.points,0),1.2),12);
  function draw(ctx:CanvasRenderingContext2D,p:number){
    const {fold,detail,fill}=introTimeline(p);
    ctx.clearRect(0,0,320,320);
    if(fold===0)ctx.drawImage(initial.c,0,0,320,320);
    else if(fold<1)trace(ctx,resample(foldedThread(outer.points,fold),1.2),12);
    else{
      ctx.save();ctx.globalAlpha=1-fill;ctx.drawImage(outline.c,0,0,320,320);ctx.restore();
    }
    if(detail>0&&fill<1){
      ctx.save();ctx.globalAlpha=1-fill;
      for(let i=0;i<others.length;i++){
        const q=smooth((detail-i/others.length*.58)/.42);
        if(q>=1)ctx.drawImage(detailLayers[i].c,0,0,320,320);
        else if(q>0)trace(ctx,prefix(others[i].points,q),8);
      }
      ctx.restore();
    }
    if(fill>0){ctx.save();ctx.globalAlpha=fill;ctx.drawImage(paper.c,0,0,320,320);ctx.restore();}
  }
  return {draw};
}
