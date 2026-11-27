"use client";
import { useCallback,useEffect,useRef } from "react";
import { useCanvasAnimation,type CanvasFrame } from "@/hooks/site/useCanvasAnimation";
import { createFlower } from "@/lib/chenille/flowers";
import { drawThread,prepareThread } from "@/lib/chenille/engine";
import { clamp,lerp } from "@/lib/chenille/paths";
import { ChenilleCanvas } from "./ChenilleCanvas";

const steps=[
  ["O fio","Tudo começa com um fio de chenille, macio e cheio de possibilidades."],
  ["As pétalas","Curvas delicadas dão forma a cada pétala."],
  ["O miolo","Os detalhes completam o coração da flor."],
  ["A flor","Caule e folhas finalizam uma flor feita para durar."]
] as const;

export function ThreadToFlower(){
  const section=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=section.current;if(!el)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){el.dataset.entered="true";observer.disconnect();}
    },{threshold:.12});
    observer.observe(el);return ()=>observer.disconnect();
  },[]);
  const setup=useCallback(()=>{
    const flower=createFlower("gerbera");
    const petals=flower.petals.map(prepareThread);
    const originals=petals.map(t=>t.points.map(p=>({...p})));
    const total=originals.reduce((n,p)=>n+p.length,0);
    const center=flower.center.map(prepareThread),stem=flower.stem.map(prepareThread),leaves=flower.leaves.map(prepareThread);
    let previous=-1;
    return {draw({ctx,width,height,reduced}:CanvasFrame){
      const el=section.current;if(!el)return;
      const rect=el.getBoundingClientRect();
      const sticky=el.firstElementChild?.getBoundingClientRect();
      const stickyNode=el.firstElementChild;
      const top=stickyNode?parseFloat(getComputedStyle(stickyNode).top)||0:72;
      const travel=Math.max(1,rect.height-(sticky?.height??window.innerHeight));
      const p=reduced?1:clamp((top-rect.top)/travel);
      const phase=p<.18?0:p<.64?1:p<.82?2:3;
      if(phase!==previous){el.dataset.step=String(phase);previous=phase;}
      const morph=clamp((p-.10)/.54),eased=morph*morph*(3-2*morph);
      let offset=0;
      ctx.save();ctx.translate(width/2,height*.51);
      const scale=Math.min(width/188,height/150);ctx.scale(scale,scale);
      for(let j=0;j<petals.length;j++){
        const t=petals[j],original=originals[j];
        for(let i=0;i<t.points.length;i++){
          const x=lerp(-75,75,(offset+i)/Math.max(1,total-1));
          t.points[i].x=lerp(x,original[i].x,eased);t.points[i].y=lerp(0,original[i].y,eased);
        }
        offset+=t.points.length;drawThread(ctx,t);
      }
      for(const t of center)drawThread(ctx,t,{end:clamp((p-.64)/.18)});
      for(const t of stem)drawThread(ctx,t,{end:clamp((p-.81)/.12)});
      for(const t of leaves)drawThread(ctx,t,{end:clamp((p-.91)/.09)});
      ctx.restore();
    }};
  },[]);
  useCanvasAnimation(canvas,setup,{scroll:true,observe:section});
  return <section ref={section} className="chenille-story" aria-labelledby="chenille-story-title">
    <div className="chenille-story-sticky">
      <div className="chenille-story-art"><ChenilleCanvas canvasRef={canvas} className="chenille-story-canvas"/></div>
      <div className="chenille-story-copy">
        <p className="chenille-eyebrow">Feito à mão, com carinho</p>
        <h2 id="chenille-story-title">Do fio à flor</h2>
        <ol className="chenille-steps">{steps.map(([title,description],i)=><li key={title}><span className="chenille-step-number">0{i+1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      </div>
    </div>
  </section>;
}
