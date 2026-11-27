import { bezier,clamp,lerp,mix,resample,seeded } from "./paths";
import { smooth } from "./sunflower";
import { createIntroMaterial } from "./logoIntroMaterial";
import type { Point } from "./types";

const NS="http://www.w3.org/2000/svg";
export const INTRO_SIZE=320;
export const INTRO_DURATION=6000;
export const INTRO_EXIT=700;
const center=160,scale=.32;
type Track={points:Point[];length:number};

export function introTimeline(progress:number){
  const t=clamp(progress);
  return {
    fold:smooth((t-.10)/.52),
    detail:smooth((t-.60)/.24),
    fill:smooth((t-.80)/.10),
    title:t>=.79
  };
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
  const p=clamp(amount),formed=prefix(points,p),tip=formed[formed.length-1];
  if(p>=1)return formed;
  // The wire tip is always shared by the completed contour and the free tail.
  // Blend tangent vectors, not angles, avoiding a discontinuity at +/- PI.
  const at=Math.floor(p*(points.length-1)),a=points[Math.max(0,at-4)],b=points[Math.min(points.length-1,at+4)];
  const n=Math.hypot(b.x-a.x,b.y-a.y)||1;
  const follow=Math.sin(Math.PI*p)*.66;
  const tangent={x:lerp(-1,(b.x-a.x)/n,follow),y:(b.y-a.y)/n*follow};
  const length=192*Math.pow(1-p,1.35);
  const dx=(258-points[0].x)*(1-smooth(p/.35)),dy=(160-points[0].y)*(1-smooth(p/.35));
  const endpoint={x:clamp(tip.x+length*tangent.x,18-dx,302-dx),y:clamp(tip.y+length*tangent.y+Math.sin(Math.PI*p)*18,18-dy,302-dy)};
  const control={x:clamp(tip.x+tangent.x*length*.40,18-dx,302-dx),y:clamp(tip.y+tangent.y*length*.40,18-dy,302-dy)};
  const bend=bezier(tip,control,{x:lerp(tip.x,endpoint.x,.78),y:lerp(tip.y,endpoint.y,.84)},endpoint,Math.max(6,Math.ceil(length/2)));
  return [...formed,...bend.slice(1)].map(q=>({x:q.x+dx,y:q.y+dy}));
}
export function createLogoIntro(svg:string,dpr:number){
  const {tracks,shape}=readTracks(svg);
  const outer=tracks[0],others=tracks.slice(1),{fibres}=createIntroMaterial();
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
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));
      ctx.drawImage(fibres[i%fibres.length],-size/2,-size/2,size,size);ctx.restore();
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
    ink.save();ink.translate(x+(rnd()-.5)*2,y+(rnd()-.5)*2);ink.rotate(rnd()*Math.PI);
    ink.drawImage(fibres[Math.floor(rnd()*fibres.length)],-s/2,-s/2,s,s);ink.restore();
  }
  // A subtle directional pile along every contour retains relief in the finished mark.
  for(const track of tracks)trace(ink,track.points,8);
  ink.restore();
  function draw(ctx:CanvasRenderingContext2D,p:number){
    const {fold,detail,fill}=introTimeline(p);
    ctx.clearRect(0,0,320,320);
    if(fold<1)trace(ctx,resample(foldedThread(outer.points,fold),1.2),12);
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
