"use client";
import { useEffect, type RefObject } from "react";

export type CanvasFrame={ctx:CanvasRenderingContext2D;width:number;height:number;dpr:number;dt:number;reduced:boolean;resized:boolean};
type Renderer=(frame:CanvasFrame)=>boolean|void;
type Setup=(canvas:HTMLCanvasElement)=>{draw:Renderer;dispose?:()=>void};
type Options={scroll?:boolean;observe?:RefObject<HTMLElement|null>};

export function useCanvasAnimation(ref:RefObject<HTMLCanvasElement|null>,setup:Setup,options:Options={}){
  const {scroll=false,observe}=options;
  useEffect(()=>{
    const canvas=ref.current, target=observe?.current??canvas;
    if(!canvas||!target)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const renderer=setup(canvas);
    let raf=0,previous=0,visible=false,disposed=false,width=0,height=0,dpr=1,dirty=true;
    const cancel=()=>{if(raf)cancelAnimationFrame(raf);raf=0;previous=0;};
    function request(){if(!disposed&&!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
    function frame(now:number){
      raf=0;if(disposed||!visible||document.hidden)return;
      const nextDpr=Math.min(window.devicePixelRatio||1,2);
      const resized=dirty||dpr!==nextDpr;
      if(resized){
        const rect=canvas!.getBoundingClientRect();width=rect.width;height=rect.height;dpr=nextDpr;dirty=false;
        if(width<=0||height<=0)return;
        canvas!.width=Math.max(1,Math.round(width*dpr));canvas!.height=Math.max(1,Math.round(height*dpr));
      }
      const dt=previous?Math.min((now-previous)/1000,.05):0;previous=now;
      ctx!.setTransform(dpr,0,0,dpr,0,0);ctx!.clearRect(0,0,width,height);
      const more=renderer.draw({ctx:ctx!,width,height,dpr,dt,reduced:media.matches,resized});
      if(more&&!media.matches)request();else previous=0;
    }
    const resize=()=>{dirty=true;request();};
    const visibility=()=>{if(document.hidden)cancel();else request();};
    const change=()=>{cancel();request();};
    const onScroll=()=>{if(!media.matches)request();};
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();else cancel();});
    io.observe(target);
    const ro=new ResizeObserver(resize);ro.observe(canvas);
    document.addEventListener("visibilitychange",visibility);
    media.addEventListener("change",change);
    window.addEventListener("resize",resize,{passive:true});
    if(scroll)window.addEventListener("scroll",onScroll,{passive:true});
    return ()=>{disposed=true;cancel();io.disconnect();ro.disconnect();document.removeEventListener("visibilitychange",visibility);media.removeEventListener("change",change);window.removeEventListener("resize",resize);if(scroll)window.removeEventListener("scroll",onScroll);renderer.dispose?.();};
  },[ref,setup,scroll,observe]);
}
