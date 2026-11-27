"use client";
import { useCallback,useEffect,useRef } from "react";
import { useCanvasAnimation,type CanvasFrame } from "@/hooks/site/useCanvasAnimation";
import { createSunflowerArt,stageProgress } from "@/lib/chenille/sunflower";
import { createBouquetArt } from "@/lib/chenille/bouquet";
import { createChenille3D,type Chenille3D } from "@/lib/chenille3d/renderer";
import { drawThread,prepareThread } from "@/lib/chenille/engine";
import { bezier,clamp,leaf,lerp,resample } from "@/lib/chenille/paths";
import { ChenilleCanvas } from "./ChenilleCanvas";

const steps=[
  ["O fio","Um fio amarelo de chenille, macio e cheio de possibilidades."],
  ["As pétalas","Fios dobrados formam pétalas douradas, em duas camadas."],
  ["O miolo","Pequenos tufos em vinho preenchem o centro do girassol."],
  ["A flor","O caule e as folhas completam a flor feita à mão."],
  ["Na embalagem","O girassol ganha companhia de tulipas vermelhas, folhagens, papel estampado e um laço."]
] as const;

export function ThreadToFlower(){
  const section=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=section.current;if(!el)return;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){el.dataset.entered="true";observer.disconnect();}},{threshold:.12});
    observer.observe(el);return ()=>observer.disconnect();
  },[]);
  const setup=useCallback(()=>{
    let previous=-1,artDpr=0;
    let flower:ReturnType<typeof createSunflowerArt>|undefined,bouquet:ReturnType<typeof createBouquetArt>|undefined;
    let greens:ReturnType<typeof prepareThread>[]=[];
    let model:Chenille3D|null=null;
    return {draw({ctx,width,height,dpr,reduced}:CanvasFrame){
      const el=section.current;if(!el)return;
      if(!flower||!bouquet||artDpr!==dpr){
        // Created lazily once per DPR, not on every scroll event.
        artDpr=dpr;flower=createSunflowerArt(dpr);bouquet=createBouquetArt(dpr);
        model?.dispose();model=createChenille3D(dpr);
        greens=[
          prepareThread({points:resample(bezier({x:0,y:32},{x:-9,y:73},{x:10,y:100},{x:2,y:130}),1.6),color:"#138451",thickness:6,shadow:"#034c35"}),
          prepareThread({points:resample(leaf(0,88,-2.55,35,11),1.6),color:"#08784c",thickness:5.7,shadow:"#034c35"}),
          prepareThread({points:resample(leaf(3,104,-.58,34,10),1.6),color:"#168a51",thickness:5.7,shadow:"#034c35"})
        ];
      }
      const rect=el.getBoundingClientRect(),stickyNode=el.firstElementChild;
      const sticky=stickyNode?.getBoundingClientRect();
      const top=stickyNode?parseFloat(getComputedStyle(stickyNode).top)||0:72;
      const travel=Math.max(1,rect.height-(sticky?.height??window.innerHeight));
      const p=reduced?1:clamp((top-rect.top)/travel);
      const phase=p<.08?0:p<.54?1:p<.66?2:p<.77?3:4;
      if(phase!==previous){el.dataset.step=String(phase);previous=phase;}
      const petals=stageProgress(p,.08,.54),center=stageProgress(p,.54,.66);
      const stem=stageProgress(p,.66,.77),pack=stageProgress(p,.77,1);
      const unit=Math.min(width/332,height/380);
      const zoom=lerp(Math.min(width/218,height/222)/unit,1,Math.max(stem*.45,pack));
      ctx.save();ctx.translate(width/2,height/2);
      ctx.scale(unit,unit);ctx.translate(0,lerp(0,-28,Math.max(stem,pack)));
      bouquet.back(ctx,pack,()=>model?.companions(ctx,pack)??false);
      const flowerScale=zoom*lerp(1,.85,pack);
      const flowerY=lerp(0,26,pack);
      // Keep stems and leaves behind the front newspaper folds.
      ctx.save();ctx.translate(0,flowerY);ctx.scale(flowerScale,flowerScale);
      ctx.globalAlpha=1-stageProgress(pack,.26,.65);
      if(!model?.stem(ctx,stem)){
        for(let i=0;i<greens.length;i++)drawThread(ctx,greens[i],{end:stageProgress(stem,i*.14,i*.14+.72)});
      }
      ctx.restore();
      // Preserve the original bloom artwork; only lift its head above the paper.
      const drawBloom=()=>{
        ctx.save();
        ctx.translate(0,flowerY-8*stageProgress(pack,.35,.85));
        ctx.scale(flowerScale,flowerScale);
        if(!model?.bloom(ctx,petals,center,pack))flower?.draw(ctx,petals,center);
        ctx.restore();
      };
      bouquet.front(ctx,pack,drawBloom);ctx.restore();
    },dispose(){model?.dispose();model=null;}};
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
