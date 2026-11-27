import { drawThread,prepareThread } from "./engine";
import { bezier,leaf,resample,seeded } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";
import { stageProgress } from "./sunflower";

type Layer=(ctx:CanvasRenderingContext2D)=>void;
const paperPath=(ctx:CanvasRenderingContext2D,points:Point[])=>{
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();
};
function paper(ctx:CanvasRenderingContext2D,points:Point[],seed:number){
  const rnd=seeded(seed);
  ctx.save();paperPath(ctx,points);
  const gradient=ctx.createLinearGradient(-120,-90,110,100);
  gradient.addColorStop(0,"#c6beb3");gradient.addColorStop(.28,"#f3efe5");gradient.addColorStop(.53,"#ded5c8");gradient.addColorStop(.78,"#faf6ed");gradient.addColorStop(1,"#a79b8d");
  ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle="#a69a8a";ctx.lineWidth=.7;ctx.stroke();ctx.clip();
  // Original decorative print, not copied headlines or branding from the photograph.
  ctx.rotate((rnd()-.5)*.35);ctx.fillStyle="#4e4543";ctx.globalAlpha=.68;
  ctx.font="bold 27px Georgia";ctx.fillText("JARDIM",-122,-77);ctx.font="bold 20px Georgia";ctx.fillText("FLORES",-88,20);
  ctx.font="8px Georgia";ctx.fillText("EDIÇÃO ESPECIAL   •   ARTESANAL",-112,-94);
  ctx.font="6px Georgia";
  for(let col=0;col<5;col++)for(let row=0;row<30;row++){
    const x=-128+col*52,y=-61+row*6;ctx.fillText(row%3===0?"Feito com carinho":"Uma flor para durar.",x,y);
  }
  ctx.globalAlpha=.23;ctx.fillStyle="#62584f";ctx.fillRect(-115,-44,48,29);ctx.fillRect(48,38,46,32);
  ctx.restore();
}
const wire=(ctx:CanvasRenderingContext2D,points:Point[],color:string,thickness:number,shadow:string)=>{
  drawThread(ctx,prepareThread({points:resample(points,1.8),color,thickness,shadow}));
};
function greenery(ctx:CanvasRenderingContext2D){
  const rnd=seeded(88);
  for(let i=0;i<13;i++){
    const x=(i%2===0?-1:1)*(38+rnd()*64),y=-80+rnd()*78;
    wire(ctx,bezier({x:0,y:106},{x:x*.3,y:20},{x:x*.75,y:y+20},{x,y}),"#087e50",5,"#034c35");
    for(let j=0;j<2;j++){
      const a=(i%2===0?-2.5:-.6)+(j-.5)*.5;
      wire(ctx,leaf(x*.8,y+20+j*12,a,13+rnd()*7,5),"#0d8958",5.8,"#034c35");
    }
  }
}
function tulip(ctx:CanvasRenderingContext2D,x:number,y:number,rotation:number,scale:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);
  const g=ctx.createLinearGradient(-23,0,24,0);g.addColorStop(0,"#94130a");g.addColorStop(.45,"#f42b16");g.addColorStop(.75,"#ff4930");g.addColorStop(1,"#a50d0d");
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,40);ctx.bezierCurveTo(-26,35,-29,-4,-19,-26);ctx.quadraticCurveTo(-10,-42,-3,-25);ctx.quadraticCurveTo(10,-45,19,-25);ctx.bezierCurveTo(29,-3,26,35,0,40);ctx.fill();
  for(let i=-3;i<=3;i++){
    const t=i/3;wire(ctx,bezier({x:t*6,y:38},{x:t*27,y:12},{x:t*24,y:-11},{x:t*13,y:-30+Math.abs(t)*6}),i%2===0?"#ed2514":"#f53b21",7.3,"#9a120b");
  }
  ctx.restore();
}
function fillers(ctx:CanvasRenderingContext2D){
  const rnd=seeded(30);
  for(let i=0;i<14;i++){
    const side=i%2===0?-1:1,x=side*(52+rnd()*38),y=-24+rnd()*50;
    wire(ctx,[{x:x*.72,y:y+30},{x,y}],"#147a4a",2.5,"#04553a");
    const r=5+rnd()*2;
    ctx.drawImage(tuftTexture("#fff9ed","#cabdac",i%4),x-r,y-r,r*2,r*2);
    ctx.drawImage(tuftTexture("#fffdf6","#d5c9b8",(i+1)%4),x-r*.8,y-r*.8,r*1.4,r*1.4);
  }
}
function ribbon(ctx:CanvasRenderingContext2D){
  const satin=ctx.createLinearGradient(-48,0,48,0);satin.addColorStop(0,"#850d19");satin.addColorStop(.28,"#db1427");satin.addColorStop(.48,"#fa4653");satin.addColorStop(.63,"#c81024");satin.addColorStop(1,"#830a16");
  ctx.fillStyle=satin;ctx.beginPath();ctx.moveTo(-5,117);ctx.bezierCurveTo(-35,120,-26,161,-45,190);ctx.lineTo(-21,183);ctx.bezierCurveTo(-10,164,-5,140,4,124);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(5,118);ctx.bezierCurveTo(29,130,21,166,40,183);ctx.lineTo(24,178);ctx.bezierCurveTo(9,163,11,137,-4,124);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(0,116);ctx.bezierCurveTo(-50,88,-53,129,-31,135);ctx.quadraticCurveTo(-10,132,0,122);ctx.bezierCurveTo(48,148,53,92,29,104);ctx.quadraticCurveTo(10,108,0,116);ctx.fill();
  ctx.fillStyle="#bc1424";ctx.beginPath();ctx.ellipse(0,120,10,8,-.1,0,Math.PI*2);ctx.fill();
}
export function createBouquetArt(dpr:number){
  const make=(paint:Layer)=>{
    const c=document.createElement("canvas");c.width=Math.ceil(280*dpr);c.height=Math.ceil(340*dpr);
    const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);ctx.translate(140,140);paint(ctx);}return c;
  };
  const back=make(ctx=>{
    paper(ctx,[{x:-133,y:-53},{x:-87,y:-125},{x:7,y:-99},{x:1,y:118}],81);
    paper(ctx,[{x:-87,y:-113},{x:45,y:-132},{x:83,y:-91},{x:10,y:119}],83);
    paper(ctx,[{x:39,y:-102},{x:103,y:-116},{x:137,y:-38},{x:12,y:119}],84);
    greenery(ctx);tulip(ctx,-60,-53,-.48,.89);tulip(ctx,0,-77,.01,1.03);tulip(ctx,65,-51,.45,.94);fillers(ctx);
  });
  const front=make(ctx=>{
    paper(ctx,[{x:-128,y:2},{x:-85,y:52},{x:-17,y:105},{x:-35,y:167},{x:30,y:178},{x:10,y:119}],91);
    paper(ctx,[{x:131,y:1},{x:83,y:53},{x:17,y:106},{x:34,y:170},{x:-25,y:177},{x:-10,y:118}],93);
    ctx.save();ctx.fillStyle="#ece4d9";ctx.globalAlpha=.94;ctx.beginPath();ctx.moveTo(-94,51);ctx.quadraticCurveTo(-39,88,0,111);ctx.quadraticCurveTo(44,85,91,46);ctx.lineTo(12,124);ctx.quadraticCurveTo(-39,117,-94,51);ctx.fill();ctx.restore();
    ribbon(ctx);
  });
  return {
    back(ctx:CanvasRenderingContext2D,p:number){const t=stageProgress(p,0,.8);if(t<=0)return;ctx.save();ctx.globalAlpha=t;ctx.translate(0,18*(1-t));ctx.drawImage(back,-140,-140,280,340);ctx.restore();},
    front(ctx:CanvasRenderingContext2D,p:number){const t=stageProgress(p,.26,1);if(t<=0)return;ctx.save();ctx.globalAlpha=t;ctx.translate(0,18*(1-t));ctx.drawImage(front,-140,-140,280,340);ctx.restore();}
  };
}
