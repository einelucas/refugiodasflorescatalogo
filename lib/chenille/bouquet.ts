import { prepareThread } from "./engine";
import { drawFloralThread } from "./floralThreads";
import { bezier,resample,seeded,lerp } from "./paths";
import { tuftTexture } from "./textures";
import type { Point } from "./types";
import { stageProgress } from "./sunflower";
import { createNewspaperWrap } from "./newspaperWrap";

type Layer=(ctx:CanvasRenderingContext2D)=>void;
const P=(x:number,y:number):Point=>({x,y});
const wire=(ctx:CanvasRenderingContext2D,points:Point[],color:string,thickness:number,shadow:string)=>{
  drawFloralThread(ctx,prepareThread({points:resample(points,1.5),color,thickness,shadow}));
};
// Long leaves are narrow folded loops, with the two chenille strands still distinct.
function greenLeaf(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,length:number,width:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const root=P(0,0),tip=P(length,0);
  const top=bezier(root,P(length*.3,-width),P(length*.94,-width),tip,28);
  const bottom=bezier(tip,P(length*.94,width),P(length*.3,width),root,28);
  wire(ctx,[...top,...bottom.slice(1)],"#087840",5.6,"#023b23");
  wire(ctx,bezier(root,P(length*.38,-width*.25),P(length*.76,-width*.2),tip,24),"#14994e",4.5,"#07532d");
  ctx.restore();
}
function pom(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,white:boolean,seed:number){
  const rnd=seeded(seed);
  const colors=white?["#e3ded4","#f2eee7","#fffdfa","#ffffff"]:["#07502b","#08763d","#169c50","#39b76b"];
  const shade=white?"#c2bbae":"#033c22";
  const g=ctx.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);
  g.addColorStop(0,colors[2]);g.addColorStop(1,colors[0]);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*.83,0,Math.PI*2);ctx.fill();
  for(let i=0;i<29;i++){
    const a=i*2.39996323,rad=Math.sqrt(i/28)*r*.75,sz=r*(.5+rnd()*.24);
    ctx.save();ctx.translate(x+Math.cos(a)*rad,y+Math.sin(a)*rad);ctx.rotate(rnd()*Math.PI);
    ctx.drawImage(tuftTexture(colors[Math.floor(rnd()*colors.length)],shade,i%4),-sz/2,-sz/2,sz,sz);ctx.restore();
  }
}
// Deliberate placements reproduce the isolated reference instead of scattering
// random foliage behind the blooms. Lower leaves remain above the wrapping.
function greenery(ctx:CanvasRenderingContext2D){
  const leaves=[
    [-34,24,-1.78,145,5.2],[36,22,-1.33,143,5.4],
    [-63,36,-2.04,107,5.5],[62,38,-1.05,109,5.3],
    [-70,48,-2.55,62,6],[70,49,-.58,63,6]
  ];
  for(const [x,y,a,l,w] of leaves)greenLeaf(ctx,x,y,a,l,w);
}
function sprigs(ctx:CanvasRenderingContext2D){
  const clusters=[
    {root:P(-39,48),tips:[P(-94,-21),P(-82,-41),P(-68,-15),P(-104,8),P(-83,21)]},
    {root:P(42,47),tips:[P(96,-23),P(83,-40),P(68,-14),P(105,7),P(89,22)]},
    {root:P(-15,22),tips:[P(-34,-65),P(-50,-43),P(-21,-40)]},
    {root:P(17,21),tips:[P(34,-66),P(19,-45),P(49,-43)]},
    {root:P(-25,68),tips:[P(-92,55),P(-82,78),P(-59,93)]},
    {root:P(26,68),tips:[P(93,54),P(82,78),P(59,93)]}
  ];
  clusters.forEach(({root,tips},i)=>tips.forEach((tip,j)=>{
    wire(ctx,bezier(root,P(lerp(root.x,tip.x,.3),root.y-9),P(tip.x*.95,tip.y+10),tip,24),"#0a8546",3.5,"#03492b");
    pom(ctx,tip.x,tip.y,6.8+(j%3)*.9,false,100+i*13+j);
  }));
  for(const [x,y,a,l,w] of [[-39,74,2.55,40,8],[-26,77,2.2,35,7],[38,73,.59,42,8],[25,77,.95,36,7]])greenLeaf(ctx,x,y,a,l,w);
}
function tulip(ctx:CanvasRenderingContext2D,x:number,y:number,rotation:number,scale:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);
  const lobe=(offset:number,tilt:number,color:string,light:string,shade:string,wide:number,height:number)=>{
    ctx.save();ctx.translate(offset,0);ctx.rotate(tilt);
    const bottom=35,top=-height;
    const g=ctx.createLinearGradient(-wide,0,wide,0);
    g.addColorStop(0,shade);g.addColorStop(.24,color);g.addColorStop(.48,light);g.addColorStop(.72,color);g.addColorStop(1,shade);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,bottom);
    ctx.bezierCurveTo(-wide*1.37,23,-wide*1.15,top+12,-wide*.47,top+3);
    ctx.quadraticCurveTo(0,top-5,wide*.47,top+3);
    ctx.bezierCurveTo(wide*1.15,top+12,wide*1.37,23,0,bottom);ctx.fill();
    // Continuous outer folded loop followed by parallel ribs, not solid painted ovals.
    const root=P(0,bottom),tip=P(0,top);
    wire(ctx,[...bezier(root,P(-wide*1.37,23),P(-wide*1.15,top+7),tip,32),...bezier(tip,P(wide*1.15,top+7),P(wide*1.37,23),root,32).slice(1)],color,5.7,shade);
    for(const i of [-2,2,-1,1,0]){
      const t=i/2;
      wire(ctx,bezier(P(t*2.7,bottom-2),P(t*wide*1.1,9),P(t*wide*.92,top+10),P(t*wide*.36,top+3+Math.abs(t)*5),32),i%2===0?light:color,4.3,shade);
    }
    ctx.restore();
  };
  lobe(-11,-.22,"#d40710","#ff3540","#87030c",15,39);
  lobe(11,.21,"#e00811","#ff4140","#990510",15,40);
  lobe(-2,-.065,"#e90710","#ff3033","#97030a",16,35);
  ctx.restore();
}
function fillers(ctx:CanvasRenderingContext2D){
  const left=[P(-73,8),P(-82,19),P(-88,32),P(-72,43),P(-58,49)];
  const right=[P(73,8),P(83,19),P(89,32),P(74,42),P(61,48)];
  [...left,...right].forEach((tip,i)=>{
    const root=P(tip.x*.50,66);
    wire(ctx,bezier(root,P(root.x,root.y-11),P(tip.x,tip.y+10),tip,20),"#59964b",2.6,"#285b30");
    pom(ctx,tip.x,tip.y,7.3+(i%3)*.8,true,350+i);
  });
}
export function createBouquetArt(dpr:number){
  const W=340,H=390,X=170,Y=162;
  const make=(paint:Layer)=>{
    const c=document.createElement("canvas");c.width=Math.ceil(W*dpr);c.height=Math.ceil(H*dpr);
    const ctx=c.getContext("2d");if(ctx){ctx.scale(dpr,dpr);ctx.translate(X,Y);paint(ctx);}return c;
  };
  const wrap=createNewspaperWrap();
  const rear=wrap.rear.map(make),handle=make(wrap.handle);
  const foliage=make(greenery),branches=make(sprigs);
  const tulips=[make(ctx=>tulip(ctx,-66,-53,-.43,.93)),make(ctx=>tulip(ctx,-2,-79,.015,1.04)),make(ctx=>tulip(ctx,67,-53,.42,.96))];
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

    },
    front(ctx:CanvasRenderingContext2D,p:number){
      // The outer sheets swing in around the neck, with the flowers between the layers.
      show(ctx,left,stageProgress(p,.54,.82),-20,12,-.42,1,111);
      show(ctx,right,stageProgress(p,.61,.89),20,12,.42,1,111);
      show(ctx,collar,stageProgress(p,.73,.94),0,19,0,.98,111);
    },
    floralForeground(ctx:CanvasRenderingContext2D,p:number){
      show(ctx,branches,stageProgress(p,.15,.49),0,18,0,.88);
      show(ctx,buds,stageProgress(p,.29,.52),0,15,0,.86);
    },
    finish(ctx:CanvasRenderingContext2D,p:number){
      show(ctx,bow,stageProgress(p,.87,1),0,12,0,.8,112);
    }
  };
}
