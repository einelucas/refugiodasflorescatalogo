import { drawThread,prepareThread,type PreparedThread } from "./engine";
import { bezier,clamp,lerp,mix,resample,seeded } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";

export const SUNFLOWER_COLORS={yellow:"#f9c314",gold:"#eda600",rear:"#df8c08",burgundy:"#76152a",green:"#08784c"} as const;
export const smooth=(value:number)=>{const t=clamp(value);return t*t*(3-2*t);};
export const stageProgress=(p:number,start:number,end:number)=>smooth((p-start)/(end-start));

export type PetalPlacement={angle:number;radius:number;length:number;width:number;rear:boolean};
// Eight broad teardrop petals above an offset second row, like the supplied bouquet.
export const SUNFLOWER_PETALS:readonly PetalPlacement[]=[
  ...Array.from({length:8},(_,i)=>({angle:-Math.PI/2+(i+.5)*Math.PI/4,radius:24,length:[55,58,54,61,57,58,54,60][i],width:16,rear:true})),
  ...Array.from({length:8},(_,i)=>({angle:-Math.PI/2+i*Math.PI/4+[0,-.035,.035,-.025,.045,-.03,.025,-.03][i],radius:23,length:[64,62,65,62,66,63,66,63][i],width:[18,19,20,18,19,20,19,19][i],rear:false}))
];
export function createPetalRibs(length:number,width:number):Point[][]{
  const ribs:Point[][]=[];
  // Five parallel longitudinal wires, with rounded tips and tightly closed bases.
  for(let i=-2;i<=2;i++){
    const t=i/2,tip=length*(1-.14*Math.abs(t));
    ribs.push(resample(bezier({x:0,y:t*2.2},{x:tip*.27,y:t*width*1.17},{x:tip*.78,y:t*width*.95},{x:tip,y:t*width*.17},24),1.35));
  }
  const apex={x:length,y:0};
  const edge=(sign:number)=>bezier({x:0,y:0},{x:length*.28,y:sign*width*1.5},{x:length,y:sign*width*.78},apex,36);
  ribs.push(resample(edge(-1),1.35),resample(edge(1),1.35));
  return ribs;
}
function layer(width:number,height:number,dpr:number,paint:(ctx:CanvasRenderingContext2D)=>void){
  const c=document.createElement("canvas");c.width=Math.ceil(width*dpr);c.height=Math.ceil(height*dpr);
  const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);paint(ctx);}return c;
}
const PETAL_W=94,PETAL_H=62,OX=10,OY=31;
type PetalArt={placement:PetalPlacement;sprite:HTMLCanvasElement;ribs:PreparedThread[]};
function petalBase(ctx:CanvasRenderingContext2D,p:PetalPlacement){
  const l=p.length,w=p.width;
  const gradient=ctx.createLinearGradient(0,-w,0,w);
  gradient.addColorStop(0,p.rear?"#ec9b08":"#ffe15a");
  gradient.addColorStop(.45,p.rear?"#dc8d06":"#f8bd09");
  gradient.addColorStop(1,p.rear?"#a75a03":"#c97902");
  ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(0,0);
  ctx.bezierCurveTo(l*.28,-w*1.5,l,-w*.78,l,0);
  ctx.bezierCurveTo(l,w*.78,l*.28,w*1.5,0,0);ctx.fill();
}
function makePetal(p:PetalPlacement,dpr:number):PetalArt{
  const paths=createPetalRibs(p.length,p.width);
  const colors=p.rear?["#d88a05","#e9a00b","#efac10","#e69a08","#cf7904","#d58a07","#ce7c05"]:["#e7a106","#f5bc0c","#ffd333","#fbc20d","#e9a205","#f2b509","#e4a006"];
  const ribs=paths.map((points,i)=>prepareThread({points,color:colors[i],thickness:i>=5?5.9:6.4,shadow:p.rear?"#a75904":"#b77503",seed:i+1}));
  const sprite=layer(PETAL_W,PETAL_H,dpr,ctx=>{
    ctx.translate(OX,OY);ctx.save();ctx.shadowColor="#71360055";ctx.shadowBlur=3;ctx.shadowOffsetY=2;petalBase(ctx,p);ctx.restore();
    for(const t of ribs)drawThread(ctx,t);
  });
  return {placement:p,sprite,ribs};
}
// A single ordered path passes through every petal, joined at its root.
export type WireLoop={index:number;points:Point[]};
export function createWireLoops():WireLoop[]{
  const order=[6,7,0,1,2,3,4,5,14,15,8,9,10,11,12,13];
  let previous:Point|undefined;
  return order.map(index=>{
    const spec=SUNFLOWER_PETALS[index],a=spec.angle;
    const map=(q:Point):Point=>({x:(q.x+spec.radius)*Math.cos(a)-q.y*Math.sin(a),y:(q.x+spec.radius)*Math.sin(a)+q.y*Math.cos(a)});
    const ribs=createPetalRibs(spec.length,spec.width);
    const outline=[...ribs[5],...ribs[6].slice().reverse().slice(1)].map(map);
    const root=outline[0];
    const bridge=previous?bezier(previous,{x:previous.x*.8,y:previous.y*.8},{x:root.x*.8,y:root.y*.8},root,12):[root];
    previous=root;
    return {index,points:resample([...bridge,...outline.slice(1)],1.25)};
  });
}
// A free end bends along the loop while remaining attached to the formed wire.
export function wirePose(loops:readonly WireLoop[],progress:number):{points:Point[];index:number;local:number}{
  const p=clamp(progress),scaled=p*loops.length,i=Math.min(loops.length-1,Math.floor(scaled)),local=scaled-i;
  const path=loops[i].points,position=local*(path.length-1),n=Math.floor(position);
  const tip=mix(path[n],path[Math.min(path.length-1,n+1)],position-n);
  const formed=[...path.slice(0,n+1),tip];
  const before=path[Math.max(0,n-3)],after=path[Math.min(path.length-1,n+3)];
  const angle=Math.atan2(after.y-before.y,after.x-before.x);
  const initial=stageProgress(p,0,.065);
  // Return to a common free-end direction at each joint, so changing loops cannot jump.
  const follow=Math.sin(Math.PI*local)**2;
  const delta=Math.atan2(Math.sin(angle-Math.PI),Math.cos(angle-Math.PI));
  const tailAngle=Math.PI+delta*follow;
  const length=lerp(132,24,initial)*(1-stageProgress(p,.94,1));
  if(length>0.01){
    const end={x:tip.x+Math.cos(tailAngle)*length,y:tip.y+Math.sin(tailAngle)*length};
    const tail=bezier(tip,{x:tip.x+Math.cos(tailAngle)*length*.33,y:tip.y+Math.sin(tailAngle)*length*.33},mix(tip,end,.75),end,20);
    formed.push(...tail.slice(1));
  }
  return {points:resample(formed,1.3),index:i,local};
}
export function createSunflowerArt(dpr:number){
  const petals=SUNFLOWER_PETALS.map(p=>makePetal(p,dpr));
  const loops=createWireLoops();
  const thread=prepareThread({points:[],color:"#f9c314",thickness:6.5,shadow:"#a96c04"});
  const rnd=seeded(284);
  const center:Array<{x:number;y:number;r:number;angle:number;texture:HTMLCanvasElement}>=[];
  const shades=["#37120c","#532016","#67251a","#843326","#9e4930"];
  for(let i=0;i<115;i++){
    const a=i*2.39996323,r=Math.sqrt(i/114)*26;
    center.push({x:Math.cos(a)*r+(rnd()-.5)*2.7,y:Math.sin(a)*r+(rnd()-.5)*2.7,r:4+rnd()*3.1,angle:rnd()*Math.PI,texture:tuftTexture(shades[Math.floor(rnd()*shades.length)],"#350a13",i%4)});
  }
  const disk=layer(72,72,dpr,ctx=>{ctx.translate(36,36);paintCenter(ctx,1);});
  function paintCenter(ctx:CanvasRenderingContext2D,p:number){
    if(p<=0)return;
    ctx.save();ctx.globalAlpha=Math.min(1,p*5);
    const g=ctx.createRadialGradient(-8,-10,1,0,0,30);g.addColorStop(0,"#793521");g.addColorStop(1,"#36100c");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,29*Math.sqrt(p),0,Math.PI*2);ctx.fill();ctx.restore();
    for(let i=0;i<Math.ceil(center.length*p);i++){
      const c=center[i];ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);ctx.drawImage(c.texture,-c.r,-c.r,c.r*2,c.r*2);ctx.restore();
    }
  }
  function paintPetal(ctx:CanvasRenderingContext2D,index:number,fill:number){
    const art=petals[index],spec=art.placement;
    ctx.save();ctx.rotate(spec.angle);ctx.translate(spec.radius,0);
    if(fill>=.999)ctx.drawImage(art.sprite,-OX,-OY,PETAL_W,PETAL_H);
    else if(fill>0){
      for(let j=0;j<5;j++)drawThread(ctx,art.ribs[j],{end:stageProgress(fill,j*.06,j*.06+.76)});
      if(fill>.84){ctx.globalAlpha=stageProgress(fill,.84,1);ctx.drawImage(art.sprite,-OX,-OY,PETAL_W,PETAL_H);}
    }
    ctx.restore();
  }
  function drawPetals(ctx:CanvasRenderingContext2D,p:number){
    const pose=wirePose(loops,p);
    const completed=p>=1?loops.length:pose.index;
    for(let i=0;i<completed;i++)paintPetal(ctx,loops[i].index,1);
    if(p>=1)return;
    paintPetal(ctx,loops[pose.index].index,stageProgress(pose.local,.34,1));
    thread.points=pose.points;
    drawThread(ctx,thread);
  }
  const full=layer(212,212,dpr,ctx=>{ctx.translate(106,106);drawPetals(ctx,1);ctx.drawImage(disk,-36,-36,72,72);});
  return {draw(ctx:CanvasRenderingContext2D,petalProgress:number,centerProgress:number){
    if(petalProgress>=1&&centerProgress>=1){ctx.drawImage(full,-106,-106,212,212);return;}
    ctx.save();
    const settle=1-stageProgress(petalProgress,0,.12);
    ctx.translate(70*settle,10*settle);
    drawPetals(ctx,petalProgress);ctx.restore();
    if(centerProgress>=1)ctx.drawImage(disk,-36,-36,72,72);else paintCenter(ctx,centerProgress);
  }};
}
