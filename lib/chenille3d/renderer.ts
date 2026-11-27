import { activeWire,centerGeometry,companionGreenery,petalGeometry,petalOrder,stemGeometry,tulipGeometry,whiteFillers,type Geometry } from "./geometry";
import { SUNFLOWER_PETALS,stageProgress } from "../chenille/sunflower";
import { clamp,lerp } from "../chenille/paths";

const WIDTH=340,HEIGHT=390,OX=170,OY=162;
const vertex=`
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform vec4 uPose; // x, y, z, scale
uniform vec3 uAngles; // pitch, yaw, roll
uniform vec2 uViewport;
uniform vec2 uOrigin;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vLocal;
vec3 rotateModel(vec3 v){
  float c=cos(uAngles.z),s=sin(uAngles.z);
  v=vec3(c*v.x-s*v.y,s*v.x+c*v.y,v.z);
  c=cos(uAngles.x);s=sin(uAngles.x);
  v=vec3(v.x,c*v.y-s*v.z,s*v.y+c*v.z);
  c=cos(uAngles.y);s=sin(uAngles.y);
  return vec3(c*v.x+s*v.z,v.y,-s*v.x+c*v.z);
}
void main(){
  vec3 p=rotateModel(aPosition)*uPose.w+uPose.xyz;
  vec2 screen=p.xy+uOrigin;
  gl_Position=vec4(screen.x/uViewport.x*2.0-1.0,1.0-screen.y/uViewport.y*2.0,-p.z/300.0,1.0);
  vNormal=rotateModel(aNormal);vColor=aColor;vLocal=aPosition.xy;
}`;
const fragment=`
precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vLocal;
uniform vec3 uReveal; // direction and radial cutoff
void main(){
  if(dot(vLocal,uReveal.xy)>uReveal.z)discard;
  vec3 n=normalize(vNormal);
  vec3 light=normalize(vec3(-0.48,-0.66,0.83));
  float key=max(dot(n,light),0.0);
  float fill=max(dot(n,normalize(vec3(0.8,0.05,0.55))),0.0);
  float rim=max(dot(n,normalize(vec3(0.1,0.5,-0.8))),0.0);
  float sheen=pow(max(dot(n,normalize(light+vec3(0.0,0.0,1.0))),0.0),11.0);
  vec3 c=vColor*(0.66+0.40*key+0.13*fill+0.07*rim)+vec3(0.085,0.068,0.045)*sheen;
  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
type Mesh={buffer:WebGLBuffer;count:number};
type Pose={x?:number;y?:number;z?:number;scale?:number;pitch?:number;yaw?:number;roll?:number};
type Reveal=[number,number,number];

function shader(gl:WebGLRenderingContext,type:number,src:string){
  const s=gl.createShader(type);if(!s)throw new Error("WebGL shader unavailable");
  gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(log??"WebGL shader failed");}
  return s;
}
function createProgram(gl:WebGLRenderingContext){
  const vs=shader(gl,gl.VERTEX_SHADER,vertex),fs=shader(gl,gl.FRAGMENT_SHADER,fragment);
  const p=gl.createProgram();if(!p){gl.deleteShader(vs);gl.deleteShader(fs);throw new Error("WebGL program unavailable");}
  gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const log=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error(log??"WebGL link failed");}
  return p;
}

export function createChenille3D(dpr:number){
  const canvas=document.createElement("canvas");
  const ratio=Math.min(2,Math.max(1,dpr));
  canvas.width=Math.round(WIDTH*ratio);canvas.height=Math.round(HEIGHT*ratio);
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true,depth:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
  if(!gl)return null;
  const meshes:Mesh[]=[];
  let program:WebGLProgram|undefined;
  try{
    const p=createProgram(gl);program=p;gl.useProgram(p);
    const pos=gl.getAttribLocation(p,"aPosition"),normal=gl.getAttribLocation(p,"aNormal"),color=gl.getAttribLocation(p,"aColor");
    const pose=gl.getUniformLocation(p,"uPose"),angles=gl.getUniformLocation(p,"uAngles"),reveal=gl.getUniformLocation(p,"uReveal");
    gl.uniform2f(gl.getUniformLocation(p,"uViewport"),WIDTH,HEIGHT);
    gl.uniform2f(gl.getUniformLocation(p,"uOrigin"),OX,OY);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
    function upload(g:Geometry,dynamic=false):Mesh{
      const buffer=gl!.createBuffer();if(!buffer)throw new Error("WebGL buffer unavailable");
      const mesh={buffer,count:g.count};meshes.push(mesh);gl!.bindBuffer(gl!.ARRAY_BUFFER,buffer);
      gl!.bufferData(gl!.ARRAY_BUFFER,g.vertices,dynamic?gl!.DYNAMIC_DRAW:gl!.STATIC_DRAW);
      return mesh;
    }
    const petals=SUNFLOWER_PETALS.map((_,i)=>upload(petalGeometry(i)));
    const disk=centerGeometry().map(g=>upload(g));
    const stem=upload(stemGeometry()),tulip=upload(tulipGeometry()),green=upload(companionGreenery()),white=upload(whiteFillers());
    const loose=upload(activeWire(0),true);
    let lastWire=0;
    function begin(){
      if(gl!.isContextLost())return false;
      gl!.viewport(0,0,canvas.width,canvas.height);gl!.clear(gl!.COLOR_BUFFER_BIT|gl!.DEPTH_BUFFER_BIT);gl!.useProgram(p);return true;
    }
    function draw(mesh:Mesh,opts:Pose={},cut:Reveal=[0,0,1000]){
      gl!.bindBuffer(gl!.ARRAY_BUFFER,mesh.buffer);
      for(const [location,offset] of [[pos,0],[normal,12],[color,24]]){
        gl!.enableVertexAttribArray(location);gl!.vertexAttribPointer(location,3,gl!.FLOAT,false,36,offset);
      }
      gl!.uniform4f(pose,opts.x??0,opts.y??0,opts.z??0,opts.scale??1);
      gl!.uniform3f(angles,opts.pitch??0,opts.yaw??0,opts.roll??0);
      gl!.uniform3f(reveal,...cut);
      gl!.drawArrays(gl!.TRIANGLES,0,mesh.count);
    }
    function composite(ctx:CanvasRenderingContext2D){ctx.drawImage(canvas,-OX,-OY,WIDTH,HEIGHT);}
    function updateWire(progress:number){
      if(lastWire===progress)return;lastWire=progress;
      const g=activeWire(progress);loose.count=g.count;gl!.bindBuffer(gl!.ARRAY_BUFFER,loose.buffer);gl!.bufferData(gl!.ARRAY_BUFFER,g.vertices,gl!.DYNAMIC_DRAW);
    }
    return {
      bloom(ctx:CanvasRenderingContext2D,petalProgress:number,centerProgress:number,pack:number){
        if(!begin())return false;
        const k=clamp(petalProgress),scaled=k*petalOrder.length,complete=Math.floor(scaled);
        const settle=1-stageProgress(k,0,.12);
        const yaw=0.25*Math.sin(Math.PI*stageProgress(k,.13,1))*(1-pack);
        const pitch=-.17*Math.sin(Math.PI*stageProgress(k,.1,1))*(1-pack);
        const transform={x:70*settle,y:10*settle,yaw,pitch};
        for(let i=0;i<complete;i++)draw(petals[petalOrder[i]],transform);
        if(complete<petalOrder.length){
          const index=petalOrder[complete],spec=SUNFLOWER_PETALS[index];
          const amount=stageProgress(scaled-complete,.40,1);
          if(amount>0)draw(petals[index],transform,[Math.cos(spec.angle),Math.sin(spec.angle),spec.radius+spec.length*amount+4]);
          updateWire(k);draw(loose,{yaw,pitch});
        }
        for(let i=0;i<disk.length;i++)if(centerProgress>i/disk.length)draw(disk[i],{yaw,pitch});
        composite(ctx);return true;
      },
      stem(ctx:CanvasRenderingContext2D,progress:number){
        if(!begin())return false;
        if(progress>0)draw(stem,{},[0,1,34+106*progress]);
        composite(ctx);return true;
      },
      companions(ctx:CanvasRenderingContext2D,pack:number){
        if(!begin())return false;
        const foliage=stageProgress(pack,0,.34);
        if(foliage>0)draw(green,{y:38*(1-foliage),scale:lerp(.8,1,foliage)},[0,-1,115*foliage]);
        const positions=[[-65,-61,-.48,.92],[-2,-84,.015,1.04],[65,-61,.43,.96]];
        positions.forEach(([x,y,roll,scale],i)=>{
          const t=stageProgress(pack,.07+i*.045,.37+i*.06);
          if(t>0)draw(tulip,{x:x+(i-1)*22*(1-t),y:y+42*(1-t),z:-5,scale:scale*lerp(.3,1,t),roll:roll+(i-1)*.12*(1-t),pitch:.08,yaw:(i-1)*.18});
        });
        const buds=stageProgress(pack,.29,.52);
        if(buds>0)draw(white,{y:15*(1-buds),z:6,scale:lerp(.82,1,buds)},[0,-1,40*buds]);
        composite(ctx);return true;
      },
      dispose(){meshes.forEach(m=>gl.deleteBuffer(m.buffer));gl.deleteProgram(p);}
    };
  }catch{
    meshes.forEach(m=>gl.deleteBuffer(m.buffer));if(program)gl.deleteProgram(program);
    return null;
  }
}
export type Chenille3D=NonNullable<ReturnType<typeof createChenille3D>>;
