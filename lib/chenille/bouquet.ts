import { drawThread,prepareThread } from "./engine";
import { bezier,leaf,resample,seeded,lerp } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";
import { stageProgress } from "./sunflower";

type Layer=(ctx:CanvasRenderingContext2D)=>void;
// Curved edges and individual folded panels, rather than a flat polygon silhouette.
function paperPath(ctx:CanvasRenderingContext2D,points:Point[]){
  const first=points[0];ctx.beginPath();ctx.moveTo(first.x,first.y);
  for(let i=1;i<points.length;i++){
    const p=points[i],prev=points[i-1];
    ctx.quadraticCurveTo((prev.x+p.x)/2+(i%2?2:-2),(prev.y+p.y)/2-3,p.x,p.y);
  }
  ctx.closePath();
}
function paper(ctx:CanvasRenderingContext2D,points:Point[],seed:number){
  const rnd=seeded(seed),minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x));
  const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
  ctx.save();ctx.shadowColor="#30241b48";ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=3;
  paperPath(ctx,points);
  const base=ctx.createLinearGradient(minX,minY,maxX,maxY);
  base.addColorStop(0,"#bcb3a7");base.addColorStop(.16,"#faf6ec");base.addColorStop(.46,"#e3d9cc");base.addColorStop(.73,"#f7f1e8");base.addColorStop(1,"#968878");
  ctx.fillStyle=base;ctx.fill();ctx.shadowColor="transparent";ctx.strokeStyle="#9c9081";ctx.lineWidth=.45;ctx.stroke();ctx.clip();
  ctx.save();ctx.translate((minX+maxX)/2,(minY+maxY)/2);ctx.rotate((rnd()-.5)*.85);ctx.translate(-90,-145);
  ctx.fillStyle="#413d38";ctx.globalAlpha=.85;
  ctx.font="bold 8px Georgia";ctx.fillText("EDIÇÃO ESPECIAL  •  ATELIÊ",0,10);
  ctx.font="bold 33px Georgia";ctx.fillText(seed%2?"JARDIM":"FLORES",0,41);
  ctx.fillRect(0,46,184,.8);ctx.font="bold 12px Georgia";ctx.fillText("ARTE  &  NATUREZA",0,61);
  ctx.fillStyle="#5c554e";ctx.fillRect(125,7,35,35);
  ctx.fillStyle="#f0e8df";ctx.font="bold 22px Georgia";ctx.fillText("02",128,33);
  for(let col=0;col<4;col++){
    const x=col*47;
    for(let row=0;row<40;row++){
      const y=74+row*6;ctx.fillStyle="#48443d";ctx.globalAlpha=.65+rnd()*.25;
      ctx.font=row%9===0?"bold 6px Georgia":"5.2px Georgia";
      ctx.fillText(row%9===0?"FEITO À MÃO":row%3===0?"Flores e afeto":"Uma flor para durar.",x,y);
    }
    if(col%2===0){ctx.fillStyle="#514b44";ctx.globalAlpha=.72;ctx.fillRect(x,122,42,29);
      ctx.fillStyle="#d9d0c3";ctx.beginPath();ctx.ellipse(x+21,136,14,8,-.4,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
  // Lighting overlays the printed ink: valleys, ridges, and a curled paper edge.
  const fold=ctx.createLinearGradient(minX,minY,maxX,minY);
  fold.addColorStop(0,"#43372b36");fold.addColorStop(.17,"#fffdf87a");fold.addColorStop(.29,"#30291d26");fold.addColorStop(.47,"#ffffff08");fold.addColorStop(.65,"#34281e44");fold.addColorStop(.76,"#fffdf86b");fold.addColorStop(1,"#3d302939");
  ctx.fillStyle=fold;ctx.fillRect(minX-3,minY-3,maxX-minX+6,maxY-minY+6);
  ctx.restore();
}
const wire=(ctx:CanvasRenderingContext2D,points:Point[],color:string,thickness:number,shadow:string)=>{
  drawThread(ctx,prepareThread({points:resample(points,1.8),color,thickness,shadow}));
};
function greenery(ctx:CanvasRenderingContext2D){
  const rnd=seeded(88);
  for(let i=0;i<16;i++){
    const x=(i%2===0?-1:1)*(38+rnd()*68),y=-94+rnd()*94;
    wire(ctx,bezier({x:0,y:106},{x:x*.3,y:20},{x:x*.75,y:y+20},{x,y}),"#087e50",5.8,"#034c35");
    for(let j=0;j<2;j++){
      const a=(i%2===0?-2.5:-.6)+(j-.5)*.5;
      wire(ctx,leaf(x*.8,y+20+j*12,a,16+rnd()*9,6),"#0d8958",5.8,"#034c35");
    }
  }
}
function tulip(ctx:CanvasRenderingContext2D,x:number,y:number,rotation:number,scale:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);
  // Three cupped overlapping lobes; each lobe has its own shadow and folded chenille ribs.
  const lobe=(offset:number,tilt:number,color:string,light:string,shade:string,wide:number)=>{
    ctx.save();ctx.translate(offset,0);ctx.rotate(tilt);
    const g=ctx.createLinearGradient(-wide,-9,wide,5);g.addColorStop(0,shade);g.addColorStop(.28,color);g.addColorStop(.57,light);g.addColorStop(1,shade);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,37);ctx.bezierCurveTo(-wide*1.3,27,-wide*1.24,-9,-wide*.72,-27);ctx.quadraticCurveTo(0,-45,wide*.72,-27);ctx.bezierCurveTo(wide*1.24,-9,wide*1.3,27,0,37);ctx.fill();
    for(let i=-2;i<=2;i++){
      const t=i/2;
      wire(ctx,bezier({x:t*3,y:36},{x:t*wide*1.24,y:12},{x:t*wide,y:-17},{x:t*wide*.55,y:-31+Math.abs(t)*4},32),i===0?light:color,5.9,shade);
    }
    ctx.restore();
  };
  lobe(-10,-.16,"#c51d10","#f43e16","#75110b",15);
  lobe(10,.15,"#e1260d","#ff4d19","#97100b",15);
  lobe(0,.015,"#e8240b","#ff4920","#a9130a",13);
  ctx.restore();
}
function fillers(ctx:CanvasRenderingContext2D){
  const rnd=seeded(30);
  for(let i=0;i<14;i++){
    const side=i%2===0?-1:1,x=side*(52+rnd()*38),y=-24+rnd()*50;
    wire(ctx,[{x:x*.72,y:y+30},{x,y}],"#147a4a",2.5,"#04553a");
    const r=5.5+rnd()*2.7;
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
  // Extra padding prevents the newspaper corners and ribbon tails from clipping.
  const W=320,H=380,X=160,Y=158;
  const make=(paint:Layer)=>{
    const c=document.createElement("canvas");c.width=Math.ceil(W*dpr);c.height=Math.ceil(H*dpr);
    const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);ctx.translate(X,Y);paint(ctx);}return c;
  };
  const rear=[
    make(ctx=>paper(ctx,[{x:-146,y:-47},{x:-113,y:-94},{x:-87,y:-129},{x:-53,y:-114},{x:4,y:122}],81)),
    make(ctx=>paper(ctx,[{x:-101,y:-101},{x:-72,y:-141},{x:48,y:-145},{x:77,y:-96},{x:7,y:120}],83)),
    make(ctx=>paper(ctx,[{x:41,y:-106},{x:100,y:-129},{x:150,y:-57},{x:12,y:123}],84))
  ];
  const foliage=make(greenery);
  const tulips=[make(ctx=>tulip(ctx,-65,-61,-.48,.92)),make(ctx=>tulip(ctx,-2,-84,.015,1.04)),make(ctx=>tulip(ctx,65,-61,.43,.96))];
  const buds=make(fillers);
  const left=make(ctx=>paper(ctx,[{x:-145,y:-26},{x:-120,y:18},{x:-80,y:64},{x:-13,y:112},{x:-32,y:178},{x:14,y:186},{x:13,y:119},{x:-65,y:49}],91));
  const right=make(ctx=>paper(ctx,[{x:148,y:-24},{x:121,y:22},{x:82,y:63},{x:13,y:111},{x:34,y:178},{x:-21,y:184},{x:-12,y:117},{x:67,y:48}],93));
  const cuff=make(ctx=>{
    ctx.save();ctx.shadowColor="#32261f42";ctx.shadowBlur=5;ctx.shadowOffsetY=3;
    ctx.beginPath();ctx.moveTo(-94,51);ctx.bezierCurveTo(-75,71,-26,91,0,107);ctx.bezierCurveTo(36,93,74,67,96,43);
    ctx.quadraticCurveTo(76,91,13,127);ctx.quadraticCurveTo(-38,124,-94,51);ctx.closePath();
    const g=ctx.createLinearGradient(-94,55,94,100);g.addColorStop(0,"#d6cabc");g.addColorStop(.33,"#fdf9ee");g.addColorStop(.56,"#a99b8b");g.addColorStop(.74,"#f7f0e5");g.addColorStop(1,"#c1b3a3");ctx.fillStyle=g;ctx.fill();ctx.restore();
    ctx.strokeStyle="#fffbf1aa";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-91,54);ctx.quadraticCurveTo(-42,92,0,108);ctx.quadraticCurveTo(49,87,94,46);ctx.stroke();
  });
  const bow=make(ribbon);
  function show(ctx:CanvasRenderingContext2D,image:HTMLCanvasElement,t:number,dx=0,dy=0,angle=0,scale=1){
    if(t<=0)return;
    ctx.save();ctx.globalAlpha=Math.min(1,t*3);ctx.translate(dx*(1-t),dy*(1-t));
    ctx.rotate(angle*(1-t));const z=lerp(scale,1,t);ctx.scale(z,z);
    ctx.drawImage(image,-X,-Y,W,H);ctx.restore();
  }
  return {
    back(ctx:CanvasRenderingContext2D,p:number){
      // Flowers assemble first; rear sheets then slide up behind the entire arrangement.
      rear.forEach((image,i)=>show(ctx,image,stageProgress(p,.40+i*.055,.76+i*.045),(i-1)*52,74,(i-1)*.25,.94));
      show(ctx,foliage,stageProgress(p,0,.34),0,38,0,.8);
      tulips.forEach((image,i)=>show(ctx,image,stageProgress(p,.07+i*.045,.37+i*.06),(i-1)*22,42,(i-1)*.12,.85));
      show(ctx,buds,stageProgress(p,.29,.52),0,15,0,.86);
    },
    front(ctx:CanvasRenderingContext2D,p:number){
      show(ctx,left,stageProgress(p,.54,.83),-52,18,-.25,.96);
      show(ctx,right,stageProgress(p,.61,.89),52,18,.25,.96);
      show(ctx,cuff,stageProgress(p,.72,.94),0,24,0,.98);
      show(ctx,bow,stageProgress(p,.87,1),0,25,0,.88);
    }
  };
}
