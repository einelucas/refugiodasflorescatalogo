import { drawThread,prepareThread } from "./engine";
import { bezier,leaf,resample,seeded,lerp } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";
import { stageProgress } from "./sunflower";
import { createNewspaperWrap } from "./newspaperWrap";

type Layer=(ctx:CanvasRenderingContext2D)=>void;
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
export function createBouquetArt(dpr:number){
  const W=340,H=390,X=170,Y=162;
  const make=(paint:Layer)=>{
    const c=document.createElement("canvas");c.width=Math.ceil(W*dpr);c.height=Math.ceil(H*dpr);
    const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);ctx.translate(X,Y);paint(ctx);}return c;
  };
  const wrap=createNewspaperWrap();
  const rear=wrap.rear.map(make),handle=make(wrap.handle);
  const foliage=make(greenery);
  const tulips=[make(ctx=>tulip(ctx,-65,-61,-.48,.92)),make(ctx=>tulip(ctx,-2,-84,.015,1.04)),make(ctx=>tulip(ctx,65,-61,.43,.96))];
  const buds=make(fillers);
  const left=make(wrap.left),right=make(wrap.right),collar=make(wrap.collar),bow=make(wrap.bow);
  function show(ctx:CanvasRenderingContext2D,image:HTMLCanvasElement,t:number,dx=0,dy=0,angle=0,scale=1,pivotY=0){
    if(t<=0)return;
    ctx.save();ctx.globalAlpha=Math.min(1,t*4);ctx.translate(dx*(1-t),dy*(1-t));
    ctx.translate(0,pivotY);ctx.rotate(angle*(1-t));const z=lerp(scale,1,t);ctx.scale(z,z);ctx.translate(0,-pivotY);
    ctx.drawImage(image,-X,-Y,W,H);ctx.restore();
  }
  return {
    back(ctx:CanvasRenderingContext2D,p:number){
      // The printed pages open behind the flower bundle. The handle joins below it.
      rear.forEach((image,i)=>show(ctx,image,stageProgress(p,.38+i*.035,.69+i*.045),(i-1.5)*24,72,(i-1.5)*.12,.98,110));
      show(ctx,handle,stageProgress(p,.45,.73),0,42,0,.97,110);
      show(ctx,foliage,stageProgress(p,0,.34),0,38,0,.8);
      tulips.forEach((image,i)=>show(ctx,image,stageProgress(p,.07+i*.045,.37+i*.06),(i-1)*22,42,(i-1)*.12,.85));
      show(ctx,buds,stageProgress(p,.29,.52),0,15,0,.86);
    },
    front(ctx:CanvasRenderingContext2D,p:number){
      // The outer sheets swing in around the neck, with the flowers between the layers.
      show(ctx,left,stageProgress(p,.54,.82),-20,12,-.42,1,111);
      show(ctx,right,stageProgress(p,.61,.89),20,12,.42,1,111);
      show(ctx,collar,stageProgress(p,.73,.94),0,19,0,.98,111);
      show(ctx,bow,stageProgress(p,.87,1),0,12,0,.8,112);
    }
  };
}
