"use client";
import { useEffect,useRef,useState } from "react";
import { usePathname } from "next/navigation";
import { createLogoIntro,INTRO_SIZE } from "@/lib/chenille/logoIntro";

const KEY="refugio-chenille-intro-v1";
const DURATION=2450;

export function ChenilleLogoIntro(){
  const pathname=usePathname();
  const [visible,setVisible]=useState(false);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const started=useRef(false);
  useEffect(()=>{
    if(pathname!=="/"||started.current||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    try{if(sessionStorage.getItem(KEY))return;}catch{/* Storage may be disabled. */}
    started.current=true;
    setVisible(true);
  },[pathname]);
  useEffect(()=>{
    if(!visible)return;
    const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx){setVisible(false);return;}
    let raf=0,done=false,exitTimer=0;
    const controller=new AbortController();
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish=()=>{
      if(done)return;done=true;cancelAnimationFrame(raf);controller.abort();
      try{sessionStorage.setItem(KEY,"1");}catch{/* Optional storage. */}
      setVisible(false);
    };
    // Do not turn the animation into a blocking network-dependent loader.
    const deadline=window.setTimeout(finish,3650);
    const onMotion=()=>{if(motion.matches)finish();};
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")finish();};
    motion.addEventListener("change",onMotion);
    window.addEventListener("keydown",onKey);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=canvas.height=Math.round(INTRO_SIZE*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    fetch("/imagens/logo-refugio.svg",{signal:controller.signal,cache:"force-cache"})
      .then(r=>{if(!r.ok)throw new Error("Logo indisponível");return r.text();})
      .then(svg=>{
        if(done)return;
        const art=createLogoIntro(svg,dpr);
        let start:number|undefined;
        const frame=(now:number)=>{
          if(done)return;start??=now;
          const p=Math.min(1,(now-start)/DURATION);
          art.draw(ctx,p);
          canvas.dataset.finished=p>=1?"true":"false";
          if(p<1){raf=requestAnimationFrame(frame);}else{
            canvas.closest(".chenille-logo-intro")?.setAttribute("data-exiting","true");
            exitTimer=window.setTimeout(finish,450);
          }
        };
        raf=requestAnimationFrame(frame);
      }).catch(()=>{if(!done)finish();});
    return ()=>{done=true;controller.abort();cancelAnimationFrame(raf);clearTimeout(deadline);clearTimeout(exitTimer);motion.removeEventListener("change",onMotion);window.removeEventListener("keydown",onKey);};
  },[visible]);
  if(!visible||pathname!=="/")return null;
  return <div className="chenille-logo-intro">
    <div className="chenille-logo-intro-inner" aria-hidden="true">
      <canvas ref={canvasRef} className="chenille-logo-intro-canvas"/>
      <p className="chenille-logo-intro-wordmark">Refúgio das Flores</p>
      <p className="chenille-logo-intro-tagline">Flores eternas, feitas à mão.</p>
    </div>
    <button type="button" className="chenille-logo-intro-skip" onClick={()=>{
      try{sessionStorage.setItem(KEY,"1");}catch{/* Optional storage. */}
      setVisible(false);
    }}>Pular animação</button>
  </div>;
}
