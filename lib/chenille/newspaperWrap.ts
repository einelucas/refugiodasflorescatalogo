import { lerp,seeded } from "./paths";
import type { Point } from "./types";

type Curve=readonly [Point,Point,Point,Point];
type Panel={left:Curve;right:Curve;bow?:number;edition:number;light?:number;crop?:[number,number,number,number]};
const P=(x:number,y:number):Point=>({x,y});
const C=(...xy:[number,number,number,number,number,number,number,number]):Curve=>[P(xy[0],xy[1]),P(xy[2],xy[3]),P(xy[4],xy[5]),P(xy[6],xy[7])];
function cubic(c:Curve,t:number):Point{
  const a=1-t;
  return P(a*a*a*c[0].x+3*a*a*t*c[1].x+3*a*t*t*c[2].x+t*t*t*c[3].x,a*a*a*c[0].y+3*a*a*t*c[1].y+3*a*t*t*c[2].y+t*t*t*c[3].y);
}
function surface(panel:Panel,u:number,v:number):Point{
  const l=cubic(panel.left,v),r=cubic(panel.right,v);
  return P(lerp(l.x,r.x,u),lerp(l.y,r.y,u)+(panel.bow??0)*Math.sin(Math.PI*u)*(1-v));
}
const TW=240,TH=320;
const ink="#3e3733";
function botanical(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,seed:number){
  const rnd=seeded(seed);
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#a59a8b");bg.addColorStop(1,"#514b44");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  for(let i=0;i<13;i++){
    const cx=rnd()*w,cy=rnd()*h,angle=rnd()*6.28,len=12+rnd()*30;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
    ctx.fillStyle=i%2?"#625d50":"#82776a";ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(len*.4,-len*.45,len,0);ctx.quadraticCurveTo(len*.45,len*.25,0,0);ctx.fill();
    ctx.strokeStyle="#b2a69a";ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();ctx.restore();
  }
  for(let i=0;i<5;i++){
    const cx=w*(.15+rnd()*.7),cy=h*(.15+rnd()*.7),r=8+rnd()*15;
    ctx.save();ctx.translate(cx,cy);
    for(let j=0;j<7;j++){ctx.save();ctx.rotate(j*Math.PI*2/7);ctx.fillStyle=j%2?"#c5b9aa":"#a99b8b";ctx.beginPath();ctx.ellipse(0,r*.65,r*.39,r*.75,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.fillStyle="#665348";ctx.beginPath();ctx.arc(0,0,r*.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.restore();
}
function architecture(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.fillStyle="#8e8276";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#c6b9a8";ctx.fillRect(w*.15,h*.37,w*.75,h*.66);
  ctx.beginPath();ctx.moveTo(w*.04,h*.4);ctx.lineTo(w*.55,h*.12);ctx.lineTo(w*.98,h*.4);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#62574c";ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<5;i++){const px=w*(.22+i*.14);ctx.fillStyle="#655b51";ctx.fillRect(px,h*.47,w*.055,h*.36);ctx.fillStyle="#e0d3c0";ctx.fillRect(px-2,h*.44,w*.022,h*.43);}
  ctx.restore();
}
function newspaper(edition:number):HTMLCanvasElement{
  const c=document.createElement("canvas");c.width=TW*2;c.height=TH*2;
  const ctx=c.getContext("2d");if(!ctx)return c;ctx.scale(2,2);
  const rnd=seeded(124+edition*31);
  ctx.fillStyle="#ded5c9";ctx.fillRect(0,0,TW,TH);
  ctx.fillStyle=ink;
  const text=(s:string,x:number,y:number,font:string,max?:number)=>{ctx.font=font;if(max===undefined)ctx.fillText(s,x,y);else ctx.fillText(s,x,y,max);};
  const rule=(x:number,y:number,w:number)=>{ctx.fillRect(x,y,w,.7);};
  if(edition===0){
    text("Vol. 02, 01 Dezembro • Edição especial",20,13,"6px Georgia");
    text("Journal",10,49,"bold 43px Georgia",190);
    ctx.fillStyle="#742632";ctx.fillRect(199,9,35,51);ctx.fillStyle="#f1e4da";
    ctx.save();ctx.translate(216,25);ctx.strokeStyle="#f1e4da";ctx.lineWidth=.8;
    for(let j=0;j<6;j++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.ellipse(0,-5,3.5,7,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
    text("02",203,55,"23px Georgia");ctx.fillStyle=ink;rule(8,65,224);
    botanical(ctx,9,72,139,156,43);
  }else if(edition===1){
    text("NOTÍCIAS • CULTURA • ATELIÊ",9,13,"7px Georgia");
    ctx.fillStyle="#494441";ctx.fillRect(12,21,112,72);ctx.fillStyle="#eee4d7";
    text("Weekend",20,43,"20px Georgia");text("Guide",20,62,"20px Georgia");
    text("Cultura",20,77,"9px Georgia");text("Gastronomia • Eventos",20,87,"7px Georgia");
    ctx.fillStyle=ink;text("& Flores",9,123,"bold 35px Georgia",222);rule(8,130,224);
    botanical(ctx,135,20,95,75,28);architecture(ctx,9,189,103,95);
  }else if(edition===2){
    ctx.fillStyle="#514741";ctx.fillRect(8,8,107,71);ctx.fillStyle="#eee5d9";
    ["IPSUM NAM","US INTERDUM","COSTR","VENENATIS","NAM ELEIF"].forEach((s,i)=>text(s,12,21+i*12,"12px Arial",101));
    ctx.fillStyle=ink;["HEADLINE","DURSTO","ADIPISCI"].forEach((s,i)=>text(s,123,23+i*19,"bold 19px Arial",109));
    text("Nº 02",12,128,"bold 48px Georgia",213);rule(8,135,224);
    architecture(ctx,112,151,116,115);
  }else{
    text(edition===3?"& Flores":"JOURNAL",8,34,"bold 31px Georgia",224);rule(8,40,224);
    botanical(ctx,10,46,106,105,edition*19);architecture(ctx,126,172,104,99);
  }
  const protectedArea=(x:number,y:number)=>{
    if(edition===0)return y<70||(x<150&&y<229);
    if(edition===1)return y<135||(x<113&&y>183&&y<285);
    if(edition===2)return y<140||(x>107&&y>146&&y<270);
    return y<45||(x<116&&y<152)||(x>124&&y>169&&y<274);
  };
  const lines=["Lorem ipsum dolor sit amet,","consectetur adipiscing elit.","Flores, arte e natureza.","Sed do eiusmod tempor incididunt.","Uma flor para durar, sempre."];
  for(let col=0;col<4;col++){
    const x=8+col*58;
    for(let y=16;y<315;y+=5.6){
      if(protectedArea(x,y)||protectedArea(x+52,y))continue;
      ctx.fillStyle=ink;ctx.globalAlpha=.7+rnd()*.24;
      text(lines[Math.floor(rnd()*lines.length)],x,y,y%9<1?"bold 5px Georgia":"4.6px Georgia",53);
    }
  }
  ctx.globalAlpha=1;
  for(let i=0;i<3500;i++){ctx.fillStyle=i%2?"#ffffff12":"#42352a10";ctx.fillRect(rnd()*TW,rnd()*TH,.4+rnd(),.3+rnd()*.65);}
  return c;
}
// Affine triangles map the printed page onto a curved sheet, rather than drawing
// straight text over a flat polygon. The mesh is rasterized once in the sprite.
function triangle(ctx:CanvasRenderingContext2D,img:HTMLCanvasElement,s:Point[],d:Point[]){
  const [a,b,c]=s,[p,q,r]=d;
  const ux=b.x-a.x,uy=b.y-a.y,vx=c.x-a.x,vy=c.y-a.y,det=ux*vy-uy*vx;
  if(Math.abs(det)<1e-8)return;
  const A=((q.x-p.x)*vy-(r.x-p.x)*uy)/det,B=((q.y-p.y)*vy-(r.y-p.y)*uy)/det;
  const D=((r.y-p.y)*ux-(q.y-p.y)*vx)/det,E=((r.x-p.x)*ux-(q.x-p.x)*vx)/det;
  ctx.save();ctx.beginPath();
  const center=P((p.x+q.x+r.x)/3,(p.y+q.y+r.y)/3);
  for(let i=0;i<3;i++){const k=d[i],dx=k.x-center.x,dy=k.y-center.y,n=Math.hypot(dx,dy)||1;const x=k.x+dx/n*.35,y=k.y+dy/n*.35;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.closePath();ctx.clip();ctx.transform(A,B,E,D,p.x-A*a.x-E*a.y,p.y-B*a.x-D*a.y);
  ctx.drawImage(img,0,0);ctx.restore();
}
function outline(ctx:CanvasRenderingContext2D,panel:Panel){
  ctx.beginPath();
  for(let i=0;i<=24;i++){const q=surface(panel,i/24,0);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}
  for(let i=1;i<=32;i++){const q=surface(panel,1,i/32);ctx.lineTo(q.x,q.y);}
  for(let i=23;i>=0;i--){const q=surface(panel,i/24,1);ctx.lineTo(q.x,q.y);}
  for(let i=31;i>=0;i--){const q=surface(panel,0,i/32);ctx.lineTo(q.x,q.y);}
  ctx.closePath();
}
function sheet(ctx:CanvasRenderingContext2D,panel:Panel,img:HTMLCanvasElement){
  const [sx,sy,sw,sh]=panel.crop??[0,0,TW,TH];
  ctx.save();outline(ctx,panel);ctx.fillStyle="#d9cfc1";ctx.shadowColor="#3b2c2450";ctx.shadowBlur=4;ctx.shadowOffsetY=2;ctx.fill();ctx.shadowColor="transparent";ctx.clip();
  const nx=10,ny=16;
  const uv=(i:number,j:number)=>P((sx+sw*i/nx)*2,(sy+sh*j/ny)*2);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const a=surface(panel,i/nx,j/ny),b=surface(panel,(i+1)/nx,j/ny),c=surface(panel,(i+1)/nx,(j+1)/ny),d=surface(panel,i/nx,(j+1)/ny);
    triangle(ctx,img,[uv(i,j),uv(i+1,j),uv(i+1,j+1)],[a,b,c]);triangle(ctx,img,[uv(i,j),uv(i+1,j+1),uv(i,j+1)],[a,c,d]);
  }
  // Follow the longitudinal creases through the same surface mesh.
  for(let i=0;i<24;i++){
    const u=i/24,mid=(i+.5)/24;
    const wave=Math.sin(mid*Math.PI*3.6+(panel.light??0))*.10+Math.cos(mid*Math.PI*7)*.055;
    ctx.fillStyle=wave>0?"rgba(255,247,232,"+wave+")":"rgba(48,32,24,"+(-wave)+")";
    ctx.beginPath();
    for(let j=0;j<=24;j++){const q=surface(panel,u,j/24);if(j===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}
    for(let j=24;j>=0;j--){const q=surface(panel,(i+1)/24,j/24);ctx.lineTo(q.x,q.y);}ctx.closePath();ctx.fill();
  }
  const dark=ctx.createLinearGradient(0,-145,0,128);dark.addColorStop(0,"#ffffff0b");dark.addColorStop(.65,"#ffffff00");dark.addColorStop(1,"#33201650");ctx.fillStyle=dark;ctx.fillRect(-170,-160,340,380);
  ctx.restore();
  ctx.save();outline(ctx,panel);ctx.strokeStyle="#65554855";ctx.lineWidth=.45;ctx.stroke();
  ctx.beginPath();for(let i=0;i<=32;i++){const q=surface(panel,i/32,0);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}ctx.strokeStyle="#fff8eaaa";ctx.lineWidth=.8;ctx.stroke();ctx.restore();
}
function satin(ctx:CanvasRenderingContext2D,path:Path2D,x0:number,y0:number,x1:number,y1:number,reverse=false){
  const g=ctx.createLinearGradient(x0,y0,x1,y1);
  const stops:[number,string][]=[[0,"#66030d"],[.13,"#a40816"],[.29,"#f12d3b"],[.39,"#ff6870"],[.49,"#e6192b"],[.68,"#ae0717"],[.83,"#f22635"],[1,"#72030c"]];
  stops.forEach(([t,c])=>g.addColorStop(reverse?1-t:t,c));
  ctx.save();ctx.shadowColor="#3e0e1155";ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.fillStyle=g;ctx.fill(path);ctx.shadowColor="transparent";
  ctx.clip();const rnd=seeded(11);for(let i=0;i<800;i++){ctx.fillStyle=i%2?"#fff4ea0d":"#45000912";ctx.fillRect(-65+rnd()*130,105+rnd()*105,.4+rnd(),.25);}
  ctx.restore();
  ctx.save();ctx.strokeStyle="#72091477";ctx.lineWidth=.45;ctx.stroke(path);ctx.restore();
}
function bow(ctx:CanvasRenderingContext2D){
  // Long asymmetrical satin tails, tucked under the hollow loops and knot.
  satin(ctx,new Path2D("M -5 111 C -20 131 -35 166 -48 204 L -24 195 C -10 163 -1 135 4 115 Z"),-42,160,-5,170);
  satin(ctx,new Path2D("M 6 111 C 22 133 42 167 40 202 L 24 214 C 26 178 11 145 -2 117 Z"),8,160,42,151,true);
  satin(ctx,new Path2D("M -4 110 C -24 94 -45 87 -53 93 C -56 103 -56 116 -52 124 C -39 130 -17 125 -4 116 Z"),-55,93,-18,126);
  satin(ctx,new Path2D("M 4 110 C 24 94 45 87 53 93 C 56 103 56 116 52 124 C 38 130 18 125 4 116 Z"),52,93,18,126,true);
  const hole=(side:number)=>{
    ctx.save();ctx.scale(side,1);
    const p=new Path2D("M -52 116 C -40 106 -20 114 -6 114 C -21 129 -45 130 -52 121 Z");
    const g=ctx.createLinearGradient(-50,119,-5,115);g.addColorStop(0,"#61030e");g.addColorStop(.42,"#850411");g.addColorStop(1,"#d51d2c");ctx.fillStyle=g;ctx.fill(p);
    ctx.strokeStyle="#ff56634d";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-51,116);ctx.bezierCurveTo(-35,111,-18,116,-7,115);ctx.stroke();ctx.restore();
  };
  hole(1);hole(-1);
  satin(ctx,new Path2D("M -7 105 Q -2 102 1 105 Q 7 102 9 107 L 8 119 Q 2 124 -7 119 Q -10 114 -7 105 Z"),-9,110,9,116);
  ctx.strokeStyle="#ff758275";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-4,106);ctx.quadraticCurveTo(-1,112,-4,119);ctx.stroke();
}
export function createNewspaperWrap(){
  const pages=Array.from({length:5},(_,i)=>newspaper(i));
  const panel=(left:Curve,right:Curve,edition:number,bowAmount=0,light=0,crop?:Panel["crop"]):Panel=>({left,right,edition,bow:bowAmount,light,crop});
  const layer=(p:Panel)=>(ctx:CanvasRenderingContext2D)=>sheet(ctx,p,pages[p.edition]);
  // The reference has a central tall page, two tilted pages and turned-out lips.
  const rear=[
    layer(panel(C(-112,-111,-108,-37,-42,73,-7,112),C(23,-154,35,-65,19,63,4,112),3,-3,1)),
    layer(panel(C(-82,-135,-74,-45,-24,61,-4,112),C(82,-139,75,-45,27,56,8,112),0,-2,1.7)),
    layer(panel(C(-142,-99,-117,-34,-46,75,-8,113),C(-109,-123,-74,-42,-16,71,3,113),1,-7,.6,[0,0,154,305])),
    layer(panel(C(71,-128,57,-55,21,71,-2,112),C(142,-102,122,-29,47,69,12,112),2,-5,2.4))
  ];
  const handle=layer(panel(C(-9,100,-14,136,-35,170,-42,188),C(11,100,19,136,46,171,42,188),4,0,2,[15,108,178,212]));
  const left=layer(panel(C(-151,-48,-146,-15,-76,82,-4,111),C(-77,-37,-70,3,-28,79,5,111),1,27,2.8,[0,92,240,220]));
  const right=layer(panel(C(78,-38,73,5,29,75,-5,111),C(151,-51,147,-12,74,82,7,111),2,24,.3,[0,85,240,230]));
  // Separate curled collar: dark underside and printed upper surface roll in front.
  const curlBack=layer(panel(C(-82,65,-61,76,-24,92,-2,111),C(3,91,21,95,11,109,4,117),3,8,.8,[4,160,220,118]));
  const curlLeft=layer(panel(C(-88,61,-58,83,-34,108,-5,117),C(-21,79,13,89,21,102,6,114),4,7,2,[0,123,240,140]));
  const curlRight=layer(panel(C(84,61,58,79,34,103,3,118),C(33,79,20,92,-11,104,-5,113),2,-8,1.2,[8,140,220,155]));
  const collar=(ctx:CanvasRenderingContext2D)=>{curlBack(ctx);curlLeft(ctx);curlRight(ctx);};
  return {rear,handle,left,right,collar,bow};
}
