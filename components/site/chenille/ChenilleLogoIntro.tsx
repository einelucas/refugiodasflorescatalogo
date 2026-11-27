"use client";
import { useEffect,useRef,useState } from "react";
import { usePathname } from "next/navigation";
import { INTRO_ATTRIBUTE,HOME_READY_ID } from "@/lib/chenille/introBootstrap";
import { INTRO_VIDEO_SECONDS,INTRO_VIDEO_TITLE_SECONDS } from "@/lib/chenille/introVideoTiming";

const LOAD_LIMIT=2500;
const PLAY_LIMIT=INTRO_VIDEO_SECONDS*1000+1500;
const EXIT_MS=700;
const CATALOG_WAIT_LIMIT=1200;

export function ChenilleLogoIntro(){
  const pathname=usePathname();
  const [visible,setVisible]=useState(false);
  const videoRef=useRef<HTMLVideoElement>(null);
  const overlayRef=useRef<HTMLDivElement>(null);
  const skipRef=useRef<()=>void>(()=>{});

  useEffect(()=>{
    const root=document.documentElement;
    if(pathname!=="/"){root.removeAttribute(INTRO_ATTRIBUTE);setVisible(false);return;}
    if(root.getAttribute(INTRO_ATTRIBUTE)==="pending")setVisible(true);
  },[pathname]);

  useEffect(()=>{
    if(!visible||pathname!=="/")return;
    const root=document.documentElement,video=videoRef.current,overlay=overlayRef.current;
    if(!video||!overlay||!root.hasAttribute(INTRO_ATTRIBUTE)){
      root.removeAttribute(INTRO_ATTRIBUTE);setVisible(false);return;
    }
    let done=false,playing=false,exiting=false;
    let loadTimer=0,playTimer=0,exitTimer=0,readyTimer=0;
    let observer:MutationObserver|undefined;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish=()=>{
      if(done)return;done=true;
      video.pause();observer?.disconnect();
      clearTimeout(loadTimer);clearTimeout(playTimer);clearTimeout(exitTimer);clearTimeout(readyTimer);
      root.removeAttribute(INTRO_ATTRIBUTE);setVisible(false);
    };
    const exit=()=>{
      if(done||exiting)return;exiting=true;
      video.pause();observer?.disconnect();
      clearTimeout(loadTimer);clearTimeout(playTimer);clearTimeout(readyTimer);
      overlay.dataset.exiting="true";
      exitTimer=window.setTimeout(finish,EXIT_MS);
    };
    skipRef.current=finish;
    const revealWhenReady=()=>{
      if(done||exiting)return;
      clearTimeout(playTimer);
      overlay.dataset.title="true";
      if(document.getElementById(HOME_READY_ID)){exit();return;}
      observer=new MutationObserver(()=>{if(document.getElementById(HOME_READY_ID))exit();});
      observer.observe(document.body,{childList:true,subtree:true});
      readyTimer=window.setTimeout(exit,CATALOG_WAIT_LIMIT);
      if(document.getElementById(HOME_READY_ID))exit();
    };
    const onPlaying=()=>{
      if(done||playing)return;playing=true;
      clearTimeout(loadTimer);overlay.dataset.playing="true";
      playTimer=window.setTimeout(exit,PLAY_LIMIT);
    };
    const onTime=()=>{
      if(Number.isFinite(video.duration)&&video.duration>0&&video.currentTime>=INTRO_VIDEO_TITLE_SECONDS)
        overlay.dataset.title="true";
    };
    const onError=()=>exit();
    const onMotion=()=>{if(motion.matches)finish();};
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")finish();};

    // The first-paint cover hands off to a visible static wire. Video decode
    // and network failures must never trap the storefront behind the splash.
    root.setAttribute(INTRO_ATTRIBUTE,"playing");
    video.addEventListener("playing",onPlaying);
    video.addEventListener("timeupdate",onTime);
    video.addEventListener("ended",revealWhenReady);
    video.addEventListener("error",onError);
    motion.addEventListener("change",onMotion);
    window.addEventListener("keydown",onKey);
    loadTimer=window.setTimeout(exit,LOAD_LIMIT);
    if(motion.matches)finish();
    else if(video.error)exit();
    else {
      video.muted=true;
      if(!video.paused&&video.readyState>=2)onPlaying();
      video.play().catch(()=>{if(!done)exit();});
    }
    return ()=>{
      done=true;video.pause();observer?.disconnect();
      clearTimeout(loadTimer);clearTimeout(playTimer);clearTimeout(exitTimer);clearTimeout(readyTimer);
      video.removeEventListener("playing",onPlaying);
      video.removeEventListener("timeupdate",onTime);
      video.removeEventListener("ended",revealWhenReady);
      video.removeEventListener("error",onError);
      motion.removeEventListener("change",onMotion);
      window.removeEventListener("keydown",onKey);
      root.removeAttribute(INTRO_ATTRIBUTE);skipRef.current=()=>{};
    };
  },[visible,pathname]);

  if(!visible||pathname!=="/")return null;
  return <div ref={overlayRef} className="chenille-logo-intro" role="dialog" aria-label="Abertura do Refúgio das Flores">
    <div className="chenille-logo-intro-inner" aria-hidden="true">
      <div className="chenille-logo-intro-media">
        <video ref={videoRef} className="chenille-logo-intro-video" src="/imagens/chenille-intro.mp4?v=2" poster="/imagens/chenille-intro-poster.png?v=2" autoPlay muted playsInline preload="auto" tabIndex={-1} disablePictureInPicture />
        <span className="chenille-logo-intro-wire" />
      </div>
      <p className="chenille-logo-intro-wordmark">Refúgio das Flores</p>
      <p className="chenille-logo-intro-tagline">Flores eternas, feitas à mão.</p>
    </div>
    <button type="button" className="chenille-logo-intro-skip" onClick={()=>skipRef.current()}>Pular animação</button>
  </div>;
}
