import { drawThread,prepareThread,type PreparedThread } from "./engine";
import { bezier,clamp,lerp,resample,seeded } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";

export const SUNFLOWER_COLORS={yellow:"#f9c314",gold:"#eda600",rear:"#df8c08",burgundy:"#76152a",green:"#08784c"} as const;
export const smooth=(value:number)=>{const t=clamp(value);return t*t*(3-2*t);};
export const stageProgress=(p:number,start:number,end:number)=>smooth((p-start)/(end-start));

export type PetalPlacement={angle:number;radius:number;length:number;width:number;rear:boolean};
// Eight broad teardrop petals above an offset second row, like the supplied bouquet.
export const SUNFLOWER_PETALS:readonly PetalPlacement[]=[
  ...Array.from({length:8},(_,i)=>({angle:-Math.PI/2+(i+.5)*Math.PI/4,radius:24,length:[55,58,54,61,57,58,54,60][i],width:16,rear:true})),
  ...Array.from({length:8},(_,i)=>({angle:-Math.PI/2+i*Math.PI/4+[0,-.035,.035,-.025,.045,-.03,.025,-.03][i],radius:23,length:[64,62,65,62,66,63,66,63][i],width:[20,20,21,19,20,21,21,20][i],rear:false}))
];
export function createPetalRibs(length:number,width:number):Point[][]{
  const ribs:Point[][]=[];
  // Five parallel longitudinal wires, with rounded tips and tightly closed bases.
  for(let i=-2;i<=2;i++){
    const t=i/2,tip=length*(1-.14*Math.abs(t));
    ribs.push(resample(bezier({x:0,y:t*2.2},{x:tip*.27,y:t*width*1.17},{x:tip*.78,y:t*width*.95},{x:tip,y:t*width*.17},24),1.35));
  }
  const apex={x:length,y:0};
  const edge=(sign:number)=>bezier({x:0,y:0},{x:length*.26,y:sign*width*1.36},{x:length*.87,y:sign*width*1.10},apex,30);
  ribs.push(resample(edge(-1),1.35),resample(edge(1),1.35));
  return ribs;
}
function layer(width:number,height:number,dpr:number,paint:(ctx:CanvasRenderingContext2D)=>void){
  const c=document.createElement("canvas");c.width=Math.ceil(width*dpr);c.height=Math.ceil(height*dpr);
  const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);paint(ctx);}return c;
}
const PETAL_W=94,PETAL_H=62,OX=10,OY=31;
type PetalArt={placement:PetalPlacement;sprite:HTMLCanvasElement;ribs:PreparedThread[];original:Point[][];morph:PreparedThread[]};
function petalBase(ctx:CanvasRenderingContext2D,p:PetalPlacement){
  const l=p.length,w=p.width;
  const gradient=ctx.createLinearGradient(0,-w,0,w);
  gradient.addColorStop(0,p.rear?"#ec9b08":"#ffe15a");
  gradient.addColorStop(.45,p.rear?"#dc8d06":"#f8bd09");
  gradient.addColorStop(1,p.rear?"#a75a03":"#c97902");
  ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(0,0);
  ctx.bezierCurveTo(l*.26,-w*1.36,l*.87,-w*1.1,l,0);
  ctx.bezierCurveTo(l*.87,w*1.1,l*.26,w*1.36,0,0);ctx.fill();
}
function makePetal(p:PetalPlacement,dpr:number):PetalArt{
  const paths=createPetalRibs(p.length,p.width);
  const colors=p.rear?["#d88a05","#e9a00b","#efac10","#e69a08","#cf7904","#d58a07","#ce7c05"]:["#e7a106","#f5bc0c","#ffd333","#fbc20d","#e9a205","#f2b509","#e4a006"];
  const ribs=paths.map((points,i)=>prepareThread({points,color:colors[i],thickness:i>=5?5.8:7.6,shadow:p.rear?"#a75904":"#b77503",seed:i+1}));
  const sprite=layer(PETAL_W,PETAL_H,dpr,ctx=>{
    ctx.translate(OX,OY);ctx.save();ctx.shadowColor="#71360055";ctx.shadowBlur=3;ctx.shadowOffsetY=2;petalBase(ctx,p);ctx.restore();
    for(const t of ribs)drawThread(ctx,t);
  });
  return {placement:p,sprite,ribs,original:paths,morph:ribs.map(t=>({...t,points:t.points.map(p=>({...p}))}))};
}
export function createSunflowerArt(dpr:number){
  const petals=SUNFLOWER_PETALS.map(p=>makePetal(p,dpr));
  const thread=prepareThread({points:resample(bezier({x:-76,y:0},{x:-28,y:-4},{x:25,y:4},{x:76,y:0}),1.3),color:SUNFLOWER_COLORS.yellow,thickness:7.4,shadow:"#a96c04"});
  const rnd=seeded(284);
  const center:Array<{x:number;y:number;r:number;angle:number;texture:HTMLCanvasElement}>=[];
  const shades=["#4f0c1b","#641021","#76152a","#8a2033","#a12e42"];
  for(let i=0;i<115;i++){
    const a=i*2.39996323,r=Math.sqrt(i/114)*26;
    center.push({x:Math.cos(a)*r+(rnd()-.5)*2.7,y:Math.sin(a)*r+(rnd()-.5)*2.7,r:4+rnd()*3.1,angle:rnd()*Math.PI,texture:tuftTexture(shades[Math.floor(rnd()*shades.length)],"#350a13",i%4)});
  }
  const disk=layer(72,72,dpr,ctx=>{ctx.translate(36,36);paintCenter(ctx,1);});
  function paintCenter(ctx:CanvasRenderingContext2D,p:number){
    if(p<=0)return;
    ctx.save();ctx.globalAlpha=Math.min(1,p*5);
    const g=ctx.createRadialGradient(-8,-10,1,0,0,30);g.addColorStop(0,"#8a263b");g.addColorStop(1,"#430a16");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,29*Math.sqrt(p),0,Math.PI*2);ctx.fill();ctx.restore();
    for(let i=0;i<Math.ceil(center.length*p);i++){
      const c=center[i];ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);ctx.drawImage(c.texture,-c.r,-c.r,c.r*2,c.r*2);ctx.restore();
    }
  }
  function drawPetals(ctx:CanvasRenderingContext2D,p:number){
    for(let i=0;i<petals.length;i++){
      const art=petals[i],spec=art.placement,local=stageProgress(p,i*.035,i*.035+.46);
      if(local<=0)continue;
      ctx.save();ctx.rotate(spec.angle);ctx.translate(spec.radius,0);
      if(local>=.999){ctx.drawImage(art.sprite,-OX,-OY,PETAL_W,PETAL_H);}
      else {
        // Each bundle bends from straight strands into the closed petal.
        ctx.globalAlpha=Math.min(1,local*5);
        for(let j=0;j<art.morph.length;j++){
          const t=art.morph[j],original=art.original[j];
          for(let k=0;k<t.points.length;k++){
            const q=original[k],u=k/Math.max(1,t.points.length-1);
            t.points[k].x=lerp(u*spec.length,q.x,local);
            t.points[k].y=lerp((j-3)*1.2,q.y,local);
          }
          drawThread(ctx,t,{end:Math.min(1,local*1.8)});
        }
        if(local>.8){ctx.globalAlpha=smooth((local-.8)/.2);ctx.drawImage(art.sprite,-OX,-OY,PETAL_W,PETAL_H);}
      }
      ctx.restore();
    }
  }
  const full=layer(212,212,dpr,ctx=>{ctx.translate(106,106);drawPetals(ctx,1);ctx.drawImage(disk,-36,-36,72,72);});
  return {draw(ctx:CanvasRenderingContext2D,petalProgress:number,centerProgress:number){
    if(petalProgress>=1&&centerProgress>=1){ctx.drawImage(full,-106,-106,212,212);return;}
    if(petalProgress<.18){ctx.save();ctx.globalAlpha=1-stageProgress(petalProgress,0,.18);drawThread(ctx,thread);ctx.restore();}
    drawPetals(ctx,petalProgress);
    if(centerProgress>=1)ctx.drawImage(disk,-36,-36,72,72);else paintCenter(ctx,centerProgress);
  }};
}
