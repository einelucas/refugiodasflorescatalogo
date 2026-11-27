"use client";
import { useRef } from "react";
import { useCanvasAnimation } from "@/hooks/site/useCanvasAnimation";
import { FLOWER_KINDS,createFlower } from "@/lib/chenille/flowers";
import { flowerSprite } from "@/lib/chenille/engine";
import { seeded } from "@/lib/chenille/paths";
import { ChenilleCanvas } from "./ChenilleCanvas";

function setup(canvas:HTMLCanvasElement){
  const random=seeded(7026);
  const flowers=FLOWER_KINDS.map((kind,i)=>({kind,x:i%2===0?.07+random()*.15:.78+random()*.15,y:.18+random()*.62,speed:5+random()*7,phase:random()*6.28,size:42+random()*30,rotation:(random()-.5)*.8}));
  let sprites:HTMLCanvasElement[]=[],spriteDpr=0,time=0,wind=0,targetWind=0;
  const parent=canvas.parentElement;
  const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse"||!parent)return;const box=parent.getBoundingClientRect();targetWind=((event.clientX-box.left)/Math.max(1,box.width)-.5)*12;};
  const leave=()=>{targetWind=0;};
  parent?.addEventListener("pointermove",move,{passive:true});parent?.addEventListener("pointerleave",leave);
  return {draw({ctx,width,height,dpr,dt,reduced}:import("@/hooks/site/useCanvasAnimation").CanvasFrame){
    if(spriteDpr!==dpr){sprites=flowers.map(f=>flowerSprite(createFlower(f.kind),dpr));spriteDpr=dpr;}
    if(reduced){time=0;wind=0;}else{time+=dt;wind+=(targetWind-wind)*Math.min(1,dt*2);}
    const count=width<480?2:width<768?4:6;
    for(let i=0;i<count;i++){
      const f=flowers[i],size=f.size*(width<480?.8:1);
      const side=f.x<.5?-1:1, x=f.x*width+Math.sin(time*f.speed*.025+f.phase)*Math.min(width*.06,45)+wind;
      const y=f.y*height+Math.sin(time*.65+f.phase)*8;
      ctx.save();ctx.translate(x,y);ctx.rotate(f.rotation+Math.sin(time*.45+f.phase)*.14*side);ctx.globalAlpha=width<480?.52:.76;
      ctx.drawImage(sprites[i],-size/2,-size/2,size,size);ctx.restore();
    }
    return !reduced;
  },dispose(){parent?.removeEventListener("pointermove",move);parent?.removeEventListener("pointerleave",leave);}};
}
export function FloatingFlowers(){const ref=useRef<HTMLCanvasElement>(null);useCanvasAnimation(ref,setup);return <ChenilleCanvas canvasRef={ref} className="chenille-floating"/>;}
