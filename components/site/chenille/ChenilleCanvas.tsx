"use client";
import type { RefObject } from "react";
export function ChenilleCanvas({canvasRef,className}:{canvasRef:RefObject<HTMLCanvasElement|null>;className:string}){
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
