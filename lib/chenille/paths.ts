import type { Point } from "./types";

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x,b.x,t), y: lerp(a.y,b.y,t) });
export function bezier(a: Point,b: Point,c: Point,d: Point,steps = 28): Point[] {
  return Array.from({length: steps+1}, (_,i) => {
    const t=i/steps, u=1-t;
    return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};
  });
}
export function petal(cx:number,cy:number,angle:number,length:number,width:number,tip=0): Point[] {
  const map=(x:number,y:number):Point=>({x:cx+x*Math.cos(angle)-y*Math.sin(angle),y:cy+x*Math.sin(angle)+y*Math.cos(angle)});
  const root=map(0,0), apex=map(length,tip);
  return [...bezier(root,map(length*.24,width),map(length*.85,width),apex,16),...bezier(apex,map(length*.86,-width),map(length*.22,-width),root,16).slice(1)];
}
export const leaf = (x:number,y:number,angle:number,length:number,width:number) => petal(x,y,angle,length,width);
export function spiral(x:number,y:number,radius:number,turns=2.6):Point[] {
  return Array.from({length:100},(_,i)=>{const t=i/99,a=t*Math.PI*2*turns;return {x:x+Math.cos(a)*radius*t,y:y+Math.sin(a)*radius*t};});
}
export function stem(x:number,y:number,height:number):Point[] {
  return bezier({x,y},{x:x+17,y:y+height*.38},{x:x-18,y:y+height*.72},{x:x+4,y:y+height});
}
// Arc-length sampling: stable spacing regardless of original vertex density.
export function resample(points: readonly Point[], spacing=2):Point[] {
  if (!points.length) return [];
  const out=[{...points[0]}]; let carried=0;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],len=Math.hypot(b.x-a.x,b.y-a.y);
    if(len<1e-6) continue;
    for(let offset=spacing-carried;offset<=len;offset+=spacing) out.push(mix(a,b,offset/len));
    carried=(carried+len)%spacing;
  }
  const last=points[points.length-1], previous=out[out.length-1];
  if(Math.hypot(last.x-previous.x,last.y-previous.y)>1e-6) out.push({...last});
  return out;
}
export function seeded(seed:number):()=>number {
  let state=seed>>>0;
  return ()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
}
