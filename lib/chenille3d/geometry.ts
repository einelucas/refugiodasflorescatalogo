import { createPetalRibs,SUNFLOWER_PETALS,createWireLoops,wirePose } from "../chenille/sunflower";
import { bezier,seeded,clamp } from "../chenille/paths";
import type { Point } from "../chenille/types";

export type Vec=[number,number,number];
type RGB=Vec;
export type Geometry={vertices:Float32Array;count:number};
const V=(x:number,y:number,z=0):Vec=>[x,y,z];
const add=(a:Vec,b:Vec):Vec=>V(a[0]+b[0],a[1]+b[1],a[2]+b[2]);
const sub=(a:Vec,b:Vec):Vec=>V(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const mul=(a:Vec,k:number):Vec=>V(a[0]*k,a[1]*k,a[2]*k);
const cross=(a:Vec,b:Vec):Vec=>V(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
const norm=(a:Vec):Vec=>mul(a,1/(Math.hypot(...a)||1));
const mix=(a:Vec,b:Vec,t:number):Vec=>add(mul(a,1-t),mul(b,t));
const hex=(s:string):RGB=>{const n=parseInt(s.slice(1),16);return V((n>>16&255)/255,(n>>8&255)/255,(n&255)/255);};
const TAU=Math.PI*2;
export class MeshBuilder{
  private data:number[]=[];
  vertex(p:Vec,n:Vec,c:RGB){this.data.push(...p,...n,...c);}
  tri(a:Vec,b:Vec,c:Vec,na:Vec,nb:Vec,nc:Vec,color:RGB){this.vertex(a,na,color);this.vertex(b,nb,color);this.vertex(c,nc,color);}
  finish():Geometry{return {vertices:new Float32Array(this.data),count:this.data.length/9};}
  // Real radial tube plus short, irregular chenille fibre triangles. All surfaces have normals.
  tube(path:Vec[],radius:number,color:string,seed:number,pile=1){
    if(path.length<2)return;
    const rnd=seeded(seed),base=hex(color),sides=8;
    const rings:{p:Vec;n:Vec}[][]=[];
    for(let i=0;i<path.length;i++){
      const tangent=norm(sub(path[Math.min(i+1,path.length-1)],path[Math.max(i-1,0)]));
      const u=norm(cross(tangent,Math.abs(tangent[2])>.94?V(0,1,0):V(0,0,1)));
      const v=norm(cross(tangent,u));
      const ring=[];
      for(let j=0;j<sides;j++){const a=j*TAU/sides,n=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));ring.push({p:add(path[i],mul(n,radius*(.94+rnd()*.12))),n});}
      rings.push(ring);
      if(pile>0)for(let j=0;j<8;j++){
        const a=(j+rnd())*TAU/8,n=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));
        const root=add(path[i],mul(n,radius*.78)),side=norm(cross(tangent,n));
        const tip=add(add(root,mul(n,radius*(.36+rnd()*.54)*pile)),mul(tangent,(rnd()-.5)*radius*.9));
        const w=radius*(.045+rnd()*.055);
        this.tri(add(root,mul(side,-w)),add(root,mul(side,w)),tip,n,n,n,mul(base,.80+rnd()*.32));
      }
    }
    for(let i=1;i<rings.length;i++)for(let j=0;j<sides;j++){
      const a=rings[i-1][j],b=rings[i-1][(j+1)%sides],c=rings[i][j],d=rings[i][(j+1)%sides];
      const col=mul(base,.90+rnd()*.13);
      this.tri(a.p,b.p,c.p,a.n,b.n,c.n,col);this.tri(b.p,d.p,c.p,b.n,d.n,c.n,col);
    }
    for(const i of [0,rings.length-1]){
      const n=norm(sub(path[i],path[i===0?1:i-1]));
      for(let j=0;j<sides;j++)this.tri(path[i],rings[i][j].p,rings[i][(j+1)%sides].p,n,n,n,base);
    }
  }
  tuft(center:Vec,r:number,color:string,seed:number){
    const rnd=seeded(seed),base=hex(color),rows=7,cols=10;
    const ring=(i:number,j:number):Vec=>{const a=i*Math.PI/rows,b=j*TAU/cols;return V(Math.sin(a)*Math.cos(b),Math.sin(a)*Math.sin(b),Math.cos(a));};
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
      const a=ring(i,j),b=ring(i+1,j),c=ring(i,j+1),d=ring(i+1,j+1),p=(n:Vec)=>add(center,mul(n,r));
      const col=mul(base,.84+rnd()*.24);
      this.tri(p(a),p(b),p(c),a,b,c,col);this.tri(p(c),p(b),p(d),c,b,d,col);
    }
    for(let i=0;i<85;i++){
      const z=rnd()*2-1,a=rnd()*TAU,k=Math.sqrt(1-z*z),n=V(k*Math.cos(a),k*Math.sin(a),z);
      const u=norm(cross(n,Math.abs(z)>.9?V(0,1,0):V(0,0,1)));
      const p=add(center,mul(n,r*.85)),tip=add(center,mul(n,r*(1.12+rnd()*.28)));
      this.tri(add(p,mul(u,-r*.065)),add(p,mul(u,r*.065)),tip,n,n,n,mul(base,.78+rnd()*.34));
    }
  }
}
const petals=SUNFLOWER_PETALS;
const loops=createWireLoops();
export const petalOrder=loops.map(l=>l.index);
export function petalGeometry(index:number):Geometry{
  const p=petals[index],b=new MeshBuilder(),cs=Math.cos(p.angle),sn=Math.sin(p.angle);
  const ribs=createPetalRibs(p.length,p.width);
  const colors=p.rear?["#d78b05","#edab12","#efb71a","#e6a00a","#c97e05","#eab018","#cd8305"]:["#ecaa04","#ffd02a","#ffcb13","#f9bf08","#e9a007","#ffce1d","#e8a407"];
  for(const j of [5,6,0,4,1,3,2]){
    const points=ribs[j].map(q=>{
      const u=clamp(q.x/p.length),arch=Math.sin(Math.PI*u);
      return V((q.x+p.radius)*cs-q.y*sn,(q.x+p.radius)*sn+q.y*cs,(p.rear?-4:3)+arch*(p.rear?6:10)-Math.abs(q.y)*.10);
    });
    b.tube(points,j>=5?2.7:3.25,colors[j],index*53+j*13);
  }
  return b.finish();
}
export function activeWire(p:number):Geometry{
  const pose=wirePose(loops,p),b=new MeshBuilder();
  const settle=1-clamp(p/.12)**2*(3-2*clamp(p/.12));
  b.tube(pose.points.map((q,i)=>V(q.x+70*settle,q.y+10*settle,6+Math.sin(i*.055)*2*(1-p))),3,"#fbc316",19,.9);
  return b.finish();
}
export function centerGeometry():Geometry[]{
  const rnd=seeded(284),result:Geometry[]=[],colors=["#42101a","#591522","#6d202b","#842d37","#963e41"];
  for(let batch=0;batch<12;batch++){
    const b=new MeshBuilder();
    for(let i=batch*10;i<batch*10+10;i++){
      const a=i*2.39996323,r=Math.sqrt(i/119)*26;
      b.tuft(V(Math.cos(a)*r,Math.sin(a)*r,10+9*(1-r/30)),4.3+rnd()*1.65,colors[Math.floor(rnd()*colors.length)],i+91);
    }
    result.push(b.finish());
  }
  return result;
}
function path3(points:Point[],z:number,bulge=0):Vec[]{return points.map((p,i)=>V(p.x,p.y,z+Math.sin(Math.PI*i/Math.max(1,points.length-1))*bulge));}
function curve(a:Point,b:Point,c:Point,d:Point,z:number,bulge=0){return path3(bezier(a,b,c,d,44),z,bulge);}
const P=(x:number,y:number):Point=>({x,y});
export function stemGeometry():Geometry{
  const b=new MeshBuilder();
  b.tube(curve(P(0,28),P(-9,73),P(10,100),P(2,132),-8,2),3.2,"#0b8048",12);
  for(const [x,y,a,l] of [[0,88,-2.55,35],[3,104,-.58,34]]){
    const map=(u:number,v:number)=>P(x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a));
    const path=[...curve(map(0,0),map(l*.28,12),map(l*.84,12),map(l,0),-6,4),...curve(map(l,0),map(l*.84,-12),map(l*.28,-12),map(0,0),-6,4).slice(1)];
    b.tube(path,2.9,"#138b4d",21+Math.round(y));
  }
  return b.finish();
}
export function tulipGeometry():Geometry{
  const b=new MeshBuilder();
  // Five overlapping cupped petals; rear lobes and central front lobe have distinct depth.
  const lobes=[[-12,-.20,-9,15,36],[10,.20,-8,15,38],[0,0,-4,16,42],[-9,-.14,4,15,36],[8,.13,9,15,35]];
  for(let j=0;j<lobes.length;j++){
    const [x,a,z,w,h]=lobes[j],cs=Math.cos(a),sn=Math.sin(a);
    const map=(q:Point,k:number)=>V(x+q.x*cs-q.y*sn,q.x*sn+q.y*cs,z+k);
    const root=P(0,35),tip=P(0,-h);
    const edge=(s:number)=>bezier(root,P(s*w*1.65,23),P(s*w*1.12,-h+7),tip,42);
    const outer=[...edge(-1),...edge(1).reverse().slice(1)];
    const col=j<3?"#c90b10":"#ed141b";
    b.tube(outer.map((q,i)=>map(q,Math.sin(Math.PI*i/(outer.length-1))*3)),2.9,col,111+j*7);
    for(let i=-2;i<=2;i++){
      const t=i/2,pts=bezier(P(t*2,33),P(t*w*1.2,11),P(t*w*.96,-h+13),P(t*w*.36,-h+4+Math.abs(t)*3),42);
      b.tube(pts.map((q,k)=>map(q,Math.sin(Math.PI*k/(pts.length-1))*(7-Math.abs(t)*2))),2.8,i===0?"#f72a26":col,123+j*13+i);
    }
  }
  return b.finish();
}
export function companionGreenery():Geometry{
  const b=new MeshBuilder(),rnd=seeded(88);
  for(let i=0;i<13;i++){
    const side=i%2?-1:1,x=side*(48+rnd()*53),y=-86+rnd()*135,z=-17+rnd()*8;
    b.tube(curve(P(0,105),P(x*.3,30),P(x*.75,y+21),P(x,y),z,3),2.8,"#087d46",400+i);
    for(let j=0;j<2;j++){
      const px=x*.82,py=y+12+j*15,angle=side>0?-.75:-2.35,l=14+rnd()*10;
      const tip=P(px+Math.cos(angle)*l,py+Math.sin(angle)*l);
      b.tube(curve(P(px,py),P(px,py-5),P(tip.x,tip.y+6),tip,z+3,2),2.5,"#138b4e",500+i*3+j);
      b.tuft(V(tip.x,tip.y,z+4),5+rnd()*1.4,"#0e894a",600+i*2+j);
    }
  }
  for(const side of [-1,1])for(let j=0;j<2;j++){
    const x=side*(33+j*47),y=-112+j*31,root=P(side*22,51),tip=P(x,y);
    const outer=[...curve(root,P(x-7*side,-15),P(x-10*side,y+20),tip,-14,3),...curve(tip,P(x+9*side,y+16),P(x+6*side,-10),root,-13,3).slice(1)];
    b.tube(outer,3.2,"#0a8249",800+j+side*8);
  }
  return b.finish();
}
export function whiteFillers():Geometry{
  const b=new MeshBuilder(),rnd=seeded(30);
  for(let i=0;i<12;i++){
    const side=i%2?-1:1,x=side*(57+rnd()*34),y=-14+rnd()*52,z=-2+rnd()*5;
    b.tube(curve(P(x*.6,y+30),P(x*.7,y+15),P(x,y+12),P(x,y),z-2),1.6,"#5b9a55",901+i);
    b.tuft(V(x,y,z),5.5+rnd()*2,"#f8f4eb",1000+i);
  }
  return b.finish();
}
