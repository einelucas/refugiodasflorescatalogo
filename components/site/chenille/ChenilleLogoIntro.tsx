"use client";
import { useEffect,useRef,useState } from "react";
import { usePathname } from "next/navigation";
import { createLogoIntro,INTRO_SIZE,INTRO_DURATION,INTRO_EXIT,introTimeline } from "@/lib/chenille/logoIntro";
import { INTRO_ATTRIBUTE,INTRO_SESSION_KEY,HOME_READY_ID } from "@/lib/chenille/introBootstrap";

export function ChenilleLogoIntro(){
  const pathname=usePathname();
  const [visible,setVisible]=useState(false);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const skipRef=useRef<()=>void>(()=>{});
  useEffect(()=>{
    // Only the pre-paint document bootstrap can opt in. Client navigation
    // must never trigger a late splash over an already-visible catalogue.
    const root=document.documentElement;
    if(pathname!=="/"){
      root.removeAttribute(INTRO_ATTRIBUTE);setVisible(false);return;
    }
    if(root.getAttribute(INTRO_ATTRIBUTE)==="pending")setVisible(true);
  },[pathname]);
  useEffect(()=>{
    if(!visible||pathname!=="/")return;
    const root=document.documentElement;
    const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx||!root.hasAttribute(INTRO_ATTRIBUTE)){
      root.removeAttribute(INTRO_ATTRIBUTE);setVisible(false);return;
    }
    let raf=0,done=false,exitTimer=0,playTimer=0,exiting=false;
    let observer:MutationObserver|undefined;
    const controller=new AbortController();
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish=()=>{
      if(done)return;done=true;cancelAnimationFrame(raf);controller.abort();observer?.disconnect();
      root.removeAttribute(INTRO_ATTRIBUTE);
      try{sessionStorage.setItem(INTRO_SESSION_KEY,"1");}catch{/* Optional storage. */}
      setVisible(false);
    };
    skipRef.current=finish;
    const exit=()=>{
      if(done||exiting)return;exiting=true;observer?.disconnect();clearTimeout(playTimer);
      canvas.closest(".chenille-logo-intro")?.setAttribute("data-exiting","true");
      exitTimer=window.setTimeout(finish,INTRO_EXIT);
    };
    const revealWhenReady=()=>{
      // The server page emits this marker after fetching its catalogue.
      // If it streams later than the motion, hold the completed logo.
      if(document.getElementById(HOME_READY_ID)){exit();return;}
      observer=new MutationObserver(()=>{
        if(document.getElementById(HOME_READY_ID))exit();
      });
      observer.observe(document.body,{childList:true,subtree:true});
      if(document.getElementById(HOME_READY_ID))exit();
    };
    // Asset/network and playback guards are separate; no indefinite screen lock.
    const deadline=window.setTimeout(finish,2200);
    const onMotion=()=>{if(motion.matches)finish();};
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")finish();};
    motion.addEventListener("change",onMotion);
    window.addEventListener("keydown",onKey);
    if(motion.matches){finish();}
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=canvas.height=Math.round(INTRO_SIZE*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(!done)fetch("/imagens/logo-refugio.svg",{signal:controller.signal,cache:"force-cache"})
      .then(r=>{if(!r.ok)throw new Error("Logo indisponível");return r.text();})
      .then(svg=>{
        if(done)return;
        const art=createLogoIntro(svg,dpr);
        clearTimeout(deadline);
        // Draw before removing the server-painted placeholder, avoiding a flash.
        art.draw(ctx,0);
        if(root.getAttribute(INTRO_ATTRIBUTE)!=="pending"){finish();return;}
        root.setAttribute(INTRO_ATTRIBUTE,"playing");
        playTimer=window.setTimeout(finish,INTRO_DURATION+INTRO_EXIT+5000);
        let start:number|undefined;
        const frame=(now:number)=>{
          if(done)return;start??=now;
          const p=Math.min(1,(now-start)/INTRO_DURATION);
          art.draw(ctx,p);
          if(introTimeline(p).title)canvas.closest(".chenille-logo-intro")?.setAttribute("data-title","true");
          if(p<1)raf=requestAnimationFrame(frame);
          else revealWhenReady();
        };
        raf=requestAnimationFrame(frame);
      }).catch(()=>{if(!done)finish();});
    return ()=>{
      done=true;controller.abort();observer?.disconnect();cancelAnimationFrame(raf);
      clearTimeout(deadline);clearTimeout(exitTimer);clearTimeout(playTimer);
      motion.removeEventListener("change",onMotion);window.removeEventListener("keydown",onKey);
      root.removeAttribute(INTRO_ATTRIBUTE);skipRef.current=()=>{};
    };
  },[visible,pathname]);
  if(!visible||pathname!=="/")return null;
  return <div className="chenille-logo-intro" role="dialog" aria-label="Abertura do Refúgio das Flores">
    <div className="chenille-logo-intro-inner" aria-hidden="true">
      <canvas ref={canvasRef} className="chenille-logo-intro-canvas"/>
      <p className="chenille-logo-intro-wordmark">Refúgio das Flores</p>
      <p className="chenille-logo-intro-tagline">Flores eternas, feitas à mão.</p>
    </div>
    <button type="button" className="chenille-logo-intro-skip" onClick={()=>skipRef.current()}>Pular animação</button>
  </div>;
}
