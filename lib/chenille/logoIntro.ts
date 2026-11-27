import { clamp,mix,resample,seeded } from "./paths";
import { smooth } from "./sunflower";
import { createIntroMaterial } from "./logoIntroMaterial";
import type { Point } from "./types";

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
    fold:easeFold(t/.48),
    detail:easeFold((t-.48)/.32),
    fill:smooth((t-.81)/.12),
    title:t>=.79
  };
}
// Limit advancement after a dropped mobile frame rather than jumping through poses.
export function advanceIntroClock(elapsed:number,delta:number){
  return Math.min(INTRO_DURATION,elapsed+clamp(delta,0,64));
}
// The official mark is a vectorized polygon path containing M/L/Z only.
 // Parse it once in document-independent coordinates so the exact same art
 // can be rendered offline by Node Canvas, not reconstructed in another style.
export function readLogoContours(svg:string){
  const group=svg.match(/<g\b[^>]*class="logo-flower"[^>]*>([\s\S]*?)<\/g>/)?.[1];
  const d=group?.match(/<path\b[^>]*\sd="([^"]+)"/)?.[1];
  if(!d)throw new Error("Símbolo oficial não encontrado");
  const tokens=d.match(/[MLZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)/g)??[];
  if(/[A-KN-Yac-z]/.test(d))throw new Error("Formato vetorial não suportado");
  const contours:Point[][]=[];let current:Point[]=[];let mode="M";
  for(let i=0;i<tokens.length;){
    const token=tokens[i];
    if(token==="M"||token==="L"){mode=token;i++;continue;}
    if(token==="Z"){if(current.length){current.push({...current[0]});contours.push(current);current=[];}i++;continue;}
    const x=Number(tokens[i++]),y=Number(tokens[i++]);
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error("Coordenada inválida");
    if(mode==="M"){if(current.length)contours.push(current);current=[];mode="L";}
    current.push({x:center+(x-540)*scale,y:center+(y-540)*scale});
  }
  if(current.length)contours.push(current);
  if(!contours.length)throw new Error("Sem contornos na logo");
  return contours;
}
function readTracks(svg:string):{tracks:Track[];shape:Path2D}{
  const contours=readLogoContours(svg),shape=new Path2D();
  const tracks=contours.map(points=>{
    shape.moveTo(points[0].x,points[0].y);
    let length=0;
    for(let i=1;i<points.length;i++){
      shape.lineTo(points[i].x,points[i].y);
      length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
    }
    shape.closePath();
    return {points:resample(points,1.2),length};
  }).filter(t=>t.length>2);
  return {tracks,shape};
}
function prefix(points:readonly Point[],amount:number):Point[]{
  const n=points.length-1,at=clamp(amount)*n,i=Math.floor(at);
  return [...points.slice(0,i+1),mix(points[i],points[Math.min(n,i+1)],at-i)];
}
// Reveal only the portion of the official contour already drawn.
export function revealedContour(points:readonly Point[],amount:number):Point[]{
  const p=clamp(amount);
  if(p===0||points.length===0)return [];
  if(p===1||points.length===1)return points.map(q=>({...q}));
  return prefix(points,p);
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
  function draw(ctx:CanvasRenderingContext2D,p:number){
    const {fold,detail,fill}=introTimeline(p);
    ctx.clearRect(0,0,320,320);
    if(fold<1)trace(ctx,revealedContour(outer.points,fold),12);
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
