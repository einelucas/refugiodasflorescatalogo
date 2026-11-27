import { drawThread,type PreparedThread } from "./engine";
import { clamp,lerp } from "./paths";

// A soft cylindrical core under the directional fibres keeps each folded
// chenille strand individually readable, rather than merging into flat fuzz.
export function drawFloralThread(ctx:CanvasRenderingContext2D,thread:PreparedThread,end=1){
  const points=thread.points,p=clamp(end);
  if(points.length<2||p<=0)return;
  const last=p*(points.length-1),n=Math.floor(last);
  const a=points[n],b=points[Math.min(points.length-1,n+1)];
  const tip={x:lerp(a.x,b.x,last-n),y:lerp(a.y,b.y,last-n)};
  ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<=n;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.lineTo(tip.x,tip.y);
  ctx.strokeStyle=thread.shadow??thread.color;ctx.lineWidth=thread.thickness*1.56;ctx.stroke();
  ctx.strokeStyle=thread.color;ctx.lineWidth=thread.thickness*1.10;ctx.stroke();
  ctx.restore();
  drawThread(ctx,thread,{end:p});
}
