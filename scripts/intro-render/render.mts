import { createCanvas,Path2D } from "@napi-rs/canvas";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { readFileSync,writeFileSync,statSync,mkdirSync,renameSync,rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { join } from "node:path";
import { createLogoIntro,INTRO_SIZE } from "../../lib/chenille/logoIntro";
import { INTRO_VIDEO_SECONDS,introVideoSourceProgress } from "../../lib/chenille/introVideoTiming";

// Only the canvas construction APIs used by the existing renderer are needed.
Object.assign(globalThis,{
  Path2D,
  document:{createElement(tag:string){
    if(tag!=="canvas")throw new Error("Unexpected element: "+tag);
    return createCanvas(1,1);
  }}
});
const fps=30,dpr=2,size=INTRO_SIZE*dpr,frames=Math.round(INTRO_VIDEO_SECONDS*fps);
const out=join(process.cwd(),"public/imagens");
mkdirSync(out,{recursive:true});
const target=join(out,"chenille-intro.mp4"),temp=join(out,"chenille-intro.tmp.mp4");
const poster=join(out,"chenille-intro-poster.png");
const svg=readFileSync(join(out,"logo-refugio.svg"),"utf8");
const art=createLogoIntro(svg,dpr);
const transparent=createCanvas(size,size),ctx=transparent.getContext("2d");
ctx.scale(dpr,dpr);
const frame=createCanvas(size,size),paint=frame.getContext("2d");
const child=spawn(ffmpeg.path,[
  "-hide_banner","-loglevel","error","-y",
  "-f","rawvideo","-pixel_format","rgba","-video_size",size+"x"+size,
  "-framerate",String(fps),"-i","pipe:0","-an","-c:v","libx264",
  "-preset","fast","-crf","20","-pix_fmt","yuv420p","-movflags","+faststart",temp
],{stdio:["pipe","ignore","inherit"]});
const closed=new Promise<void>((resolve,reject)=>{
  child.once("error",reject);
  child.once("close",code=>code===0?resolve():reject(new Error("FFmpeg exited with code "+code)));
});
closed.catch(()=>{}); // The error is propagated after encoding/when the stream closes.
try{
  for(let i=0;i<frames;i++){
    art.draw(ctx as unknown as CanvasRenderingContext2D,introVideoSourceProgress(i/(frames-1)*INTRO_VIDEO_SECONDS));
    paint.fillStyle="#684675";paint.fillRect(0,0,size,size);
    paint.drawImage(transparent,0,0);
    if(i===0)writeFileSync(poster,frame.toBuffer("image/png"));
    const rgba=paint.getImageData(0,0,size,size).data;
    if(!child.stdin.write(Buffer.from(rgba)))await Promise.race([once(child.stdin,"drain"),closed.then(()=>{throw new Error("Encoder closed prematurely");})]);
  }
  child.stdin.end();await closed;
  renameSync(temp,target);
  console.log("Intro: "+frames+" frames, "+size+"×"+size+", "+fps+" fps, "+Math.round(statSync(target).size/1024)+" KiB");
}catch(error){
  child.kill();rmSync(temp,{force:true});throw error;
}
