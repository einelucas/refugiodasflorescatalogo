"use client";
import { useRef,type ReactNode } from "react";
import { useCanvasAnimation,type CanvasFrame } from "@/hooks/site/useCanvasAnimation";
import { drawThread,prepareThread,type PreparedThread } from "@/lib/chenille/engine";
import { PALETTE,underlinePath } from "@/lib/chenille/flowers";
import { ChenilleCanvas } from "./ChenilleCanvas";

function setup(){
  let progress=0,thread:PreparedThread|undefined;
  return {draw({ctx,width,height,dt,reduced,resized}:CanvasFrame){
    if(!thread||resized)thread=prepareThread({points:underlinePath(width,height),color:PALETTE.lavender,thickness:3,shadow:PALETTE.deep});
    progress=reduced?1:Math.min(1,progress+dt/1.15);
    drawThread(ctx,thread,{end:progress});return progress<1;
  }};
}
export function ThreadUnderline({children}:{children:ReactNode}){
  const ref=useRef<HTMLCanvasElement>(null);useCanvasAnimation(ref,setup);
  return <span className="chenille-underlined">{children}<ChenilleCanvas canvasRef={ref} className="chenille-underline"/></span>;
}
